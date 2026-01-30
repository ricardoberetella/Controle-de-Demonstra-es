
export enum DemonstrationStatus {
  PENDING = 'PENDING',
  DONE = 'DONE'
}

export interface Operation {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface DemonstrationRecord {
  status: DemonstrationStatus;
  date: string | null;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  demonstrations: Record<string, DemonstrationRecord>; // Key is operationId
}

export interface ClassRoom {
  id: string;
  name: string;
}

export interface AIAnalysis {
  summary: string;
  suggestions: string[];
}
