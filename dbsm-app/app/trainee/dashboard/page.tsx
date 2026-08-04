'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { getSession, getStore } from '@/lib/store';
import { AuthSession, Trainee, Post, SeatingArrangement, MassReadingRoster, RosterEntry } from '@/lib/types';
import { formatDate, getDomainLabel } from '@/lib/utils';
import { UtensilsCrossed, BookOpen, User, Bell, Star, CalendarDays } from 'lucide-react';

const TONGUE_COLORS: Record<string, string> = {
  'Tamil': 'bg-red-100 text-red-700 border-red-200',
  'Kannada': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Telugu': 'bg-green-100 text-green-700 border-green-200',
  'Hindi': 'bg-blue-100 text-blue-700 border-blue-200',
  'Malayalam': 'bg-purple-100 text-purple-700 border-purple-200',
  'Khasi': 'bg-pink-100 text-pink-700 border-pink-200',
};

export default function TraineeDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [trainee, setTrainee] = useState<Trainee | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [seatInfo, setSeatInfo] = useState<{ tableName: string; tableId: string; seatNum: number; neighbors: { name: string; tongue: string }[] } | null>(null);
  const [readings, setReadings] = useState<{ date: string; role: string; note: string }[]>([]);
  const [cycleLabel, setCycleLabel] = useState('');

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== 'trainee') { router.replace('/login'); return; }
    setSession(s);

    const store = getStore();
    const me = store.trainees.find(t => t.id === s.userId);
    if (!me) { router.replace('/login'); return; }
    setTrainee(me);
    setPosts([...store.posts].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)));

    // Find seat assignment
    const cycleId = store.settings.currentCycleId;
    if (cycleId) {
      const cycle = store.cycles.find(c => c.id === cycleId);
      if (cycle) setCycleLabel(cycle.label);

      const arr = store.seatingArrangements[cycleId];
      if (arr?.publishedAt) {
        for (const table of arr.tables) {
          const seatIdx = table.seats.findIndex(s => s.traineeId === me.id);
          if (seatIdx !== -1) {
            const seat = table.seats[seatIdx];
            const n = table.seats.length;
            const prevSeat = table.seats[(seatIdx - 1 + n) % n];
            const nextSeat = table.seats[(seatIdx + 1) % n];
            const neighbors = [prevSeat, nextSeat]
              .filter(s => s.traineeId && s.traineeId !== me.id)
              .map(s => ({ name: s.traineeName || '—', tongue: s.motherTongue || '' }));
            setSeatInfo({ tableName: table.name, tableId: table.id, seatNum: seat.seatNumber, neighbors });
            break;
          }
        }
      }

      // Find reading assignments
      const roster: MassReadingRoster | undefined = store.massReadingRosters[cycleId];
      if (roster?.publishedAt) {
        const myReadings: { date: string; role: string; note: string }[] = [];
        for (const entry of roster.entries) {
          for (const a of entry.assignments) {
            if (a.traineeId === me.id) {
              myReadings.push({ date: entry.date, role: a.role, note: entry.liturgicalNote });
            }
          }
        }
        setReadings(myReadings);
      }
    }
  }, [router]);

  if (!session || !trainee) return <div className="min-h-screen flex items-center justify-center"><div className="dbsm-spinner" /></div>;

  const tongueClass = TONGUE_COLORS[trainee.motherTongue] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <AppLayout role="trainee" userName={session.name}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="dbsm-card p-5 dbsm-header-gradient text-white rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-2xl font-bold text-white border border-white/20 flex-shrink-0">
              {trainee.name.charAt(0)}
            </div>
            <div>
              <p className="text-blue-200 text-sm">Welcome back!</p>
              <h1 className="text-xl font-playfair font-bold">{trainee.name}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs bg-white/15 border border-white/20 rounded-full px-3 py-0.5">
                  {trainee.domain} — {getDomainLabel(trainee.domain).split('(')[0].trim()}
                </span>
                <span className="text-xs bg-white/15 border border-white/20 rounded-full px-3 py-0.5">
                  {trainee.gender === 'male' ? '♂' : '♀'} {trainee.gender === 'male' ? 'Male' : 'Female'}
                </span>
                {cycleLabel && (
                  <span className="text-xs bg-amber-400/20 border border-amber-400/30 text-amber-200 rounded-full px-3 py-0.5">
                    📅 {cycleLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Refectory Card */}
          <div className="dbsm-card p-5 animate-fade-in-up delay-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                <UtensilsCrossed size={18} className="text-orange-600" />
              </div>
              <h2 className="font-semibold text-slate-700">My Refectory Seat</h2>
            </div>

            {seatInfo ? (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1 bg-[#1B3F82] text-white rounded-xl p-4 text-center">
                    <p className="text-xs opacity-70 mb-1">Table</p>
                    <p className="text-lg font-bold">{seatInfo.tableName}</p>
                  </div>
                  <div className="flex-1 bg-amber-500 text-white rounded-xl p-4 text-center">
                    <p className="text-xs opacity-70 mb-1">Seat Number</p>
                    <p className="text-3xl font-bold">{seatInfo.seatNum}</p>
                  </div>
                </div>

                {seatInfo.neighbors.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Your Neighbors</p>
                    <div className="space-y-2">
                      {seatInfo.neighbors.map((n, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <span className="text-sm text-slate-700">{n.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TONGUE_COLORS[n.tongue] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {n.tongue}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-blue-500 mt-2">💬 Practice English with your neighbors!</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <UtensilsCrossed size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No seating assignment yet</p>
                <p className="text-xs mt-1">Admin will publish the seating plan soon.</p>
              </div>
            )}
          </div>

          {/* Mass Reading Card */}
          <div className="dbsm-card p-5 animate-fade-in-up delay-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                <BookOpen size={18} className="text-purple-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-700">My Mass Reading Schedule</h2>
                <p className="text-xs text-slate-400">
                  {trainee.religion === 'Catholic' ? '🙏 Compulsory (Catholic)' : trainee.willingToRead ? '✅ Volunteered' : '—'}
                </p>
              </div>
            </div>

            {readings.length > 0 ? (
              <div className="space-y-2">
                {readings.map((r, i) => {
                  const d = new Date(r.date + 'T00:00:00');
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex flex-col items-center justify-center text-xs font-bold flex-shrink-0">
                        <span>{d.getDate()}</span>
                        <span className="text-[9px] opacity-70">{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-purple-800">{r.role}</p>
                        <p className="text-xs text-purple-600">{r.note}</p>
                        <p className="text-xs text-slate-400">{d.toLocaleDateString('en-IN', { weekday: 'long' })}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">
                  {!trainee.willingToRead && trainee.religion !== 'Catholic'
                    ? 'Not in reading pool (not opted in)'
                    : 'No reading assigned yet'}
                </p>
                <p className="text-xs mt-1">Admin will publish the roster soon.</p>
              </div>
            )}
          </div>
        </div>

        {/* Profile Summary */}
        <div className="dbsm-card p-5 animate-fade-in-up delay-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <User size={18} className="text-slate-600" />
            </div>
            <h2 className="font-semibold text-slate-700">My Profile</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: 'Full Name', value: trainee.name },
              { label: 'Domain', value: `${trainee.domain}` },
              { label: 'Gender', value: trainee.gender === 'male' ? '♂ Male' : '♀ Female' },
              { label: 'Mother Tongue', value: trainee.motherTongue },
              { label: 'Religion', value: trainee.religion },
              { label: 'Date of Birth', value: formatDate(trainee.dob) || '—' },
              { label: 'Contact', value: trainee.contactNumber || '—' },
              { label: 'Username', value: trainee.username },
              { label: 'Willing to Read', value: trainee.willingToRead ? 'Yes ✅' : 'No' },
            ].map(f => (
              <div key={f.label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 font-semibold uppercase mb-1">{f.label}</p>
                <p className="text-sm font-medium text-slate-700">{f.value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">📝 To update your details, contact the Admin.</p>
        </div>

        {/* Announcements */}
        <div className="dbsm-card p-5 animate-fade-in-up delay-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <Bell size={18} className="text-amber-600" />
            </div>
            <h2 className="font-semibold text-slate-700">Announcements</h2>
          </div>

          {posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map(p => (
                <div key={p.id} className={`p-4 rounded-xl border ${p.pinned ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-start gap-2">
                    {p.pinned && <Star size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />}
                    <div>
                      <h3 className="font-semibold text-sm text-slate-800">{p.title}</h3>
                      <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed">{p.content}</p>
                      <p className="text-xs text-slate-400 mt-2">📅 {formatDate(p.datePosted)} — {p.postedBy}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400">
              <Bell size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No announcements yet</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
