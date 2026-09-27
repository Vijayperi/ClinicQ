import { Router } from 'express';
import * as appointmentsController from '../controllers/appointments.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { bookAppointmentSchema } from '../schemas/appointment.schema.js';
import { idParamSchema } from '../schemas/common.schema.js';

export const appointmentsRouter = Router();

// Every appointment route needs a logged-in patient.
appointmentsRouter.use(authenticate, requireRole('PATIENT'));

appointmentsRouter.get('/', appointmentsController.listMine);
appointmentsRouter.post(
  '/',
  validate({ body: bookAppointmentSchema }),
  appointmentsController.book,
);
appointmentsRouter.post(
  '/:id/cancel',
  validate({ params: idParamSchema }),
  appointmentsController.cancel,
);
