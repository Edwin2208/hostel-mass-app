'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const session = getSession();
    if (session?.role === 'admin') router.replace('/admin/dashboard');
    else if (session?.role === 'trainee') router.replace('/trainee/dashboard');
    else router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center dbsm-header-gradient">
      <div className="dbsm-spinner" />
    </div>
  );
}
