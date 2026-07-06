export type TuitionPlanStatus = "active" | "inactive";

export type PaymentType =
  | "registration"
  | "monthly_tuition"
  | "reenrollment"
  | "other";


  export type PaymentStatus =
  | "pending"          // creado, esperando comprobante
  | "submitted"        // padre subió comprobante
  | "approved"         // admin aceptó
  | "rejected"         // admin rechazó, padre puede reenviar
  | "paid_manually"    // admin marcó pagado sin comprobante
  | "overdue"          // vencido
  | "cancelled";

export type MontessoriProgram =
  | "infant"
  | "toddler"
  | "primary"
  | "kindergarten";

export type ScheduleType = "full_time" | "part_time";

export interface PaymentReceipt {
  fileName: string;
  fileUrl: string;
  fileType: string;
  publicId: string;
  resourceType: "image" | "raw";
  uploadedAt: string;
}

export interface TuitionPlan {
  id: string;

  name: string;
  program: MontessoriProgram;
  scheduleType: ScheduleType;

  monthlyAmount: number;
  registrationFee: number;
  reenrollmentFee?: number;

  currency: "USD";
  status: TuitionPlanStatus;

  createdAt: string;
  updatedAt: string;
}

export interface CreateTuitionPlanInput {
  name: string;
  program: MontessoriProgram;
  scheduleType: ScheduleType;
  monthlyAmount: number;
  registrationFee: number;
  reenrollmentFee?: number;
}

export interface UpdateTuitionPlanInput {
  name?: string;
  monthlyAmount?: number;
  registrationFee?: number;
  reenrollmentFee?: number;
  status?: TuitionPlanStatus;
}

export interface TuitionPayment {
  id: string;

  studentId: string;
  parentId: string;

  type: PaymentType;
  title: string;
  description?: string;

  amount: number;
  currency: "USD";
  dueDate: string;

  status: PaymentStatus;

  receipt?: PaymentReceipt;

  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;

  markedPaidAt?: string;
  markedPaidBy?: string;
  manualPaymentNotes?: string;

  billingMonth?: string;
  billingCycleId?: string;
  program?: string;
  scheduleType?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateTuitionPaymentInput {
  studentId: string;
  parentId: string;
  type: PaymentType;
  title: string;
  description?: string;
  amount: number;
  dueDate: string;
  billingMonth?: string;
  billingCycleId?: string;
  program?: string;
  scheduleType?: string;
}

export interface SubmitTuitionPaymentInput {
  receipt: PaymentReceipt;
}

export interface ReviewTuitionPaymentInput {
  status: "approved" | "rejected";
  reviewedBy: string;
  reviewNotes?: string;
}

export type BillingCycleStatus =
  | "open"
  | "closed"
  | "cancelled";

export interface TuitionBillingCycle {
  id: string;
  billingMonth: string; // "2026-07"
  title: string;
  dueDate: string; // "2026-07-05"
  status: BillingCycleStatus;

  createdPayments: number;
  skippedStudents: number;
  totalActiveStudents: number;

  expectedRevenue: number;
  collectedRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
  collectionRate: number;

  students: number;

  plans: {
    program: string;
    scheduleType: string;
    expectedRevenue: number;
    collectedRevenue: number;
    pendingRevenue: number;
    students: number;
  }[];

  createdAt: string;
  updatedAt: string;
}