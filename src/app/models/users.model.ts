export interface Role {
  _id?: string;
  name: string;
  status?: string;
  lowerCaseName?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface User {
  id?: string;
  _id?: string;
  UserCode?: string;
  UserName: string;
  department?: string;
  role: string | Role;  // 👈 role can be a string or an object
  userName: string;
  password: string;
  lowerCaseName?: string;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  token?: string;
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