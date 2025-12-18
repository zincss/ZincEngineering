'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { X, FileText, Globe, Clock, ExternalLink } from 'lucide-react';
import { parseWikiContent } from './utils/ZincContentParser';

// Scroll Progress Bar
const ScrollProgress = ({ targetRef }: { targetRef: React.RefObject<HTMLElement> }) => {
  const { scrollYProgress } = useScroll({ container: targetRef });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#DFFF00] origin-left z-50 shadow-[0_0_10px_#DFFF00]"
      style={{ scaleX }}
    />
  );
};

interface ZincReaderOverlayProps {
  article: any;
  onClose: () => void;
}

export default function ZincReaderOverlay({ article, onClose }: ZincReaderOverlayProps) {
  const [cleanedContent, setCleanedContent] = useState('');
  const articleScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (article?.content) {
      setCleanedContent(parseWikiContent(article.content));
    }
  }, [article]);

  if (!article) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: '20%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] flex justify-center items-end md:items-center p-0 md:p-6 bg-black/80 backdrop-blur-md"
    >
      <div className="w-full h-full mt-24 md:h-[85vh] md:max-w-5xl bg-zinc-950 md:rounded-[2rem] shadow-2xl border border-zinc-800 overflow-hidden relative flex flex-col ring-1 ring-white/5">
          
          {/* BG TEXTURE */}
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%]" />

          {/* READER HEADER */}
          <div className="relative z-20 flex items-center justify-between px-6 py-5 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800">
              <div className="flex items-center gap-5 flex-1 min-w-0">
                <div className="hidden md:flex w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 items-center justify-center text-[#DFFF00] shadow-inner">
                    <FileText size={24} />
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight truncate leading-none mb-1">{article.title}</h2>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1 text-[#DFFF00]"><Globe size={10} /> Global Web</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-800" />
                      <span className="flex items-center gap-1"><Clock size={10} /> {article.readTime || 5} Min Read</span>
                    </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                  <button 
                      onClick={onClose}
                      className="group flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-[#DFFF00] hover:border-[#DFFF00] transition-all"
                  >
                      <span className="text-xs font-bold text-zinc-400 group-hover:text-black uppercase hidden md:block">Close File</span>
                      <X size={18} className="text-zinc-400 group-hover:text-black transition-colors" />
                  </button>
              </div>
              <ScrollProgress targetRef={articleScrollRef} />
          </div>

          {/* CONTENT ENGINE */}
          <div 
            ref={articleScrollRef}
            className="relative z-10 flex-1 overflow-y-auto scroll-smooth custom-scrollbar bg-zinc-950/50"
          >
            <div className="max-w-4xl mx-auto px-4 py-8 md:px-12 md:py-16">
                
                {/* HERO TITLE */}
                <div className="mb-12 border-b border-zinc-800/50 pb-12">
                  <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase leading-[0.9]">
                      {article.title}
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="h-1 w-24 bg-[#DFFF00]" />
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                        Subject Intelligence /// Verified
                    </p>
                  </div>
                </div>

                {/* DYNAMIC CONTENT STYLING */}
                <div className="zinc-reader-engine">
                  <style jsx global>{`
                      /* --- BASE TYPOGRAPHY --- */
                      .zinc-reader-engine {
                        font-family: var(--font-geist-sans, sans-serif);
                        color: #a1a1aa; /* Zinc-400 */
                      }

                      /* --- LABELS --- */
                      .zinc-label {
                          font-family: monospace;
                          font-size: 0.7rem;
                          color: #DFFF00;
                          text-transform: uppercase;
                          letter-spacing: 0.2em;
                          margin-bottom: 2rem;
                          opacity: 0.9;
                          display: flex;
                          align-items: center;
                          gap: 1rem;
                      }
                      .zinc-label::after {
                          content: '';
                          flex: 1;
                          height: 1px;
                          background: linear-gradient(90deg, #27272a, transparent);
                      }
                      .zinc-hash {
                        color: #52525b;
                      }

                      /* --- LINK STYLING --- */
                      .zinc-ref-link {
                          color: #e4e4e7;
                          border-bottom: 1px dotted #52525b;
                          cursor: default;
                          transition: color 0.2s;
                      }
                      .zinc-ref-link:hover {
                          color: #DFFF00;
                          border-color: #DFFF00;
                      }

                      /* --- MODULE 1: THE BRIEFING (INTRO) --- */
                      .zinc-briefing-module {
                          font-size: 1.15rem;
                          line-height: 1.8;
                          color: #d4d4d8; /* Zinc-300 */
                          margin-bottom: 4rem;
                      }
                      .zinc-briefing-module p {
                          margin-bottom: 1.5rem;
                          max-width: 70ch;
                      }
                      /* Make first paragraph stand out */
                      .zinc-briefing-module > p:first-of-type {
                          font-size: 1.35rem;
                          font-weight: 300;
                          color: white;
                          line-height: 1.6;
                          margin-bottom: 2rem;
                      }

                      /* --- MODULE 2: DATA FILES (ACCORDIONS) --- */
                      .zinc-file-module {
                          border: 1px solid #18181b;
                          background: #09090b;
                          border-radius: 0.5rem;
                          overflow: hidden;
                          transition: all 0.3s ease;
                      }
                      
                      .zinc-file-module:hover {
                          border-color: #3f3f46;
                      }
                      
                      .zinc-file-module[open] {
                          border-color: #DFFF00;
                          background: #000;
                          box-shadow: 0 0 0 1px #DFFF00, 0 10px 30px -10px rgba(0,0,0,0.5);
                          margin: 1.5rem 0;
                      }

                      /* HEADER (SUMMARY) */
                      .zinc-file-header {
                          list-style: none;
                          padding: 1.25rem 1.5rem;
                          cursor: pointer;
                          display: flex;
                          align-items: center;
                          justify-content: space-between;
                          background: #09090b;
                          transition: background 0.2s;
                          user-select: none;
                      }
                      .zinc-file-header::-webkit-details-marker { display: none; }
                      
                      .zinc-file-module[open] .zinc-file-header {
                          border-bottom: 1px solid #27272a;
                          background: #101012;
                      }

                      .zinc-file-title {
                          font-weight: 700;
                          text-transform: uppercase;
                          letter-spacing: 0.05em;
                          color: #e4e4e7;
                          font-size: 0.95rem;
                      }
                      
                      .zinc-file-icon-wrapper {
                          width: 20px;
                          display: flex;
                          justify-content: center;
                      }
                      
                      .zinc-file-icon {
                          width: 6px; height: 6px;
                          background: #3f3f46;
                          border-radius: 50%;
                          transition: all 0.3s;
                      }
                      
                      .zinc-file-module[open] .zinc-file-icon {
                          background: #DFFF00;
                          box-shadow: 0 0 10px #DFFF00;
                          transform: scale(1.5);
                      }
                      
                      .zinc-file-indicator {
                          color: #52525b;
                          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                      }
                      
                      .zinc-file-module[open] .zinc-file-indicator {
                          transform: rotate(180deg);
                          color: #DFFF00;
                      }

                      /* BODY CONTENT */
                      .zinc-file-body {
                          padding: 2rem;
                          font-size: 1rem;
                          line-height: 1.7;
                          color: #a1a1aa;
                          animation: slideDown 0.3s ease-out;
                      }
                      
                      @keyframes slideDown {
                          from { opacity: 0; transform: translateY(-5px); }
                          to { opacity: 1; transform: translateY(0); }
                      }

                      .zinc-file-body p { margin-bottom: 1.25rem; max-width: 65ch; }
                      .zinc-file-body ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; }
                      .zinc-file-body li { margin-bottom: 0.5rem; }

                      /* SUB-HEADERS (H3) */
                      .zinc-sub-header {
                          color: #fff;
                          font-weight: 700;
                          margin-top: 2.5rem;
                          margin-bottom: 1rem;
                          font-size: 1.1rem;
                          display: flex;
                          align-items: center;
                          gap: 0.75rem;
                      }
                      .zinc-sub-header::before {
                          content: '';
                          width: 4px; height: 4px;
                          background: #DFFF00;
                      }

                      /* --- IMAGES --- */
                      .zinc-figure {
                          margin: 2rem 0;
                          background: #121214;
                          border: 1px solid #27272a;
                          border-radius: 0.75rem;
                          padding: 0.75rem;
                          display: table; 
                          max-width: 100%;
                      }
                      .zinc-figure img {
                          border-radius: 0.25rem;
                          max-width: 100%;
                          height: auto;
                          display: block;
                      }
                      
                      .zinc-figcaption {
                          display: table-caption;
                          caption-side: bottom;
                          margin-top: 0.75rem;
                          font-family: monospace;
                          font-size: 0.75rem;
                          color: #71717a;
                          text-align: center;
                          line-height: 1.4;
                      }

                      /* --- INFOBOXES (Wiki Sidebars) --- */
                      .zinc-infobox {
                          float: right;
                          width: 300px;
                          background: #0f0f11;
                          border: 1px solid #27272a;
                          border-radius: 0.5rem;
                          padding: 1rem;
                          margin: 0 0 1.5rem 1.5rem;
                          font-family: monospace;
                          font-size: 0.8rem;
                          clear: right;
                          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                      }
                      
                      @media (max-width: 800px) {
                         .zinc-infobox { float: none; margin: 2rem auto; width: 100%; max-width: 400px; }
                      }
                      
                      .zinc-infobox th { text-align: left; color: #d4d4d8; padding: 0.5rem 0; border-bottom: 1px solid #27272a; }
                      .zinc-infobox td { padding: 0.5rem 0 0.5rem 1rem; color: #a1a1aa; vertical-align: top; text-align: right; }
                      .zinc-infobox img { max-width: 100%; height: auto; border-radius: 4px; margin-bottom: 0.5rem; }

                      /* --- DATA TABLES --- */
                      .zinc-table-wrapper {
                          overflow-x: auto;
                          margin: 2rem 0;
                          border: 1px solid #27272a;
                          background: #0f0f11;
                          border-radius: 0.5rem;
                      }
                      .zinc-table {
                          width: 100% !important;
                          border-collapse: collapse;
                          font-size: 0.85rem;
                          white-space: nowrap;
                      }
                      .zinc-table th {
                          background: #18181b; color: #fff;
                          text-align: left; padding: 0.75rem 1rem;
                          font-weight: 700;
                          border-bottom: 1px solid #27272a;
                      }
                      .zinc-table td {
                          padding: 0.75rem 1rem;
                          border-bottom: 1px solid #27272a;
                          color: #d4d4d8;
                      }
                      .zinc-table tr:last-child td { border-bottom: none; }
                  `}</style>
                  
                  <div dangerouslySetInnerHTML={{ __html: cleanedContent }} />
                </div>

                {/* FOOTER */}
                <div className="mt-24 pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono text-zinc-600 uppercase">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#DFFF00] animate-pulse rounded-full" />
                    <span>End of Transmission</span>
                  </div>
                  <a href={article.url} target="_blank" rel="noopener" className="flex items-center gap-2 hover:text-[#DFFF00] transition-colors group">
                      Original Source Data <ExternalLink size={12} className="group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
            </div>
          </div>
      </div>
    </motion.div>
  );
}