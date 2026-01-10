import React from 'react';
import { getBooks } from './actions';
import Bookshelf from './components/Bookshelf';
import PageWrapper from '@/app/components/PageWrapper';
import { Book as BookIcon, Plus } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export default async function LibraryPage() {
  const books = await getBooks();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdmin = profile?.role === 'admin';
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-3 text-[#DFFF00] font-mono text-[10px] font-bold tracking-[0.3em] uppercase mb-2">
                <BookIcon size={14} />
                <span>ARCHIVE_SECTOR // 09</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none">
                The <span className="text-zinc-800">Library</span>
              </h1>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mb-2">
                Dynamic Archive System v1.0
              </div>
              <div className="h-px w-32 bg-zinc-800" />
            </div>
          </div>

          <Bookshelf initialBooks={books} isAdmin={isAdmin} />
        </div>
      </div>
    </PageWrapper>
  );
}
