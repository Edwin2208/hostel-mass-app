// ============================================================
// utils.ts – Utility functions
// ============================================================

// Simple deterministic hash (not cryptographically secure but
// consistent for localStorage demo mode)
export function hashPassword(password: string): string {
  let hash = 5381;
  const salted = `dbsm2026::${password}::hostel`;
  for (let i = 0; i < salted.length; i++) {
    hash = ((hash << 5) + hash) + salted.charCodeAt(i);
    hash = hash & hash; // convert to 32bit int
  }
  const h2 = Math.abs(hash).toString(36).padStart(8, '0');
  // second pass for longer hash
  let hash2 = 0x811c9dc5;
  for (let i = 0; i < salted.length; i++) {
    hash2 ^= salted.charCodeAt(i);
    hash2 = (hash2 * 0x01000193) & 0xffffffff;
  }
  const h3 = Math.abs(hash2).toString(36).padStart(8, '0');
  return `$dbsm$${h2}${h3}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'))
      .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

export function formatDateLong(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr + 'T00:00:00')
      .toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return dateStr; }
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDomainLabel(domain: string): string {
  const map: Record<string, string> = {
    'CP-01': 'AWS Cloud Practitioner Batch 1',
    'CP-02': 'AWS Cloud Practitioner Batch 2',
    'EV': 'Electric Vehicles (EV)',
    'DCOM': 'Digital Commerce (DCOM)',
    'GSA': 'General Skills & Aptitude (GSA)',
  };
  return map[domain] || domain;
}

export function getDomainShort(domain: string): string {
  return domain;
}

export function getCurrentCycleLabel(frequency: 'monthly' | '15-day', date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = date.toLocaleDateString('en-IN', { month: 'long' });
  if (frequency === 'monthly') {
    return `${m} ${y}`;
  } else {
    const day = date.getDate();
    const lastDay = new Date(y, date.getMonth() + 1, 0).getDate();
    if (day <= 15) return `${m} 1–15, ${y}`;
    return `${m} 16–${lastDay}, ${y}`;
  }
}

export function getCycleDateRange(frequency: 'monthly' | '15-day', date: Date = new Date()): { start: string; end: string } {
  const d = new Date(date);
  const y = d.getFullYear();
  const mo = d.getMonth();

  if (frequency === 'monthly') {
    const start = new Date(y, mo, 1);
    const end = new Date(y, mo + 1, 0);
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  } else {
    const day = d.getDate();
    if (day <= 15) {
      const start = new Date(y, mo, 1);
      const end = new Date(y, mo, 15);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    } else {
      const start = new Date(y, mo, 16);
      const end = new Date(y, mo + 1, 0);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    }
  }
}

export function getDatesBetween(startStr: string, endStr: string): string[] {
  const dates: string[] = [];
  const current = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function isSunday(dateStr: string): boolean {
  return new Date(dateStr + 'T00:00:00').getDay() === 0;
}

export function capitalize(str: string): string {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

// Shuffle array in place (Fisher-Yates)
export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// CSV parser helper
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  result.push(current.trim());
  return result;
}

export function downloadJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
