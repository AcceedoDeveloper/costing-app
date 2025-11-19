export interface Customerdetails {
  _id: string;
  CustomerName: Customer;
  drawingNo: string;
  partName: string;
  processType: ProcessType;
  grade: Grade;
  Inputs: Inputs; // 👈 updated: grouping inputs
  __v: number;
}

export interface Customer {
  _id: string;
  name: string;
  lowerCaseName: string;
  __v: number;
  address: string;
  phoneNo: string;
}

export interface ProcessType {
  _id: string;
  name: string;
  lowerCaseName: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Grade {
  _id: string;
  name: string;
  gradeNo: string;
  rawMaterial: RawMaterialGroup[];
  createdOn: string;
  lastUpdated: string;
  __v: number;
}

export interface RawMaterialGroup {
  type: string;
  materialsUsed: MaterialUsed[];
}

export interface MaterialUsed {
  name: string;
  quantity: number;
  objectId: string;
}

export interface Inputs {
  castingInputs: CastingInput[];
  coreInputs: CoreInput[];
  mouldingInputs: MouldingInput[];
}

export interface CastingInput {
  _id: string;
  CastingWeight: number;
  Cavities: number;
  PouringWeight: number;
  CastingWeightPerKg: number;
  Yeild: number;
  MaterialReturned: number;
  __v: number;
}

export interface CoreInput {
  _id: string;
  CoreWeight: number;
  coresPerMould: number;
  Cavities: number;
  ShootingPerShift: number;
  CoreSand: number;
  __v: number;
}

export interface MouldingInput {
  _id: string;
  MouldingWeight: number;
  MouldsPerHeat: number;
  BakeMoulding: number;
  __v: number;
}


export interface CustomerProcess {
  _id?: string;
  CustomerName: string;
  drawingNo: string;
  partName: string;
  processName: string[];
  castingInputs: boolean;
  CastingWeight: number;
  Cavities: number;
  PouringWeight: number;
  mouldingInputs: boolean;
  coreInputs: boolean;
  processType?: any; 
  grade?: any;      
  Status?: string; 
  Inputs?: any;     
  __v?: number;
}




export interface Revision {
  processName: any[];
  castingInputs?: any;
  coreInputs?: any;
  mouldingInputs?: any;
  SalaryAndWages?: any;
  OverHeads?: any;
  CommercialTerms?: any;
  Margin?: any;
  AnticipatedRejection?: any;
  totalProcessCost?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerdetailsIn {
  _id: string;
  CustomerName: {
    _id: string;
    name: string;
    lowerCaseName: string;
  };
  drawingNo: string;
  partName: string;
  processName: any[]; // can type strongly later
  Inputs: {
    castingInputs: string[];
    coreInputs: string[];
    mouldingInputs: string[];
  };
  Revision?: Revision[]; // Array of revisions
  OverallTotalCost?: number;
  Status: string;
  createdAt?: string;
  updatedAt?: string;
}



export interface CustomerProcesss {
  CustomerName: string;
  drawingNo: string;
  partName: string;
  processName: string[];

  castingInputs?: boolean;
  CastingWeight?: number;
  Cavities?: number;
  PouringWeight?: number;

  mouldingInputs?: boolean;
  MouldingWeight?: number;
  BakeMoulding?: number;

  coreInputs?: boolean;
  CoreWeight?: number;
  CoresPerMould?: number;
  CoreCavities?: number;
  ShootingPerShift?: number;
  CoreSand?: number;

  salaryforProcess?: number;
  salaryExcludingCoreMaking?: number;
  salaryForCoreProduction?: number;
  outSourcingCost?: number;
  splOutSourcingCost?: number;

  repairAndMaintenance?: number;
  sellingDistributionAndMiscOverHeads?: number;
  financeCost?: number;

  paymentCreditPeriod?: number;
  bankInterest?: number;

  profit?: number;
  rejection?: number;

  heatTreatment?: number;
  postProcess?: number;
  packingAndTransport?: number;
  NozzleShotBlasting?: number;
  highPressureCleaning?: number;
}
