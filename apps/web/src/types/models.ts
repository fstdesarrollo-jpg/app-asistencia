export type UserRole = 'administrador' | 'profesional';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  nombre?: string;
}

export interface Madre {
  id: string;
  nombreCompleto: string;
  documento: string;
  municipio: string;
  numeroEquipo: string;
  coordinacion: string;
}

export type RolInterno =
  | 'equipo_psicosocial'
  | 'coordinadora'
  | 'coordinadora_tecnica'
  | null;

export interface Profesional {
  id: string;
  nombre: string;
  documento: string;
  cargo: string;
  municipio: string;
  numeroEquipo: string;
  coordinacion: string;
  /** Destinatarios de alertas internas filtradas por equipo + coordinación */
  rolInterno?: RolInterno;
}

export type ParticipantesTipo = 'general' | 'segmentada';

export interface BloqueReunion {
  id: string;
  fecha: string;
  hora: string;
  madresIds: string[];
}

export interface ResponsableReunion {
  nombre: string;
  cargo: string;
  numeroEquipo: string;
}

export interface Reunion {
  id: string;
  nombre: string;
  fecha: string;
  hora: string;
  responsable: ResponsableReunion;
  profesionalesIds: string[];
  participantesTipo: ParticipantesTipo;
  bloques: BloqueReunion[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type EstadoAsistenciaMadre = 'si' | 'no' | 'excusa';

export interface RegistroAsistencia {
  id: string;
  reunionId: string;
  bloqueId: string;
  tipo: 'madre' | 'profesional';
  madreId?: string;
  profesionalId?: string;
  madreDocumento?: string;
  profesionalDocumento?: string;
  estado: EstadoAsistenciaMadre | 'presente' | 'ausente';
  horaInicio?: string;
  motivoRetraso?: string;
  motivoNoAsiste?: string;
  fechaRegistro: string;
}

export type TipoAlerta =
  | 'asistencia'
  | 'inasistencia'
  | 'excusa'
  | 'reunion_programada'
  | 'acompanamiento'
  | 'grupo_interno';

export interface AlertaLog {
  id: string;
  tipo: TipoAlerta;
  dedupeKey: string;
  destinatarioTipo: 'madre' | 'profesional' | 'equipo_psicosocial' | 'coordinadora' | 'coordinadora_tecnica';
  destinatarioRef?: string;
  mensaje: string;
  reunionId?: string;
  bloqueId?: string;
  madreId?: string;
  numeroEquipo?: string;
  coordinacion?: string;
  creadoEn: string;
  metadata?: Record<string, string | number | boolean | undefined>;
}

export interface AlertaProgramada {
  id: string;
  fecha: string;
  hora: string;
  municipios: string[];
  mensaje?: string;
  reunionId?: string;
  creadoEn: string;
}

export interface SystemLog {
  id: string;
  nivel: 'info' | 'warn' | 'error';
  accion: string;
  detalle: string;
  uid?: string;
  creadoEn: string;
}

export const MUNICIPIOS_ALERTA = ['Ibagué', 'Lérida', 'Chaparral', 'Icononzo'] as const;

export const UMBRALES_LLAMADO = [3, 6, 9] as const;
