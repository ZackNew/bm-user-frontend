export interface SubscriptionPlan {
  id: string;
  name: string;
  buildingPrice: number;
  managerPrice: number;
  status: "active" | "inactive";
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  buildingCount: number;
  managerCount: number;
  totalAmount: number;
  billingCycleStart: string;
  billingCycleEnd: string;
  nextBillingDate: string;
  status: "active" | "cancelled" | "expired";
  plan?: SubscriptionPlan;
  createdAt: string;
  updatedAt: string;
}
