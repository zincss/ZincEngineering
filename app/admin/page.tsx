'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Shield, Users, Coins, Save, Lock, Search, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  // Dashboard State
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        router.push('/'); // Kick out non-admins
      } else {
        fetchUsers();
      }
    }
  }, [isAdmin, authLoading, router]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    // Fetch all profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false } as any); // Type cast if needed
      
    if (data) setAllUsers(data);
    setLoadingUsers(false);
  };

  const handleUpdateCredits = async (userId: string, currentCredits: number, amountToAdd: number) => {
    const newTotal = currentCredits + amountToAdd;
    
    // Optimistic Update
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, credits: newTotal } : u));

    const { error } = await supabase
      .from('profiles')
      .update({ credits: newTotal })
      .eq('id', userId);

    if (error) {
      alert('Failed to update credits: ' + error.message);
      fetchUsers(); // Revert
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
        setPasswordMsg("Password must be 6+ characters.");
        return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setPasswordMsg("Error: " + error.message);
    else {
        setPasswordMsg("Success! Password updated.");
        setNewPassword('');
    }
  };

  if (authLoading || !isAdmin) return <div className="min-h-screen bg-black flex items-center justify-center text-[#DFFF00] font-mono animate-pulse">VERIFYING CLEARANCE...</div>;

  const filteredUsers = allUsers.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12 pt-32">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-12 border-b border-zinc-800 pb-8">
            <div className="p-4 bg-red-900/20 border border-red-500 rounded-2xl">
                <Shield size={48} className="text-red-500" />
            </div>
            <div>
                <div className="text-red-500 font-mono text-xs font-bold uppercase tracking-widest mb-1">Restricted Area</div>
                <h1 className="text-4xl md:text-5xl font-black uppercase">Command Console</h1>
                <p className="text-zinc-500 font-mono text-sm">Welcome, Admin {profile?.username}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT: USER MANAGEMENT */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase flex items-center gap-2">
                        <Users className="text-[#DFFF00]" /> User Database
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                        <input 
                            type="text" 
                            placeholder="SEARCH USERS..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs font-mono uppercase focus:border-[#DFFF00] outline-none w-[200px]"
                        />
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-900 text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Credits</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-zinc-900/80 transition-colors">
                                    <td className="p-4 font-bold">{u.username || 'Unknown'}</td>
                                    <td className="p-4">
                                        <span className={`text-[10px] px-2 py-1 rounded border ${u.role === 'admin' ? 'border-red-500 text-red-500 bg-red-950/20' : 'border-zinc-700 text-zinc-500'}`}>
                                            {u.role || 'USER'}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-[#DFFF00]">{u.credits}</td>
                                    <td className="p-4 flex justify-end gap-2">
                                        <button 
                                            onClick={() => handleUpdateCredits(u.id, u.credits, 100)}
                                            className="p-2 bg-zinc-800 hover:bg-[#DFFF00] hover:text-black rounded transition-colors"
                                            title="Add 100 Credits"
                                        >
                                            <Coins size={14} /> +100
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateCredits(u.id, u.credits, 1000)}
                                            className="p-2 bg-zinc-800 hover:bg-[#DFFF00] hover:text-black rounded transition-colors"
                                            title="Add 1000 Credits"
                                        >
                                            <Coins size={14} /> +1k
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const amount = prompt("Enter custom amount (negative to remove):");
                                                if (amount) handleUpdateCredits(u.id, u.credits, parseInt(amount));
                                            }}
                                            className="p-2 bg-zinc-800 hover:bg-white hover:text-black rounded transition-colors"
                                            title="Custom Amount"
                                        >
                                            ...
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="p-8 text-center text-zinc-500 font-mono text-sm">NO USERS FOUND</div>
                    )}
                </div>
            </div>

            {/* RIGHT: TOOLS */}
            <div className="space-y-6">
                
                {/* ADMIN PROFILE SECURITY */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h2 className="text-lg font-black uppercase flex items-center gap-2 mb-4">
                        <Lock className="text-red-500" size={18} /> Admin Security
                    </h2>
                    <p className="text-zinc-500 text-xs mb-4">Update your access credentials.</p>
                    
                    <div className="space-y-3">
                        <input 
                            type="password" 
                            placeholder="NEW PASSWORD" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-black border border-zinc-700 p-3 rounded text-sm font-mono focus:border-red-500 outline-none"
                        />
                        <button 
                            onClick={handleChangePassword}
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold uppercase py-3 rounded text-xs tracking-widest transition-colors"
                        >
                            Update Password
                        </button>
                        {passwordMsg && (
                            <div className="text-[10px] font-mono text-[#DFFF00] text-center pt-2">{passwordMsg}</div>
                        )}
                    </div>
                </div>

                {/* SYSTEM STATUS */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h2 className="text-lg font-black uppercase flex items-center gap-2 mb-4">
                        <AlertTriangle className="text-[#DFFF00]" size={18} /> System Status
                    </h2>
                    <div className="space-y-2 font-mono text-xs">
                        <div className="flex justify-between p-2 bg-black rounded border border-zinc-800">
                            <span className="text-zinc-500">USER_COUNT</span>
                            <span className="text-white">{allUsers.length}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-black rounded border border-zinc-800">
                            <span className="text-zinc-500">TOTAL_CREDITS</span>
                            <span className="text-[#DFFF00]">{allUsers.reduce((acc, u) => acc + (u.credits || 0), 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-black rounded border border-zinc-800">
                            <span className="text-zinc-500">DB_STATUS</span>
                            <span className="text-green-500">CONNECTED</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}