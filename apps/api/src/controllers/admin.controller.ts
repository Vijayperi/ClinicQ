import type { Request, Response } from 'express';
import * as appointmentsService from '../services/appointments.service.js';

export async function listAllAppointments(_req: Request, res: Response) {
  const appointments = await appointmentsService.listAllAppointments();
  res.json({ appointments });
}
