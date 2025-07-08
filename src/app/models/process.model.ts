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
  totalUnitPerProcess: number;
  grade: string | string[];
  rawMaterial: RawMaterial[];
}