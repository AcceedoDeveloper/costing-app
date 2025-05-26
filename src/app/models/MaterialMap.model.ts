export interface MaterialItem {
  _id: string;
  name: string;
  unitCost: number;
}

export interface MaterialMap {
  [key: string]: MaterialItem[];
}




export interface Roles {
  _id: string;
  name: string;
}


export interface MaterialMapResponse {
  materialMap: MaterialMap;
  roleMap: Roles[];
}
