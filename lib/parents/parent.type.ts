export type ParentStatus =
  | "active"
  | "inactive"
  | "pending_profile"
  | "suspended";

export type PreferredContactMethod =
  | "phone"
  | "email"
  | "whatsapp"
  | "app_notification";

export interface ParentAddress {
  street: string;
  exteriorNumber?: string;
  interiorNumber?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  references?: string;
}

export interface ParentContactInfo {
  phone: string;
  alternatePhone?: string;
  whatsapp?: string;
}

export interface EmergencyContact {
  fullName: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
}

export interface AuthorizedPickupPerson {
  fullName: string;
  relationship: string;
  phone: string;
  identification?: string;
}

export interface Parent {
  id: string;

  uid: string;
  userId: string;

  email: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;

  contact: ParentContactInfo;
  address: ParentAddress;

  preferredContactMethod: PreferredContactMethod;

  emergencyContacts: EmergencyContact[];
  authorizedPickupPeople: AuthorizedPickupPerson[];

  occupation?: string;
  workplace?: string;

  profileCompleted: boolean;
  status: ParentStatus;

  createdAt: string;
  updatedAt: string;
}

export interface CreateParentInput {
  uid: string;
  userId: string;

  email: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;

  contact: ParentContactInfo;
  address: ParentAddress;

  preferredContactMethod?: PreferredContactMethod;

  emergencyContacts?: EmergencyContact[];
  authorizedPickupPeople?: AuthorizedPickupPerson[];

  occupation?: string;
  workplace?: string;
}

export interface UpdateParentInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;

  contact?: Partial<ParentContactInfo>;
  address?: Partial<ParentAddress>;

  preferredContactMethod?: PreferredContactMethod;

  emergencyContacts?: EmergencyContact[];
  authorizedPickupPeople?: AuthorizedPickupPerson[];

  occupation?: string;
  workplace?: string;

  profileCompleted?: boolean;
  status?: ParentStatus;
}