// ============================================================
// algorithms/mass-reading.ts – Holy Mass Reading Roster Algorithm
// ============================================================

import {
  Trainee, MassReadingRoster, RosterEntry, ReadingAssignment,
  ReadingCitation, ReadingRole, Domain, DayType, Cycle
} from '../types';
import { getDatesBetween, isSunday, shuffleArray } from '../utils';
import { FEAST_DAYS_2026, getLiturgicalDay } from '../liturgical';

/**
 * Generate a Mass Reading roster for a cycle.
 * Rules:
 * 1. Catholics (compulsory) + Willing non-Catholics
 * 2. Same domain for all readers on a given day
 * 3. Each eligible person reads exactly once per cycle (Bible + Psalm separately)
 * 4. Sundays/Feasts have 2 Readings + 1 Psalm; Weekdays 1 Reading + 1 Psalm
 */
export async function generateMassReadingRoster(
  trainees: Trainee[],
  cycle: Cycle
): Promise<MassReadingRoster> {
  const dates = getDatesBetween(cycle.startDate, cycle.endDate);

  // Build eligible pool
  const eligible = trainees.filter(t =>
    t.religion === 'Catholic' || t.willingToRead
  );

  // Group by domain
  const byDomain: Record<Domain, Trainee[]> = {
    'CP-01': [], 'CP-02': [], 'EV': [], 'DCOM': [], 'GSA': []
  };
  for (const t of eligible) {
    byDomain[t.domain].push(t);
  }

  // Shuffle within each domain
  const domainKeys = Object.keys(byDomain) as Domain[];
  for (const d of domainKeys) {
    byDomain[d] = shuffleArray(byDomain[d]);
  }

  // Tracking pointers for fair rotation
  const readingPointers: Record<Domain, number> = { 'CP-01': 0, 'CP-02': 0, 'EV': 0, 'DCOM': 0, 'GSA': 0 };
  const psalmPointers: Record<Domain, number> = { 'CP-01': 0, 'CP-02': 0, 'EV': 0, 'DCOM': 0, 'GSA': 0 };
  let domainRotation = 0;

  const entries: RosterEntry[] = [];

  for (const date of dates) {
    const dayType = getDayType(date);
    const liturgicalInfo = getLiturgicalDay(date);

    // Pick domain for this day (rotate through domains)
    let domain = domainKeys[domainRotation % domainKeys.length];
    // Skip domains with no eligible members
    let attempts = 0;
    while (byDomain[domain].length === 0 && attempts < domainKeys.length) {
      domainRotation++;
      domain = domainKeys[domainRotation % domainKeys.length];
      attempts++;
    }
    domainRotation++;

    const assignments: ReadingAssignment[] = [];
    const citations: ReadingCitation[] = liturgicalInfo.readings;

    // Assign First Reading
    const reader1 = pickNextFromDomain(byDomain[domain], readingPointers, domain, 'reading');
    if (reader1) {
      assignments.push({ role: 'First Reading', traineeId: reader1.id, traineeName: reader1.name, domain });
    }

    // Assign Responsorial Psalm (different person from reader1)
    const psalmReader = pickNextFromDomain(byDomain[domain], psalmPointers, domain, 'psalm', reader1?.id);
    if (psalmReader) {
      assignments.push({ role: 'Responsorial Psalm', traineeId: psalmReader.id, traineeName: psalmReader.name, domain });
    }

    // Assign Second Reading for Sunday/Feast
    if (dayType === 'sunday' || dayType === 'feast') {
      const usedIds = new Set([reader1?.id, psalmReader?.id].filter(Boolean) as string[]);
      const reader2 = pickNextFromDomainExcluding(byDomain[domain], readingPointers, domain, usedIds);
      if (reader2) {
        assignments.push({ role: 'Second Reading', traineeId: reader2.id, traineeName: reader2.name, domain });
      }
    }

    entries.push({
      date,
      dayType,
      liturgicalNote: liturgicalInfo.note,
      readings: citations,
      assignments,
    });
  }

  return {
    cycleId: cycle.id,
    entries,
    publishedAt: undefined,
  };
}

function getDayType(dateStr: string): DayType {
  if (isSunday(dateStr)) return 'sunday';
  if (FEAST_DAYS_2026[dateStr]) return 'feast';
  return 'weekday';
}

function pickNextFromDomain(
  pool: Trainee[],
  pointers: Record<Domain, number>,
  domain: Domain,
  type: 'reading' | 'psalm',
  excludeId?: string
): Trainee | null {
  if (pool.length === 0) return null;
  const ptr = pointers[domain];

  for (let i = 0; i < pool.length; i++) {
    const idx = (ptr + i) % pool.length;
    const candidate = pool[idx];
    if (excludeId && candidate.id === excludeId) continue;
    pointers[domain] = (idx + 1) % pool.length;
    return candidate;
  }
  return null;
}

function pickNextFromDomainExcluding(
  pool: Trainee[],
  pointers: Record<Domain, number>,
  domain: Domain,
  excludeIds: Set<string>
): Trainee | null {
  if (pool.length === 0) return null;
  const ptr = pointers[domain];

  for (let i = 0; i < pool.length; i++) {
    const idx = (ptr + i) % pool.length;
    const candidate = pool[idx];
    if (!excludeIds.has(candidate.id)) {
      pointers[domain] = (idx + 1) % pool.length;
      return candidate;
    }
  }
  return null;
}
