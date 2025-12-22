'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleOAuthLogin = async (provider: 'github' | 'google' | 'discord') => {
    setIsLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(null);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading('email');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert("Login failed: " + error.message);
        throw error;
      }

      // Force a hard refresh to update AuthContext state
      window.location.href = '/'; 
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold">Zinc Engineering</h2>
          <p className="mt-2 text-gray-400">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
          
          {/* OAuth Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => handleOAuthLogin('github')}
              disabled={isLoading !== null}
              className="flex items-center justify-center p-2 border border-gray-600 rounded hover:bg-gray-700 transition"
            >
              Github
            </button>
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading !== null}
              className="flex items-center justify-center p-2 border border-gray-600 rounded hover:bg-gray-700 transition"
            >
              Google
            </button>
            <button
              onClick={() => handleOAuthLogin('discord')}
              disabled={isLoading !== null}
              className="flex items-center justify-center p-2 border border-gray-600 rounded hover:bg-gray-700 transition"
            >
              Discord
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full p-2 rounded bg-gray-900 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full p-2 rounded bg-gray-900 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading !== null}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded font-medium transition disabled:opacity-50"
            >
              {isLoading === 'email' ? 'Signing in...' : 'Sign In with Email'}
            </button>
          </form>
        </div>

        {/* --- DEBUGGER SECTION (Use this to find the Ghost) --- */}
        <div className="p-4 border-2 border-red-500 rounded bg-red-900/20 text-center">
            <h3 className="font-bold text-red-500 mb-2">Auth Debugger</h3>
            <button 
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded font-bold"
                onClick={async () => {
                    console.log("Starting Debug Check...");
                    const { data, error } = await supabase.auth.getUser();
                    
                    if (error) {
                        alert(`CRITICAL ERROR: ${error.message}\n(This means your token is invalid on the server)`);
                    } else if (!data.user) {
                        alert("No User Found (But no error? This is rare)");
                    } else {
                        alert(`SUCCESS: Logged in as ${data.user.email}\nID: ${data.user.id}`);
                    }
                }}
            >
                Test Auth Validity
            </button>
        </div>
        
      </div>
    </div>
  );
}