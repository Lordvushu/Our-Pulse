// Supabase Edge Function — send check-in email to all contacts
// Deploy: supabase functions deploy send-pulse-email
// Secrets: supabase secrets set RESEND_API_KEY=re_...

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

// The "from" address must be verified in your Resend account.
// During development you can use: onboarding@resend.dev
const FROM_ADDRESS = 'Our Pulse <noreply@ourpulse.app>';

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

    const { pulseId } = await req.json();
    if (!pulseId) return new Response('Missing pulseId', { status: 400 });

    // Use service role for DB queries (bypass RLS to read contacts)
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get pulse details
    const { data: pulse, error: pulseError } = await admin
      .from('pulses')
      .select('*')
      .eq('id', pulseId)
      .eq('user_id', user.id) // safety: only the owner's pulses
      .single();

    if (pulseError || !pulse) {
      return new Response('Pulse not found', { status: 404 });
    }

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

    // Format email content
    const sentAt = new Date(pulse.sent_at);
    const time = sentAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const date = sentAt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const windowLabel = pulse.type === 'morning' ? '☀️ Morning' : '🌙 Evening';
    const location = pulse.city ?? `${Number(pulse.lat).toFixed(3)}, ${Number(pulse.lng).toFixed(3)}`;

    const subject = `${userName} checked in ✓ — ${windowLabel} Pulse`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, sans-serif; background: #f0f9ff; margin: 0; padding: 24px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #38bdf8, #06b6d4); padding: 32px 24px; text-align: center;">
      <div style="font-size: 32px; margin-bottom: 8px;">💙</div>
      <h1 style="color: white; font-size: 22px; margin: 0; font-weight: 600;">${userName} is safe</h1>
      <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 13px;">${windowLabel} check-in received</p>
    </div>
    <div style="padding: 24px;">
      <div style="background: #f0f9ff; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 16px;">📍</span>
          <span style="font-size: 15px; font-weight: 600; color: #0c4a6e;">${location}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 16px;">🕐</span>
          <span style="font-size: 15px; color: #0369a1;">${time} · ${date}</span>
        </div>
      </div>
      <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0;">
        ${userName} sent a ${pulse.type} pulse from Our Pulse. No action needed — this is just to let you know they're doing well.
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

    // Send to each contact
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
