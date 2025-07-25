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



