'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { getSession, getStore, saveStore } from '@/lib/store';
import { AuthSession, Post } from '@/lib/types';
import { generateId, formatDate } from '@/lib/utils';
import { Plus, Pencil, Trash2, Star, X, Pin } from 'lucide-react';

export default function PostsPage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== 'admin') { router.replace('/login'); return; }
    setSession(s);
    setPosts(getStore().posts);
  }, [router]);

  const openAdd = () => { setTitle(''); setContent(''); setPinned(false); setEditId(null); setModal(true); };
  const openEdit = (p: Post) => { setTitle(p.title); setContent(p.content); setPinned(!!p.pinned); setEditId(p.id); setModal(true); };

  const save = () => {
    if (!title.trim() || !content.trim()) { showToast('⚠️ Title and content required.'); return; }
    const store = getStore();
    if (editId) {
      const p = store.posts.find(x => x.id === editId);
      if (p) { p.title = title; p.content = content; p.pinned = pinned; }
    } else {
      store.posts.unshift({ id: generateId(), title, content, pinned, postedBy: session!.name, datePosted: new Date().toISOString() });
    }
    saveStore(store);
    setPosts(store.posts);
    setModal(false);
    showToast(editId ? '✅ Post updated!' : '✅ Post published!');
  };

  const deletePost = (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    const store = getStore();
    store.posts = store.posts.filter(p => p.id !== id);
    saveStore(store);
    setPosts(store.posts);
    showToast('🗑️ Post deleted.');
  };

  const togglePin = (id: string) => {
    const store = getStore();
    const p = store.posts.find(x => x.id === id);
    if (p) p.pinned = !p.pinned;
    saveStore(store);
    setPosts(store.posts);
  };

  if (!session) return <div className="min-h-screen flex items-center justify-center"><div className="dbsm-spinner" /></div>;

  const sorted = [...posts].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <AppLayout role="admin" userName={session.name}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-playfair font-bold text-[#1B3F82]">Announcements</h1>
            <p className="text-sm text-slate-500">{posts.length} posts visible to all trainees</p>
          </div>
          <button onClick={openAdd} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={15} /> New Post
          </button>
        </div>

        <div className="space-y-4">
          {sorted.map(p => (
            <div key={p.id} className={`dbsm-card p-5 animate-fade-in ${p.pinned ? 'border-amber-200 bg-amber-50/30' : ''}`}>
              <div className="flex items-start gap-3">
                {p.pinned && <Pin size={16} className="text-amber-500 mt-1 flex-shrink-0" />}
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 mb-1">{p.title}</h3>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{p.content}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                    <span>📅 {formatDate(p.datePosted)}</span>
                    <span>👤 {p.postedBy}</span>
                    {p.pinned && <span className="text-amber-500 font-medium">📌 Pinned</span>}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => togglePin(p.id)} title="Pin/Unpin"
                    className={`p-1.5 rounded-lg transition-colors ${p.pinned ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}>
                    <Star size={14} />
                  </button>
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deletePost(p.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="dbsm-card p-12 text-center text-slate-400">
              <p className="text-4xl mb-3">📢</p>
              <p className="font-medium">No announcements yet</p>
              <p className="text-sm mt-1">Create your first post to inform trainees.</p>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in-up">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-lg text-[#1B3F82]">{editId ? '✏️ Edit Post' : '📢 New Announcement'}</h3>
              <button onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="form-label">Title *</label>
                <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title..." />
              </div>
              <div>
                <label className="form-label">Content *</label>
                <textarea className="form-input" rows={6} value={content} onChange={e => setContent(e.target.value)} placeholder="Write your announcement here..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="pin" checked={pinned} onChange={e => setPinned(e.target.checked)} className="w-4 h-4" />
                <label htmlFor="pin" className="text-sm text-slate-600">📌 Pin this announcement (shows at top)</label>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setModal(false)} className="btn-outline flex-1 text-sm">Cancel</button>
                <button onClick={save} className="btn-primary flex-1 text-sm">{editId ? 'Update Post' : 'Publish Post'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast"><p className="text-sm font-medium">{toast}</p></div>}
    </AppLayout>
  );
}
