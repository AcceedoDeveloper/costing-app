export interface User {
  id?: string;
  UserCode?: string;
  UserName: string;
  department: string;
  role: string;
  userName: string; 
  password: string;
  _id?:string;
  
}

export interface Userget {
  _id: string;
  UserCode: string;
  UserName: string;
  lowerCaseName?: string;
  department?: string;
  role?: string;
  deleted?: boolean;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
  token?: string;
  userName?: string;
}