export interface NestedMaterialUsed {
  name: string;
  quantity: number;
  objectId: string;
}

export interface RawMaterial {
  type: string;
  materialsUsed: NestedMaterialUsed[];
}


export interface FlatMaterialUsed {
  name: string;
  quantity: number;
  objectId: string;
}


export interface Grade {
  _id?: string;
  gradeNo: string;
  name: string;
  price?: number;
  totalQuantity?: number;
  baseMetalQuantity?: number;
  alloyQuantity?: number;
  baseMetalPrice?: number;
  alloyPrice?: number;
  materialsUsed?: FlatMaterialUsed[]; 
  rawMaterial?: RawMaterial[];        
  createdOn?: string;
  lastUpdated?: string;
}
