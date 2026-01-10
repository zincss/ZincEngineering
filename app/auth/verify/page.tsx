'use client';

import Link from 'next/link';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#DFFF00]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-3xl p-10 text-center relative z-10 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
        
        <div className="w-20 h-20 bg-zinc-950 rounded-full flex items-center justify-center mx-auto mb-8 border border-zinc-800 shadow-xl relative group">
            <Mail size={32} className="text-zinc-400 group-hover:text-[#DFFF00] transition-colors relative z-10" />
            <div className="absolute inset-0 bg-[#DFFF00]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Check Your Inbox</h1>
        
        <p className="text-zinc-400 text-sm leading-relaxed mb-8">
          We've sent a secure verification link to your email address. 
          <br /><br />
          Please confirm your identity to activate your <span className="text-[#DFFF00] font-bold">Zinc Operator</span> status.
        </p>

        <div className="flex flex-col gap-4">
            <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50 flex items-center gap-3 text-left">
                <CheckCircle2 size={18} className="text-[#DFFF00] flex-shrink-0" />
                <span className="text-xs text-zinc-500 font-medium">Link expires in 24 hours.</span>
            </div>
            
            <Link href="/login" className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-[#DFFF00] transition-colors flex items-center justify-center gap-2">
                <ArrowLeft size={16} /> Return to Login
            </Link>
        </div>

      </div>
    </div>
  );
}
