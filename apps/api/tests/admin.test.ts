import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import {
  authHeader,
  createAppointment,
  createDoctor,
  createSlot,
  createUser,
  hoursFromNow,
  resetDatabase,
} from './helpers.js';

const app = createApp();

beforeEach(resetDatabase);

describe('GET /api/admin/appointments', () => {
  it('rule: admins see every patient’s appointments, with status', async () => {
    const { token: adminToken } = await createUser('ADMIN');
    const { user: alice } = await createUser();
    const { user: bob } = await createUser();
    const doctor = await createDoctor();
    await createAppointment(alice.id, (await createSlot(doctor.id, hoursFromNow(24))).id, 'BOOKED');
    await createAppointment(
      bob.id,
      (await createSlot(doctor.id, hoursFromNow(25))).id,
      'CANCELLED',
    );

    const res = await request(app).get('/api/admin/appointments').set(authHeader(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.appointments).toHaveLength(2);
    expect(
      res.body.appointments.map((a: { patient: { id: string }; status: string }) => [
        a.patient.id,
        a.status,
      ]),
    ).toEqual([
      [alice.id, 'BOOKED'],
      [bob.id, 'CANCELLED'],
    ]);
    expect(res.body.appointments[0].patient).not.toHaveProperty('passwordHash');
  });

  it('forbids patients', async () => {
    const { token } = await createUser('PATIENT');

    const res = await request(app).get('/api/admin/appointments').set(authHeader(token));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('requires login', async () => {
    const res = await request(app).get('/api/admin/appointments');

    expect(res.status).toBe(401);
  });
});

describe('patient-only routes', () => {
  it('do not let admins book appointments', async () => {
    const { token } = await createUser('ADMIN');
    const slot = await createSlot((await createDoctor()).id, hoursFromNow(24));

    const res = await request(app)
      .post('/api/appointments')
      .set(authHeader(token))
      .send({ slotId: slot.id });

    expect(res.status).toBe(403);
  });
});
