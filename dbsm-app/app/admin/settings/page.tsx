'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { getSession, getStore, saveStore } from '@/lib/store';
import { AuthSession, CycleFrequency } from '@/lib/types';
import { Settings, Calendar, Shield, Wifi, Save, RefreshCcw } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [freq, setFreq] = useState<CycleFrequency>('monthly');
  const [campusIPs, setCampusIPs] = useState('');
  const [softRestrict, setSoftRestrict] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== 'admin') { router.replace('/login'); return; }
    setSession(s);
    const store = getStore();
    setFreq(store.settings.cycleFrequency);
    setCampusIPs(store.settings.campusIPs.join('\n'));
    setSoftRestrict(store.settings.softIPRestriction);
  }, [router]);

  const save = () => {
    const store = getStore();
    store.settings.cycleFrequency = freq;
    store.settings.campusIPs = campusIPs.split('\n').map(s => s.trim()).filter(Boolean);
    store.settings.softIPRestriction = softRestrict;
    store.settings.lastUpdated = new Date().toISOString();
    saveStore(store);
    showToast('✅ Settings saved! New cycles will use the updated frequency.');
  };

  const resetData = () => {
    if (!confirm('⚠️ This will RESET ALL DATA (trainees, seats, rosters) to defaults. Are you sure?')) return;
    localStorage.removeItem('dbsm_store');
    localStorage.removeItem('dbsm_session');
    router.push('/login');
  };

  if (!session) return <div className="min-h-screen flex items-center justify-center"><div className="dbsm-spinner" /></div>;

  return (
    <AppLayout role="admin" userName={session.name}>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-xl font-playfair font-bold text-[#1B3F82]">App Settings</h1>
          <p className="text-sm text-slate-500">Configure cycle frequency, access control, and system preferences</p>
        </div>

        {/* Cycle Frequency */}
        <div className="dbsm-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#1B3F82]/10 flex items-center justify-center">
              <Calendar size={18} className="text-[#1B3F82]" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Regeneration Cycle Frequency</h2>
              <p className="text-xs text-slate-500">Applies to both Refectory Seating and Mass Reading Roster</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { val: 'monthly' as CycleFrequency, label: '📅 Monthly', desc: '1 cycle per month (1st–end of month)' },
              { val: '15-day' as CycleFrequency, label: '⏰ 15-Day', desc: '2 cycles per month (1st–15th, 16th–end)' },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => setFreq(opt.val)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  freq === opt.val
                    ? 'border-[#1B3F82] bg-[#1B3F82]/5'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="font-semibold text-sm mb-1">{opt.label}</p>
                <p className="text-xs text-slate-500">{opt.desc}</p>
              </button>
            ))}
          </div>

          <div className={`mt-4 p-3 rounded-xl text-xs border ${freq === 'monthly' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
            <strong>Current:</strong> {freq === 'monthly' ? 'Monthly cycles — Admin generates once a month' : '15-Day cycles — Admin generates twice a month'}
          </div>
        </div>

        {/* IP Restriction */}
        <div className="dbsm-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
              <Wifi size={18} className="text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Campus Network Access Control</h2>
              <p className="text-xs text-slate-500">Restrict login to campus Wi-Fi/network only</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <input type="checkbox" id="soft" checked={softRestrict} onChange={e => setSoftRestrict(e.target.checked)} className="w-4 h-4" />
            <label htmlFor="soft" className="text-sm text-amber-800">
              <strong>Soft Restriction</strong> — Show warning if off-campus (doesn't block login; free tier)
            </label>
          </div>

          <div>
            <label className="form-label">Campus IP Ranges (one per line)</label>
            <textarea
              className="form-input text-sm font-mono"
              rows={4}
              value={campusIPs}
              onChange={e => setCampusIPs(e.target.value)}
              placeholder="192.168.1.0/24&#10;10.0.0.0/24"
            />
            <p className="text-xs text-slate-400 mt-1">Enter your campus Wi-Fi IP ranges. Hard IP blocking requires server-level config.</p>
          </div>
        </div>

        {/* Security */}
        <div className="dbsm-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
              <Shield size={18} className="text-red-600" />
            </div>
            <h2 className="font-semibold text-slate-800">Danger Zone</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">Irreversible actions — use with extreme caution.</p>
          <button onClick={resetData} className="btn-danger flex items-center gap-2">
            <RefreshCcw size={15} /> Reset All Data to Defaults
          </button>
        </div>

        <button onClick={save} className="btn-primary flex items-center gap-2">
          <Save size={16} /> Save Settings
        </button>
      </div>

      {toast && <div className="toast"><p className="text-sm font-medium">{toast}</p></div>}
    </AppLayout>
  );
}
