export interface User {
  _id: string;
  userName: string;
  name: string;
  email: string;
  password: string;
  birthDate: Date;
  useTerms: boolean;
  tastes: string[];
  followers: string[];
  following: string[];
}
