import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import {
  createAppointment,
  createDoctor,
  createSlot,
  createUser,
  hoursFromNow,
  resetDatabase,
} from './helpers.js';

const app = createApp();

beforeEach(resetDatabase);

describe('GET /api/doctors', () => {
  it('lists doctors with their specialties, sorted by name', async () => {
    await createDoctor('Dr. Zed', 'Cardiology');
    await createDoctor('Dr. Amy', 'Dermatology');

    const res = await request(app).get('/api/doctors');

    expect(res.status).toBe(200);
    expect(res.body.doctors).toEqual([
      { id: expect.any(String), name: 'Dr. Amy', specialty: 'Dermatology' },
      { id: expect.any(String), name: 'Dr. Zed', specialty: 'Cardiology' },
    ]);
  });
});

describe('GET /api/doctors/:id/slots', () => {
  it('returns the doctor and only their future slots that are not booked', async () => {
    const doctor = await createDoctor();
    const { user: patient } = await createUser();
    await createSlot(doctor.id, hoursFromNow(-3)); // in the past
    const bookedSlot = await createSlot(doctor.id, hoursFromNow(24));
    const freeSlot = await createSlot(doctor.id, hoursFromNow(25));
    const reopenedSlot = await createSlot(doctor.id, hoursFromNow(26));
    await createAppointment(patient.id, bookedSlot.id, 'BOOKED');
    await createAppointment(patient.id, reopenedSlot.id, 'CANCELLED');

    const res = await request(app).get(`/api/doctors/${doctor.id}/slots`);

    expect(res.status).toBe(200);
    expect(res.body.doctor).toEqual({ id: doctor.id, name: 'Dr. Test', specialty: 'General Practice' });
    expect(res.body.slots.map((slot: { id: string }) => slot.id)).toEqual([
      freeSlot.id,
      reopenedSlot.id,
    ]);
  });

  it('returns 404 for an unknown doctor', async () => {
    const res = await request(app).get(`/api/doctors/${randomUUID()}/slots`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('DOCTOR_NOT_FOUND');
  });

  it('returns 400 for a malformed doctor id', async () => {
    const res = await request(app).get('/api/doctors/not-a-uuid/slots');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
