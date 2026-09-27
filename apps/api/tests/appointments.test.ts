import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
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

describe('POST /api/appointments (book)', () => {
  it('books a free future slot', async () => {
    const { user, token } = await createUser();
    const doctor = await createDoctor('Dr. Book', 'Cardiology');
    const slot = await createSlot(doctor.id, hoursFromNow(24));

    const res = await request(app)
      .post('/api/appointments')
      .set(authHeader(token))
      .send({ slotId: slot.id });

    expect(res.status).toBe(201);
    expect(res.body.appointment).toMatchObject({
      patientId: user.id,
      status: 'BOOKED',
      slot: { id: slot.id, doctor: { name: 'Dr. Book', specialty: 'Cardiology' } },
    });
  });

  it('rule: a slot cannot be double-booked', async () => {
    const { user: firstPatient } = await createUser();
    const { token: secondToken } = await createUser();
    const slot = await createSlot((await createDoctor()).id, hoursFromNow(24));
    await createAppointment(firstPatient.id, slot.id, 'BOOKED');

    const res = await request(app)
      .post('/api/appointments')
      .set(authHeader(secondToken))
      .send({ slotId: slot.id });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('SLOT_ALREADY_BOOKED');
  });

  it('rule: two patients booking the same slot at the same moment get one booking', async () => {
    const { token: tokenA } = await createUser();
    const { token: tokenB } = await createUser();
    const slot = await createSlot((await createDoctor()).id, hoursFromNow(24));

    const responses = await Promise.all(
      [tokenA, tokenB].map((token) =>
        request(app).post('/api/appointments').set(authHeader(token)).send({ slotId: slot.id }),
      ),
    );

    expect(responses.map((res) => res.status).sort()).toEqual([201, 409]);
    expect(await prisma.appointment.count({ where: { slotId: slot.id, status: 'BOOKED' } })).toBe(
      1,
    );
  });

  it('allows booking a slot whose previous appointment was cancelled', async () => {
    const { user: firstPatient } = await createUser();
    const { token: secondToken } = await createUser();
    const slot = await createSlot((await createDoctor()).id, hoursFromNow(24));
    await createAppointment(firstPatient.id, slot.id, 'CANCELLED');

    const res = await request(app)
      .post('/api/appointments')
      .set(authHeader(secondToken))
      .send({ slotId: slot.id });

    expect(res.status).toBe(201);
  });

  it('rule: an appointment cannot be booked in the past', async () => {
    const { token } = await createUser();
    const slot = await createSlot((await createDoctor()).id, hoursFromNow(-1));

    const res = await request(app)
      .post('/api/appointments')
      .set(authHeader(token))
      .send({ slotId: slot.id });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('SLOT_IN_PAST');
  });

  it('returns 404 for a slot that does not exist', async () => {
    const { token } = await createUser();

    const res = await request(app)
      .post('/api/appointments')
      .set(authHeader(token))
      .send({ slotId: randomUUID() });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('SLOT_NOT_FOUND');
  });

  it('returns 400 when slotId is missing', async () => {
    const { token } = await createUser();

    const res = await request(app).post('/api/appointments').set(authHeader(token)).send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('requires login', async () => {
    const res = await request(app).post('/api/appointments').send({ slotId: randomUUID() });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/appointments (my appointments)', () => {
  it('returns only the logged-in patient’s appointments', async () => {
    const { user: me, token } = await createUser();
    const { user: someoneElse } = await createUser();
    const doctor = await createDoctor();
    const mySlot = await createSlot(doctor.id, hoursFromNow(24));
    const theirSlot = await createSlot(doctor.id, hoursFromNow(25));
    const mine = await createAppointment(me.id, mySlot.id);
    await createAppointment(someoneElse.id, theirSlot.id);

    const res = await request(app).get('/api/appointments').set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.appointments).toHaveLength(1);
    expect(res.body.appointments[0].id).toBe(mine.id);
  });
});

describe('POST /api/appointments/:id/cancel', () => {
  it('rule: a patient can cancel their own appointment more than 2 hours away', async () => {
    const { user, token } = await createUser();
    const slot = await createSlot((await createDoctor()).id, hoursFromNow(3));
    const appointment = await createAppointment(user.id, slot.id);

    const res = await request(app)
      .post(`/api/appointments/${appointment.id}/cancel`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.appointment.status).toBe('CANCELLED');
    expect(res.body.appointment.cancelledAt).toEqual(expect.any(String));
  });

  it('rule: a patient cannot cancel someone else’s appointment', async () => {
    const { user: owner } = await createUser();
    const { token: otherToken } = await createUser();
    const slot = await createSlot((await createDoctor()).id, hoursFromNow(24));
    const appointment = await createAppointment(owner.id, slot.id);

    const res = await request(app)
      .post(`/api/appointments/${appointment.id}/cancel`)
      .set(authHeader(otherToken));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('NOT_YOUR_APPOINTMENT');
    const unchanged = await prisma.appointment.findUniqueOrThrow({ where: { id: appointment.id } });
    expect(unchanged.status).toBe('BOOKED');
  });

  it('rule: a patient cannot cancel within 2 hours of the appointment', async () => {
    const { user, token } = await createUser();
    const slot = await createSlot((await createDoctor()).id, hoursFromNow(1.5));
    const appointment = await createAppointment(user.id, slot.id);

    const res = await request(app)
      .post(`/api/appointments/${appointment.id}/cancel`)
      .set(authHeader(token));

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('CANCELLATION_WINDOW_PASSED');
  });

  it('rejects cancelling an appointment twice', async () => {
    const { user, token } = await createUser();
    const slot = await createSlot((await createDoctor()).id, hoursFromNow(24));
    const appointment = await createAppointment(user.id, slot.id, 'CANCELLED');

    const res = await request(app)
      .post(`/api/appointments/${appointment.id}/cancel`)
      .set(authHeader(token));

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ALREADY_CANCELLED');
  });

  it('returns 404 for an appointment that does not exist', async () => {
    const { token } = await createUser();

    const res = await request(app)
      .post(`/api/appointments/${randomUUID()}/cancel`)
      .set(authHeader(token));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('APPOINTMENT_NOT_FOUND');
  });
});
