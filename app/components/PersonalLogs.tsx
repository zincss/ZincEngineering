'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, PenTool, Save, X, Calendar, Hash, ChevronRight, Lock, Unlock, Key, Edit, Trash2, Loader2, RefreshCw, Maximize2, LogOut } from 'lucide-react';
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
  const [viewLog, setViewLog] = useState<LogEntry | null>(null); // New state for expanding logs
  const [newLog, setNewLog] = useState({ title: '', content: '', tags: '' });

  // --- 1. FETCH LOGS FROM SUPABASE ---
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

    // Real-time subscription to changes
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
    // Close view modal if open
    setViewLog(null);
    
    setNewLog({
        title: log.title,
        content: log.content,
        tags: log.tags.join(', ')
    });
    setEditingId(log.id);
    setIsWriting(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!isAuthenticated) return;
    
    if (confirm('CONFIRM DELETION PROTOCOL? THIS ACTION CANNOT BE UNDONE.')) {
      // Optimistic Update
      setLogs(prev => prev.filter(l => l.id !== id));
      if (viewLog?.id === id) setViewLog(null);
      
      const { error } = await supabase
        .from('personal_logs')
        .delete()
        .eq('id', id);

      if (error) {
        alert('ERROR DELETING ENTRY');
        fetchLogs(); // Revert on error
      } else {
        if (editingId === id) resetForm();
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

    // Optimistic Update
    if (editingId) {
      setLogs(prev => prev.map(l => l.id === editingId ? entry : l));
    } else {
      setLogs(prev => [entry, ...prev]);
    }

    // Database Update
    const { error } = await supabase
      .from('personal_logs')
      .upsert(entry);

    if (error) {
      console.error('Save Error:', error);
      alert('DATABASE WRITE FAILED');
      fetchLogs(); // Revert
    } else {
      resetForm();
    }
  };

  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 md:px-6 py-12 border-t border-zinc-800 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[#DFFF00] font-mono text-sm font-black tracking-widest uppercase mb-1">
            <Terminal size={16} />
            <span>PERSONAL_LOGS // ARCHIVE</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
            Developer Notes
          </h2>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            {/* AUTH INDICATOR */}
            <div className={`flex items-center gap-2 px-3 py-1 border font-mono text-[10px] uppercase tracking-widest ${isAuthenticated ? 'border-[#DFFF00] text-[#DFFF00] bg-[#DFFF00]/10' : 'border-zinc-800 text-zinc-500'}`}>
                {isAuthenticated ? <Unlock size={12} /> : <Lock size={12} />}
                <span className="hidden sm:inline">{isAuthenticated ? 'ADMIN_ACCESS_GRANTED' : 'READ_ONLY_MODE'}</span>
            </div>

            {/* DEV LOGIN / LOGOUT BUTTON */}
            {isAuthenticated ? (
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1 border border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-500 font-mono text-[10px] uppercase tracking-widest transition-all"
                >
                    <LogOut size={12} />
                    <span className="hidden sm:inline">LOGOUT</span>
                </button>
            ) : (
                <button 
                    onClick={() => setShowAuthInput(true)}
                    className="flex items-center gap-2 px-3 py-1 border border-zinc-800 text-zinc-500 hover:text-[#DFFF00] hover:border-[#DFFF00] font-mono text-[10px] uppercase tracking-widest transition-all"
                >
                    <Key size={12} />
                    <span className="hidden sm:inline">DEV_LOGIN</span>
                </button>
            )}

            <button 
            onClick={handleAccessRequest}
            className={`
                flex items-center gap-2 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest transition-all
                ${isWriting 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-zinc-900 text-zinc-400 hover:text-[#DFFF00] border border-zinc-800 hover:border-[#DFFF00]'
                }
            `}
            >
            {isWriting ? <><X size={14} /> CANCEL</> : <><PenTool size={14} /> NEW_ENTRY</>}
            </button>
        </div>
      </div>

      {/* ACCESS CODE INPUT MODAL */}
      {showAuthInput && !isAuthenticated && (
        <div className="mb-12 bg-black border border-red-500/50 p-8 animate-in fade-in slide-in-from-top-4 relative overflow-hidden flex flex-col items-center justify-center text-center">
            <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
            <Lock size={48} className="text-red-500 mb-4" />
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Restricted Access</h3>
            <p className="text-zinc-500 font-mono text-xs mb-6">ENTER SECURITY CLEARANCE CODE TO PROCEED</p>
            
            <div className="flex items-center gap-2 w-full max-w-xs relative">
                <Key size={16} className="absolute left-4 text-zinc-500" />
                <input 
                    type="password" 
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    onKeyDown={handleKeyPress}
                    autoFocus
                    className="w-full bg-zinc-900 border border-zinc-700 p-3 pl-10 text-white font-mono text-center tracking-[0.5em] focus:outline-none focus:border-red-500 transition-colors uppercase placeholder:text-zinc-800"
                    placeholder="••••"
                />
            </div>
            
            <div className="flex gap-4 mt-6">
                 <button onClick={() => setShowAuthInput(false)} className="text-xs font-mono text-zinc-500 hover:text-white uppercase">Cancel</button>
                 <button onClick={verifyCode} className="text-xs font-bold bg-red-500 text-white px-4 py-2 hover:bg-red-600 uppercase tracking-widest">Verify</button>
            </div>
        </div>
      )}

      {/* WRITE / EDIT INTERFACE */}
      {isWriting && isAuthenticated && (
        <div className="mb-12 bg-zinc-900/50 border border-[#DFFF00] p-6 animate-in fade-in slide-in-from-top-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-50">
             <div className="text-[10px] font-mono text-[#DFFF00]">
                {editingId ? 'EDIT_MODE_ACTIVE // MODIFYING_ENTRY' : 'WRITE_MODE_ACTIVE // NEW_ENTRY'}
             </div>
          </div>

          <div className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Subject Line</label>
                <input 
                  type="text" 
                  value={newLog.title}
                  onChange={(e) => setNewLog({...newLog, title: e.target.value})}
                  className="w-full bg-black border border-zinc-700 p-4 text-white font-mono text-sm focus:outline-none focus:border-[#DFFF00] transition-colors uppercase placeholder:text-zinc-800"
                  placeholder="ENTER_SUBJECT..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Tags (Comma Separated)</label>
                <input 
                  type="text" 
                  value={newLog.tags}
                  onChange={(e) => setNewLog({...newLog, tags: e.target.value})}
                  className="w-full bg-black border border-zinc-700 p-4 text-white font-mono text-sm focus:outline-none focus:border-[#DFFF00] transition-colors uppercase placeholder:text-zinc-800"
                  placeholder="SYSTEM, DEV, UPDATE..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Log Content</label>
              <textarea 
                value={newLog.content}
                onChange={(e) => setNewLog({...newLog, content: e.target.value})}
                className="w-full h-80 bg-black border border-zinc-700 p-4 text-zinc-300 font-mono text-sm focus:outline-none focus:border-[#DFFF00] transition-colors resize-none placeholder:text-zinc-800"
                placeholder="INITIALIZING WRITE PROTOCOL..."
              />
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-[#DFFF00] text-black font-black uppercase py-4 hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {editingId ? 'UPDATE_DATABASE_ENTRY' : 'COMMIT_TO_DATABASE'}
            </button>
          </div>
        </div>
      )}

      {/* FULL SCREEN VIEW LOG MODAL */}
      {viewLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setViewLog(null)}>
            <div 
                className="bg-zinc-950 border-2 border-[#DFFF00] w-full max-w-3xl max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(223,255,0,0.15)] animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="p-6 border-b border-zinc-800 flex justify-between items-start bg-zinc-900/50">
                    <div>
                        <div className="text-[#DFFF00] font-mono text-xs mb-3 flex items-center gap-2">
                             <Calendar size={12} /> 
                             {viewLog.date}
                             <span className="text-zinc-600">|</span>
                             <span className="text-zinc-400">LOG_ID: {viewLog.id.slice(0,8)}</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase leading-tight">{viewLog.title}</h2>
                    </div>
                    <button onClick={() => setViewLog(null)} className="text-zinc-500 hover:text-white transition-colors p-2">
                        <X size={24} />
                    </button>
                </div>
                
                {/* Modal Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-black/40">
                    <div className="prose prose-invert prose-sm md:prose-base max-w-none font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        {viewLog.status === 'ENCRYPTED' && !isAuthenticated 
                            ? '/// CONTENT REDACTED /// ENCRYPTION KEY REQUIRED ///' 
                            : viewLog.content}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                    <div className="flex gap-2">
                         {viewLog.tags.map(t => (
                             <span key={t} className="text-[10px] font-bold bg-zinc-800 text-[#DFFF00] px-3 py-1 uppercase tracking-wider">{t}</span>
                         ))}
                    </div>
                    
                    {isAuthenticated && (
                        <button 
                            onClick={() => handleEdit(viewLog)}
                            className="flex items-center gap-2 text-xs font-bold text-black bg-[#DFFF00] px-4 py-2 hover:bg-white transition-colors uppercase tracking-widest"
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
              <div className="col-span-full py-12 text-center text-zinc-600 font-mono text-sm border border-zinc-800 bg-zinc-900/20">
                  NO LOGS FOUND IN ARCHIVE
              </div>
          )}
          
          {logs.map((log) => (
            <div 
              key={log.id} 
              onClick={() => setViewLog(log)}
              className="group relative bg-zinc-900/30 border border-zinc-800 hover:border-[#DFFF00] transition-colors flex flex-col h-full cursor-pointer hover:bg-zinc-900/50"
            >
              {/* Log Header */}
              <div className="p-6 border-b border-zinc-800 flex justify-between items-start">
                <div>
                  <div className="text-[#DFFF00] font-mono text-xs mb-2 flex items-center gap-2">
                    <Calendar size={12} />
                    {log.date}
                  </div>
                  <h3 className="text-xl font-black text-white uppercase leading-tight group-hover:text-[#DFFF00] transition-colors line-clamp-2">
                    {log.title}
                  </h3>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                    <div className="text-zinc-600 group-hover:text-white transition-colors">
                      {log.status === 'ENCRYPTED' ? <Lock size={16} /> : <Hash size={16} />}
                    </div>
                    
                    {/* Action Buttons (Only visible when authenticated) */}
                    {isAuthenticated && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(log.id); }}
                              className="text-zinc-500 hover:text-red-500 transition-colors p-1"
                              title="Delete Entry"
                          >
                              <Trash2 size={14} />
                          </button>
                          <button 
                              onClick={(e) => { e.stopPropagation(); handleEdit(log); }}
                              className="text-zinc-500 hover:text-[#DFFF00] transition-colors p-1"
                              title="Edit Entry"
                          >
                              <Edit size={14} />
                          </button>
                      </div>
                    )}
                </div>
              </div>

              {/* Log Content Preview */}
              <div className="p-6 flex-1">
                <p className="text-zinc-400 font-mono text-sm leading-relaxed line-clamp-4 group-hover:text-zinc-300 transition-colors whitespace-pre-wrap">
                  {log.status === 'ENCRYPTED' ? '/// CONTENT REDACTED /// ENCRYPTION KEY REQUIRED ///' : log.content}
                </p>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[#DFFF00] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                    <Maximize2 size={10} /> READ_FULL_ENTRY
                </div>
              </div>

              {/* Footer / Tags */}
              <div className="p-4 bg-black/20 border-t border-zinc-800 flex items-center justify-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                  {log.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] font-bold text-black bg-zinc-800 px-2 py-0.5 group-hover:bg-[#DFFF00] transition-colors uppercase">
                      {tag}
                    </span>
                  ))}
                  {log.tags.length > 3 && (
                      <span className="text-[10px] font-bold text-zinc-500 px-1 py-0.5">+{log.tags.length - 3}</span>
                  )}
                </div>
                <button className="text-zinc-500 hover:text-white transition-colors hidden md:block">
                  <ChevronRight size={18} className="group-hover:text-[#DFFF00] transition-colors" />
                </button>
              </div>
              
              {/* Hover Effect Line */}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#DFFF00] group-hover:w-full transition-all duration-500" />
            </div>
          ))}

          {/* Placeholder / Empty Slots to fill grid visual */}
          {logs.length > 0 && [1].map((i) => (
            <div key={`empty-${i}`} className="border border-zinc-900 p-6 flex items-center justify-center opacity-30 pointer-events-none hidden lg:flex">
                <div className="text-zinc-800 font-mono text-xs uppercase tracking-widest">SLOT_EMPTY</div>
            </div>
          ))}
        </div>
      )}

    </section>
  );
}