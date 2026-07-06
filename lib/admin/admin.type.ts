export type AdminStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "pending_profile";

export type AdminLevel =
  | "super_admin"
  | "school_admin"
  | "staff_admin";

export interface AdminPermissions {
  canManageUsers: boolean;
  canManageTeachers: boolean;
  canManageParents: boolean;
  canManageStudents: boolean;
  canManageGroups: boolean;
  canManagePayments: boolean;
  canManageEnrollments: boolean;
  canManageContent: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
}

export interface AdminContactInfo {
  phone: string;
  alternatePhone?: string;
}

export interface Admin {
  id: string;

  uid: string;
  userId: string;

  email: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;

  position: string;
  department?: string;

  adminLevel: AdminLevel;
  permissions: AdminPermissions;

  contact: AdminContactInfo;

  profileCompleted: boolean;
  status: AdminStatus;

  createdAt: string;
  updatedAt: string;
  lastAccessAt?: string;
}

export interface CreateAdminInput {
  uid: string;
  userId: string;

  email: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;

  position: string;
  department?: string;

  adminLevel: AdminLevel;
  permissions?: Partial<AdminPermissions>;

  contact: AdminContactInfo;
}

export interface UpdateAdminInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;

  position?: string;
  department?: string;

  adminLevel?: AdminLevel;
  permissions?: Partial<AdminPermissions>;

  contact?: Partial<AdminContactInfo>;

  profileCompleted?: boolean;
  status?: AdminStatus;
}