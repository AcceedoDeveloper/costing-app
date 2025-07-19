export interface Overheads {
  _id: string;
  processName: string;
  repairAndMaintenance: number;
  sellingDistributionAndMiscOverHeads: number;
  financeCost: number;
  totalOverHeads: number;
  totalOverHeadsWithFinanceCost: number;
  previousOverheadsDetails: PreviousOverhead[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  date: string;
}

export interface PreviousOverhead {
  repairAndMaintenance: number;
  sellingDistributionAndMiscOverHeads: number;
  financeCost: number;
  totalOverHeads: number;
  totalOverHeadsWithFinanceCost: number;
  date: string;
  _id: string;
}



export interface PowerCost {
  _id?: string;
  costPerUnit: number;
  effectiveDate: string;
  previousCostDetails?: any[]; 
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
}
