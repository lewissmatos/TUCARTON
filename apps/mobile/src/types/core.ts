export interface User {
  tuCartonCode: string;
}
export interface Business {
  id: string;
  name: string;
}
export interface Debt {
  id: string;
  amountMinor: number;
  note: string | null;
  status: string;
}
export interface Session {
  accessToken: string;
  refreshToken: string;
  user: User;
}
