// ============================================================
// liturgical.ts – Catholic Liturgical Calendar & Readings
// ============================================================

import { ReadingCitation, DayType, ReadingRole } from './types';

export interface LiturgicalDayInfo {
  date: string;
  note: string;
  dayType: DayType;
  readings: ReadingCitation[];
}

// Known feast days for 2026 (Indian context, Roman Catholic)
export const FEAST_DAYS_2026: Record<string, string> = {
  '2026-01-01': 'Solemnity of Mary, Mother of God',
  '2026-01-06': 'Epiphany of the Lord',
  '2026-02-02': 'Presentation of the Lord',
  '2026-03-19': 'Feast of Saint Joseph',
  '2026-04-02': 'Holy Thursday',
  '2026-04-03': 'Good Friday',
  '2026-04-05': 'Easter Sunday',
  '2026-04-25': 'Feast of Saint Mark',
  '2026-05-01': 'Feast of Saint Joseph the Worker',
  '2026-05-14': 'Feast of Saint Matthias',
  '2026-05-24': 'Ascension of the Lord',
  '2026-06-03': 'Feast of Corpus Christi',
  '2026-06-11': 'Feast of Saint Barnabas',
  '2026-06-24': 'Birth of Saint John the Baptist',
  '2026-06-29': 'Feast of Saints Peter and Paul',
  '2026-07-25': 'Feast of Saint James',
  '2026-08-01': 'Feast of Saint Alphonsus Liguori',
  '2026-08-04': 'Feast of Saint John Vianney',
  '2026-08-06': 'Feast of Transfiguration of the Lord',
  '2026-08-08': 'Feast of Saint Dominic',
  '2026-08-10': 'Feast of Saint Lawrence',
  '2026-08-11': 'Feast of Saint Clare',
  '2026-08-14': 'Vigil of the Assumption',
  '2026-08-15': 'Solemnity of the Assumption of Mary',
  '2026-08-22': 'Feast of the Queenship of Mary',
  '2026-08-24': 'Feast of Saint Bartholomew',
  '2026-09-08': 'Feast of the Nativity of Mary',
  '2026-09-14': 'Feast of the Exaltation of the Holy Cross',
  '2026-09-15': 'Our Lady of Sorrows',
  '2026-10-01': 'Feast of Saint Thérèse of the Child Jesus',
  '2026-10-02': 'Feast of the Holy Guardian Angels',
  '2026-10-04': 'Feast of Saint Francis of Assisi',
  '2026-11-01': 'Solemnity of All Saints',
  '2026-11-02': 'Commemoration of All Souls',
  '2026-11-09': 'Feast of the Dedication of the Lateran Basilica',
  '2026-12-08': 'Solemnity of the Immaculate Conception',
  '2026-12-25': 'Solemnity of the Nativity of the Lord (Christmas)',
  '2026-12-26': 'Feast of Saint Stephen',
  '2026-12-27': 'Feast of Saint John the Apostle',
  '2026-12-28': 'Feast of the Holy Innocents',
};

// Fallback reading citations when API is unavailable
// Keyed by date (YYYY-MM-DD), otherwise use day-of-week pattern
const FALLBACK_READINGS: Record<string, ReadingCitation[]> = {
  '2026-08-04': [
    { role: 'First Reading', citation: 'Ezekiel 3:17-21', text: 'Watchman for the house of Israel' },
    { role: 'Responsorial Psalm', citation: 'Psalm 117:1-2' },
    { role: 'Second Reading', citation: 'Matthew 16:13-19', text: 'You are the Christ, Son of the Living God' },
  ],
  '2026-08-06': [
    { role: 'First Reading', citation: 'Daniel 7:9-10, 13-14' },
    { role: 'Responsorial Psalm', citation: 'Psalm 97:1-2, 5-6, 9' },
    { role: 'Second Reading', citation: 'Luke 9:28b-36', text: 'The Transfiguration of the Lord' },
  ],
  '2026-08-15': [
    { role: 'First Reading', citation: 'Revelation 11:19a; 12:1-6a, 10ab' },
    { role: 'Responsorial Psalm', citation: 'Psalm 45:10-12, 16' },
    { role: 'Second Reading', citation: 'Luke 1:39-56', text: 'The Magnificat' },
  ],
};

// Weekday pattern readings (cycling through weeks)
function getWeekdayReading(dateStr: string): ReadingCitation[] {
  const d = new Date(dateStr + 'T00:00:00');
  const weekNum = Math.ceil(d.getDate() / 7);
  const dayOfWeek = d.getDay();

  const weekdayReadings: ReadingCitation[][] = [
    [{ role: 'First Reading', citation: 'Isaiah 55:10-11' }, { role: 'Responsorial Psalm', citation: 'Psalm 19:8-11' }],
    [{ role: 'First Reading', citation: 'Jeremiah 1:4-10' }, { role: 'Responsorial Psalm', citation: 'Psalm 71:1-6, 15-17' }],
    [{ role: 'First Reading', citation: 'Ezekiel 34:11-16' }, { role: 'Responsorial Psalm', citation: 'Psalm 23:1-6' }],
    [{ role: 'First Reading', citation: 'Romans 8:28-30' }, { role: 'Responsorial Psalm', citation: 'Psalm 13:4-6' }],
    [{ role: 'First Reading', citation: '1 Corinthians 12:31-13:13' }, { role: 'Responsorial Psalm', citation: 'Psalm 33:2-5, 12' }],
    [{ role: 'First Reading', citation: 'Colossians 3:12-17' }, { role: 'Responsorial Psalm', citation: 'Psalm 128:1-5' }],
    [{ role: 'First Reading', citation: 'Acts 2:1-11' }, { role: 'Responsorial Psalm', citation: 'Psalm 104:1, 24, 29-31, 34' }],
  ];

  return weekdayReadings[(dayOfWeek + weekNum) % weekdayReadings.length];
}

function getSundayReading(dateStr: string): ReadingCitation[] {
  const d = new Date(dateStr + 'T00:00:00');
  const month = d.getMonth();
  const sundayNum = Math.ceil(d.getDate() / 7);

  const sundayReadings: ReadingCitation[][] = [
    [
      { role: 'First Reading', citation: 'Isaiah 6:1-2a, 3-8' },
      { role: 'Responsorial Psalm', citation: 'Psalm 138:1-5, 7-8' },
      { role: 'Second Reading', citation: 'Luke 5:1-11', text: 'Do not be afraid; from now on you will be catching men' },
    ],
    [
      { role: 'First Reading', citation: 'Exodus 17:3-7' },
      { role: 'Responsorial Psalm', citation: 'Psalm 95:1-2, 6-9' },
      { role: 'Second Reading', citation: 'John 4:5-42', text: 'I am he, the one speaking with you' },
    ],
    [
      { role: 'First Reading', citation: 'Nehemiah 8:2-4a, 5-6, 8-10' },
      { role: 'Responsorial Psalm', citation: 'Psalm 19:8-10, 15' },
      { role: 'Second Reading', citation: 'Luke 1:1-4; 4:14-21', text: 'Today this Scripture is fulfilled in your hearing' },
    ],
    [
      { role: 'First Reading', citation: 'Wisdom 12:13, 16-19' },
      { role: 'Responsorial Psalm', citation: 'Psalm 86:5-6, 9-10, 15-16' },
      { role: 'Second Reading', citation: 'Matthew 13:24-43', text: 'The Parable of the Wheat and Tares' },
    ],
  ];

  return sundayReadings[(month + sundayNum) % sundayReadings.length];
}

export function getLiturgicalDay(dateStr: string): LiturgicalDayInfo {
  const isSun = new Date(dateStr + 'T00:00:00').getDay() === 0;
  const feastNote = FEAST_DAYS_2026[dateStr];
  const dayType: DayType = isSun ? 'sunday' : (feastNote ? 'feast' : 'weekday');

  const note = feastNote || (isSun
    ? `Sunday — ${new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`
    : `Ordinary Weekday`
  );

  // Check fallback readings
  let readings = FALLBACK_READINGS[dateStr];

  if (!readings) {
    if (isSun || feastNote) {
      readings = getSundayReading(dateStr);
    } else {
      readings = getWeekdayReading(dateStr);
    }
  }

  return { date: dateStr, note, dayType, readings };
}

/**
 * Try to fetch from Universalis API (client-side, if available).
 * Returns null if fetch fails.
 */
export async function fetchUniversalisReadings(dateStr: string): Promise<ReadingCitation[] | null> {
  try {
    const [year, month, day] = dateStr.split('-');
    const url = `https://universalis.app/api/v1/${year}/${month}/${day}/jsonpmass`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!resp.ok) return null;
    const data = await resp.json();
    const readings: ReadingCitation[] = [];

    if (data?.mass?.readings?.length) {
      for (const r of data.mass.readings) {
        const role: ReadingRole = r.source?.includes('Psalm')
          ? 'Responsorial Psalm'
          : readings.filter(x => x.role !== 'Responsorial Psalm').length === 0
            ? 'First Reading'
            : 'Second Reading';
        readings.push({ role, citation: r.source || '', text: r.text?.slice(0, 500) });
      }
    }

    return readings.length > 0 ? readings : null;
  } catch {
    return null;
  }
}
