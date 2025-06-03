export interface Material {
  _id: string; 
  name: string; 
  unitCost: number; 
  quantity?: number;
  description?: string; 
  createdAt?: string; 
  updatedAt?: string; 
  houseType?: string; // Optional field for material type
  materialType?: string; // Optional field for material type
}
