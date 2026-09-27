import { Router } from 'express';
import { adminRouter } from './admin.routes.js';
import { appointmentsRouter } from './appointments.routes.js';
import { authRouter } from './auth.routes.js';
import { doctorsRouter } from './doctors.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/doctors', doctorsRouter);
apiRouter.use('/appointments', appointmentsRouter);
apiRouter.use('/admin', adminRouter);
