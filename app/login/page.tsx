'use client';

import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';
import { login, signup } from './actions';
import { Loader2, Github, Mail, Key, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const supabase = createClient();

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

    const formData = new FormData(event.currentTarget);
    
    if (isSignUp) {
        const response = await signup(formData);
        if (response?.error) {
            setErrorMsg(response.error);
            setLoadingProvider(null);
        }
    } else {
        const response = await login(formData);
        if (response?.error) {
            setErrorMsg(response.error);
            setLoadingProvider(null);
        }
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-80px)] w-full px-4 overflow-hidden bg-zinc-950">
      
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#DFFF00]/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      <div className="w-full max-w-[420px] relative z-10">
        
        {/* Logo/Branding */}
        <div className="text-center mb-10">
            <div className="w-16 h-16 bg-[#DFFF00] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(223,255,0,0.3)]">
                <span className="font-black text-3xl text-black">Z</span>
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
              Zinc <span className="text-zinc-700">ID</span>
            </h1>
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-[0.2em]">Secure Access Protocol v4.2</p>
        </div>

        {/* Main Card */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#DFFF00]/50 to-transparent opacity-50" />
          
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-zinc-950 rounded-xl mb-8 border border-zinc-800">
              <button 
                onClick={() => { setIsSignUp(false); setErrorMsg(null); }}
                className={`py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${!isSignUp ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                  Sign In
              </button>
              <button 
                onClick={() => { setIsSignUp(true); setErrorMsg(null); }}
                className={`py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${isSignUp ? 'bg-[#DFFF00] text-black shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                  Register
              </button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {errorMsg && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 text-xs font-bold text-red-400 bg-red-950/30 border border-red-500/20 rounded-xl flex items-center gap-3"
                >
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                   {errorMsg}
                </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Username Field (Only for Sign Up) */}
            <AnimatePresence>
                {isSignUp && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-2 mb-5">
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2" htmlFor="username">
                                <User size={12} className="text-[#DFFF00]" /> Operator Handle
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required={isSignUp}
                                disabled={!!loadingProvider}
                                className="w-full px-4 py-3.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-[#DFFF00] text-sm text-white placeholder:text-zinc-700 transition-all font-bold"
                                placeholder="Choose a unique handle"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2" htmlFor="email">
                <Mail size={12} className={isSignUp ? '' : 'text-[#DFFF00]'} /> Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={!!loadingProvider}
                className="w-full px-4 py-3.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-[#DFFF00] text-sm text-white placeholder:text-zinc-700 transition-all font-mono"
                placeholder="operator@zinc.network"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2" htmlFor="password">
                <Key size={12} /> Access Key
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={!!loadingProvider}
                className="w-full px-4 py-3.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-[#DFFF00] text-sm text-white placeholder:text-zinc-700 transition-all font-mono"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={!!loadingProvider}
              className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-[#DFFF00] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl mt-4 flex items-center justify-center gap-3"
            >
              {loadingProvider === 'email' ? (
                 <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                 <>
                    {isSignUp ? 'Initialize' : 'Authenticate'} <ArrowRight size={16} />
                 </>
              )}
            </button>
          </form>

          {/* OAuth Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-widest font-mono">
              <span className="bg-zinc-900 px-3 text-zinc-600 rounded-full border border-zinc-800">Or Connect With</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {['github', 'google', 'discord'].map((provider) => (
               <button 
                key={provider}
                onClick={() => handleOAuthLogin(provider as any)} 
                disabled={!!loadingProvider} 
                className="group flex items-center justify-center p-3.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 rounded-xl transition-all disabled:opacity-50"
               >
                 {provider === 'github' && <Github className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors"/>}
                 {provider === 'google' && (
                    <svg className="w-5 h-5 fill-zinc-400 group-hover:fill-white transition-colors" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.347.533 12S5.867 24 12.48 24c3.44 0 6.1-1.133 8.253-3.293 2.187-2.187 2.867-5.28 2.867-7.707 0-.76-.08-1.36-.173-1.92h-10.947z" /></svg>
                 )}
                 {provider === 'discord' && (
                    <svg className="w-5 h-5 fill-zinc-400 group-hover:fill-white transition-colors" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z"/></svg>
                 )}
               </button>
            ))}
          </div>

        </div>
        
        {/* Footer */}
        <div className="text-center mt-12 text-[10px] text-zinc-600 font-mono flex items-center justify-center gap-2">
            <ShieldCheck size={12} /> SECURE_UPLINK_ESTABLISHED
        </div>
      </div>
    </div>
  );
}
