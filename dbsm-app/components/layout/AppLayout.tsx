'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { clearSession } from '@/lib/store';
import {
  LayoutDashboard, Users, UtensilsCrossed, BookOpen,
  Megaphone, Settings, LogOut, Menu, X, ChevronRight, Bell
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

const adminNav: NavItem[] = [
  { href: '/admin/dashboard',    icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { href: '/admin/trainees',     icon: <Users size={18} />,           label: 'Trainees' },
  { href: '/admin/refectory',    icon: <UtensilsCrossed size={18} />, label: 'Refectory' },
  { href: '/admin/mass-reading', icon: <BookOpen size={18} />,        label: 'Mass Reading' },
  { href: '/admin/posts',        icon: <Megaphone size={18} />,       label: 'Announcements' },
  { href: '/admin/settings',     icon: <Settings size={18} />,        label: 'Settings' },
];

const traineeNav: NavItem[] = [
  { href: '/trainee/dashboard', icon: <LayoutDashboard size={18} />, label: 'My Dashboard' },
];

interface AppLayoutProps {
  role: 'admin' | 'trainee';
  userName: string;
  children: React.ReactNode;
}

export default function AppLayout({ role, userName, children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = role === 'admin' ? adminNav : traineeNav;

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  const currentTitle = navItems.find(n => pathname.startsWith(n.href))?.label
    || (role === 'admin' ? 'Admin Panel' : 'My Portal');

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ── Mobile Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full z-50 w-64 flex flex-col
        dbsm-header-gradient text-white
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 p-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/20">
            <Image
              src="/images/don_bosco_skill_mission_center_logo.png"
              alt="DBSM Logo"
              width={40}
              height={40}
              className="object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight truncate">Don Bosco SMC</p>
            <p className="text-xs text-blue-300">Bengaluru</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Gold stripe */}
        <div className="h-0.5 dbsm-gold-stripe" />

        {/* Role badge */}
        <div className="px-5 pt-4 pb-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            role === 'admin' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-green-400/20 text-green-300 border border-green-400/30'
          }`}>
            {role === 'admin' ? '🛡️ ADMIN' : '🎓 TRAINEE'}
          </span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150 group
                  ${active
                    ? 'bg-white/15 text-white shadow-lg border border-white/10'
                    : 'text-white/70 hover:bg-white/8 hover:text-white'
                  }
                `}
              >
                <span className={active ? 'text-amber-400' : 'text-white/50 group-hover:text-white/80'}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={14} className="text-amber-400" />}
                {item.badge ? (
                  <span className="bg-amber-400 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300 font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-blue-300">● Online</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-xl text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 px-4 h-14">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400 hidden sm:inline">Don Bosco SMC</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="font-semibold text-[#1B3F82]">{currentTitle}</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden sm:block text-sm text-slate-500">
                Welcome, <strong className="text-slate-700">{userName}</strong>
              </span>
              <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100">
                <Bell size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
