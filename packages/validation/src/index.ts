import { z } from 'zod';

/** Shared structural validation; server-side authorization remains mandatory. */
export const tuCartonCodeSchema = z
  .string()
  .trim()
  .min(4)
  .max(16)
  .regex(/^[A-Z0-9]+$/);
