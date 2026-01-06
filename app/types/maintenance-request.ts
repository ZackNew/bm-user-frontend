export enum MaintenanceRequestStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum MaintenanceRequestPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export interface Note {
  text: string;
  author: string;
  timestamp: string;
}

export interface MaintenanceRequest {
  id: string;
  buildingId: string;
  tenantId: string;
  unitId?: string;
  title: string;
  description: string;
  priority: MaintenanceRequestPriority;
  status: MaintenanceRequestStatus;
  notes?: Note[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  tenant: {
    id: string;
    name: string;
    email: string;
  };
  unit?: {
    id: string;
    unitNumber: string;
    floor?: number;
  };
}

export interface CreateMaintenanceRequestRequest {
  title: string;
  description: string;
  priority?: MaintenanceRequestPriority;
  tenantId?: string;
}

export interface UpdateMaintenanceRequestRequest {
  status?: MaintenanceRequestStatus;
  note?: string;
}
