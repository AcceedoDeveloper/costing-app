export interface AuthResponseData {
  user: {
    _id: string;
    UserId: string;
    UserCode: string;
    UserName: string;
   role: {
      _id: string;
      name: string;
      status: string;
      lowerCaseName: string;
      createdAt: string;
      updatedAt: string;
      __v: number;
    };
    userName: string;
    __v: number;
    createdAt: string;
    updatedAt: string;
    token: string;
  };
  token: string;
}
