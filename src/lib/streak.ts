/**
 * Computes the current streak from a list of pulses.
 *
 * Rules:
 * - A day "counts" if at least one pulse was sent on that day.
 * - Streak = how many consecutive days (ending today or yesterday) have at least one pulse.
 * - Streak resets to 0 if the most recent pulse day is not today or yesterday.
 */
export function computeStreak(pulses: { dateString: string }[]): number {
  if (!pulses.length) return 0;

  const uniqueDates = [...new Set(pulses.map(p => p.dateString))].sort().reverse();
  const latestDate = uniqueDates[0];

  const today = getDateString(new Date());
  const yesterday = getDateString(offsetDays(new Date(), -1));

  // Streak is only active if they've checked in today or yesterday
  if (latestDate !== today && latestDate !== yesterday) return 0;

  let streak = 0;
  let expected = latestDate;

  for (const date of uniqueDates) {
    if (date === expected) {
      streak++;
      expected = getDateString(offsetDays(new Date(expected + 'T12:00:00'), -1));
    } else {
      break;
    }
  }

  return streak;
}

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function offsetDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
