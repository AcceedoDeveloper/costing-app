export interface PreviousCostDetail {
  totalUnitPerProcess: number;
  totalUnitCost: number;
  date: string;
  _id: string;
}

export interface PowerCostData {
  _id: string;
  processName: string;
  totalUnitPerProcess: number;
  totalUnitCost: number;
  previousUnitCostDetails: PreviousCostDetail[];
  createdAt: string;
  updatedAt: string;
  processId: string; 
}
