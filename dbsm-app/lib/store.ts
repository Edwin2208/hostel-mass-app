// ============================================================
// store.ts – localStorage-based state management
// ============================================================
import {
  AppStore, Trainee, AdminUser, Post, Cycle, SeatingArrangement,
  MassReadingRoster, AppSettings, AuthSession, Domain, Gender
} from './types';
import { hashPassword, generateId, getCurrentCycleLabel } from './utils';

const STORE_KEY = 'dbsm_store';
const SESSION_KEY = 'dbsm_session';

// ─── DEFAULT ADMIN ──────────────────────────────────────────
const DEFAULT_ADMIN_PASSWORD = 'admin@dbsm2026';

function createDefaultAdmin(): AdminUser {
  return {
    id: 'admin-001',
    name: 'DBSM Administrator',
    username: 'admin',
    passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
    role: 'admin',
    createdAt: new Date().toISOString(),
  };
}

// ─── SEED TRAINEES ───────────────────────────────────────────
const MOTHER_TONGUES = [
  'Tamil', 'Kannada', 'Telugu', 'Hindi', 'Malayalam',
  'Khasi', 'Bengali', 'Marathi', 'Odia', 'Punjabi', 'Gujarati'
];

const RELIGIONS: Array<Trainee['religion']> = [
  'Catholic', 'Catholic', 'Catholic', 'Catholic', 'Catholic',
  'Christian (non-Catholic)', 'Hindu', 'Muslim', 'Catholic'
];

const DOMAINS: Array<Domain> = ['CP-01', 'CP-02', 'EV', 'DCOM', 'GSA'];

const SAMPLE_NAMES = {
  male: [
    'Arjun Kumar', 'Rahul Sharma', 'Priya Das', 'Sanjay Reddy', 'Anil Nair',
    'Vikram Singh', 'Suresh Iyer', 'Ravi Patel', 'Mohan Rao', 'Deepak Mehta',
    'Ashok Pillai', 'Naveen Bose', 'Kiran Shetty', 'Gopal Menon', 'Rajesh Thomas',
    'Manoj Fernandez', 'Anand Xavier', 'Babu George', 'Cyril Mathew', 'Donal Pereira',
    'Edwin James', 'Francis D\'Souza', 'Gerald Gomes', 'Henry Lopes', 'Ivan Miranda',
    'Jacob Paul', 'Kevin Pinto', 'Leo Rodrigues', 'Mark Sequeira', 'Nelson Silva',
    'Oscar Vaz', 'Peter Coelho', 'Quinton Ferreira', 'Robert Gonsalves', 'Samuel Mascarenhas',
    'Tony Nazareth', 'Uday Cardoza', 'Vincent Lobo', 'Walter Menezes', 'Xavier Noronha',
    'Yusuf Shaikh', 'Zaid Khan', 'Abhishek Yadav', 'Bharat Tiwari', 'Chetan Gupta',
    'Dev Joshi', 'Eshan Kapoor', 'Farhan Sheikh', 'Gaurav Saxena', 'Harsh Mishra'
  ],
  female: [
    'Ananya Krishnan', 'Bhavana Nair', 'Chithra Menon', 'Divya Rajesh', 'Esha Pillai',
    'Fiona Thomas', 'Geetha Rajan', 'Hema Devi', 'Indira Sharma', 'Jaya Lakshmi',
    'Kavitha Suresh', 'Lalitha Rani', 'Meena Kumari', 'Nisha Patel', 'Oormila Devi',
    'Preethi George', 'Rekha Nambiar', 'Saranya Selvam', 'Tara D\'Souza', 'Uma Fernandez',
    'Vandana Xavier', 'Winifred Pinto', 'Xena Rodrigues', 'Yamini Coelho', 'Zeena Gomes',
    'Amala Francis', 'Beena Mathew', 'Clara Paul', 'Daisy Pereira', 'Elina Miranda',
    'Grace George', 'Helen Lobo', 'Iris Menezes', 'Jessy Noronha', 'Kezia Mascarenhas',
    'Lulu Vaz', 'Mary Cardoza', 'Nancy Ferreira', 'Oona Lopes', 'Philomena Gonsalves',
    'Queenie Coelho', 'Rose Sequeira', 'Stella Silva', 'Teresa Shetty', 'Usha Iyer',
    'Vimala Rao', 'Winnie Patel', 'Xerya Thomas', 'Yolanda Sharma'
  ]
};

function createSeedTrainees(): Trainee[] {
  const trainees: Trainee[] = [];
  let maleIdx = 0, femaleIdx = 0;

  const genderDistribution: Gender[] = [
    ...Array(50).fill('male'),
    ...Array(48).fill('female')
  ];

  genderDistribution.forEach((gender, i) => {
    const name = gender === 'male'
      ? SAMPLE_NAMES.male[maleIdx++ % SAMPLE_NAMES.male.length]
      : SAMPLE_NAMES.female[femaleIdx++ % SAMPLE_NAMES.female.length];

    const domain = DOMAINS[i % DOMAINS.length];
    const motherTongue = MOTHER_TONGUES[i % MOTHER_TONGUES.length];
    const religion = RELIGIONS[i % RELIGIONS.length];
    const willing = religion === 'Catholic' ? true : (i % 3 === 0);

    trainees.push({
      id: generateId(),
      name,
      gender,
      domain,
      motherTongue,
      religion,
      dob: `${1998 + (i % 6)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      contactNumber: `+91 ${Math.floor(7000000000 + Math.random() * 2999999999)}`,
      willingToRead: willing,
      username: `trainee${String(i + 1).padStart(3, '0')}`,
      passwordHash: hashPassword('pass1234'),
      role: 'trainee',
      createdAt: new Date().toISOString(),
    });
  });

  return trainees;
}

// ─── INITIAL STORE ────────────────────────────────────────────
function createInitialStore(): AppStore {
  const admin = createDefaultAdmin();
  const trainees = createSeedTrainees();

  const settings: AppSettings = {
    cycleFrequency: 'monthly',
    currentCycleId: null,
    campusIPs: ['192.168.1.0/24', '10.0.0.0/24'],
    softIPRestriction: true,
    lastUpdated: new Date().toISOString(),
  };

  const welcomePost: Post = {
    id: generateId(),
    title: '🙏 Welcome to DBSM Hostel Management System',
    content: 'Welcome to the Don Bosco Skill Mission Center Hostel Management System! This platform helps you view your refectory seating arrangements and Holy Mass reading schedule. Please contact the Admin if you have any questions.\n\n— DBSM Administration',
    postedBy: 'Admin',
    datePosted: new Date().toISOString(),
    pinned: true,
  };

  return {
    trainees,
    admins: [admin],
    posts: [welcomePost],
    cycles: [],
    seatingArrangements: {},
    massReadingRosters: {},
    settings,
  };
}

// ─── STORE API ────────────────────────────────────────────────
export function getStore(): AppStore {
  if (typeof window === 'undefined') return createInitialStore();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      const initial = createInitialStore();
      saveStore(initial);
      return initial;
    }
    return JSON.parse(raw) as AppStore;
  } catch {
    const initial = createInitialStore();
    saveStore(initial);
    return initial;
  }
}

export function saveStore(store: AppStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function resetStore(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORE_KEY);
  localStorage.removeItem(SESSION_KEY);
}

// ─── SESSION API ──────────────────────────────────────────────
export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}
