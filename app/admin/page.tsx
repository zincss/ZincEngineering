'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, Shield, Coins, Search, Edit2, Check, X, 
  Activity, Database, Terminal, AlertTriangle, Zap, RefreshCw, Trash2, Mail
} from 'lucide-react';
import { 
  getAdminData, updateUserCredits, updateUserRole, distributeStimulus, 
  resetEconomy, clearSystemCache, sendTestDigest, getSystemMessage, updateSystemMessage 
} from './actions';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: string, action: () => Promise<any> } | null>(null);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [testMailHtml, setTestMailHtml] = useState<string | null>(null);
  
  // System Message State
  const [sysMsg, setSysMsg] = useState({ message: '', link: '' });
  const [msgSaving, setMsgSaving] = useState(false);

  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [res, msgRes] = await Promise.all([getAdminData(), getSystemMessage()]);
    
    if (res.error) {
        setError(res.error);
        if (res.error === 'Unauthorized' || res.error === 'Forbidden') {
            router.push('/');
        }
    } else {
        setData(res);
    }

    if (msgRes && msgRes.data) {
        setSysMsg({ message: msgRes.data.message, link: msgRes.data.link });
    } else {
        // Defaults
        setSysMsg({ message: 'INITIALIZE ASTRO EXPANSION', link: '/collections/astro' });
    }

    setLoading(false);
  };

  const handleSaveUser = async () => {
      if (!editingUser) return;
      await updateUserCredits(editingUser.id, editingUser.credits);
      await updateUserRole(editingUser.id, editingUser.role);
      setEditingUser(null);
      loadData();
  };

  const handleUpdateMessage = async () => {
      setMsgSaving(true);
      await updateSystemMessage(sysMsg.message, sysMsg.link);
      setMsgSaving(false);
      alert('Broadcast Updated');
  };

  const executeAction = async () => {
      if (!confirmAction) return;
      setProcessing(true);
      const res = await confirmAction.action();
      setProcessing(false);
      setConfirmAction(null);
      
      if (res.success) {
          if (res.html) {
              setTestMailHtml(res.html);
          } else {
              loadData();
              alert('Operation Successful');
          }
      } else {
          alert('Operation Failed: ' + res.error);
      }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-[#DFFF00] font-mono animate-pulse">INITIALIZING_ADMIN_UPLINK...</div>;
  if (error) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-500 font-mono">ACCESS_DENIED: {error}</div>;

  const filteredUsers = data?.profiles.filter((p: any) => 
    p.username?.toLowerCase().includes(search.toLowerCase()) || 
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-[#DFFF00] selection:text-black">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800 z-50 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20">
                  <Shield size={20} />
              </div>
              <div>
                  <h1 className="text-xl font-black uppercase tracking-tighter text-white">Zinc<span className="text-red-500">Admin</span></h1>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">System_Root_Access</p>
              </div>
          </div>
          <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  SYSTEM_ONLINE
              </div>
          </div>
      </header>

      <main className="pt-32 pb-20 px-6 max-w-[1600px] mx-auto space-y-12">
          
          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 text-zinc-800 group-hover:text-zinc-700 transition-colors"><Users size={64} /></div>
                  <div className="relative z-10">
                      <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Total Operators</div>
                      <div className="text-5xl font-black text-white">{data.stats.totalUsers}</div>
                  </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 text-zinc-800 group-hover:text-zinc-700 transition-colors"><Coins size={64} /></div>
                  <div className="relative z-10">
                      <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Global Economy</div>
                      <div className="text-5xl font-black text-[#DFFF00]">{data.stats.totalEconomy.toLocaleString()} <span className="text-lg text-zinc-500">CR</span></div>
                  </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 text-zinc-800 group-hover:text-zinc-700 transition-colors"><Activity size={64} /></div>
                  <div className="relative z-10">
                      <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Avg. Net Worth</div>
                      <div className="text-5xl font-black text-white">{data.stats.averageWealth.toLocaleString()} <span className="text-lg text-zinc-500">CR</span></div>
                  </div>
              </div>
          </div>

          {/* SYSTEM OPERATIONS TOOLKIT */}
          <div>
              <div className="flex items-center gap-3 mb-6">
                  <Terminal size={20} className="text-[#DFFF00]" />
                  <h2 className="text-lg font-black uppercase tracking-tight text-white">System Operations</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Stimulus Tool */}
                  <button 
                    onClick={() => setConfirmAction({ type: 'STIMULUS', action: () => distributeStimulus(5000) })}
                    className="group bg-zinc-900 border border-zinc-800 hover:border-[#DFFF00] p-6 rounded-2xl text-left transition-all"
                  >
                      <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:bg-emerald-500 group-hover:text-black transition-colors"><Coins size={24} /></div>
                          <Zap size={16} className="text-zinc-600 group-hover:text-[#DFFF00]" />
                      </div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">Global Stimulus</h3>
                      <p className="text-xs text-zinc-500">Airdrop 5,000 CR to all registered operators.</p>
                  </button>

                  {/* Cache Purge */}
                  <button 
                    onClick={() => setConfirmAction({ type: 'PURGE', action: () => clearSystemCache() })}
                    className="group bg-zinc-900 border border-zinc-800 hover:border-blue-500 p-6 rounded-2xl text-left transition-all"
                  >
                      <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors"><RefreshCw size={24} /></div>
                          <Activity size={16} className="text-zinc-600 group-hover:text-blue-500" />
                      </div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">System Purge</h3>
                      <p className="text-xs text-zinc-500">Force revalidate global cache and update stats.</p>
                  </button>

                  {/* Test Digest */}
                  <button 
                    onClick={() => setConfirmAction({ type: 'TEST_DIGEST', action: () => sendTestDigest() })}
                    className="group bg-zinc-900 border border-zinc-800 hover:border-[#DFFF00] p-6 rounded-2xl text-left transition-all"
                  >
                      <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-[#DFFF00]/10 text-[#DFFF00] rounded-xl group-hover:bg-[#DFFF00] group-hover:text-black transition-colors"><Mail size={24} /></div>
                          <Edit2 size={16} className="text-zinc-600 group-hover:text-[#DFFF00]" />
                      </div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">Test Digest</h3>
                      <p className="text-xs text-zinc-500">Generate and preview a test weekly digest email.</p>
                  </button>

                  {/* Economy Reset */}
                  <button 
                    onClick={() => setConfirmAction({ type: 'RESET', action: () => resetEconomy(1000) })}
                    className="group bg-zinc-900 border border-zinc-800 hover:border-red-500 p-6 rounded-2xl text-left transition-all"
                  >
                      <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-colors"><Trash2 size={24} /></div>
                          <AlertTriangle size={16} className="text-zinc-600 group-hover:text-red-500" />
                      </div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">Economy Reset</h3>
                      <p className="text-xs text-zinc-500">Wipe all balances to default (1,000 CR). Danger!</p>
                  </button>
              </div>
          </div>

          {/* BROADCAST CONFIGURATION */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                  <Activity size={20} className="text-[#DFFF00]" />
                  <h2 className="text-lg font-black uppercase tracking-tight text-white">Broadcast Configuration</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Display Message</label>
                      <input 
                        type="text" 
                        value={sysMsg.message}
                        onChange={(e) => setSysMsg({ ...sysMsg, message: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white font-mono outline-none focus:border-[#DFFF00] transition-colors"
                        placeholder="INITIALIZE ASTRO EXPANSION"
                      />
                  </div>
                  <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Target Link</label>
                      <div className="flex gap-4">
                          <input 
                            type="text" 
                            value={sysMsg.link}
                            onChange={(e) => setSysMsg({ ...sysMsg, link: e.target.value })}
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white font-mono outline-none focus:border-[#DFFF00] transition-colors"
                            placeholder="/collections/astro"
                          />
                          <button 
                            onClick={handleUpdateMessage}
                            disabled={msgSaving}
                            className="px-8 bg-[#DFFF00] text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-colors disabled:opacity-50"
                          >
                              {msgSaving ? <RefreshCw className="animate-spin" size={16} /> : 'Update'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>

          {/* PREVIEW MODAL */}
          {testMailHtml && (
              <div className="fixed inset-0 z-[250] flex flex-col bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
                  <div className="h-20 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-8 shrink-0">
                      <div className="flex items-center gap-3 uppercase font-black text-white tracking-widest italic">
                          <Mail className="text-[#DFFF00]" /> Digest Preview
                      </div>
                      <button onClick={() => setTestMailHtml(null)} className="p-2 bg-zinc-900 hover:bg-white hover:text-black rounded-full transition-all border border-zinc-800"><X size={20}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 flex justify-center">
                      <div className="w-full max-w-[600px] bg-white rounded-3xl overflow-hidden shadow-2xl">
                          <iframe 
                            srcDoc={testMailHtml} 
                            className="w-full h-full min-h-[800px]" 
                            title="Digest Preview"
                          />
                      </div>
                  </div>
              </div>
          )}

          {/* USER MANAGEMENT */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-3">
                      <Database size={20} className="text-zinc-500" />
                      <h2 className="text-lg font-black uppercase tracking-tight text-white">User Database</h2>
                  </div>
                  <div className="relative w-full md:w-96">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <input 
                        type="text" 
                        placeholder="SEARCH_OPERATOR_ID..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-xs font-mono text-white focus:border-[#DFFF00] outline-none transition-colors"
                      />
                  </div>
              </div>

              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead>
                          <tr className="bg-zinc-950 text-zinc-500 text-[10px] uppercase font-bold tracking-widest border-b border-zinc-800">
                              <th className="p-6">Operator</th>
                              <th className="p-6">Role</th>
                              <th className="p-6">Credits</th>
                              <th className="p-6 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800 text-sm">
                          {filteredUsers.map((user: any) => (
                              <tr key={user.id} className="hover:bg-zinc-800/50 transition-colors group">
                                  <td className="p-6">
                                      <div className="font-bold text-white">{user.username || 'Unknown'}</div>
                                      <div className="text-[10px] font-mono text-zinc-600">{user.id}</div>
                                  </td>
                                  <td className="p-6">
                                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${user.role === 'admin' || user.role === 'owner' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                                          {user.role || 'user'}
                                      </span>
                                  </td>
                                  <td className="p-6 font-mono text-[#DFFF00] font-bold">
                                      {user.credits.toLocaleString()} CR
                                  </td>
                                  <td className="p-6 text-right">
                                      <button 
                                        onClick={() => setEditingUser(user)}
                                        className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
                                      >
                                          <Edit2 size={14} />
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>

      </main>

      {/* CONFIRMATION MODAL */}
      {confirmAction && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl relative text-center">
                  <div className="w-16 h-16 bg-zinc-900 rounded-2xl mx-auto mb-6 flex items-center justify-center border border-zinc-800">
                      <AlertTriangle size={32} className="text-red-500" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-2">Confirm Protocol</h3>
                  <p className="text-xs text-zinc-500 mb-8 px-4">
                      Are you sure you want to execute <span className="text-white font-bold">{confirmAction.type}</span>? This action affects the global system.
                  </p>
                  
                  <div className="flex gap-4">
                      <button onClick={() => setConfirmAction(null)} className="flex-1 py-4 bg-zinc-900 text-zinc-400 font-bold uppercase tracking-widest rounded-xl hover:text-white transition-colors">Abort</button>
                      <button 
                        onClick={executeAction} 
                        disabled={processing}
                        className="flex-1 py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-red-500 transition-colors flex items-center justify-center gap-2"
                      >
                          {processing ? <RefreshCw className="animate-spin" size={16} /> : 'Execute'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* EDIT MODAL */}
      {editingUser && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                  <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-6 flex items-center gap-3">
                      <Terminal size={24} className="text-[#DFFF00]" />
                      Edit Operator
                  </h3>
                  
                  <div className="space-y-6">
                      <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Username</label>
                          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-zinc-400 text-sm font-mono">{editingUser.username}</div>
                      </div>

                      <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Credit Balance</label>
                          <input 
                            type="number" 
                            value={editingUser.credits} 
                            onChange={(e) => setEditingUser({...editingUser, credits: parseInt(e.target.value)})}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white font-mono outline-none focus:border-[#DFFF00]"
                          />
                      </div>

                      <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Security Clearance</label>
                          <select 
                            value={editingUser.role || 'user'}
                            onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white font-mono outline-none focus:border-[#DFFF00]"
                          >
                              <option value="user">USER</option>
                              <option value="admin">ADMIN</option>
                              <option value="owner">OWNER</option>
                          </select>
                      </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                      <button onClick={() => setEditingUser(null)} className="flex-1 py-4 bg-zinc-900 text-zinc-400 font-bold uppercase tracking-widest rounded-xl hover:text-white transition-colors">Cancel</button>
                      <button onClick={handleSaveUser} className="flex-1 py-4 bg-[#DFFF00] text-black font-black uppercase tracking-widest rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2">
                          <Check size={16} /> Save
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}