'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, PenTool, Save, X, Calendar, Hash, ChevronRight, Lock, Unlock, Key, Edit, Trash2, Loader2, Maximize2, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface LogEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
  status: 'ENCRYPTED' | 'PUBLIC' | 'DRAFT';
}

export default function PersonalLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthInput, setShowAuthInput] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  
  // State for editing and viewing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewLog, setViewLog] = useState<LogEntry | null>(null);
  const [newLog, setNewLog] = useState({ title: '', content: '', tags: '' });

  // --- FETCH LOGS ---
  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('personal_logs')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error);
    } else {
      setLogs(data as LogEntry[] || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    const channel = supabase
      .channel('personal_logs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'personal_logs' }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- AUTH HANDLERS ---
  const handleAccessRequest = () => {
    if (isAuthenticated) {
      if (isWriting) {
        resetForm();
      } else {
        setIsWriting(true);
      }
      return;
    }
    setShowAuthInput(true);
  };

  const verifyCode = () => {
    if (accessCode === '1698') {
      setIsAuthenticated(true);
      setShowAuthInput(false);
      setIsWriting(true);
      setAccessCode('');
    } else {
      setAccessCode('');
      alert('ACCESS DENIED: INVALID SECURITY PROTOCOL');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsWriting(false);
    setEditingId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') verifyCode();
  };

  // --- CRUD OPERATIONS ---
  const resetForm = () => {
    setIsWriting(false);
    setEditingId(null);
    setNewLog({ title: '', content: '', tags: '' });
  };

  const handleEdit = (log: LogEntry) => {
    if (!isAuthenticated) {
        setShowAuthInput(true);
        return;
    }
    setViewLog(null);
    setNewLog({
        title: log.title,
        content: log.content,
        tags: log.tags.join(', ')
    });
    setEditingId(log.id);
    setIsWriting(true);
    // Scroll to form
    const formElement = document.getElementById('log-editor');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!isAuthenticated) return;
    if (confirm('CONFIRM DELETION PROTOCOL? THIS ACTION CANNOT BE UNDONE.')) {
      setLogs(prev => prev.filter(l => l.id !== id));
      if (viewLog?.id === id) setViewLog(null);
      
      const { error } = await supabase.from('personal_logs').delete().eq('id', id);
      if (error) {
        alert('ERROR DELETING ENTRY');
        fetchLogs();
      } else if (editingId === id) {
        resetForm();
      }
    }
  };

  const handleSave = async () => {
    if (!newLog.title || !newLog.content) return;

    const entry: LogEntry = {
      id: editingId || `LOG_${Date.now()}`,
      date: editingId ? logs.find(l => l.id === editingId)?.date || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      title: newLog.title.toUpperCase(),
      content: newLog.content,
      tags: newLog.tags.split(',').map(t => t.trim().toUpperCase()).filter(t => t),
      status: 'PUBLIC'
    };

    if (editingId) {
      setLogs(prev => prev.map(l => l.id === editingId ? entry : l));
    } else {
      setLogs(prev => [entry, ...prev]);
    }

    const { error } = await supabase.from('personal_logs').upsert(entry);

    if (error) {
      console.error('Save Error:', error);
      alert('DATABASE WRITE FAILED');
      fetchLogs();
    } else {
      resetForm();
    }
  };

  return (
    <section className="relative">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-2">
           {/* DECORATIVE LINE */}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
            {/* AUTH INDICATOR */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border font-mono text-[10px] uppercase tracking-widest backdrop-blur-md ${isAuthenticated ? 'border-[#DFFF00] text-[#DFFF00] bg-[#DFFF00]/10' : 'border-zinc-800 text-zinc-500 bg-zinc-900/50'}`}>
                {isAuthenticated ? <Unlock size={12} /> : <Lock size={12} />}
                <span className="hidden sm:inline">{isAuthenticated ? 'ADMIN_ACCESS_GRANTED' : 'READ_ONLY_MODE'}</span>
            </div>

            {/* DEV LOGIN / LOGOUT */}
            {isAuthenticated ? (
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-red-500 hover:border-red-500 font-mono text-[10px] uppercase tracking-widest transition-all"
                >
                    <LogOut size={12} />
                    <span className="hidden sm:inline">LOGOUT</span>
                </button>
            ) : (
                <button 
                    onClick={() => setShowAuthInput(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-[#DFFF00] hover:border-[#DFFF00] font-mono text-[10px] uppercase tracking-widest transition-all"
                >
                    <Key size={12} />
                    <span className="hidden sm:inline">DEV_LOGIN</span>
                </button>
            )}

            <button 
                onClick={handleAccessRequest}
                className={`
                    flex items-center gap-2 px-6 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-lg
                    ${isWriting 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-zinc-100 text-black hover:bg-[#DFFF00] hover:scale-105'
                    }
                `}
            >
                {isWriting ? <><X size={14} /> CANCEL</> : <><PenTool size={14} /> NEW_ENTRY</>}
            </button>
        </div>
      </div>

      {/* ACCESS CODE MODAL */}
      {showAuthInput && !isAuthenticated && (
        <div className="mb-12 rounded-[2.5rem] bg-zinc-900 border border-red-500/50 p-8 md:p-12 animate-in fade-in slide-in-from-top-4 relative overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl">
            <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
            <Lock size={48} className="text-red-500 mb-6" />
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Restricted Access</h3>
            <p className="text-zinc-500 font-mono text-xs mb-8">ENTER SECURITY CLEARANCE CODE TO PROCEED</p>
            
            <div className="flex items-center gap-2 w-full max-w-xs relative mb-8">
                <Key size={16} className="absolute left-6 text-zinc-500 z-10" />
                <input 
                    type="password" 
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    onKeyDown={handleKeyPress}
                    autoFocus
                    className="w-full bg-black border border-zinc-800 rounded-full py-4 pl-12 pr-6 text-white font-mono text-center tracking-[0.5em] focus:outline-none focus:border-red-500 transition-all uppercase placeholder:text-zinc-800 shadow-inner"
                    placeholder="••••"
                />
            </div>
            
            <div className="flex gap-4">
                 <button onClick={() => setShowAuthInput(false)} className="px-6 py-2 rounded-full border border-zinc-800 text-xs font-mono text-zinc-500 hover:text-white uppercase hover:bg-zinc-800 transition-colors">Cancel</button>
                 <button onClick={verifyCode} className="px-8 py-2 rounded-full bg-red-500 text-white text-xs font-bold hover:bg-red-600 uppercase tracking-widest transition-colors shadow-lg shadow-red-900/20">Verify</button>
            </div>
        </div>
      )}

      {/* EDITOR */}
      {isWriting && isAuthenticated && (
        <div id="log-editor" className="mb-12 rounded-[2.5rem] bg-zinc-900/80 backdrop-blur-xl border border-[#DFFF00]/50 p-8 md:p-10 animate-in fade-in slide-in-from-top-4 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-8 right-10 opacity-50">
             <div className="text-[10px] font-mono font-bold text-[#DFFF00] bg-[#DFFF00]/10 px-3 py-1 rounded-full border border-[#DFFF00]/20">
                {editingId ? 'EDIT_MODE // MODIFYING' : 'WRITE_MODE // NEW_ENTRY'}
             </div>
          </div>

          <div className="grid gap-6 mt-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-2">Subject Line</label>
                <input 
                  type="text" 
                  value={newLog.title}
                  onChange={(e) => setNewLog({...newLog, title: e.target.value})}
                  className="w-full bg-black/50 border border-zinc-700 rounded-2xl p-4 text-white font-mono text-sm focus:outline-none focus:border-[#DFFF00] focus:ring-1 focus:ring-[#DFFF00]/50 transition-all uppercase placeholder:text-zinc-800"
                  placeholder="ENTER_SUBJECT..."
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-2">Tags</label>
                <input 
                  type="text" 
                  value={newLog.tags}
                  onChange={(e) => setNewLog({...newLog, tags: e.target.value})}
                  className="w-full bg-black/50 border border-zinc-700 rounded-2xl p-4 text-white font-mono text-sm focus:outline-none focus:border-[#DFFF00] focus:ring-1 focus:ring-[#DFFF00]/50 transition-all uppercase placeholder:text-zinc-800"
                  placeholder="SYSTEM, DEV, UPDATE..."
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-2">Log Content</label>
              <textarea 
                value={newLog.content}
                onChange={(e) => setNewLog({...newLog, content: e.target.value})}
                className="w-full h-80 bg-black/50 border border-zinc-700 rounded-3xl p-6 text-zinc-300 font-mono text-sm focus:outline-none focus:border-[#DFFF00] focus:ring-1 focus:ring-[#DFFF00]/50 transition-all resize-none placeholder:text-zinc-800 custom-scrollbar"
                placeholder="INITIALIZING WRITE PROTOCOL..."
              />
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-[#DFFF00] hover:bg-white text-black font-black uppercase py-5 rounded-2xl transition-all hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(223,255,0,0.3)] flex items-center justify-center gap-3"
            >
              <Save size={18} />
              {editingId ? 'UPDATE DATABASE ENTRY' : 'COMMIT TO DATABASE'}
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-in fade-in duration-200" onClick={() => setViewLog(null)}>
            <div 
                className="bg-zinc-950 border border-zinc-800 w-full max-w-4xl max-h-[85vh] flex flex-col rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="p-8 pb-4 bg-gradient-to-b from-zinc-900 to-zinc-950 flex justify-between items-start">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[#DFFF00] font-mono text-[10px] font-bold mb-4">
                             <Calendar size={12} /> 
                             {viewLog.date}
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase leading-none tracking-tight">{viewLog.title}</h2>
                    </div>
                    <button onClick={() => setViewLog(null)} className="bg-zinc-900 hover:bg-white hover:text-black text-zinc-500 rounded-full p-3 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                {/* Modal Content */}
                <div className="p-8 pt-4 overflow-y-auto custom-scrollbar flex-1">
                    <div className="prose prose-invert prose-lg max-w-none font-mono text-zinc-400 whitespace-pre-wrap leading-relaxed">
                        {viewLog.status === 'ENCRYPTED' && !isAuthenticated 
                            ? '/// CONTENT REDACTED /// ENCRYPTION KEY REQUIRED ///' 
                            : viewLog.content}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex justify-between items-center">
                    <div className="flex gap-2">
                         {viewLog.tags.map(t => (
                             <span key={t} className="text-[10px] font-bold bg-black border border-zinc-800 text-zinc-400 px-3 py-1 rounded-full uppercase tracking-wider">{t}</span>
                         ))}
                    </div>
                    
                    {isAuthenticated && (
                        <button 
                            onClick={() => handleEdit(viewLog)}
                            className="flex items-center gap-2 text-xs font-bold text-black bg-[#DFFF00] px-6 py-2 rounded-full hover:bg-white transition-colors uppercase tracking-widest"
                        >
                            <Edit size={14} /> Edit Entry
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* LOGS GRID */}
      {loading ? (
         <div className="flex flex-col items-center justify-center py-20 text-zinc-600 gap-4">
            <Loader2 size={32} className="animate-spin text-[#DFFF00]" />
            <span className="text-[10px] font-mono uppercase tracking-widest">Fetching Archives...</span>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {logs.length === 0 && (
              <div className="col-span-full py-20 text-center rounded-[2.5rem] border border-zinc-800 bg-zinc-900/20">
                  <Terminal className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <span className="text-zinc-500 font-mono text-sm uppercase tracking-widest">No Logs Found In Archive</span>
              </div>
          )}
          
          {logs.map((log) => (
            <div 
              key={log.id} 
              onClick={() => setViewLog(log)}
              className="group relative bg-zinc-900/40 border border-zinc-800 hover:border-[#DFFF00]/50 rounded-[2rem] p-6 flex flex-col h-80 cursor-pointer hover:bg-zinc-900/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden"
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Header */}
              <div className="relative z-10 flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-mono font-bold uppercase tracking-widest bg-zinc-950/50 px-2 py-1 rounded-lg border border-zinc-800 group-hover:border-[#DFFF00]/30 transition-colors">
                      <Calendar size={10} /> {log.date}
                  </div>
                  <div className="text-zinc-700 group-hover:text-[#DFFF00] transition-colors">
                      {log.status === 'ENCRYPTED' ? <Lock size={16} /> : <Hash size={16} />}
                  </div>
              </div>

              {/* Title */}
              <h3 className="relative z-10 text-2xl font-black text-white uppercase leading-none mb-4 group-hover:text-[#DFFF00] transition-colors line-clamp-2">
                 {log.title}
              </h3>

              {/* Preview */}
              <p className="relative z-10 text-zinc-500 font-mono text-xs leading-relaxed line-clamp-4 group-hover:text-zinc-400 transition-colors flex-1">
                 {log.status === 'ENCRYPTED' ? '/// ENCRYPTED CONTENT ///' : log.content}
              </p>

              {/* Footer */}
              <div className="relative z-10 pt-4 mt-4 border-t border-zinc-800/50 flex items-center justify-between">
                  <div className="flex gap-2">
                      {log.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] font-bold text-zinc-400 bg-zinc-950 px-2 py-1 rounded-md uppercase">
                          {tag}
                        </span>
                      ))}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-zinc-950 flex items-center justify-center text-zinc-600 group-hover:bg-[#DFFF00] group-hover:text-black transition-all">
                      <ChevronRight size={14} />
                  </div>
              </div>

              {/* Auth Actions */}
              {isAuthenticated && (
                  <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                          onClick={(e) => { e.stopPropagation(); handleEdit(log); }}
                          className="p-2 bg-zinc-800 text-white rounded-full hover:bg-[#DFFF00] hover:text-black"
                      >
                          <Edit size={12} />
                      </button>
                      <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(log.id); }}
                          className="p-2 bg-zinc-800 text-red-500 rounded-full hover:bg-red-500 hover:text-white"
                      >
                          <Trash2 size={12} />
                      </button>
                  </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}