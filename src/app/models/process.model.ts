export interface MaterialUsed {
  name: string;
  quantity: number;
}

export interface RawMaterial {
  type: string;
  materialsUsed: MaterialUsed[];
}

export interface Process {
  processName: string;
  grade: string;
  rawMaterial: RawMaterial[];
}