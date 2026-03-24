// Supabase Edge Function — send silent SOS alert to circle
// Deploy: supabase functions deploy send-sos-email
// Secrets: supabase secrets set RESEND_API_KEY=<your-resend-key>

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const FROM_ADDRESS = 'Our Pulse <hello@phandaai.co.za>';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401 });

    // Verify the calling user's JWT
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return new Response('Unauthorized', { status: 401 });

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user profile
    const { data: profile } = await admin
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    const userName = profile?.name ?? user.email?.split('@')[0] ?? 'Someone';

    // Get contacts with emails
    const { data: contacts } = await admin
      .from('contacts')
      .select('name, email')
      .eq('user_id', user.id)
      .neq('email', '');

    if (!contacts?.length) {
      return new Response(JSON.stringify({ sent: 0, reason: 'No contacts with emails' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const subject = `🚨 ${userName} needs you right now`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, sans-serif; background: #fff1f2; margin: 0; padding: 24px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.12);">
    <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 32px 24px; text-align: center;">
      <div style="font-size: 40px; margin-bottom: 8px;">🚨</div>
      <h1 style="color: white; font-size: 22px; margin: 0; font-weight: 700;">${userName} needs you</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0; font-size: 14px;">Please reach out as soon as possible</p>
    </div>
    <div style="padding: 28px 24px;">
      <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        <strong>${userName}</strong> sent a silent alert through Our Pulse at <strong>${time}</strong> on ${date}.
      </p>
      <div style="background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <p style="color: #991b1b; font-size: 14px; font-weight: 600; margin: 0 0 4px;">What to do</p>
        <p style="color: #b91c1c; font-size: 14px; margin: 0; line-height: 1.5;">
          Call or message ${userName} right away to check in. If you can't reach them, consider going to them in person or contacting emergency services.
        </p>
      </div>
      <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0;">
        This alert was triggered directly by ${userName} using the Our Pulse app. They may not be able to call for help themselves.
      </p>
    </div>
    <div style="padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
      <p style="color: #94a3b8; font-size: 11px; margin: 0;">
        You're receiving this because you're in ${userName}'s Our Pulse circle.<br>
        <a href="mailto:support@ourpulse.app" style="color: #94a3b8;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;

    let sent = 0;
    for (const contact of contacts) {
      if (!contact.email?.trim()) continue;
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: FROM_ADDRESS,
            to: contact.email.trim(),
            subject,
            html,
          }),
        });
        if (res.ok) sent++;
        else console.error(`Failed to send to ${contact.email}:`, await res.text());
      } catch (e) {
        console.error(`Error sending to ${contact.email}:`, e);
      }
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
