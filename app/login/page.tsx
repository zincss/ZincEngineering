'use client';

import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';
import { login, signup } from './actions';
import { useRouter } from 'next/navigation';
import { Loader2, Github, Mail, Key } from 'lucide-react'; // Assuming you have lucide-react, otherwise use SVGs

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleOAuthLogin = async (provider: 'github' | 'google' | 'discord') => {
    setLoadingProvider(provider);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMsg(error.message);
      setLoadingProvider(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadingProvider('email');
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData(event.currentTarget);
    
    if (isSignUp) {
        const response = await signup(formData);
        if (response?.error) {
            setErrorMsg(response.error);
            setLoadingProvider(null);
        } else {
            // Supabase might require email confirmation
            setSuccessMsg("Account created! Please check your email to confirm.");
            setLoadingProvider(null);
        }
    } else {
        const response = await login(formData);
        if (response?.error) {
            setErrorMsg(response.error);
            setLoadingProvider(null);
        }
        // If successful, the server action redirects.
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-140px)] w-full px-4">
      {/* Dynamic Background Effects (Matches Global Theme) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#DFFF00]/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          
          {/* Top Highlight Line */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#DFFF00]/50 to-transparent" />

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
              {isSignUp ? 'Initialize Access' : 'System Access'}
            </h1>
            <p className="text-zinc-400 text-xs font-mono uppercase tracking-widest">
              {isSignUp ? 'Create new operator identity' : 'Authenticate credentials'}
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-6 p-3 text-xs font-bold text-red-300 bg-red-950/30 border border-red-500/20 rounded-lg flex items-center gap-2">
               <span className="block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
               {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-3 text-xs font-bold text-emerald-300 bg-emerald-950/30 border border-emerald-500/20 rounded-lg flex items-center gap-2">
               <span className="block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               {successMsg}
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {['github', 'google', 'discord'].map((provider) => (
               <button 
                key={provider}
                onClick={() => handleOAuthLogin(provider as any)} 
                disabled={!!loadingProvider} 
                className="group flex items-center justify-center p-3 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 rounded-xl transition-all disabled:opacity-50"
               >
                 {provider === 'github' && <Github className="w-5 h-5 text-white group-hover:scale-110 transition-transform"/>}
                 {provider === 'google' && (
                    <svg className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.347.533 12S5.867 24 12.48 24c3.44 0 6.1-1.133 8.253-3.293 2.187-2.187 2.867-5.28 2.867-7.707 0-.76-.08-1.36-.173-1.92h-10.947z" /></svg>
                 )}
                 {provider === 'discord' && (
                    <svg className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z"/></svg>
                 )}
               </button>
            ))}
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-mono">
              <span className="bg-zinc-950/80 backdrop-blur px-2 text-zinc-500">Or continue with email</span>
            </div>
          </div>

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2" htmlFor="email">
                <Mail size={12} /> Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={!!loadingProvider}
                className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFFF00]/50 focus:border-[#DFFF00] text-sm text-white placeholder:text-zinc-600 transition-all"
                placeholder="operator@zinc.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2" htmlFor="password">
                <Key size={12} /> Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={!!loadingProvider}
                className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DFFF00]/50 focus:border-[#DFFF00] text-sm text-white placeholder:text-zinc-600 transition-all"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={!!loadingProvider}
              className="w-full py-3 bg-[#DFFF00] text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(223,255,0,0.15)] hover:shadow-[0_0_30px_rgba(223,255,0,0.3)] mt-2"
            >
              {loadingProvider === 'email' ? (
                 <span className="flex items-center justify-center gap-2">
                   <Loader2 className="animate-spin h-4 w-4" />
                   Processing...
                 </span>
              ) : (isSignUp ? 'Establish Identity' : 'Authenticate')}
            </button>
          </form>

          {/* Toggle Sign Up / Login */}
          <div className="mt-6 text-center">
            <button 
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); }}
                className="text-xs text-zinc-500 hover:text-[#DFFF00] transition-colors"
            >
                {isSignUp ? "Already have credentials? Sign In" : "Need access? Create Identity"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}