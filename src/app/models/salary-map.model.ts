export interface SalaryAndWages {
  salaryforProcess: number;
  salaryExcludingCoreMaking: number;
  salaryForCoreProduction: number;
  outSourcingCost: number;
  splOutSourcingCost: number;
  TotalOutSourcingCost: number;
}

export interface SalaryMapItem {
  processNames: string[];
  SalaryAndWages: SalaryAndWages;
}

export interface SalaryMapResponse {
  [key: string]: SalaryMapItem;
}
