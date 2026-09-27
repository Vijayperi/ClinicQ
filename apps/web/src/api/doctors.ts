import type { Doctor, Slot } from '../types';
import { apiRequest } from './client';

export function fetchDoctors() {
  return apiRequest<{ doctors: Doctor[] }>('/doctors');
}

export function fetchDoctorSlots(doctorId: string) {
  return apiRequest<{ doctor: Doctor; slots: Slot[] }>(`/doctors/${doctorId}/slots`);
}
