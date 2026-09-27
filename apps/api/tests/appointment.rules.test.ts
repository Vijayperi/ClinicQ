import { describe, expect, it } from 'vitest';
import { isInPast, isOutsideCancellationWindow } from '../src/services/appointment.rules.js';

const now = new Date('2026-03-10T10:00:00Z');
const minutes = (n: number) => new Date(now.getTime() + n * 60 * 1000);

describe('isInPast', () => {
  it('is true for a slot that has already started', () => {
    expect(isInPast(minutes(-1), now)).toBe(true);
  });

  it('is true for a slot starting right now', () => {
    expect(isInPast(now, now)).toBe(true);
  });

  it('is false for a slot in the future', () => {
    expect(isInPast(minutes(1), now)).toBe(false);
  });
});

describe('isOutsideCancellationWindow', () => {
  it('allows cancelling more than 2 hours ahead', () => {
    expect(isOutsideCancellationWindow(minutes(121), now)).toBe(true);
  });

  it('blocks cancelling exactly 2 hours ahead', () => {
    expect(isOutsideCancellationWindow(minutes(120), now)).toBe(false);
  });

  it('blocks cancelling less than 2 hours ahead', () => {
    expect(isOutsideCancellationWindow(minutes(119), now)).toBe(false);
  });

  it('blocks cancelling an appointment that has already started', () => {
    expect(isOutsideCancellationWindow(minutes(-30), now)).toBe(false);
  });
});
