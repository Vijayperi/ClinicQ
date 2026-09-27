import { prisma } from '../lib/prisma.js';
import { HttpError } from '../errors/HttpError.js';

export async function listDoctors() {
  return prisma.doctor.findMany({
    select: { id: true, name: true, specialty: true },
    orderBy: { name: 'asc' },
  });
}

// Slots that are in the future and don't have an active booking.
export async function listAvailableSlots(doctorId: string, now = new Date()) {
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) {
    throw new HttpError(404, 'DOCTOR_NOT_FOUND', 'Doctor not found');
  }

  return prisma.timeSlot.findMany({
    where: {
      doctorId,
      startsAt: { gt: now },
      appointments: { none: { status: 'BOOKED' } },
    },
    select: { id: true, startsAt: true, endsAt: true },
    orderBy: { startsAt: 'asc' },
  });
}
