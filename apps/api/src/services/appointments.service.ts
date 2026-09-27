import { prisma } from '../lib/prisma.js';
import { HttpError } from '../errors/HttpError.js';
import { Prisma } from '../generated/prisma/client.js';
import {
  CANCELLATION_CUTOFF_HOURS,
  isInPast,
  isOutsideCancellationWindow,
} from './appointment.rules.js';

// What we return for an appointment: the appointment plus its slot and doctor.
const appointmentInclude = {
  slot: {
    select: {
      id: true,
      startsAt: true,
      endsAt: true,
      doctor: { select: { id: true, name: true, specialty: true } },
    },
  },
} satisfies Prisma.AppointmentInclude;

export async function bookAppointment(patientId: string, slotId: string, now = new Date()) {
  const slot = await prisma.timeSlot.findUnique({ where: { id: slotId } });
  if (!slot) {
    throw new HttpError(404, 'SLOT_NOT_FOUND', 'Time slot not found');
  }

  if (isInPast(slot.startsAt, now)) {
    throw new HttpError(422, 'SLOT_IN_PAST', 'You cannot book an appointment in the past');
  }

  try {
    return await prisma.appointment.create({
      data: { patientId, slotId, status: 'BOOKED' },
      include: appointmentInclude,
    });
  } catch (err) {
    // The database's unique index allows only one BOOKED appointment per slot.
    // Relying on it (rather than checking first) also covers two people booking at the same moment.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new HttpError(409, 'SLOT_ALREADY_BOOKED', 'This time slot is already booked');
    }
    throw err;
  }
}

export async function listPatientAppointments(patientId: string) {
  return prisma.appointment.findMany({
    where: { patientId },
    include: appointmentInclude,
    orderBy: { slot: { startsAt: 'asc' } },
  });
}

export async function cancelAppointment(
  patientId: string,
  appointmentId: string,
  now = new Date(),
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { slot: true },
  });

  if (!appointment) {
    throw new HttpError(404, 'APPOINTMENT_NOT_FOUND', 'Appointment not found');
  }

  if (appointment.patientId !== patientId) {
    throw new HttpError(403, 'NOT_YOUR_APPOINTMENT', 'You can only cancel your own appointments');
  }

  if (appointment.status === 'CANCELLED') {
    throw new HttpError(409, 'ALREADY_CANCELLED', 'This appointment is already cancelled');
  }

  if (!isOutsideCancellationWindow(appointment.slot.startsAt, now)) {
    throw new HttpError(
      422,
      'CANCELLATION_WINDOW_PASSED',
      `Appointments can only be cancelled more than ${CANCELLATION_CUTOFF_HOURS} hours before they start`,
    );
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'CANCELLED', cancelledAt: now },
    include: appointmentInclude,
  });
}

export async function listAllAppointments() {
  return prisma.appointment.findMany({
    include: {
      ...appointmentInclude,
      patient: { select: { id: true, name: true, email: true } },
    },
    orderBy: { slot: { startsAt: 'asc' } },
  });
}
