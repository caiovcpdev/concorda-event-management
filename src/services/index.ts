import { api, unwrap } from "@/lib/api";
import type {
  ApiResponse,
  CreateEventoDto,
  CreateEscalaDto,
  CreateOcorrenciaDto,
  CreatePagamentoDto,
  CreateTrabalhadorDto,
  Escala,
  Evento,
  EventoTrabalhador,
  Pagamento,
  RegistrarPagamentoDto,
  Trabalhador,
  VincularTrabalhadorDto,
  CheckinDto,
} from "@/types/api";

export const eventosService = {
  list: () => unwrap<Evento[]>(api.get<ApiResponse<Evento[]>>("/eventos")),
  get: (id: string) => unwrap<Evento>(api.get<ApiResponse<Evento>>(`/eventos/${id}`)),
  create: (dto: CreateEventoDto) =>
    unwrap<Evento>(api.post<ApiResponse<Evento>>("/eventos", dto)),
};

export const trabalhadoresService = {
  list: () => unwrap<Trabalhador[]>(api.get<ApiResponse<Trabalhador[]>>("/trabalhadores")),
  create: (dto: CreateTrabalhadorDto) =>
    unwrap<Trabalhador>(api.post<ApiResponse<Trabalhador>>("/trabalhadores", dto)),
  updateStatus: (id: string, status: string) =>
    unwrap<Trabalhador>(
      api.patch<ApiResponse<Trabalhador>>(`/trabalhadores/${id}/status`, null, {
        params: { status },
      }),
    ),
};

export const eventoTrabalhadoresService = {
  list: (eventoId: string) =>
    unwrap<EventoTrabalhador[]>(
      api.get<ApiResponse<EventoTrabalhador[]>>(`/eventos/${eventoId}/trabalhadores`),
    ),
  vincular: (eventoId: string, dto: VincularTrabalhadorDto) =>
    unwrap<EventoTrabalhador>(
      api.post<ApiResponse<EventoTrabalhador>>(`/eventos/${eventoId}/trabalhadores`, dto),
    ),
};

export const escalasService = {
  list: (eventoId: string) =>
    unwrap<Escala[]>(api.get<ApiResponse<Escala[]>>(`/eventos/${eventoId}/escalas`)),
  create: (eventoId: string, dto: CreateEscalaDto) =>
    unwrap<Escala>(api.post<ApiResponse<Escala>>(`/eventos/${eventoId}/escalas`, dto)),
};

export const checkinService = {
  checkin: (escalaTrabalhadorId: string, dto: CheckinDto) =>
    unwrap(api.post<ApiResponse<unknown>>(`/escalas/${escalaTrabalhadorId}/checkin`, dto)),
  checkout: (escalaTrabalhadorId: string) =>
    unwrap(api.post<ApiResponse<unknown>>(`/escalas/${escalaTrabalhadorId}/checkout`, {})),
};

export const ocorrenciasService = {
  create: (eventoTrabalhadorId: string, dto: CreateOcorrenciaDto) =>
    unwrap(
      api.post<ApiResponse<unknown>>(
        `/eventos/trabalhadores/${eventoTrabalhadorId}/ocorrencias`,
        dto,
      ),
    ),
};

export const pagamentosService = {
  create: (eventoTrabalhadorId: string, dto: CreatePagamentoDto) =>
    unwrap<Pagamento>(
      api.post<ApiResponse<Pagamento>>(
        `/eventos/trabalhadores/${eventoTrabalhadorId}/pagamentos`,
        dto,
      ),
    ),
  aprovar: (id: string) =>
    unwrap<Pagamento>(api.patch<ApiResponse<Pagamento>>(`/pagamentos/${id}/aprovar`, {})),
  registrar: (id: string, dto: RegistrarPagamentoDto) =>
    unwrap<Pagamento>(api.post<ApiResponse<Pagamento>>(`/pagamentos/${id}/pagar`, dto)),
};
