import type { Appointment } from '../types';

// Mirrors the API's rule so we can hide the Cancel button early.
// The API still enforces it; this is only for a friendlier screen.
const CANCELLATION_CUTOFF_MS = 2 * 60 * 60 * 1000;

export function canCancel(appointment: Appointment, now = new Date()): boolean {
  const msUntilStart = new Date(appointment.slot.startsAt).getTime() - now.getTime();
  return appointment.status === 'BOOKED' && msUntilStart > CANCELLATION_CUTOFF_MS;
}

export function isUpcoming(appointment: Appointment, now = new Date()): boolean {
  return (
    appointment.status === 'BOOKED' && new Date(appointment.slot.startsAt).getTime() > now.getTime()
  );
}
