export interface UserInfo {
  address: Address;
  dateOfBirth: string;
  email: string;
  gender: string;
  phone: string;
  sub: string;
  name: string;
  firstName: string;
  lastName: string;
}

export interface Address{
  street_address: string;
  locality: string;
  region: string;
  postal_code: string;
  country: string;
}
