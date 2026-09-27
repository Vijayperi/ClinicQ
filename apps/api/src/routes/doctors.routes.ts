import { Router } from 'express';
import * as doctorsController from '../controllers/doctors.controller.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../schemas/common.schema.js';

export const doctorsRouter = Router();

// Public: anyone can browse doctors and open slots before logging in.
doctorsRouter.get('/', doctorsController.listDoctors);
doctorsRouter.get(
  '/:id/slots',
  validate({ params: idParamSchema }),
  doctorsController.listAvailableSlots,
);
