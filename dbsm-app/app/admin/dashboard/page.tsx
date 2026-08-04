'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { getSession, getStore } from '@/lib/store';
import { AuthSession, AppStore } from '@/lib/types';
import { Users, UtensilsCrossed, BookOpen, Megaphone, TrendingUp, ChevronRight, Star } from 'lucide-react';
import Link from 'next/link';
import { formatDate, getDomainLabel } from '@/lib/utils';

export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [store, setStore] = useState<AppStore | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== 'admin') { router.replace('/login'); return; }
    setSession(s);
    setStore(getStore());
  }, [router]);

  if (!session || !store) return <div className="min-h-screen flex items-center justify-center"><div className="dbsm-spinner" /></div>;

  const stats = [
    { label: 'Total Trainees', value: store.trainees.length, icon: <Users size={22} />, color: 'bg-blue-500', link: '/admin/trainees' },
    { label: 'Active Posts',   value: store.posts.length,    icon: <Megaphone size={22} />, color: 'bg-amber-500', link: '/admin/posts' },
    { label: 'Seating Cycles', value: Object.keys(store.seatingArrangements).length, icon: <UtensilsCrossed size={22} />, color: 'bg-green-500', link: '/admin/refectory' },
    { label: 'Reading Rosters', value: Object.keys(store.massReadingRosters).length, icon: <BookOpen size={22} />, color: 'bg-purple-500', link: '/admin/mass-reading' },
  ];

  const domainCounts = ['CP-01','CP-02','EV','DCOM','GSA'].map(d => ({
    domain: d,
    label: getDomainLabel(d),
    count: store.trainees.filter(t => t.domain === d).length,
    male: store.trainees.filter(t => t.domain === d && t.gender === 'male').length,
    female: store.trainees.filter(t => t.domain === d && t.gender === 'female').length,
  }));

  const willRead = store.trainees.filter(t => t.willingToRead || t.religion === 'Catholic').length;
  const catholics = store.trainees.filter(t => t.religion === 'Catholic').length;

  return (
    <AppLayout role="admin" userName={session.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="dbsm-card p-6 dbsm-header-gradient text-white rounded-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-playfair font-bold">Admin Dashboard</h1>
              <p className="text-blue-200 text-sm mt-1">Don Bosco Skill Mission Center — Hostel Management</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs bg-white/15 rounded-full px-3 py-1 border border-white/20">
                Cycle: <strong>{store.settings.cycleFrequency === 'monthly' ? 'Monthly' : '15-Day'}</strong>
              </span>
              <span className="text-xs bg-amber-400/20 rounded-full px-3 py-1 border border-amber-400/30 text-amber-200">
                {store.settings.currentCycleId ? '🟢 Cycle Active' : '⚠️ No Active Cycle'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <Link key={s.label} href={s.link}
              className="dbsm-card p-5 flex flex-col gap-3 hover:shadow-lg transition-all animate-fade-in-up cursor-pointer"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className={`w-10 h-10 rounded-xl ${s.color} text-white flex items-center justify-center`}>
                {s.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                <div className="text-xs text-slate-500 font-medium">{s.label}</div>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#1B3F82] font-medium">
                <span>Manage</span><ChevronRight size={12} />
              </div>
            </Link>
          ))}
        </div>

        {/* Domain Breakdown + Reading Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Domain Breakdown */}
          <div className="dbsm-card p-5 animate-fade-in-up delay-2">
            <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-[#1B3F82]" />
              Trainees by Domain / Batch
            </h2>
            <div className="space-y-3">
              {domainCounts.map(d => (
                <div key={d.domain} className="flex items-center gap-3">
                  <span className="text-xs font-bold bg-[#1B3F82]/10 text-[#1B3F82] rounded-lg px-2 py-1 w-16 text-center flex-shrink-0">
                    {d.domain}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="truncate max-w-[140px]">{d.label}</span>
                      <span className="font-bold text-slate-700">{d.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-[#1B3F82] rounded-full"
                        style={{ width: `${Math.min(100, (d.count / store.trainees.length) * 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">♂ {d.male} &nbsp;♀ {d.female}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mass Reading + Recent Posts */}
          <div className="space-y-4">
            {/* Reading Pool Stats */}
            <div className="dbsm-card p-5 animate-fade-in-up delay-3">
              <h2 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <BookOpen size={18} className="text-purple-600" />
                Mass Reading Pool
              </h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                  <div className="text-xl font-bold text-purple-700">{catholics}</div>
                  <div className="text-xs text-purple-500">Catholics</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <div className="text-xl font-bold text-blue-700">{willRead - catholics}</div>
                  <div className="text-xs text-blue-500">Willing Others</div>
                </div>
                <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                  <div className="text-xl font-bold text-green-700">{willRead}</div>
                  <div className="text-xs text-green-500">Total Pool</div>
                </div>
              </div>
            </div>

            {/* Recent Announcements */}
            <div className="dbsm-card p-5 animate-fade-in-up delay-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                  <Megaphone size={18} className="text-amber-500" />
                  Recent Posts
                </h2>
                <Link href="/admin/posts" className="text-xs text-[#1B3F82] hover:underline font-medium">View All →</Link>
              </div>
              <div className="space-y-2">
                {store.posts.slice(0, 3).map(p => (
                  <div key={p.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50">
                    {p.pinned && <Star size={12} className="text-amber-400 mt-1 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{p.title}</p>
                      <p className="text-xs text-slate-400">{formatDate(p.datePosted)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dbsm-card p-5 animate-fade-in-up delay-5">
          <h2 className="font-semibold text-slate-700 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/trainees" className="btn-primary text-sm flex items-center gap-2">
              <Users size={16} /> Add Trainee
            </Link>
            <Link href="/admin/refectory" className="btn-gold text-sm flex items-center gap-2">
              <UtensilsCrossed size={16} /> Generate Seating
            </Link>
            <Link href="/admin/mass-reading" className="btn-outline text-sm flex items-center gap-2">
              <BookOpen size={16} /> Generate Reading Roster
            </Link>
            <Link href="/admin/posts" className="btn-outline text-sm flex items-center gap-2">
              <Megaphone size={16} /> Post Announcement
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
