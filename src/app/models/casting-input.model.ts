export interface CastingData {
  _id: string;
  CastingInput: CastingInput;
  MouldingInput: MouldingInput;
  CoreInput: CoreInput;
  __v: number;
}

export interface CastingInput {
  _id: string;
  CastingWeight: number;
  Cavities: number;
  PouringWeight: number;
  CastingWeightKgPerHeat: number;
  Yeild: number;
  MaterialReturned: number;
  YeildPercent: number;
}

export interface MouldingInput {
  _id: string;
  MouldingWeight: number;
  MouldsPerHeat: number;
  BakeMoulding: number;
}

export interface CoreInput {
  _id: string;
  CoreWeight: number;
  CoresPerMould: number;
  CoreCavities: number;
  ShootingPerShift: number;
  CoreSand: number;
}



export interface SalaryAndWages {
  salaryforProcess: number;
  salaryExcludingCoreMaking: number;
  salaryForCoreProduction: number;
  outSourcingCost: number;
  splOutSourcingCost: number;
  TotalOutSourcingCost: number;
}

export interface OverHeads {
  repairAndMaintenance: number;
  sellingDistributionAndMiscOverHeads: number;
  financeCost: number;
  totalOverHeads: number;
  totalOverHeadsWithFinanceCost: number;
}

export interface CostSummary {
  _id: string;
  SalaryAndWages: SalaryAndWages;
  OverHeads: OverHeads;
  __v: number;
}
