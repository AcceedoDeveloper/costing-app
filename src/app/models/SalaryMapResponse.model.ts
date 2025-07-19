export interface SalaryMapResponseData {
  data: SalaryEntry[];
}

export interface SalaryEntry {
  _id: string;
  processName: string;
  salaryforProcess: number;
  salaryExcludingCoreMaking: number;
  salaryForCoreProduction: number;
  outSourcingCost: number;
  splOutSourcingCost: number;
  TotalOutSourcingCost: number;
  previousSalaryWagesDetails: PreviousSalaryWage[];
  createdAt: string; 
  updatedAt: string; 
  __v: number;
  date: string;
}

export interface PreviousSalaryWage {
  _id: string;
  salaryforProcess: number;
  salaryExcludingCoreMaking: number;
  salaryForCoreProduction: number;
  outSourcingCost: number;
  splOutSourcingCost: number;
  TotalOutSourcingCost: number;
  date: string; // ISO Date
}
