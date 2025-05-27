export interface Role {
  _id: string;
  name: string;
  status?: string;
  lowerCaseName?: string;
  createdAt?: string;
  updatedAt?: string;
}



export interface Customer {
  _id: string;
  name: string;
  lowerCaseName: string;
  __v: number;
}
