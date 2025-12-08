'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User } from 'lucide-react';
import BackButton from '@/app/components/BackButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Only for signup
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }, // Pass username to trigger
      });
      if (error) alert(error.message);
      else alert('Check your email for the confirmation link!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else router.push('/'); // Redirect to home
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <h1 className="text-3xl font-black text-white uppercase mb-6 text-center">
          {isSignUp ? 'Initialize ID' : 'System Access'}
        </h1>
        
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {isSignUp && (
            <div className="bg-black border border-zinc-800 p-3 flex items-center gap-3 rounded-lg">
              <User size={16} className="text-zinc-500"/>
              <input 
                className="bg-transparent outline-none text-white w-full uppercase font-mono text-sm"
                placeholder="OPERATOR NAME"
                value={username} onChange={e => setUsername(e.target.value)}
              />
            </div>
          )}
          
          <div className="bg-black border border-zinc-800 p-3 flex items-center gap-3 rounded-lg">
            <Mail size={16} className="text-zinc-500"/>
            <input 
              type="email" 
              className="bg-transparent outline-none text-white w-full font-mono text-sm"
              placeholder="EMAIL ADDR"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="bg-black border border-zinc-800 p-3 flex items-center gap-3 rounded-lg">
            <Lock size={16} className="text-zinc-500"/>
            <input 
              type="password" 
              className="bg-transparent outline-none text-white w-full font-mono text-sm"
              placeholder="PASSWORD"
              value={password} onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button className="bg-[#DFFF00] text-black font-black uppercase py-4 rounded-lg hover:bg-white transition-colors mt-2">
            {isSignUp ? 'Create Identity' : 'Authenticate'}
          </button>
        </form>

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-center mt-6 text-xs font-mono text-zinc-500 hover:text-white uppercase tracking-widest"
        >
          {isSignUp ? 'Already have access? Login' : 'Need new credentials? Sign Up'}
        </button>
      </div>
      <BackButton href="/" label="Cancel" />
    </div>
  );
}