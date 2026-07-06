// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export type ObservationArea =
  | "practical_life"
  | "sensorial"
  | "language"
  | "mathematics"
  | "cultural_studies"
  | "social_emotional"
  | "motor_skills"
  | "independence"
  | "behavior"
  | "general";

export const OBSERVATION_AREA_LABELS: Record<ObservationArea, string> = {
  practical_life: "Practical Life",
  sensorial: "Sensorial",
  language: "Language",
  mathematics: "Mathematics",
  cultural_studies: "Cultural Studies",
  social_emotional: "Social-Emotional",
  motor_skills: "Motor Skills",
  independence: "Independence",
  behavior: "Behavior",
  general: "General",
};

export type ObservationVisibility = "draft" | "visible_to_parent";

export type ObservationMood =
  | "happy"
  | "calm"
  | "focused"
  | "sensitive"
  | "tired"
  | "frustrated"
  | "excited"
  | "not_observed";

export type ObservationMediaType = "image" | "pdf" | "other";

// ─────────────────────────────────────────────
// SUB-TIPOS
// ─────────────────────────────────────────────

export interface ObservationMedia {
  id: string;

  fileName: string;
  fileUrl: string;
  fileType: string;

  publicId: string;
  resourceType: "image" | "raw";

  mediaType: ObservationMediaType;

  caption?: string;

  uploadedAt: string;
  uploadedBy: string;
}

export interface ObservationRecommendation {
  title: string;
  description: string;
}

// ─────────────────────────────────────────────
// DOCUMENTO PRINCIPAL — observations/{id}
// ─────────────────────────────────────────────

export interface Observation {
  id: string;

  studentId: string;
  teacherId: string;
  studentName?: string;
  teacherName?: string;
  areaLabel?: string;
  summary?: string;
  homeRecommendation?: string;

  observationDate: string; // YYYY-MM-DD

  area: ObservationArea;
  mood: ObservationMood;

  title: string;

  sessionSummary: string;
  activitiesWorked: string;

  strengths?: string;
  challenges?: string;

  homeRecommendations: ObservationRecommendation[];

  teacherNotes?: string;

  media: ObservationMedia[];

  visibility: ObservationVisibility;
  visibleToParent: boolean;
  publishedAt?: string;

  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// INPUT — creación
// ─────────────────────────────────────────────

export interface CreateObservationInput {
  studentId: string;
  teacherId: string;

  observationDate: string;

  area: ObservationArea;
  mood?: ObservationMood;

  title: string;

  sessionSummary: string;
  activitiesWorked: string;

  strengths?: string;
  challenges?: string;

  homeRecommendations?: ObservationRecommendation[];

  teacherNotes?: string;

  media?: ObservationMedia[];

  visibleToParent?: boolean;
}

// ─────────────────────────────────────────────
// INPUT — actualización
// ─────────────────────────────────────────────

export interface UpdateObservationInput {
  observationDate?: string;

  area?: ObservationArea;
  mood?: ObservationMood;

  title?: string;

  sessionSummary?: string;
  activitiesWorked?: string;

  strengths?: string;
  challenges?: string;

  homeRecommendations?: ObservationRecommendation[];

  teacherNotes?: string;

  media?: ObservationMedia[];

  visibleToParent?: boolean;
  visibility?: ObservationVisibility;
}