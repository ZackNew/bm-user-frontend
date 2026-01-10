import { z } from "zod";
import { TenantStatus } from "~/types/tenant";

export const createTenantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  unitId: z.string().uuid().optional(),
  status: z.nativeEnum(TenantStatus).optional(),
  password: z.string().min(6).optional(),
});

export const updateTenantSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  unitId: z.string().uuid().optional(),
  status: z.nativeEnum(TenantStatus).optional(),
});

export type CreateTenantSchema = z.output<typeof createTenantSchema>;
export type UpdateTenantSchema = z.output<typeof updateTenantSchema>;
