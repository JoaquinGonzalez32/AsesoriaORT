export enum ResultadoLlamada {
  PrimerContacto = '1er Contacto',
  Contactado = 'Contactado',
  NoInteresado = 'No interesado',
  Interesado = 'Interesado',
  NumeroIncorrecto = 'Número Incorrecto',
  LlamarMasTarde = 'Llamar más tarde'
}

export enum LiceoTipo {
  Publico = 'Publico',
  Privado = 'Privado',
  Interior = 'Interior'
}

export enum FaseOportunidad {
  Interesado = 'Interesado',
  Evaluando = 'Evaluando',
  NoInteresado = 'No interesado',
  Contactado = 'Contactado',
  PromesaInscripcion = 'Promesa de Inscripción',
  Inscripto = 'Inscripto'
}

export enum ModalidadRAS {
  Presencial = 'Presencial',
  EnLinea = 'En línea'
}

export enum HorarioLlamada {
  Manana = 'Mañana',
  Tarde = 'Tarde',
  Noche = 'Noche'
}

export interface Lead {
  lead_id: string;
  nombre: string;
  carrera_interes: string;
  fecha_lead: string;
  resultado_llamada: ResultadoLlamada;
  horario_llamada?: HorarioLlamada | null;
  intentos_llamado: number;
  comentario: string;
  owner: string | null;
  convertido?: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Oportunidad {
  opp_id: string;
  nombre: string;
  cedula?: string;
  telefono?: string;
  mail?: string;
  sape?: string;
  carrera_interes: string;
  otros_intereses?: string[] | null;
  liceo: string;
  fecha_lead: string;
  ras_agendada: boolean;
  ras_asistio: boolean;
  multiple_interes: boolean;
  liceo_tipo: LiceoTipo;
  ras_hecha_por: string | null;
  owner: string | null;
  proceso_inicio: string;
  fase_oportunidad: FaseOportunidad;
  comentario_extra: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface RAS {
  ras_id: string;
  opp_id: string;
  titulo: string;
  nombre_interesado: string;
  agente_nombre: string;
  fecha_hora: string;
  modalidad: ModalidadRAS;
  carrera: string;
  estado_oportunidad: string;
  owner: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface KPIStats {
  totalLeads: number;
  contactados: number;
  interesados: number;
  totalOpps: number;
  rasAgendadas: number;
  rasAsistidas: number;
}