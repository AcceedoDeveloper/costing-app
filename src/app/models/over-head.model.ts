export interface OverHead {
  _id?: string;       // optional for new items
  name: string;
  code: number;
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
