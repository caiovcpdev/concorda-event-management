export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errors: string[] | null;
}

export type UUID = string;

export type Perfil = "Administrador" | "Supervisor" | "Lider" | "Operador" | "Trabalhador";

export interface LoginRequest {
  email: string;
  senha: string;
}
export interface LoginResponse {
  token: string;
  expiracao: string;
}

export interface JwtClaims {
  nameid?: string;
  email?: string;
  role?: Perfil | Perfil[];
  exp?: number;
  [k: string]: unknown;
}

export interface Evento {
  id: UUID;
  nome: string;
  cidade: string;
  estado: string;
  dataInicio: string;
  dataFim: string;
  organizador: string;
  createdBy?: string;
}
export type CreateEventoDto = Omit<Evento, "id">;

export interface Trabalhador {
  id: UUID;
  nome: string;
  cpf: string;
  dataNascimento: string;
  sexo: number;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  status?: string;
  createdBy?: string;
}
export type CreateTrabalhadorDto = Omit<Trabalhador, "id" | "status">;

export interface EventoTrabalhador {
  id: UUID;
  eventoId: UUID;
  trabalhadorId: UUID;
  tipoTrabalhador: number;
  valorDiaria: number;
  nome?: string;
}
export interface VincularTrabalhadorDto {
  trabalhadorId: UUID;
  tipoTrabalhador: number;
  valorDiaria: number;
  createdBy?: string;
}

export interface Escala {
  id: UUID;
  eventoId: UUID;
  nome: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  pontoEncontro: string;
}
export type CreateEscalaDto = Omit<Escala, "id" | "eventoId"> & { createdBy?: string };

export interface CheckinDto {
  latitude: number;
  longitude: number;
  dispositivo: string;
}

export interface Ocorrencia {
  id: UUID;
  tipo: number;
  gravidade: number;
  descricao: string;
}
export interface CreateOcorrenciaDto {
  tipo: number;
  gravidade: number;
  descricao: string;
  createdBy?: string;
}

export interface Pagamento {
  id: UUID;
  eventoTrabalhadorId: UUID;
  valorPrevisto: number;
  valorPago?: number;
  dataPrevista: string;
  formaPagamento: number;
  status?: string;
  comprovanteUrl?: string;
}
export interface CreatePagamentoDto {
  valorPrevisto: number;
  dataPrevista: string;
  formaPagamento: number;
  createdBy?: string;
}
export interface RegistrarPagamentoDto {
  valorPago: number;
  formaPagamento: number;
  comprovanteUrl?: string;
}
