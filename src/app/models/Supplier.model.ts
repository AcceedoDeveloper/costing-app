export interface Supplier {
  _id: string;
  name: string;
  materialType: string;
  materialName: string;
  quantity: number;
  ratePerKg: string; 
  effectiveTill: string; 
  address: string;
  __v?: number;
}
