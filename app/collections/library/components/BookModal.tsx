'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, Edit3, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Book } from '../actions';

interface BookModalProps {
  book: Book;
  isAdmin: boolean;
  isEditing: boolean;
  onClose: () => void;
  onSave: (bookData: Partial<Book>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function BookModal({ book, isAdmin, isEditing: initialIsEditing, onClose, onSave, onDelete }: BookModalProps) {
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [category, setCategory] = useState(book.category || 'Archives');
  const [description, setDescription] = useState(book.description);
  const [content, setContent] = useState(book.content);
  const [coverColor, setCoverColor] = useState(book.cover_color);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  const pages = useMemo(() => {
    if (!content) return ["This volume is currently empty."];
    const parts = content.split('---').map(p => p.trim()).filter(p => p.length > 0);
    if (parts.length > 1) return parts;
    
    const charsPerPage = 550; 
    const result = [];
    for (let i = 0; i < content.length; i += charsPerPage) {
      let chunk = content.substring(i, i + charsPerPage);
      if (i + charsPerPage < content.length) {
        const lastSpace = chunk.lastIndexOf(' ');
        if (lastSpace > charsPerPage * 0.7) {
          chunk = chunk.substring(0, lastSpace);
          i -= (charsPerPage - lastSpace);
        }
      }
      result.push(chunk);
    }
    return result;
  }, [content]);

  const handleSave = async () => {
    await onSave({
      id: book.id,
      title,
      author,
      category,
      description,
      content,
      cover_color: coverColor,
    });
    setIsEditing(false);
  };

  const paginate = (newDirection: number) => {
    const maxPage = pages.length;
    if (currentPage + newDirection >= 0 && currentPage + newDirection <= maxPage) {
      setDirection(newDirection);
      setCurrentPage(prev => prev + newDirection);
    }
  };

  const CATEGORIES = ["Technical", "History", "Fiction", "Philosophy", "Archives"];

  // Restore the 3D Flip Variants
  const pageVariants = {
    enter: (direction: number) => ({
      rotateY: direction > 0 ? 90 : -90,
      opacity: 0,
    }),
    center: {
      rotateY: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      rotateY: direction > 0 ? -90 : 90,
      opacity: 0,
    }),
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-8 bg-black/95 backdrop-blur-md"
    >
      <div className="relative w-full max-w-6xl h-[90vh] md:h-[85vh] bg-zinc-900 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl z-30">
          <div className="flex items-center gap-4">
             <div 
               className="w-10 h-14 rounded-r shadow-lg border border-white/10 relative overflow-hidden"
               style={{ backgroundColor: coverColor }}
             >
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
             </div>
             <div>
                <h2 className="text-xl font-black uppercase tracking-tight italic text-white leading-none mb-1">
                   {isEditing ? 'Archiving Unit' : book.title}
                </h2>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-800 px-2 py-0.5 rounded">
                      {book.author}
                   </span>
                   <span className="text-[9px] font-mono text-[#DFFF00] uppercase tracking-widest border border-[#DFFF00]/20 px-2 py-0.5 rounded">
                      {category}
                   </span>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isAdmin && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="p-3 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-[#DFFF00]"
              >
                <Edit3 size={18} />
              </button>
            )}
            {isAdmin && isEditing && (
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-[#DFFF00] text-black px-5 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(223,255,0,0.2)]"
              >
                <Save size={14} />
                COMMIT ARCHIVE
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-3 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-hidden relative bg-zinc-950">
          {isEditing ? (
            <div className="h-full overflow-y-auto p-8 md:p-12 scrollbar-hide">
               <div className="space-y-8 max-w-3xl mx-auto font-sans">
                  <div className="space-y-6 bg-zinc-900/50 p-8 rounded-3xl border border-white/5">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] mb-3">Volume Identity</label>
                      <input 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/5 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-[#DFFF00] text-lg font-bold italic"
                        placeholder="TITILE_REQUIRED"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] mb-3">Originator</label>
                        <input 
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          className="w-full bg-zinc-950 border border-white/5 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-[#DFFF00] font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] mb-3">Classification</label>
                        <select 
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-zinc-950 border border-white/5 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-[#DFFF00] appearance-none font-mono text-xs"
                        >
                          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] mb-3">Archive Content (Use '---' for manual page breaks)</label>
                      <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-[400px] bg-zinc-950 border border-white/5 rounded-3xl px-8 py-8 text-zinc-300 font-serif text-lg leading-relaxed focus:outline-none focus:border-[#DFFF00] resize-none scrollbar-hide"
                        placeholder="Begin documenting..."
                      />
                    </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-4 md:p-8" style={{ perspective: '3000px' }}>
               
               {/* Aged Paper Container */}
               <div className="relative w-full max-w-5xl aspect-[1.4/1] flex shadow-[0_50px_100px_rgba(0,0,0,0.7)] rounded-sm overflow-hidden bg-[#e8e4d9]">
                  
                  <div className="absolute inset-0 opacity-[0.2] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] z-30" />
                  
                  <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                      key={currentPage}
                      custom={direction}
                      variants={pageVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        rotateY: { type: "spring", stiffness: 50, damping: 20 },
                        opacity: { duration: 0.3 }
                      }}
                      className="absolute inset-0 flex"
                    >
                      {/* Left Page */}
                      <div className="flex-1 h-full border-r border-black/10 relative p-12 md:p-20 flex flex-col justify-between bg-gradient-to-r from-[#dcd8cc] to-[#e8e4d9]">
                        {currentPage === 0 ? (
                          <div className="h-full flex flex-col justify-center items-center text-center space-y-8 border border-black/5 rounded-sm p-8 bg-black/[0.02]">
                             <div className="space-y-2">
                                <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-black/40">Archive_Entry</div>
                                <h3 className="text-4xl font-black uppercase tracking-tighter italic text-zinc-900 leading-none">
                                  {book.title}
                                </h3>
                             </div>
                             <div className="w-12 h-px bg-black/20" />
                             <div className="space-y-1">
                                <div className="text-[9px] font-mono uppercase tracking-widest text-black/40">Originator</div>
                                <div className="text-lg font-serif italic text-zinc-800">{book.author}</div>
                             </div>
                             <div className="pt-12">
                                <BookOpen size={32} className="text-black/10" />
                             </div>
                          </div>
                        ) : (
                          <>
                            <div className="absolute top-8 left-12 text-[8px] font-mono uppercase tracking-[0.3em] text-black/40 font-bold">{book.title}</div>
                            <div className="relative z-10 font-serif text-zinc-900 text-xl leading-[1.8] italic first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:mt-1">
                                {pages[currentPage - 1]}
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-[9px] font-mono text-black/30 font-bold uppercase tracking-widest">{book.author}</span>
                                <span className="text-[10px] font-mono text-black/60 font-black px-2 py-1 border border-black/10 rounded">{currentPage}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Right Page */}
                      <div className="flex-1 h-full relative p-12 md:p-20 flex flex-col justify-between bg-gradient-to-l from-[#dcd8cc] to-[#e8e4d9]">
                        <div className="absolute top-8 right-12 text-[8px] font-mono uppercase tracking-[0.3em] text-black/40 font-bold">ZINC_ARCHIVE // {category}</div>
                        <div className="relative z-10 font-serif text-zinc-900 text-xl leading-[1.8]">
                            {pages[currentPage] ? (
                              <div className={currentPage === 0 ? "first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:mt-1" : ""}>
                                 {pages[currentPage]}
                              </div>
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center opacity-10 py-20 text-center">
                                 <BookOpen size={64} className="mb-6" />
                                 <p className="uppercase tracking-[0.2em] font-mono text-xs">End of Volume</p>
                              </div>
                            )}
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-mono text-black/60 font-black px-2 py-1 border border-black/10 rounded">{currentPage === 0 ? 1 : currentPage + 1}</span>
                            <span className="text-[9px] font-mono text-black/30 font-bold uppercase tracking-widest">SEC_09</span>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Spine Shadow */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-20 -translate-x-1/2 bg-gradient-to-r from-black/5 via-black/25 to-black/5 z-20 pointer-events-none" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/20 z-20 pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.3)]" />

                  {/* Nav Hitboxes */}
                  <button 
                    onClick={() => paginate(-2)}
                    disabled={currentPage === 0}
                    className="absolute left-0 top-0 bottom-0 w-1/4 z-40 group cursor-pointer disabled:cursor-default"
                  >
                    <div className="absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-black/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                       <ChevronLeft className="text-black/60" />
                    </div>
                  </button>
                  <button 
                    onClick={() => paginate(2)}
                    disabled={currentPage >= pages.length}
                    className="absolute right-0 top-0 bottom-0 w-1/4 z-40 group cursor-pointer disabled:cursor-default"
                  >
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-black/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                       <ChevronRight className="text-black/60" />
                    </div>
                  </button>
               </div>

               {/* External Controls */}
               <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 z-50">
                  <div className="flex items-center gap-4 bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                     <button 
                        onClick={() => paginate(-2)}
                        disabled={currentPage === 0}
                        className="p-1 disabled:opacity-20 text-white hover:text-[#DFFF00] transition-colors"
                      >
                        <ChevronLeft size={20} />
                     </button>
                     <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-400">
                        VOL_INDEX <span className="text-white font-bold">{Math.floor(currentPage / 2) + 1}</span> / <span className="text-white/40">{Math.ceil(pages.length / 2) + 1}</span>
                     </div>
                     <button 
                        onClick={() => paginate(2)}
                        disabled={currentPage >= pages.length}
                        className="p-1 disabled:opacity-20 text-white hover:text-[#DFFF00] transition-colors"
                      >
                        <ChevronRight size={20} />
                     </button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
