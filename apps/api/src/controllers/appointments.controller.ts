import type { Request, Response } from 'express';
import * as appointmentsService from '../services/appointments.service.js';
import { getAuthUser } from '../middleware/authenticate.js';

export async function book(req: Request, res: Response) {
  const user = getAuthUser(req);
  const appointment = await appointmentsService.bookAppointment(user.id, req.body.slotId);
  res.status(201).json({ appointment });
}

export async function listMine(req: Request, res: Response) {
  const user = getAuthUser(req);
  const appointments = await appointmentsService.listPatientAppointments(user.id);
  res.json({ appointments });
}

export async function cancel(req: Request<{ id: string }>, res: Response) {
  const user = getAuthUser(req);
  const appointment = await appointmentsService.cancelAppointment(user.id, req.params.id);
  res.json({ appointment });
}
