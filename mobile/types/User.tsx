export interface User {
  id: number;
  userName: string;
  name: string;
  email: string;
  password: string;
  birthDate: Date;
  useTerms: boolean;
  tastes: string[];
}
