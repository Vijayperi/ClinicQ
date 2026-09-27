import { z } from 'zod';

export const bookAppointmentSchema = z.object({
  slotId: z.uuid('Invalid slot id'),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
