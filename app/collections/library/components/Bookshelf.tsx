'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, saveBook, deleteBook, updateBookOrder } from '../actions';
import BookModal from './BookModal';
import { Plus, Book as BookIcon, Search, Trash2, Edit3, Settings2, ArrowLeft, ArrowRight, ArrowDownAz } from 'lucide-react';

interface BookshelfProps {
  initialBooks: Book[];
  isAdmin: boolean;
}

const CATEGORIES = ["All", "Technical", "History", "Fiction", "Philosophy", "Archives"];
type SortMode = 'manual' | 'title' | 'author' | 'newest';

const DEFAULT_BOOKS: Partial<Book>[] = [
  {
    title: "The Zinc Manifesto",
    author: "System",
    category: "Philosophy",
    description: "The core principles of the Zinc ecosystem.",
    content: "Content is being archived...",
    cover_color: "#DFFF00",
  },
  {
    title: "Digital Horizons",
    author: "Archive",
    category: "Archives",
    description: "Exploring the boundaries of digital collection.",
    content: "Exploring the void...",
    cover_color: "#27272a",
  },
  {
    title: "Neural Networks",
    author: "Intelligence",
    category: "Technical",
    description: "A deep dive into synthetic consciousness.",
    content: "Processing data...",
    cover_color: "#3f3f46",
  }
];

export default function Bookshelf({ initialBooks, isAdmin }: BookshelfProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks.length > 0 ? initialBooks : (DEFAULT_BOOKS as Book[]));
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isManageMode, setIsManageMode] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('manual');

  const filteredBooks = useMemo(() => {
    let result = [...books];
    
    // Filter
    result = result.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort
    result.sort((a, b) => {
      if (sortMode === 'title') return a.title.localeCompare(b.title);
      if (sortMode === 'author') return a.author.localeCompare(b.author);
      if (sortMode === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return (a.order_index || 0) - (b.order_index || 0);
    });

    return result;
  }, [books, searchQuery, selectedCategory, sortMode]);

  const handleOpenBook = (book: Book) => {
    if (isManageMode) return;
    setSelectedBook(book);
    setIsEditing(false);
  };

  const handleMove = async (book: Book, direction: 'left' | 'right') => {
    const currentIndex = books.findIndex(b => b.id === book.id);
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= books.length) return;

    const newBooks = [...books];
    const targetBook = newBooks[targetIndex];
    
    // Swap order indices
    const tempIndex = book.order_index || 0;
    const targetOrderIndex = targetBook.order_index || 0;
    
    const updatedBook = { ...book, order_index: targetOrderIndex };
    const updatedTarget = { ...targetBook, order_index: tempIndex };

    newBooks[currentIndex] = updatedTarget;
    newBooks[targetIndex] = updatedBook;
    
    setBooks(newBooks);

    try {
      await Promise.all([
        updateBookOrder(updatedBook.id, updatedBook.order_index),
        updateBookOrder(updatedTarget.id, updatedTarget.order_index)
      ]);
    } catch (e) {
      console.error("Failed to persist order", e);
    }
  };

  const handleAddBook = () => {
    const newBook: Partial<Book> = {
      title: "New Volume",
      author: "Unknown",
      category: "Archives",
      description: "A blank archive entry.",
      content: "",
      cover_color: "#18181b",
    };
    setSelectedBook(newBook as Book);
    setIsEditing(true);
  };

  const handleSave = async (bookData: Partial<Book>) => {
    try {
      const saved = await saveBook(bookData);
      setBooks(prev => {
        const index = prev.findIndex(b => b.id === saved.id);
        if (index >= 0) {
          const newBooks = [...prev];
          newBooks[index] = saved;
          return newBooks;
        }
        return [saved, ...prev];
      });
      setSelectedBook(null);
    } catch (error) {
      console.error("Failed to save book:", error);
      alert("Error saving book. Make sure you updated your database schema.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm permanent deletion of this volume?")) return;
    try {
      await deleteBook(id);
      setBooks(prev => prev.filter(b => b.id !== id));
      if (selectedBook?.id === id) setSelectedBook(null);
    } catch (error) {
      console.error("Failed to delete book:", error);
    }
  };

  return (
    <div className="relative space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                selectedCategory === cat 
                ? 'bg-[#DFFF00] text-black shadow-[0_0_15px_rgba(223,255,0,0.3)]' 
                : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          {/* Sort Selector */}
          <div className="relative">
            <ArrowDownAz className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={14} />
            <select 
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="bg-zinc-950 border border-zinc-800 rounded-full py-2 pl-9 pr-8 text-[10px] font-mono text-white focus:outline-none focus:border-[#DFFF00] appearance-none cursor-pointer"
            >
              <option value="manual">MANUAL_ORDER</option>
              <option value="title">SORT_TITLE</option>
              <option value="author">SORT_AUTHOR</option>
              <option value="newest">SORT_NEWEST</option>
            </select>
          </div>

          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text"
              placeholder="SEARCH ARCHIVES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-[10px] font-mono text-white focus:outline-none focus:border-[#DFFF00] transition-colors"
            />
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
               <button
                onClick={() => setIsManageMode(!isManageMode)}
                className={`p-2 rounded-lg border transition-all ${
                  isManageMode 
                  ? 'bg-red-500/10 border-red-500/50 text-red-500' 
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                }`}
                title="Toggle Manage Mode"
              >
                <Settings2 size={20} />
              </button>
              <button
                onClick={handleAddBook}
                className="bg-[#DFFF00] text-black p-2 rounded-lg font-bold hover:bg-white transition-colors shadow-lg"
              >
                <Plus size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Library Stats */}
      <div className="flex items-center gap-6 px-4">
          <div className="flex flex-col">
             <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Total Volumes</span>
             <span className="text-2xl font-black italic">{books.length}</span>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div className="flex flex-col">
             <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Category</span>
             <span className="text-2xl font-black italic text-[#DFFF00] uppercase tracking-tighter">{selectedCategory}</span>
          </div>
          {filteredBooks.length !== books.length && (
            <>
              <div className="h-8 w-px bg-zinc-800" />
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Matches</span>
                <span className="text-2xl font-black italic text-white">{filteredBooks.length}</span>
              </div>
            </>
          )}
      </div>

      {/* The Bookshelf */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-y-20 gap-x-10 pb-32">
        {filteredBooks.map((book, idx) => (
          <motion.div
            key={book.id || idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group relative"
          >
            {/* Manage Overlay */}
            <AnimatePresence>
              {isManageMode && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute -top-4 -right-4 z-30 flex flex-col gap-2"
                >
                  {sortMode === 'manual' && (
                    <div className="flex gap-1 mb-1">
                      <button 
                        onClick={() => handleMove(book, 'left')}
                        className="p-2 bg-zinc-800 text-white rounded-full shadow-xl hover:bg-[#DFFF00] hover:text-black transition-colors"
                      >
                        <ArrowLeft size={12} />
                      </button>
                      <button 
                        onClick={() => handleMove(book, 'right')}
                        className="p-2 bg-zinc-800 text-white rounded-full shadow-xl hover:bg-[#DFFF00] hover:text-black transition-colors"
                      >
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  )}
                  <button 
                    onClick={() => handleDelete(book.id)}
                    className="p-2 bg-red-600 text-white rounded-full shadow-xl hover:bg-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedBook(book);
                      setIsEditing(true);
                      setIsManageMode(false);
                    }}
                    className="p-2 bg-zinc-100 text-black rounded-full shadow-xl hover:bg-white transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The Book */}
            <div 
              onClick={() => handleOpenBook(book)}
              className={`relative aspect-[2/3] cursor-pointer transition-all duration-500 preserve-3d
                ${isManageMode ? 'scale-95 opacity-50 grayscale' : 'group-hover:-translate-y-10 group-hover:rotate-3'}
              `}
              style={{ perspective: '1200px' }}
            >
              {/* Cover */}
              <div 
                className="absolute inset-0 rounded-r-lg shadow-[15px_15px_30px_rgba(0,0,0,0.7)] overflow-hidden border border-white/10 flex flex-col justify-between p-6"
                style={{ 
                  backgroundColor: book.cover_color,
                  backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(255,255,255,0.05) 1%, rgba(0,0,0,0.1) 5%, transparent 10%)'
                }}
              >
                <div className="space-y-4">
                  <div className="h-2 w-12 bg-black/20 rounded-full" />
                  <div className="space-y-1">
                    <h3 className={`font-black uppercase tracking-tight leading-tight text-xl ${book.cover_color === '#DFFF00' ? 'text-black' : 'text-white'}`}>
                      {book.title}
                    </h3>
                    <div className={`text-[9px] font-mono uppercase tracking-[0.2em] font-black ${book.cover_color === '#DFFF00' ? 'text-black/40' : 'text-zinc-500'}`}>
                      {book.category}
                    </div>
                  </div>
                  <p className={`text-[10px] font-mono uppercase tracking-widest font-bold ${book.cover_color === '#DFFF00' ? 'text-black/60' : 'text-zinc-400'}`}>
                    {book.author}
                  </p>
                </div>
                
                <div className="flex justify-between items-end">
                   <div className="p-2 bg-black/10 rounded-lg backdrop-blur-sm">
                      <BookIcon size={20} className={book.cover_color === '#DFFF00' ? 'text-black/40' : 'text-white/20'} />
                   </div>
                   <div className={`text-[8px] font-black font-mono tracking-widest ${book.cover_color === '#DFFF00' ? 'text-black/40' : 'text-zinc-500'}`}>
                      ZINC_v3
                   </div>
                </div>

                {/* Spine Highlight */}
                <div className="absolute top-0 left-0 w-4 h-full bg-gradient-to-r from-black/40 via-transparent to-transparent" />
              </div>
              
              {/* Pages */}
              <div className="absolute top-[4px] right-[-6px] bottom-[4px] w-6 bg-zinc-100 rounded-r-sm -z-10 shadow-2xl" />
            </div>

            {/* Shelf */}
            <div className="absolute -bottom-6 left-[-20%] right-[-20%] h-5 bg-gradient-to-b from-zinc-800 to-zinc-950 border-t border-white/5 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
               <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 rounded-t-xl" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBooks.length === 0 && (
        <div className="py-40 flex flex-col items-center justify-center text-zinc-600 space-y-4">
          <BookIcon size={48} className="opacity-20" />
          <p className="font-mono text-xs uppercase tracking-[0.3em]">No volumes found in this sector</p>
        </div>
      )}

      <AnimatePresence>
        {selectedBook && (
          <BookModal 
            book={selectedBook} 
            isAdmin={isAdmin}
            isEditing={isEditing}
            onClose={() => setSelectedBook(null)}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}