export interface MaterialUsed {
  name: string;
  type: string;
  quantity: number;
}

export interface Grade {
  gradeNo: string;
  name: string;
  price: number;
  totalQuantity: number;
  baseMetalQuantity: number;
  alloyQuantity: number;
  baseMetalPrice: number;
  alloyPrice: number;
  materialsUsed: MaterialUsed[];
}
