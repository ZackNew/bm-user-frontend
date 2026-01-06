export enum TenantStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export interface Tenant {
  id: string;
  buildingId: string;
  unitId?: string;
  name: string;
  email: string;
  phone?: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
  unit?: {
    id: string;
    unitNumber: string;
    floor?: number;
  };
}

export interface CreateTenantRequest {
  name: string;
  email: string;
  phone?: string;
  unitId?: string;
  status?: TenantStatus;
}

export interface UpdateTenantRequest {
  name?: string;
  email?: string;
  phone?: string;
  unitId?: string;
  status?: TenantStatus;
}
