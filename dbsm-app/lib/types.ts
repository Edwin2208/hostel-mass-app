// ============================================================
// types.ts – All TypeScript types for DBSM Hostel App
// ============================================================

export type Gender = 'male' | 'female';
export type Domain = 'CP-01' | 'CP-02' | 'EV' | 'DCOM' | 'GSA';
export type Religion = 'Catholic' | 'Christian (non-Catholic)' | 'Hindu' | 'Muslim' | 'Sikh' | 'Buddhist' | 'Other';
export type Role = 'admin' | 'trainee';
export type CycleFrequency = 'monthly' | '15-day';
export type ReadingRole = 'First Reading' | 'Second Reading' | 'Responsorial Psalm';
export type DayType = 'weekday' | 'sunday' | 'feast';
export type RefStatus = 'success' | 'pending' | 'failed';

export interface Trainee {
  id: string;
  name: string;
  gender: Gender;
  domain: Domain;
  motherTongue: string;
  religion: Religion;
  dob: string; // ISO date
  contactNumber: string;
  willingToRead: boolean;
  username: string;
  passwordHash: string;
  role: 'trainee';
  createdAt: string;
  // Current cycle assignment (denormalized for quick access)
  currentTableId?: string;
  currentSeatNumber?: number;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  role: 'admin';
  createdAt: string;
}

export type User = Trainee | AdminUser;

export interface Post {
  id: string;
  title: string;
  content: string;
  postedBy: string; // admin name
  datePosted: string;
  pinned?: boolean;
}

export interface Cycle {
  id: string;
  type: CycleFrequency;
  label: string; // e.g. "August 2026" or "Aug 1–15 2026"
  startDate: string;
  endDate: string;
  published: boolean;
  createdAt: string;
}

export interface SeatingArrangement {
  cycleId: string;
  tables: RefectoryTable[];
  publishedAt?: string;
}

export interface RefectoryTable {
  id: string;
  name: string; // "Boys Table 1", "Girls Table 2", etc.
  genderType: Gender;
  tableNumber: number; // 1–4
  seats: Seat[];
}

export interface Seat {
  seatNumber: number; // 1–12
  traineeId: string | null;
  traineeName?: string;
  motherTongue?: string;
}

export interface MassReadingRoster {
  cycleId: string;
  entries: RosterEntry[];
  publishedAt?: string;
}

export interface RosterEntry {
  date: string;
  dayType: DayType;
  liturgicalNote: string; // e.g. "Feast of St. John Bosco"
  readings: ReadingCitation[];
  assignments: ReadingAssignment[];
}

export interface ReadingCitation {
  role: ReadingRole;
  citation: string; // e.g. "Isaiah 6:1-8"
  text?: string; // optional full text
}

export interface ReadingAssignment {
  role: ReadingRole;
  traineeId: string;
  traineeName: string;
  domain: Domain;
}

export interface AppSettings {
  cycleFrequency: CycleFrequency;
  currentCycleId: string | null;
  campusIPs: string[];
  softIPRestriction: boolean;
  lastUpdated: string;
}

export interface AppStore {
  trainees: Trainee[];
  admins: AdminUser[];
  posts: Post[];
  cycles: Cycle[];
  seatingArrangements: { [cycleId: string]: SeatingArrangement };
  massReadingRosters: { [cycleId: string]: MassReadingRoster };
  settings: AppSettings;
}

// Auth session stored in localStorage
export interface AuthSession {
  userId: string;
  role: Role;
  name: string;
  username: string;
  loginTime: string;
}

// Liturgical API response shape
export interface LiturgicalDay {
  date: string;
  season: string;
  weekday: string;
  celebrations: Array<{
    title: string;
    colour: string;
    rank: string;
  }>;
  readings?: {
    first?: string;
    psalm?: string;
    second?: string;
    gospel?: string;
  };
}
