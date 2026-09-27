import type { Request, Response } from 'express';
import * as doctorsService from '../services/doctors.service.js';

export async function listDoctors(_req: Request, res: Response) {
  const doctors = await doctorsService.listDoctors();
  res.json({ doctors });
}

export async function listAvailableSlots(req: Request<{ id: string }>, res: Response) {
  const { doctor, slots } = await doctorsService.getDoctorWithAvailableSlots(req.params.id);
  res.json({ doctor, slots });
}
