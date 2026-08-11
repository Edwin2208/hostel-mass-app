'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getStore, saveSession, getSession } from '@/lib/store';
import { verifyPassword } from '@/lib/utils';
import { Eye, EyeOff, BookOpen, Home, Shield, Loader2 } from 'lucide-react';

type TabType = 'trainee' | 'admin';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabType>('trainee');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session?.role === 'admin') router.replace('/admin/dashboard');
    else if (session?.role === 'trainee') router.replace('/trainee/dashboard');
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 600)); // Simulated auth delay

    const store = getStore();

    if (tab === 'admin') {
      const admin = store.admins.find(a => a.username === username.trim());
      if (!admin || !verifyPassword(password, admin.passwordHash)) {
        setError('Invalid admin credentials. Please try again.');
        setLoading(false);
        return;
      }
      saveSession({ userId: admin.id, role: 'admin', name: admin.name, username: admin.username, loginTime: new Date().toISOString() });
      router.push('/admin/dashboard');
    } else {
      const trainee = store.trainees.find(t => t.username === username.trim());
      if (!trainee || !verifyPassword(password, trainee.passwordHash)) {
        setError('Invalid trainee credentials. Contact Admin if you forgot your password.');
        setLoading(false);
        return;
      }
      saveSession({ userId: trainee.id, role: 'trainee', name: trainee.name, username: trainee.username, loginTime: new Date().toISOString() });
      router.push('/trainee/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left Panel: Don Bosco Branding ── */}
      <div className="lg:w-[55%] dbsm-header-gradient flex flex-col items-center justify-center p-8 lg:p-16 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />

        {/* Gold top stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 dbsm-gold-stripe" />

        <div className="relative z-10 text-center text-white max-w-md">
          {/* Center Logo */}
          <div className="flex justify-center mb-6 animate-fade-in">
            <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center overflow-hidden shadow-2xl">
              <Image
                src="https://github.com/Edwin2208/hostel-mass-app/blob/main/dbsm-app/public/images/don_bosco_skill_mission_center_logo.png"
                alt="Don Bosco Skill Mission Center Logo"
                width={128}
                height={128}
                className="object-contain p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-playfair font-bold mb-2 animate-fade-in delay-1">
            Don Bosco Skill Mission Center
          </h1>
          <p className="text-xl text-blue-200 font-semibold mb-1 animate-fade-in delay-2">Bengaluru</p>
          <div className="w-20 h-0.5 bg-amber-400 mx-auto mb-4 animate-fade-in delay-2" />
          <p className="text-blue-200 text-sm mb-8 animate-fade-in delay-3">
            DBSM Hostel MANAGEMENT SYSTEM
          </p>

          {/* Don Bosco Portrait */}
          <div className="flex justify-center mb-8 animate-fade-in delay-3">
            <div className="relative w-44 h-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
              <Image
                src="/https://github.com/Edwin2208/hostel-mass-app/blob/main/dbsm-app/public/images/don_bosco_portrait.png"
                alt="Saint John Bosco — Don Bosco"
                fill
                className="object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLImageElement).parentElement!.style.background = 'rgba(255,255,255,0.1)';
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>

          <p className="text-sm text-blue-300 italic animate-fade-in delay-4">
            "Education is a matter of the heart."<br />
            <span className="text-blue-200 not-italic font-semibold">— St. John Bosco</span>
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6 animate-fade-in delay-5">
            {[
              { icon: <Home size={12} />, label: 'Refectory Seating' },
              { icon: <BookOpen size={12} />, label: 'Mass Readings' },
              { icon: <Shield size={12} />, label: 'Secure Access' },
            ].map(f => (
              <span key={f.label} className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 text-xs text-blue-100 border border-white/20">
                {f.icon} {f.label}
              </span>
            ))}
          </div>
        </div>

        {/* DB Tech Logo bottom-left */}
        <div className="absolute bottom-6 left-6 flex items-center gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
            <Image
              src="https://github.com/Edwin2208/hostel-mass-app/blob/main/dbsm-app/public/images/don_bosco_tech_skilling_india_logo.jpeg"
              alt="Don Bosco Tech"
              width={40}
              height={40}
              className="object-contain p-0.5"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <div>
            <p className="text-xs text-white font-semibold">Don Bosco Tech</p>
            <p className="text-xs text-blue-300">Skilling India</p>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="lg:w-[45%] flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm animate-fade-in-up">
          <h2 className="text-2xl font-playfair font-bold text-[#1B3F82] mb-1">Welcome Back</h2>
          <p className="text-slate-500 text-sm mb-6">Sign in to access your hostel portal</p>

          {/* Role Tabs */}
          <div className="flex rounded-xl border border-slate-200 p-1 mb-6 bg-slate-50">
            {(['trainee', 'admin'] as TabType[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setUsername(''); setPassword(''); }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${tab === t
                    ? 'bg-[#1B3F82] text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {t === 'trainee' ? '🎓 Trainee' : '🛡️ Admin'}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="form-label">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                className="form-input"
                placeholder={tab === 'admin' ? 'admin' : 'trainee001'}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="form-input pr-12"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-start gap-2">
                <span className="text-red-500 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Signing in...</>
              ) : (
                <>{tab === 'admin' ? '🛡️ Admin Sign In' : '🎓 Trainee Sign In'}</>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <p className="font-semibold mb-1">🔑 Demo Credentials</p>
            <p><strong>Admin:</strong> admin / admin@dbsm2026</p>
            <p><strong>Trainee:</strong> trainee001 / pass1234</p>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            © 2026 Don Bosco Skill Mission Center, Bengaluru<br />
            Powered by Don Bosco Tech — Skilling India
          </p>
        </div>
      </div>
    </div>
  );
}
