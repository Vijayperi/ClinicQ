import bcrypt from 'bcrypt';
import { prisma } from '../src/lib/prisma.js';
import { signToken } from '../src/services/token.service.js';
import type { Role } from '../src/generated/prisma/enums.js';

const HOUR_MS = 60 * 60 * 1000;

export function hoursFromNow(hours: number): Date {
  return new Date(Date.now() + hours * HOUR_MS);
}

// Empties every table so each test starts from a known state.
export async function resetDatabase() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "Appointment", "TimeSlot", "Doctor", "User" RESTART IDENTITY CASCADE',
  );
}

let userCounter = 0;

export async function createUser(role: Role = 'PATIENT', password = 'Password123!') {
  userCounter += 1;
  const user = await prisma.user.create({
    data: {
      email: `user${userCounter}@example.com`,
      name: `Test User ${userCounter}`,
      role,
      passwordHash: await bcrypt.hash(password, 4),
    },
  });
  return { user, token: signToken({ userId: user.id, role: user.role }) };
}

export async function createDoctor(name = 'Dr. Test', specialty = 'General Practice') {
  return prisma.doctor.create({ data: { name, specialty } });
}

export async function createSlot(doctorId: string, startsAt: Date) {
  return prisma.timeSlot.create({
    data: { doctorId, startsAt, endsAt: new Date(startsAt.getTime() + 30 * 60 * 1000) },
  });
}

export async function createAppointment(
  patientId: string,
  slotId: string,
  status: 'BOOKED' | 'CANCELLED' = 'BOOKED',
) {
  return prisma.appointment.create({ data: { patientId, slotId, status } });
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
