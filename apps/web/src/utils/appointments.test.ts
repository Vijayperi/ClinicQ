import { describe, expect, it } from 'vitest';
import type { Appointment } from '../types';
import { canCancel, isUpcoming } from './appointments';

const now = new Date('2026-03-10T10:00:00Z');

function appointmentAt(
  minutesFromNow: number,
  status: Appointment['status'] = 'BOOKED',
): Appointment {
  const startsAt = new Date(now.getTime() + minutesFromNow * 60 * 1000).toISOString();
  return {
    id: 'a1',
    status,
    createdAt: now.toISOString(),
    cancelledAt: null,
    slot: {
      id: 's1',
      startsAt,
      endsAt: startsAt,
      doctor: { id: 'd1', name: 'Dr. Test', specialty: 'General Practice' },
    },
  };
}

describe('canCancel', () => {
  it('allows a booked appointment more than 2 hours away', () => {
    expect(canCancel(appointmentAt(121), now)).toBe(true);
  });

  it('blocks an appointment exactly 2 hours away', () => {
    expect(canCancel(appointmentAt(120), now)).toBe(false);
  });

  it('blocks an appointment that is already cancelled', () => {
    expect(canCancel(appointmentAt(24 * 60, 'CANCELLED'), now)).toBe(false);
  });
});

describe('isUpcoming', () => {
  it('is true for a booked appointment in the future', () => {
    expect(isUpcoming(appointmentAt(30), now)).toBe(true);
  });

  it('is false for a past appointment', () => {
    expect(isUpcoming(appointmentAt(-30), now)).toBe(false);
  });

  it('is false for a cancelled future appointment', () => {
    expect(isUpcoming(appointmentAt(30, 'CANCELLED'), now)).toBe(false);
  });
});
