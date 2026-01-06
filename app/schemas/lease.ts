import { z } from "zod";
import { LeaseStatus } from "~/types/lease";

export const createLeaseSchema = z.object({
  tenantId: z.string().uuid("Invalid tenant"),
  unitId: z.string().uuid("Invalid unit"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  rentAmount: z.number().positive("Rent amount must be greater than 0"),
  securityDeposit: z.number().positive().optional(),
  status: z.nativeEnum(LeaseStatus).optional(),
});

export const updateLeaseSchema = z.object({
  startDate: z.string().min(1, "Start date is required").optional(),
  endDate: z.string().min(1, "End date is required").optional(),
  rentAmount: z
    .number()
    .positive("Rent amount must be greater than 0")
    .optional(),
  securityDeposit: z.number().positive().optional(),
  status: z.nativeEnum(LeaseStatus).optional(),
});

export type CreateLeaseSchema = z.output<typeof createLeaseSchema>;
export type UpdateLeaseSchema = z.output<typeof updateLeaseSchema>;
