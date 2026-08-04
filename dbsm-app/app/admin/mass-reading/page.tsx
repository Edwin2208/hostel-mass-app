'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { getSession, getStore, saveStore } from '@/lib/store';
import { AuthSession, MassReadingRoster, Cycle, RosterEntry } from '@/lib/types';
import { generateMassReadingRoster } from '@/lib/algorithms/mass-reading';
import { getCycleDateRange, getCurrentCycleLabel, generateId, formatDateLong, formatDate, isSunday } from '@/lib/utils';
import { FEAST_DAYS_2026 } from '@/lib/liturgical';
import { RefreshCcw, CheckCircle, AlertTriangle, BookOpen, Zap, ChevronDown, ChevronUp } from 'lucide-react';

const ROLE_COLORS: Record<string, string> = {
  'First Reading': 'bg-blue-50 text-blue-700 border-blue-200',
  'Second Reading': 'bg-purple-50 text-purple-700 border-purple-200',
  'Responsorial Psalm': 'bg-green-50 text-green-700 border-green-200',
};

export default function MassReadingPage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [roster, setRoster] = useState<MassReadingRoster | null>(null);
  const [generating, setGenerating] = useState(false);
  const [published, setPublished] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [editEntry, setEditEntry] = useState<{ date: string; field: string; value: string } | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== 'admin') { router.replace('/login'); return; }
    setSession(s);
    const store = getStore();
    setCycles(store.cycles);
    if (store.settings.currentCycleId && store.massReadingRosters[store.settings.currentCycleId]) {
      const r = store.massReadingRosters[store.settings.currentCycleId];
      setRoster(r);
      setPublished(!!r.publishedAt);
    }
  }, [router]);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1000));

    const store = getStore();
    const { start, end } = getCycleDateRange(store.settings.cycleFrequency);
    const label = getCurrentCycleLabel(store.settings.cycleFrequency);

    // Use existing cycle or create new
    let cycle = store.cycles.find(c => c.startDate === start);
    if (!cycle) {
      cycle = {
        id: generateId(), type: store.settings.cycleFrequency,
        label, startDate: start, endDate: end,
        published: false, createdAt: new Date().toISOString(),
      };
      store.cycles.unshift(cycle);
    }

    const r = await generateMassReadingRoster(store.trainees, cycle);
    store.massReadingRosters[cycle.id] = r;
    store.settings.currentCycleId = cycle.id;
    saveStore(store);
    setCycles(store.cycles);
    setRoster(r);
    setPublished(false);
    setGenerating(false);
    showToast(`✅ Reading roster generated for ${label}!`);
  };

  const handlePublish = () => {
    if (!roster) return;
    const store = getStore();
    const r = store.massReadingRosters[roster.cycleId];
    if (r) r.publishedAt = new Date().toISOString();
    const cycle = store.cycles.find(c => c.id === roster.cycleId);
    if (cycle) cycle.published = true;
    saveStore(store);
    setPublished(true);
    showToast('🎉 Reading roster published!');
  };

  const cycleInfo = roster ? cycles.find(c => c.id === roster.cycleId) : null;

  const getDayBadge = (entry: RosterEntry) => {
    if (entry.dayType === 'sunday') return <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">Sunday</span>;
    if (entry.dayType === 'feast') return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">Feast Day</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Weekday</span>;
  };

  if (!session) return <div className="min-h-screen flex items-center justify-center"><div className="dbsm-spinner" /></div>;

  return (
    <AppLayout role="admin" userName={session.name}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-playfair font-bold text-[#1B3F82]">Holy Mass Reading Roster</h1>
            <p className="text-sm text-slate-500">Daily Bible Reading & Responsorial Psalm assignments</p>
          </div>
          <div className="flex gap-2">
            {roster && !published && (
              <button onClick={handlePublish} className="btn-primary text-sm flex items-center gap-2">
                <Zap size={15} /> Publish
              </button>
            )}
            <button onClick={handleGenerate} disabled={generating} className="btn-gold text-sm flex items-center gap-2">
              {generating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>
                : <><RefreshCcw size={15} /> Generate Roster</>}
            </button>
          </div>
        </div>

        {/* Status */}
        {roster && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${published ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
            {published ? <CheckCircle size={18} className="text-green-600" /> : <AlertTriangle size={18} className="text-amber-500" />}
            <div>
              <p className={`text-sm font-semibold ${published ? 'text-green-700' : 'text-amber-700'}`}>
                {published ? `✅ Published — ${cycleInfo?.label}` : `⚠️ Draft — ${cycleInfo?.label}`}
              </p>
              {cycleInfo && <p className="text-xs text-slate-500">{formatDate(cycleInfo.startDate)} to {formatDate(cycleInfo.endDate)} · {roster.entries.length} days</p>}
            </div>
          </div>
        )}

        {!roster && !generating && (
          <div className="dbsm-card p-12 text-center">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-lg font-semibold text-slate-600 mb-2">No Reading Roster Yet</h2>
            <p className="text-slate-400 text-sm mb-6">Generate a roster to assign Bible Reading and Psalm readers for the cycle.</p>
            <button onClick={handleGenerate} className="btn-gold mx-auto flex items-center gap-2">
              <RefreshCcw size={16} /> Generate Reading Roster
            </button>
          </div>
        )}

        {roster && (
          <div className="space-y-3">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="dbsm-card p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{roster.entries.filter(e => e.dayType === 'weekday').length}</div>
                <div className="text-xs text-slate-500">Weekdays</div>
              </div>
              <div className="dbsm-card p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{roster.entries.filter(e => e.dayType === 'sunday').length}</div>
                <div className="text-xs text-slate-500">Sundays</div>
              </div>
              <div className="dbsm-card p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">{roster.entries.filter(e => e.dayType === 'feast').length}</div>
                <div className="text-xs text-slate-500">Feast Days</div>
              </div>
            </div>

            {/* Roster Calendar */}
            <div className="dbsm-card overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                <h2 className="font-semibold text-slate-700">📅 Daily Assignments</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {roster.entries.map(entry => {
                  const isExpanded = expandedDate === entry.date;
                  const isSpecial = entry.dayType !== 'weekday';
                  return (
                    <div key={entry.date}
                      className={`transition-colors ${isSpecial ? 'bg-purple-50/30' : ''}`}>
                      <button
                        className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-slate-50"
                        onClick={() => setExpandedDate(isExpanded ? null : entry.date)}
                      >
                        <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isSpecial ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <span>{new Date(entry.date + 'T00:00:00').getDate()}</span>
                          <span className="text-[9px] opacity-70">{new Date(entry.date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' })}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getDayBadge(entry)}
                            <span className="text-xs font-medium text-slate-700 truncate">{entry.liturgicalNote}</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {entry.assignments.map(a => a.traineeName?.split(' ')[0]).join(', ')} · Domain: {entry.assignments[0]?.domain}
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-4 space-y-3">
                          {/* Readings */}
                          {entry.readings.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">📖 Scripture Readings</p>
                              <div className="space-y-1">
                                {entry.readings.map((r, i) => (
                                  <div key={i} className={`text-xs px-3 py-2 rounded-lg border ${ROLE_COLORS[r.role] || 'bg-slate-50 border-slate-200'}`}>
                                    <span className="font-bold">{r.role}:</span> {r.citation}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Assignments */}
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">👤 Assigned Readers</p>
                            <div className="space-y-1">
                              {entry.assignments.map((a, i) => (
                                <div key={i} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${ROLE_COLORS[a.role] || 'bg-slate-50 border-slate-200'}`}>
                                  <span className="font-bold">{a.role}:</span>
                                  <span className="flex-1">{a.traineeName}</span>
                                  <span className="opacity-60 bg-white/50 px-1.5 py-0.5 rounded">{a.domain}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      {toast && <div className="toast"><p className="text-sm font-medium">{toast}</p></div>}
    </AppLayout>
  );
}
