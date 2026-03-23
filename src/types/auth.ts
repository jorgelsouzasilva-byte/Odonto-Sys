
export interface User {
  id: string;
  nome: string;
  email: string;
  unidades: string[];
  roles: string[];
  permissoes: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}
