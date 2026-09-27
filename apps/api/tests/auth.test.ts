import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { authHeader, createUser, resetDatabase } from './helpers.js';

const app = createApp();

beforeEach(resetDatabase);

describe('POST /api/auth/register', () => {
  it('creates a patient and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'New.Patient@Example.com', name: 'New Patient', password: 'Password123!' });

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ email: 'new.patient@example.com', role: 'PATIENT' });
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('ignores an attempt to register as an admin', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'sneaky@example.com',
      name: 'Sneaky',
      password: 'Password123!',
      role: 'ADMIN',
    });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('PATIENT');
  });

  it('rejects an email that is already registered', async () => {
    const body = { email: 'dup@example.com', name: 'Dup', password: 'Password123!' };
    await request(app).post('/api/auth/register').send(body);

    const res = await request(app).post('/api/auth/register').send(body);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('rejects invalid input with field errors', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', name: '', password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(Object.keys(res.body.error.details)).toEqual(
      expect.arrayContaining(['email', 'name', 'password']),
    );
  });
});

describe('POST /api/auth/login', () => {
  it('returns a token for correct credentials', async () => {
    const { user } = await createUser('PATIENT', 'Password123!');

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.id).toBe(user.id);
  });

  it('rejects a wrong password', async () => {
    const { user } = await createUser('PATIENT', 'Password123!');

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'WrongPassword!' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('gives the same error for an unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Password123!' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('GET /api/auth/me', () => {
  it('returns the logged-in user', async () => {
    const { user, token } = await createUser();

    const res = await request(app).get('/api/auth/me').set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: user.id, email: user.email });
  });

  it('rejects a request without a token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects a tampered token', async () => {
    const { token } = await createUser();

    const res = await request(app)
      .get('/api/auth/me')
      .set(authHeader(`${token.slice(0, -2)}xx`));

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });
});
