'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { getSession, getStore, saveStore } from '@/lib/store';
import { Trainee, Domain, Gender, Religion, AuthSession } from '@/lib/types';
import Papa from 'papaparse';
import { hashPassword, generateId, getDomainLabel, formatDate } from '@/lib/utils';
import { UserPlus, Search, Filter, Download, Upload, Pencil, Trash2, X, Check, ChevronDown } from 'lucide-react';

const DOMAINS: Domain[] = ['CP-01', 'CP-02', 'EV', 'DCOM', 'GSA'];
const GENDERS: Gender[] = ['male', 'female'];
const RELIGIONS: Religion[] = ['Catholic', 'Christian (non-Catholic)', 'Hindu', 'Muslim', 'Sikh', 'Buddhist', 'Other'];
const MOTHER_TONGUES = ['Tamil', 'Kannada', 'Telugu', 'Hindi', 'Malayalam', 'Khasi', 'Bengali', 'Marathi', 'Odia', 'Punjabi', 'Gujarati', 'English', 'Other'];

type ModalMode = 'add' | 'edit' | null;

const emptyTrainee = (): Omit<Trainee, 'id' | 'passwordHash' | 'role' | 'createdAt'> & { password: string } => ({
  name: '', gender: 'male', domain: 'CP-01', motherTongue: 'Tamil',
  religion: 'Catholic', dob: '', contactNumber: '', willingToRead: false,
  username: '', password: '',
});

export default function TraineesPage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [modal, setModal] = useState<ModalMode>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyTrainee());
  const [toast, setToast] = useState<string | null>(null);
  const [csvPreview, setCsvPreview] = useState<Partial<Trainee>[]>([]);
  const [showCsv, setShowCsv] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== 'admin') { router.replace('/login'); return; }
    setSession(s);
    setTrainees(getStore().trainees);
  }, [router]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = trainees.filter(t => {
    const q = search.toLowerCase();
    return (
      (t.name.toLowerCase().includes(q) || t.username.includes(q) || t.contactNumber.includes(q)) &&
      (domainFilter === 'all' || t.domain === domainFilter) &&
      (genderFilter === 'all' || t.gender === genderFilter)
    );
  });

  const saveTrainee = () => {
    if (!form.name || !form.username || !form.password) {
      showToast('⚠️ Please fill Name, Username, and Password.'); return;
    }
    const store = getStore();
    // Check username uniqueness
    const exists = store.trainees.find(t => t.username === form.username && t.id !== editId);
    if (exists) { showToast('⚠️ Username already taken. Choose another.'); return; }

    if (modal === 'add') {
      const newT: Trainee = {
        id: generateId(),
        ...form,
        passwordHash: hashPassword(form.password),
        willingToRead: form.willingToRead,
        role: 'trainee',
        createdAt: new Date().toISOString(),
      };
      store.trainees.unshift(newT);
    } else if (editId) {
      const idx = store.trainees.findIndex(t => t.id === editId);
      if (idx !== -1) {
        store.trainees[idx] = {
          ...store.trainees[idx],
          ...form,
          passwordHash: form.password ? hashPassword(form.password) : store.trainees[idx].passwordHash,
        };
      }
    }
    saveStore(store);
    setTrainees(store.trainees);
    setModal(null);
    showToast(modal === 'add' ? '✅ Trainee added!' : '✅ Trainee updated!');
  };

  const deleteTrainee = (id: string) => {
    if (!confirm('Delete this trainee? This cannot be undone.')) return;
    const store = getStore();
    store.trainees = store.trainees.filter(t => t.id !== id);
    saveStore(store);
    setTrainees(store.trainees);
    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    showToast('🗑️ Trainee removed.');
  };

  const deleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected trainee(s)? This cannot be undone.`)) return;
    const store = getStore();
    store.trainees = store.trainees.filter(t => !selectedIds.includes(t.id));
    saveStore(store);
    setTrainees(store.trainees);
    setSelectedIds([]);
    showToast(`🗑️ Deleted ${selectedIds.length} selected trainee(s).`);
  };

  const openEdit = (t: Trainee) => {
    setForm({ ...t, password: '' });
    setEditId(t.id);
    setModal('edit');
  };

  const openAdd = () => { setForm(emptyTrainee()); setEditId(null); setModal('add'); };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    const extension = file.name.split('.').pop()?.toLowerCase();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      let rows: Partial<Trainee>[] = [];

      if (extension === 'json') {
        try {
          const jsonData = JSON.parse(text);
          if (Array.isArray(jsonData)) {
            rows = jsonData.map((row: any) => ({
              name: (row.name || row.full_name || row.fullname || row['Full Name'] || row['full name'] || '').toString().trim(),
              gender: (row.gender === 'female' ? 'female' : 'male') as Gender,
              domain: (DOMAINS.includes((row.domain || row.Domain || 'CP-01') as Domain) ? (row.domain || row.Domain) : 'CP-01') as Domain,
              motherTongue: (row.mother_tongue || row.mothertongue || row['Mother Tongue'] || 'Tamil').toString().trim(),
              religion: (row.religion || row.Religion || 'Catholic').toString().trim() as Religion,
              dob: (row.dob || row.date_of_birth || row['DoB'] || '').toString().trim(),
              contactNumber: (row.contact || row.contact_number || row['Contact'] || '').toString().trim(),
              username: (row.username || row.user_name || row['Username'] || '').toString().trim(),
              willingToRead: ['yes', 'true', '1'].includes(((row.willing_to_read || row.willing || row.Willing || '')).toString().toLowerCase()),
            } as Partial<Trainee>));
          }
        } catch (err) {
          showToast('⚠️ JSON parse failed. Upload a valid JSON array of trainees.');
          return;
        }
      } else {
        const parsed = Papa.parse<Record<string, string>>(text, {
          header: true,
          skipEmptyLines: true,
        });
        if (parsed.errors.length > 0) {
          showToast(`⚠️ ${parsed.errors.length} row parse issue(s) skipped.`);
        }
        rows = (parsed.data || []).map(row => ({
          name: (row.name || row.full_name || row.fullname || row['Full Name'] || row['full name'] || '').trim(),
          gender: (row.gender === 'female' ? 'female' : 'male') as Gender,
          domain: (DOMAINS.includes((row.domain || row.Domain || 'CP-01') as Domain) ? (row.domain || row.Domain) : 'CP-01') as Domain,
          motherTongue: (row.mother_tongue || row.mothertongue || row['Mother Tongue'] || 'Tamil').trim(),
          religion: (row.religion || row.Religion || 'Catholic').trim() as Religion,
          dob: (row.dob || row.date_of_birth || row['DoB'] || '').trim(),
          contactNumber: (row.contact || row.contact_number || row['Contact'] || '').trim(),
          username: (row.username || row.user_name || row['Username'] || '').trim(),
          willingToRead: ['yes', 'true', '1'].includes(((row.willing_to_read || row.willing || row.Willing || '')).toString().toLowerCase()),
        } as Partial<Trainee>));
      }

      rows = rows.filter(r => r.name && r.username);
      if (rows.length === 0) {
        showToast('⚠️ No valid trainee records found in uploaded file.');
        return;
      }
      setCsvPreview(rows);
      setShowCsv(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const importCSV = () => {
    const store = getStore();
    let added = 0;
    for (const row of csvPreview) {
      if (!row.name || !row.username) continue;
      const exists = store.trainees.find(t => t.username === row.username);
      if (exists) continue;
      store.trainees.push({
        id: generateId(),
        name: row.name!,
        gender: row.gender || 'male',
        domain: row.domain || 'CP-01',
        motherTongue: row.motherTongue || 'Tamil',
        religion: (row.religion || 'Catholic') as Religion,
        dob: row.dob || '',
        contactNumber: row.contactNumber || '',
        willingToRead: row.willingToRead || false,
        username: row.username!,
        passwordHash: hashPassword('pass1234'),
        role: 'trainee',
        createdAt: new Date().toISOString(),
      } as Trainee);
      added++;
    }
    saveStore(store);
    setTrainees(store.trainees);
    setShowCsv(false);
    showToast(`✅ Imported ${added} trainees! Default password: pass1234`);
  };

  const exportCSV = () => {
    const rows = ['Name,Gender,Domain,Mother Tongue,Religion,DoB,Contact,Username,Willing to Read'];
    trainees.forEach(t => {
      rows.push(`"${t.name}",${t.gender},${t.domain},"${t.motherTongue}",${t.religion},${t.dob},${t.contactNumber},${t.username},${t.willingToRead ? 'yes' : 'no'}`);
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'trainees.csv'; a.click();
  };

  if (!session) return <div className="min-h-screen flex items-center justify-center"><div className="dbsm-spinner" /></div>;

  return (
    <AppLayout role="admin" userName={session.name}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-playfair font-bold text-[#1B3F82]">Trainee Management</h1>
            <p className="text-sm text-slate-500">{trainees.length} total trainees in DBSM Mariam Manne Hostel</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <label className="btn-outline text-sm flex items-center gap-2 cursor-pointer">
              <Upload size={15} /> Bulk Upload (CSV/TXT/JSON/Any File)
              <input type="file" accept=".csv,.txt,.json,*/*" onChange={handleCSV} className="hidden" />
            </label>
            {selectedIds.length > 0 && (
              <button onClick={deleteSelected} className="btn-danger text-sm flex items-center gap-2">
                <Trash2 size={15} /> Delete Selected ({selectedIds.length})
              </button>
            )}
            <button onClick={exportCSV} className="btn-outline text-sm flex items-center gap-2">
              <Download size={15} /> Export CSV
            </button>
            <button onClick={openAdd} className="btn-primary text-sm flex items-center gap-2">
              <UserPlus size={15} /> Add Trainee
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="dbsm-card p-4 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[180px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="form-input pl-9 text-sm"
              placeholder="Search name, username, phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="form-input text-sm w-36" value={domainFilter} onChange={e => setDomainFilter(e.target.value)}>
            <option value="all">All Domains</option>
            {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="form-input text-sm w-32" value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Filter size={14} /> {filtered.length} shown
          </div>
        </div>

        {/* Table */}
        <div className="dbsm-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-12">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selectedIds.length === filtered.length}
                      onChange={() => setSelectedIds(filtered.length > 0 && selectedIds.length === filtered.length ? [] : filtered.map(t => t.id))}
                    />
                  </th>
                  <th>#</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Domain</th>
                  <th>Mother Tongue</th>
                  <th>Religion</th>
                  <th>Username</th>
                  <th>Read?</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr key={t.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(t.id)}
                        onChange={() => setSelectedIds(prev => prev.includes(t.id) ? prev.filter(id => id !== t.id) : [...prev, t.id])}
                        className="mt-1"
                      />
                    </td>
                    <td className="text-slate-400 text-xs">{i + 1}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          t.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                        }`}>{t.name.charAt(0)}</div>
                        <div>
                          <p className="font-medium text-sm text-slate-800">{t.name}</p>
                          <p className="text-xs text-slate-400">{t.contactNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        t.gender === 'male' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                      }`}>{t.gender === 'male' ? '♂ Male' : '♀ Female'}</span>
                    </td>
                    <td><span className="text-xs font-bold bg-[#1B3F82]/10 text-[#1B3F82] px-2 py-0.5 rounded-lg">{t.domain}</span></td>
                    <td className="text-sm">{t.motherTongue}</td>
                    <td className="text-sm text-slate-500">{t.religion}</td>
                    <td><code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{t.username}</code></td>
                    <td>
                      {t.willingToRead || t.religion === 'Catholic'
                        ? <span className="text-green-600 text-xs font-medium flex items-center gap-1"><Check size={12} /> Yes</span>
                        : <span className="text-slate-400 text-xs">No</span>}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deleteTrainee(t.id)} className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="text-center py-10 text-slate-400">No trainees found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-5 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-semibold text-lg text-[#1B3F82]">
                {modal === 'add' ? '➕ Add New Trainee' : '✏️ Edit Trainee'}
              </h3>
              <button onClick={() => setModal(null)} className="p-2 rounded-lg hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Arjun Kumar" />
                </div>
                <div>
                  <label className="form-label">Gender *</label>
                  <select className="form-input" value={form.gender} onChange={e => setForm({...form, gender: e.target.value as Gender})}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Domain / Batch *</label>
                  <select className="form-input" value={form.domain} onChange={e => setForm({...form, domain: e.target.value as Domain})}>
                    {DOMAINS.map(d => <option key={d} value={d}>{d} — {getDomainLabel(d).split('(')[0].trim()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Mother Tongue *</label>
                  <select className="form-input" value={form.motherTongue} onChange={e => setForm({...form, motherTongue: e.target.value})}>
                    {MOTHER_TONGUES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Religion *</label>
                  <select className="form-input" value={form.religion} onChange={e => setForm({...form, religion: e.target.value as Religion})}>
                    {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="form-input" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Contact Number</label>
                  <input className="form-input" value={form.contactNumber} onChange={e => setForm({...form, contactNumber: e.target.value})} placeholder="+91 9876543210" />
                </div>
                <div>
                  <label className="form-label">Username *</label>
                  <input className="form-input" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="trainee001" />
                </div>
                <div>
                  <label className="form-label">{modal === 'edit' ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                  <input type="password" className="form-input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="willing" checked={form.willingToRead} onChange={e => setForm({...form, willingToRead: e.target.checked})} className="w-4 h-4 rounded" />
                  <label htmlFor="willing" className="text-sm text-slate-600">Willing to do Bible Reading / Responsorial Psalm in Chapel?</label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal(null)} className="btn-outline flex-1 text-sm">Cancel</button>
                <button onClick={saveTrainee} className="btn-primary flex-1 text-sm">{modal === 'add' ? 'Add Trainee' : 'Save Changes'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Preview Modal */}
      {showCsv && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-lg text-[#1B3F82]">📋 CSV Preview — {csvPreview.length} rows</h3>
              <button onClick={() => setShowCsv(false)}><X size={18} /></button>
            </div>
            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="data-table text-xs">
                  <thead><tr><th>Name</th><th>Gender</th><th>Domain</th><th>Mother Tongue</th><th>Username</th></tr></thead>
                  <tbody>
                    {csvPreview.slice(0,10).map((r, i) => (
                      <tr key={i}><td>{r.name}</td><td>{r.gender}</td><td>{r.domain}</td><td>{r.motherTongue}</td><td>{r.username}</td></tr>
                    ))}
                  </tbody>
                </table>
                {csvPreview.length > 10 && <p className="text-xs text-slate-400 mt-2">... and {csvPreview.length - 10} more</p>}
              </div>
              <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg mt-3">Default password for all imported trainees: <strong>pass1234</strong></p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowCsv(false)} className="btn-outline flex-1 text-sm">Cancel</button>
                <button onClick={importCSV} className="btn-primary flex-1 text-sm">Import {csvPreview.length} Trainees</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="toast"><p className="text-sm font-medium">{toast}</p></div>}
    </AppLayout>
  );
}
