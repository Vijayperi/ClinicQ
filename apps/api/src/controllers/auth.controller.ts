import type { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import { getAuthUser } from '../middleware/authenticate.js';

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body);
  res.json(result);
}

export async function me(req: Request, res: Response) {
  const user = await authService.getCurrentUser(getAuthUser(req).id);
  res.json({ user });
}
