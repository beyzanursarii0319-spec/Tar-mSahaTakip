export interface Farmer {
  id: number;
  fullName: string;
  nationalId: string;
  phoneNumber: string;
  region: string;
  district: string;
  createdAt: string;
}

export type VisitStatus = 'Planned' | 'Completed' | 'Cancelled';
export type VisitType = 'Routine' | 'Training' | 'Inspection' | 'Emergency';

export interface FarmVisit {
  id: number;
  farmerId: number;
  visitDate: string;
  visitType: VisitType;
  notes?: string;
  status: VisitStatus;
  nextVisitDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DashboardSummary {
  totalFarmers: number;
  totalVisits: number;
  plannedVisits: number;
  completedVisits: number;
  upcomingVisits: FarmVisit[];
}