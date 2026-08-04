'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { getSession, getStore, saveStore } from '@/lib/store';
import { AuthSession, SeatingArrangement, Cycle, RefectoryTable, Seat } from '@/lib/types';
import { generateSeatingArrangement, validateTable } from '@/lib/algorithms/seating';
import { getCycleDateRange, getCurrentCycleLabel, generateId, formatDate } from '@/lib/utils';
import {
  RefreshCcw, Eye, EyeOff, CheckCircle, AlertTriangle,
  Shuffle, Table2, Users, ChevronDown, X, Zap
} from 'lucide-react';

const TONGUE_COLORS: Record<string, string> = {
  'Tamil': 'tongue-tamil', 'Kannada': 'tongue-kannada', 'Telugu': 'tongue-telugu',
  'Hindi': 'tongue-hindi', 'Malayalam': 'tongue-malayalam', 'Khasi': 'tongue-khasi',
  'Bengali': 'tongue-bengali', 'Marathi': 'tongue-marathi', 'Odia': 'tongue-odia',
  'Punjabi': 'tongue-punjabi', 'Gujarati': 'tongue-gujarati',
};
const getTongueClass = (t?: string) => t ? (TONGUE_COLORS[t] || 'tongue-default') : 'tongue-default';

export default function RefectoryPage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [arrangement, setArrangement] = useState<SeatingArrangement | null>(null);
  const [published, setPublished] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'boys' | 'girls'>('boys');
  const [swapMode, setSwapMode] = useState(false);
  const [swapSeat1, setSwapSeat1] = useState<{ tableId: string; seatNum: number } | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [viewCycleId, setViewCycleId] = useState<string>('current');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== 'admin') { router.replace('/login'); return; }
    setSession(s);
    const store = getStore();
    setCycles(store.cycles);
    if (store.settings.currentCycleId && store.seatingArrangements[store.settings.currentCycleId]) {
      const arr = store.seatingArrangements[store.settings.currentCycleId];
      setArrangement(arr);
      setPublished(!!arr.publishedAt);
    }
  }, [router]);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 800)); // Show spinner

    const store = getStore();
    const { start, end } = getCycleDateRange(store.settings.cycleFrequency);
    const label = getCurrentCycleLabel(store.settings.cycleFrequency);

    // Create new cycle
    const cycle: Cycle = {
      id: generateId(),
      type: store.settings.cycleFrequency,
      label,
      startDate: start,
      endDate: end,
      published: false,
      createdAt: new Date().toISOString(),
    };

    const arr = generateSeatingArrangement(store.trainees, cycle);
    store.cycles.unshift(cycle);
    store.seatingArrangements[cycle.id] = arr;
    store.settings.currentCycleId = cycle.id;
    saveStore(store);
    setCycles(store.cycles);
    setArrangement(arr);
    setPublished(false);
    setGenerating(false);
    showToast(`✅ Seating arrangement generated for ${label}!`);
  };

  const handlePublish = () => {
    if (!arrangement) return;
    const store = getStore();
    const arr = store.seatingArrangements[arrangement.cycleId];
    if (arr) { arr.publishedAt = new Date().toISOString(); }

    // Update trainee records with seat assignments
    arrangement.tables.forEach(table => {
      table.seats.forEach(seat => {
        if (seat.traineeId) {
          const t = store.trainees.find(x => x.id === seat.traineeId);
          if (t) { t.currentTableId = table.id; t.currentSeatNumber = seat.seatNumber; }
        }
      });
    });

    // Mark cycle as published
    const cycle = store.cycles.find(c => c.id === arrangement.cycleId);
    if (cycle) cycle.published = true;

    saveStore(store);
    setPublished(true);
    showToast('🎉 Seating arrangement published! Trainees can now see their seats.');
  };

  const handleSeatClick = (tableId: string, seatNum: number, traineeId: string | null) => {
    if (!swapMode || !arrangement || !traineeId) return;
    if (!swapSeat1) {
      setSwapSeat1({ tableId, seatNum });
      showToast('Click another seat to swap with');
      return;
    }
    // Perform swap
    const arr: SeatingArrangement = JSON.parse(JSON.stringify(arrangement));
    const t1 = arr.tables.find(t => t.id === tableId);
    const t2 = arr.tables.find(t => t.id === swapSeat1.tableId);
    if (!t1 || !t2 || t1.genderType !== t2.genderType) {
      showToast('⚠️ Can only swap within same gender tables'); setSwapSeat1(null); return;
    }
    const s1 = t1.seats.find(s => s.seatNumber === seatNum);
    const s2 = t2.seats.find(s => s.seatNumber === swapSeat1.seatNum);
    if (s1 && s2) {
      [s1.traineeId, s2.traineeId] = [s2.traineeId, s1.traineeId];
      [s1.traineeName, s2.traineeName] = [s2.traineeName, s1.traineeName];
      [s1.motherTongue, s2.motherTongue] = [s2.motherTongue, s1.motherTongue];
    }
    const store = getStore();
    store.seatingArrangements[arr.cycleId] = arr;
    saveStore(store);
    setArrangement(arr);
    setSwapSeat1(null);
    showToast('✅ Seats swapped!');
  };

  const displayTables = arrangement?.tables.filter(t => t.genderType === (selectedTab === 'boys' ? 'male' : 'female')) || [];
  const issues = arrangement?.tables.flatMap(t => validateTable(t).map(v => ({ table: t.name, ...v }))) || [];

  if (!session) return <div className="min-h-screen flex items-center justify-center"><div className="dbsm-spinner" /></div>;

  const cycleInfo = arrangement ? cycles.find(c => c.id === arrangement.cycleId) : null;

  return (
    <AppLayout role="admin" userName={session.name}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-playfair font-bold text-[#1B3F82]">Refectory Seating</h1>
            <p className="text-sm text-slate-500">8 tables (4 Boys + 4 Girls) × 12 seats — Mixed mother tongue arrangement</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {arrangement && !published && (
              <button onClick={() => setSwapMode(!swapMode)}
                className={`text-sm flex items-center gap-2 ${swapMode ? 'btn-gold' : 'btn-outline'}`}>
                <Shuffle size={15} /> {swapMode ? 'Exit Swap Mode' : 'Swap Seats'}
              </button>
            )}
            {arrangement && !published && (
              <button onClick={handlePublish} className="btn-primary text-sm flex items-center gap-2">
                <Zap size={15} /> Publish
              </button>
            )}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-gold text-sm flex items-center gap-2"
            >
              {generating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                : <><RefreshCcw size={15} /> Generate New</>}
            </button>
          </div>
        </div>

        {/* Status Bar */}
        {arrangement && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            published ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
          }`}>
            {published ? <CheckCircle size={18} className="text-green-600" /> : <AlertTriangle size={18} className="text-amber-500" />}
            <div>
              <p className={`text-sm font-semibold ${published ? 'text-green-700' : 'text-amber-700'}`}>
                {published ? `✅ Published — ${cycleInfo?.label}` : `⚠️ Draft — ${cycleInfo?.label || 'Current Cycle'} (not yet published)`}
              </p>
              {cycleInfo && <p className="text-xs text-slate-500">{formatDate(cycleInfo.startDate)} to {formatDate(cycleInfo.endDate)}</p>}
            </div>
            {issues.length > 0 && (
              <div className="ml-auto text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle size={12} /> {issues.length} adjacency issue{issues.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        {!arrangement && !generating && (
          <div className="dbsm-card p-12 text-center">
            <Table2 size={48} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-lg font-semibold text-slate-600 mb-2">No Seating Arrangement Yet</h2>
            <p className="text-slate-400 text-sm mb-6">Click "Generate New" to create a fresh seating plan for the current cycle.</p>
            <button onClick={handleGenerate} className="btn-gold mx-auto flex items-center gap-2">
              <RefreshCcw size={16} /> Generate Seating Arrangement
            </button>
          </div>
        )}

        {arrangement && (
          <>
            {/* Gender Tabs */}
            <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-50 max-w-xs">
              {(['boys', 'girls'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedTab(g)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                    selectedTab === g ? 'bg-[#1B3F82] text-white shadow' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {g === 'boys' ? '♂ Boys Tables' : '♀ Girls Tables'}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="dbsm-card p-4">
              <button
                onClick={() => setShowLegend(!showLegend)}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 w-full"
              >
                <ChevronDown size={16} className={`transition-transform ${showLegend ? 'rotate-180' : ''}`} />
                Color Legend — Mother Tongues
              </button>
              {showLegend && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {Object.entries(TONGUE_COLORS).map(([tongue, cls]) => (
                    <span key={tongue} className={`text-xs px-2 py-1 rounded-lg border ${cls} font-medium`}>
                      {tongue}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayTables.map(table => {
                const tableIssues = validateTable(table);
                return (
                  <div key={table.id} className="dbsm-card overflow-hidden animate-fade-in-up">
                    <div className={`px-4 py-3 flex items-center justify-between ${
                      table.genderType === 'male' ? 'bg-blue-600' : 'bg-pink-600'
                    } text-white`}>
                      <div>
                        <h3 className="font-bold">{table.name}</h3>
                        <p className="text-xs opacity-80">
                          {table.seats.filter(s => s.traineeId).length}/12 occupied
                          {tableIssues.length > 0 && ` • ⚠️ ${tableIssues.length} issues`}
                        </p>
                      </div>
                      <Users size={20} className="opacity-60" />
                    </div>
                    <div className="p-4 grid grid-cols-3 gap-2">
                      {table.seats.map(seat => {
                        const isSelected = swapSeat1?.tableId === table.id && swapSeat1?.seatNum === seat.seatNumber;
                        const cls = getTongueClass(seat.motherTongue);
                        return (
                          <div
                            key={seat.seatNumber}
                            onClick={() => handleSeatClick(table.id, seat.seatNumber, seat.traineeId)}
                            className={`
                              border rounded-lg p-2 text-xs transition-all
                              ${seat.traineeId ? `${cls} cursor-pointer` : 'bg-slate-50 border-slate-200 text-slate-300'}
                              ${swapMode && seat.traineeId ? 'hover:scale-105 hover:shadow-md' : ''}
                              ${isSelected ? 'ring-2 ring-amber-400 scale-105' : ''}
                            `}
                          >
                            <div className="font-bold text-xs opacity-60 mb-1">S{seat.seatNumber}</div>
                            {seat.traineeId ? (
                              <>
                                <div className="font-medium leading-tight text-xs truncate" title={seat.traineeName}>{seat.traineeName?.split(' ')[0]}</div>
                                <div className="text-xs opacity-70 truncate">{seat.motherTongue}</div>
                              </>
                            ) : (
                              <div className="text-xs opacity-40">Empty</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Past Cycles */}
            {cycles.length > 1 && (
              <div className="dbsm-card p-5">
                <h2 className="font-semibold text-slate-700 mb-3">📋 Cycle History</h2>
                <div className="space-y-2">
                  {cycles.map(c => (
                    <div key={c.id} className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-slate-50">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.published ? 'badge-success' : 'badge-pending'}`}>
                        {c.published ? '✅ Published' : '⏳ Draft'}
                      </span>
                      <span className="font-medium text-slate-700">{c.label}</span>
                      <span className="text-slate-400">{formatDate(c.startDate)} – {formatDate(c.endDate)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {swapMode && swapSeat1 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50">
          <span className="text-sm font-semibold">Seat selected — click another to swap</span>
          <button onClick={() => setSwapSeat1(null)} className="opacity-70 hover:opacity-100"><X size={16} /></button>
        </div>
      )}

      {toast && <div className="toast"><p className="text-sm font-medium">{toast}</p></div>}
    </AppLayout>
  );
}
