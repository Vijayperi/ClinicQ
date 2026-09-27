// The appointment business rules as plain functions, so they're easy to read and unit test.

export const CANCELLATION_CUTOFF_HOURS = 2;
const CANCELLATION_CUTOFF_MS = CANCELLATION_CUTOFF_HOURS * 60 * 60 * 1000;

// A slot that starts now or earlier can't be booked.
export function isInPast(startsAt: Date, now: Date): boolean {
  return startsAt.getTime() <= now.getTime();
}

// Patients can cancel only if the appointment is MORE than 2 hours away.
// Exactly 2 hours away is too late.
export function isOutsideCancellationWindow(startsAt: Date, now: Date): boolean {
  return startsAt.getTime() - now.getTime() > CANCELLATION_CUTOFF_MS;
}
