// The shapes of the JSON the API returns. Dates arrive as ISO strings.

export type Role = 'PATIENT' | 'ADMIN';
export type AppointmentStatus = 'BOOKED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

export interface Slot {
  id: string;
  startsAt: string;
  endsAt: string;
}

export interface Appointment {
  id: string;
  status: AppointmentStatus;
  createdAt: string;
  cancelledAt: string | null;
  slot: Slot & { doctor: Doctor };
}

export interface AdminAppointment extends Appointment {
  patient: { id: string; name: string; email: string };
}
