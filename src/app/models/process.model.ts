export interface MaterialUsed {
  name: string;
  quantity: number;
}

export interface RawMaterial {
  type: string;
  materialsUsed: MaterialUsed[];
}

export interface Process {
  _id?: string;
  processName: string;
 
  grade: string | string[];
  rawMaterial: RawMaterial[];
}


export interface SalaryHistory {
  salaryforProcess: number;
  salaryExcludingCoreMaking: number;
  salaryForCoreProduction: number;
  outSourcingCost: number;
  splOutSourcingCost: number;
  TotalOutSourcingCost: number;
  updatedAt: string;
  _id?: string;
}


export interface OverHeadsHistory {
  repairAndMaintenance: number;
  sellingDistributionAndMiscOverHeads: number;
  financeCost: number;
  totalOverHeads: number;
  totalOverHeadsWithFinanceCost: number;
  updatedAt: string;
  _id?: string;
}



