
export interface User {
  id: number;
  nome: string;
  email: string;
  unidades: number[];
  roles: string[];
  permissoes: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}
