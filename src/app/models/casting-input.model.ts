// models/casting-input.model.ts
export interface CastingInput {
  _id: string;
  CastingWeight: number;
  Cavities: number;
  PouringWeight: number;
  CastingWeightPerKg: number;
  Yeild: number;
  MaterialReturned: number;
  __v?: number;
}



// models/casting-input.model.ts
export interface MouldingInput {
  _id: string;
  BakeMoulding: number;
  MouldingWeight: number;
  MouldsPerHeat: number;
  __v?: number;
}



export interface CoreInput {
  _id: string;
 CoreWeight: number;
  coresPerMould: number;
 Cavities: number;
  ShootingPerShift: number;
  CoreSand: number;
  __v?: number; // optional since it's usually used internally by MongoDB
}
