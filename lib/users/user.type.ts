// ─────────────────────────────────────────────
//  ENUMS
// ─────────────────────────────────────────────

export type UserRole = "admin" | "teacher" | "parent";

export type AccountStatus =
  | "active"
  | "inactive"
  | "pending_verification"
  | "suspended";

export type PreferredLanguage = "english" | "spanish" | "other";

// ─────────────────────────────────────────────
//  SUB-TIPOS
// ─────────────────────────────────────────────

export interface ContactInfo {
  phone: string;
  alternatePhone?: string;   // opcional
}

// ─────────────────────────────────────────────
//  DOCUMENTO PRINCIPAL — usuario almacenado
//  Colección: "users"
//  ID del documento = Firebase Auth UID
// ─────────────────────────────────────────────

export interface User {
  id: string;                // = uid

  // Identidad
  uid: string;               // Firebase Auth UID
  email: string;             // espejo de Firebase Auth
  firstName: string;
  lastName: string;
  photoUrl?: string;         // opcional

  // Rol — define qué puede hacer en el sistema
  role: UserRole;

  // Contacto
  contact: ContactInfo;

  // Preferencias
  preferredLanguage: PreferredLanguage;

  // ── Campos específicos por rol ──
  // (todos opcionales porque dependen de `role`)

  // Solo admin
  permissions?: AdminPermissions;

  // Solo teacher
  teacherInfo?: TeacherInfo;

  // Solo parent
  parentInfo?: ParentInfo;

  // Estado de la cuenta
  accountStatus: AccountStatus;

  // Auditoría
  createdAt: string;         // ISO datetime
  updatedAt: string;         // ISO datetime
  lastLoginAt?: string;       // ISO datetime — opcional
}

// ─────────────────────────────────────────────
//  ADMIN — permisos granulares (opcional usar)
// ─────────────────────────────────────────────

export interface AdminPermissions {
  canManageUsers: boolean;
  canManagePayments: boolean;
  canManageEnrollments: boolean;
  canManageContent: boolean;
}

// ─────────────────────────────────────────────
//  TEACHER — información del docente
// ─────────────────────────────────────────────

export interface TeacherInfo {
  classroom: string;          // ej. "Primary A", "Toddler Room 2"
  program: "infant" | "toddler" | "primary" | "kindergarten";
  hireDate: string;            // ISO date "YYYY-MM-DD"
  studentIds: string[];        // alumnos asignados a su salón
}

// ─────────────────────────────────────────────
//  PARENT — información del padre/tutor
// ─────────────────────────────────────────────

export interface ParentInfo {
  studentIds: string[];        // alumnos vinculados
  relationshipToStudent:
    | "mother"
    | "father"
    | "grandmother"
    | "grandfather"
    | "aunt"
    | "uncle"
    | "legal_guardian"
    | "other";
}

// ─────────────────────────────────────────────
//  INPUT — creación de usuario
//  Se llama justo después del registro en
//  Firebase Auth (signup) o cuando el admin
//  crea cuentas de docentes manualmente.
// ─────────────────────────────────────────────

export interface CreateUserInput {
  uid: string;                 // del token de sesión, nunca del body
  email: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  role: UserRole;
  contact: ContactInfo;
  preferredLanguage: PreferredLanguage;

  // Solo se usan según el role
  teacherInfo?: TeacherInfo;
  parentInfo?: ParentInfo;
}

// ─────────────────────────────────────────────
//  INPUT — actualización de perfil
// ─────────────────────────────────────────────

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  contact?: Partial<ContactInfo>;
  preferredLanguage?: PreferredLanguage;

  // Solo admin puede modificar estos
  role?: UserRole;
  accountStatus?: AccountStatus;
  permissions?: Partial<AdminPermissions>;

  // Actualización de info específica por rol
  teacherInfo?: Partial<TeacherInfo>;
  parentInfo?: Partial<ParentInfo>;
}