import type { AdminAppointment, Appointment } from '../types';
import { apiRequest } from './client';

export function fetchMyAppointments() {
  return apiRequest<{ appointments: Appointment[] }>('/appointments');
}

export function bookAppointment(slotId: string) {
  return apiRequest<{ appointment: Appointment }>('/appointments', {
    method: 'POST',
    body: { slotId },
  });
}

export function cancelAppointment(appointmentId: string) {
  return apiRequest<{ appointment: Appointment }>(`/appointments/${appointmentId}/cancel`, {
    method: 'POST',
  });
}

export function fetchAllAppointments() {
  return apiRequest<{ appointments: AdminAppointment[] }>('/admin/appointments');
}
