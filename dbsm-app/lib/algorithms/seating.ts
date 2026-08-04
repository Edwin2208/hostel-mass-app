// ============================================================
// algorithms/seating.ts – Refectory Seating Shuffle Algorithm
// ============================================================

import { Trainee, RefectoryTable, Seat, SeatingArrangement, Cycle, Gender } from '../types';
import { shuffleArray } from '../utils';

const SEATS_PER_TABLE = 12;
const TABLES_PER_GENDER = 4;

/**
 * Main seating generation function implementing the 7-step algorithm:
 * 1. Split into Boys/Girls pools
 * 2. Group each pool by mother tongue
 * 3. Round-robin fill across language groups
 * 4. Validation pass (check adjacent seats)
 * 5. Randomize starting order
 * 6. Store result
 * 7. Support manual overrides
 */
export function generateSeatingArrangement(
  trainees: Trainee[],
  cycle: Cycle
): SeatingArrangement {
  // Step 1: Split into gender pools
  const boys = trainees.filter(t => t.gender === 'male');
  const girls = trainees.filter(t => t.gender === 'female');

  const boyTables = assignGenderPool(boys, 'male', 1);
  const girlTables = assignGenderPool(girls, 'female', 1);

  return {
    cycleId: cycle.id,
    tables: [...boyTables, ...girlTables],
    publishedAt: undefined,
  };
}

function assignGenderPool(
  pool: Trainee[],
  gender: Gender,
  tableOffset: number
): RefectoryTable[] {
  // Step 2: Group by mother tongue
  const languageGroups = groupByMotherTongue(pool);

  // Step 5: Randomize starting order within each group and group order
  const shuffledGroupKeys = shuffleArray(Object.keys(languageGroups));
  const shuffledGroups: Trainee[][] = shuffledGroupKeys.map(key =>
    shuffleArray(languageGroups[key])
  );

  // Step 3: Round-robin across language groups
  const roundRobinOrder = roundRobinFill(shuffledGroups);

  // Distribute into tables (4 tables × 12 seats = 48 seats)
  const tables: RefectoryTable[] = [];

  for (let t = 0; t < TABLES_PER_GENDER; t++) {
    const tableNumber = t + 1;
    const tableId = `${gender}-table-${tableNumber}`;
    const genderLabel = gender === 'male' ? 'Boys' : 'Girls';
    const seats: Seat[] = [];

    for (let s = 0; s < SEATS_PER_TABLE; s++) {
      const traineeIndex = t * SEATS_PER_TABLE + s;
      const trainee = roundRobinOrder[traineeIndex];
      seats.push({
        seatNumber: s + 1,
        traineeId: trainee ? trainee.id : null,
        traineeName: trainee ? trainee.name : undefined,
        motherTongue: trainee ? trainee.motherTongue : undefined,
      });
    }

    tables.push({
      id: tableId,
      name: `${genderLabel} Table ${tableNumber}`,
      genderType: gender,
      tableNumber,
      seats,
    });
  }

  // Step 4: Validation pass — check adjacent seats for same mother tongue
  for (const table of tables) {
    runValidationPass(table, pool);
  }

  return tables;
}

function groupByMotherTongue(trainees: Trainee[]): Record<string, Trainee[]> {
  const groups: Record<string, Trainee[]> = {};
  for (const t of trainees) {
    if (!groups[t.motherTongue]) groups[t.motherTongue] = [];
    groups[t.motherTongue].push(t);
  }
  return groups;
}

function roundRobinFill(groups: Trainee[][]): Trainee[] {
  const result: Trainee[] = [];
  const totalSeats = TABLES_PER_GENDER * SEATS_PER_TABLE; // 48
  const pointers = groups.map(() => 0);

  let filled = 0;
  let groupIdx = 0;
  const numGroups = groups.length;

  while (filled < totalSeats) {
    let found = false;
    // Try to pick one from each group in round-robin
    for (let attempt = 0; attempt < numGroups; attempt++) {
      const gIdx = (groupIdx + attempt) % numGroups;
      if (pointers[gIdx] < groups[gIdx].length) {
        result.push(groups[gIdx][pointers[gIdx]]);
        pointers[gIdx]++;
        filled++;
        groupIdx = (gIdx + 1) % numGroups;
        found = true;
        break;
      }
    }
    if (!found) break; // All groups exhausted
  }

  return result;
}

/**
 * Step 4: Validation pass
 * Checks each adjacent seat pair; if same mother tongue, swap with a
 * compatible trainee elsewhere in the pool.
 */
function runValidationPass(table: RefectoryTable, pool: Trainee[]): void {
  const seats = table.seats;
  const n = seats.length;

  for (let i = 0; i < n; i++) {
    const curr = seats[i];
    const next = seats[(i + 1) % n]; // circular

    if (!curr.traineeId || !next.traineeId) continue;
    if (curr.motherTongue === next.motherTongue) {
      // Find a swap candidate from the same table that fixes the conflict
      const swapIdx = findSwapCandidate(seats, i, curr.motherTongue!, next.motherTongue!);
      if (swapIdx !== -1 && swapIdx !== i && swapIdx !== (i + 1) % n) {
        // Swap seats[i+1] with seats[swapIdx]
        const nextIdx = (i + 1) % n;
        swapSeats(seats, nextIdx, swapIdx);
      }
    }
  }
}

function findSwapCandidate(
  seats: Seat[],
  conflictIdx: number,
  tongue1: string,
  tongue2: string
): number {
  const n = seats.length;
  const nextIdx = (conflictIdx + 1) % n;

  for (let k = 0; k < n; k++) {
    if (k === conflictIdx || k === nextIdx) continue;
    const candidate = seats[k];
    if (!candidate.traineeId || !candidate.motherTongue) continue;

    // Check that swapping won't create new conflicts
    const prevK = (k - 1 + n) % n;
    const nextK = (k + 1) % n;

    const candidateTongue = candidate.motherTongue;

    // Candidate's neighbors' tongues
    const prevTongue = seats[prevK].motherTongue;
    const nextTongue = seats[nextK].motherTongue;
    const conflictNextTongue = seats[nextIdx].motherTongue;
    const conflictPrevTongue = seats[(conflictIdx - 1 + n) % n].motherTongue;

    if (
      candidateTongue !== tongue1 &&
      candidateTongue !== conflictPrevTongue &&
      conflictNextTongue !== prevTongue &&
      conflictNextTongue !== nextTongue
    ) {
      return k;
    }
  }
  return -1;
}

function swapSeats(seats: Seat[], i: number, j: number): void {
  const tempId = seats[i].traineeId;
  const tempName = seats[i].traineeName;
  const tempTongue = seats[i].motherTongue;

  seats[i].traineeId = seats[j].traineeId;
  seats[i].traineeName = seats[j].traineeName;
  seats[i].motherTongue = seats[j].motherTongue;

  seats[j].traineeId = tempId;
  seats[j].traineeName = tempName;
  seats[j].motherTongue = tempTongue;
}

/**
 * Manually swap two seats in an arrangement (for admin drag-drop)
 */
export function swapTwoSeats(
  arrangement: SeatingArrangement,
  tableId1: string, seatNum1: number,
  tableId2: string, seatNum2: number
): SeatingArrangement {
  const updated = JSON.parse(JSON.stringify(arrangement)) as SeatingArrangement;
  const table1 = updated.tables.find(t => t.id === tableId1);
  const table2 = updated.tables.find(t => t.id === tableId2);
  if (!table1 || !table2) return updated;

  const seat1 = table1.seats.find(s => s.seatNumber === seatNum1);
  const seat2 = table2.seats.find(s => s.seatNumber === seatNum2);
  if (!seat1 || !seat2) return updated;

  // Only allow swapping within same gender tables
  if (table1.genderType !== table2.genderType) return updated;

  swapSeats([seat1, seat2], 0, 1);
  return updated;
}

/**
 * Validate adjacency rules for a table (for display)
 */
export function validateTable(table: RefectoryTable): { seatNum: number; issue: string }[] {
  const issues: { seatNum: number; issue: string }[] = [];
  const seats = table.seats.filter(s => s.traineeId);
  const n = seats.length;

  for (let i = 0; i < n; i++) {
    const curr = seats[i];
    const next = seats[(i + 1) % n];
    if (curr.motherTongue && next.motherTongue && curr.motherTongue === next.motherTongue) {
      issues.push({
        seatNum: curr.seatNumber,
        issue: `Seat ${curr.seatNumber} and Seat ${next.seatNumber} both speak ${curr.motherTongue}`
      });
    }
  }
  return issues;
}
