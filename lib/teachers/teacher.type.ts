// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export type TeacherStatus =
  | "active"
  | "inactive"
  | "on_leave"
  | "suspended";

export type TeacherProgram =
  | "infant"
  | "toddler"
  | "primary"
  | "kindergarten";

export type TeacherContractType =
  | "full_time"
  | "part_time"
  | "temporary"
  | "substitute";

// ─────────────────────────────────────────────
// SUB-TIPOS
// ─────────────────────────────────────────────

export interface TeacherContactInfo {
  phone: string;
  alternatePhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface TeacherAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface TeacherQualification {
  title: string;
  institution?: string;
  year?: number;
}

export interface TeacherSchedule {
  day:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

// ─────────────────────────────────────────────
// DOCUMENTO PRINCIPAL — docente almacenado
// Colección: "teachers"
// ID del documento = Firebase Auth UID o id interno
// ─────────────────────────────────────────────

export interface Teacher {
  id: string;

  // Relación con users
  uid: string;          // UID de Firebase Auth
  userId: string;       // normalmente igual al uid del documento en users

  // Identidad
  email: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;

  // Información docente
  employeeNumber?: string;
  classroom: string;
  program: TeacherProgram;
  hireDate: string; // YYYY-MM-DD
  contractType: TeacherContractType;

  // Contacto
  contact: TeacherContactInfo;
  address?: TeacherAddress;

  // Formación
  qualifications: TeacherQualification[];

  // Horario
  schedule: TeacherSchedule[];

  // Alumnos / grupos asignados
  studentIds: string[];
  groupIds: string[];

  // Estado
  status: TeacherStatus;

  // Auditoría
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// INPUT — creación de docente
// ─────────────────────────────────────────────

export interface CreateTeacherInput {
  uid: string;
  userId: string;

  email: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;

  employeeNumber?: string;
  classroom: string;
  program: TeacherProgram;
  hireDate: string;
  contractType: TeacherContractType;

  contact: TeacherContactInfo;
  address?: TeacherAddress;

  qualifications?: TeacherQualification[];
  schedule?: TeacherSchedule[];

  studentIds?: string[];
  groupIds?: string[];
}

// ─────────────────────────────────────────────
// INPUT — actualización de docente
// ─────────────────────────────────────────────

export interface UpdateTeacherInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;

  employeeNumber?: string;
  classroom?: string;
  program?: TeacherProgram;
  hireDate?: string;
  contractType?: TeacherContractType;

  contact?: Partial<TeacherContactInfo>;
  address?: Partial<TeacherAddress>;

  qualifications?: TeacherQualification[];
  schedule?: TeacherSchedule[];

  studentIds?: string[];
  groupIds?: string[];

  status?: TeacherStatus;
}