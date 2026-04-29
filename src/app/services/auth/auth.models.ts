export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  username: string;
  twoFactorRequired?: boolean;
  activationRequired?: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  phoneNumber: string;
  gender?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  roles: string[];
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  twoFactorEnabled?: boolean;
}

export interface Wallet {
  id: number;
  balance: number;
  currency: string;
  createdBy: string;
}
