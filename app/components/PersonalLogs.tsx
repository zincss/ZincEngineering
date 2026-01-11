'use client';

import React, { useState, useEffect } from 'react';
import { 
    X, Calendar, ChevronRight, 
    Lock, Unlock, Key, Edit, Trash2, Loader2, LogOut, 
    MessageSquare, Save, Clock, Plus, ExternalLink
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface LogEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
  status: 'ENCRYPTED' | 'PUBLIC' | 'DRAFT';
}

export default function PersonalLogs() {
  const supabase = createClient();
  const { isAdmin } = useAuth();

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthInput, setShowAuthInput] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewLog, setViewLog] = useState<LogEntry | null>(null);
  const [newLog, setNewLog] = useState({ title: '', content: '', tags: '' });

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('personal_logs')
      .select('*')
      .order('date', { ascending: false });

    if (error) console.error('Error fetching logs:', error);
    else setLogs(data as LogEntry[] || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) setIsAuthenticated(true);
    fetchLogs();
    const channel = supabase.channel('personal_logs_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'personal_logs' }, () => fetchLogs()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const verifyCode = () => {
    if (accessCode === '1698') {
      setIsAuthenticated(true);
      setShowAuthInput(false);
      setIsWriting(true);
      setAccessCode('');
    } else {
      setAccessCode('');
      alert('Invalid code.');
    }
  };

  const handleSave = async () => {
    if (!newLog.title || !newLog.content) return;
    const entry: LogEntry = {
      id: editingId || `LOG_${Date.now()}`,
      date: editingId ? logs.find(l => l.id === editingId)?.date || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      title: newLog.title,
      content: newLog.content,
      tags: newLog.tags.split(',').map(t => t.trim()).filter(t => t),
      status: 'PUBLIC'
    };
    const { error } = await supabase.from('personal_logs').upsert(entry);
    if (!error) {
      setIsWriting(false);
      setEditingId(null);
      setNewLog({ title: '', content: '', tags: '' });
      fetchLogs();
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAuthenticated) return;
    if (confirm('Delete this post?')) {
      const { error } = await supabase.from('personal_logs').delete().eq('id', id);
      if (!error) fetchLogs();
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-zinc-700 gap-4">
        <Loader2 className="animate-spin text-[#DFFF00]" size={32} />
        <span className="font-sans text-xs font-bold uppercase tracking-widest animate-pulse">Loading Updates...</span>
    </div>
  );

  return (
    <div className="w-full space-y-12">
      
      {/* HEADER CONTROLS */}
      <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-500 font-sans text-[10px] font-bold uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#DFFF00] animate-pulse shadow-[0_0_8px_#DFFF00]" />
                  Latest News
              </div>
          </div>

          <div className="flex items-center gap-3">
              {isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setIsWriting(!isWriting); setEditingId(null); }} className="px-5 py-2 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#DFFF00] transition-colors shadow-lg">
                        {isWriting ? 'Cancel' : 'New Post'}
                    </button>
                    <button onClick={() => setIsAuthenticated(false)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors"><LogOut size={18}/></button>
                  </div>
              ) : (
                  <button onClick={() => setShowAuthInput(true)} className="p-2 text-zinc-800 hover:text-white transition-colors"><Key size={18}/></button>
              )}
          </div>
      </div>

      <AnimatePresence>
          {showAuthInput && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col items-center text-center max-w-sm mx-auto shadow-2xl">
                  <Lock size={24} className="text-[#DFFF00] mb-4" />
                  <h3 className="text-white font-bold text-sm mb-6">Admin Access</h3>
                  <input 
                    type="password" 
                    value={accessCode} 
                    onChange={e => setAccessCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && verifyCode()}
                    className="bg-black border border-zinc-800 rounded-xl px-4 py-3 text-center text-white focus:border-[#DFFF00] outline-none mb-6 w-full font-mono"
                    placeholder="Enter Code"
                    autoFocus
                  />
                  <button onClick={() => setShowAuthInput(false)} className="text-xs font-bold text-zinc-600 hover:text-white uppercase tracking-widest">Cancel</button>
              </motion.div>
          )}

          {isWriting && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-10 bg-zinc-900 border border-zinc-800 rounded-[3rem] space-y-6 max-w-4xl mx-auto shadow-2xl">
                  <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-zinc-500 ml-1">Title</label>
                              <input 
                                value={newLog.title} 
                                onChange={e => setNewLog({...newLog, title: e.target.value})}
                                className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-[#DFFF00] outline-none transition-colors"
                                placeholder="Update Title"
                              />
                          </div>
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-zinc-500 ml-1">Tags</label>
                              <input 
                                value={newLog.tags} 
                                onChange={e => setNewLog({...newLog, tags: e.target.value})}
                                className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:border-[#DFFF00] outline-none transition-colors"
                                placeholder="News, Sports, Tech"
                              />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 ml-1">Content</label>
                          <textarea 
                            value={newLog.content} 
                            onChange={e => setNewLog({...newLog, content: e.target.value})}
                            className="w-full h-64 bg-black border border-zinc-800 rounded-3xl p-8 text-zinc-300 font-sans text-sm resize-none focus:border-[#DFFF00] outline-none transition-colors custom-scrollbar"
                            placeholder="Write your update here..."
                          />
                      </div>
                      <button onClick={handleSave} className="w-full py-5 bg-[#DFFF00] text-black font-black uppercase tracking-widest rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-3 shadow-xl">
                          <Save size={18}/> Publish Post
                      </button>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* REFINED FEED */}
      <div className="grid grid-cols-1 gap-8">
          {logs.length === 0 ? (
              <div className="py-40 text-center border-2 border-dashed border-zinc-900 rounded-[3rem] bg-zinc-900/20">
                  <MessageSquare size={48} className="text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">No updates yet</p>
              </div>
          ) : (
              logs.map((log) => (
                  <motion.div 
                    key={log.id} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="group bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-700 rounded-[2.5rem] p-8 md:p-12 transition-all duration-500 relative overflow-hidden flex flex-col md:flex-row gap-10"
                  >
                      {/* Date Column */}
                      <div className="md:w-48 shrink-0 flex flex-col">
                          <div className="flex items-center gap-3 text-[#DFFF00] mb-2 font-sans font-bold text-xs uppercase tracking-widest">
                              <Calendar size={14} />
                              {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">Published By Zinc</div>
                          
                          {/* Tags */}
                          <div className="mt-6 flex flex-wrap gap-2">
                              {log.tags.map(tag => (
                                  <span key={tag} className="text-[9px] font-bold text-zinc-500 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800 uppercase tracking-tighter">#{tag}</span>
                              ))}
                          </div>
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 space-y-6">
                          <h3 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight group-hover:text-[#DFFF00] transition-colors">{log.title}</h3>
                          <p className="text-zinc-400 font-sans text-base leading-relaxed max-w-3xl whitespace-pre-wrap">{log.content}</p>
                          
                          <div className="pt-6 flex items-center justify-between border-t border-zinc-800/50">
                              <button onClick={() => setViewLog(log)} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#DFFF00] hover:translate-x-2 transition-all group/btn">
                                  Read Full Post <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                              </button>

                              {isAuthenticated && (
                                  <div className="flex gap-2">
                                      <button onClick={() => { setEditingId(log.id); setNewLog({ title: log.title, content: log.content, tags: log.tags.join(', ') }); setIsWriting(true); }} className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-colors"><Edit size={14}/></button>
                                      <button onClick={() => handleDelete(log.id)} className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-500 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Background Visual */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[#DFFF00]/[0.02] blur-[100px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
              ))
          )}
      </div>

      {/* FULL POST MODAL */}
      <AnimatePresence>
          {viewLog && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl"
                onClick={() => setViewLog(null)}
              >
                  <motion.div 
                    initial={{ scale: 0.95, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 40 }}
                    className="bg-zinc-950 border border-white/10 w-full max-w-4xl rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden"
                    onClick={e => e.stopPropagation()}
                  >
                      <button onClick={() => setViewLog(null)} className="absolute top-8 right-8 p-3 bg-zinc-900 hover:bg-white hover:text-black rounded-full transition-all border border-zinc-800"><X size={24}/></button>
                      
                      <div className="mb-12">
                          <div className="flex items-center gap-3 text-[#DFFF00] font-sans font-bold text-xs uppercase tracking-widest mb-6">
                              <Calendar size={14} />
                              {new Date(viewLog.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">{viewLog.title}</h2>
                      </div>

                      <div className="prose prose-invert max-w-none">
                          <p className="text-zinc-400 font-sans text-lg leading-relaxed whitespace-pre-wrap">
                              {viewLog.content}
                          </p>
                      </div>

                      <div className="mt-16 pt-10 border-t border-zinc-900 flex flex-wrap gap-3">
                          {viewLog.tags.map(t => (
                              <span key={t} className="px-5 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500">#{t}</span>
                          ))}
                      </div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}