import { z } from "zod";
import {
  MaintenanceRequestPriority,
  MaintenanceRequestStatus,
} from "~/types/maintenance-request";

export const createMaintenanceRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.nativeEnum(MaintenanceRequestPriority).optional(),
  tenantId: z.string().uuid().optional(),
});

export const updateMaintenanceRequestSchema = z.object({
  status: z.nativeEnum(MaintenanceRequestStatus).optional(),
  note: z.string().min(1, "Note cannot be empty").optional(),
});

export type CreateMaintenanceRequestSchema = z.output<
  typeof createMaintenanceRequestSchema
>;
export type UpdateMaintenanceRequestSchema = z.output<
  typeof updateMaintenanceRequestSchema
>;
