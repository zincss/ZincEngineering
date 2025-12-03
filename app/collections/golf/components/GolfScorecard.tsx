'use client';

import React, { useState } from 'react';
import { Plus, Users, Play, RotateCcw, ChevronLeft, ChevronRight, Trophy, Minus, Check, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Player {
  id: string;
  name: string;
  scores: number[]; // 18 scores
}

const TOTAL_HOLES = 18;

export default function GolfScorecard() {
  // --- STATE ---
  const [mode, setMode] = useState<'SETUP' | 'ACTIVE' | 'SUMMARY'>('SETUP');
  const [players, setPlayers] = useState<Player[]>([]);
  const [inputName, setInputName] = useState('');
  
  // Round State
  const [currentHole, setCurrentHole] = useState(1); // 1-18
  const [pars, setPars] = useState<number[]>(Array(TOTAL_HOLES).fill(4)); // Default Pars

  // --- ACTIONS ---

  const handleAddPlayer = () => {
    if (!inputName.trim() || players.length >= 4) return;
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: inputName.toUpperCase(),
      scores: Array(TOTAL_HOLES).fill(0)
    };
    setPlayers([...players, newPlayer]);
    setInputName('');
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const updatePar = (change: number) => {
    const newPars = [...pars];
    let newVal = newPars[currentHole - 1] + change;
    if (newVal < 3) newVal = 3;
    if (newVal > 6) newVal = 6;
    newPars[currentHole - 1] = newVal;
    setPars(newPars);
  };

  const updateScore = (playerIndex: number, change: number) => {
    const updatedPlayers = [...players];
    const currentScore = updatedPlayers[playerIndex].scores[currentHole - 1];
    
    // If score is 0, initialize to Par
    let newScore = currentScore === 0 ? pars[currentHole - 1] : currentScore + change;
    if (newScore < 1) newScore = 1;
    
    updatedPlayers[playerIndex].scores[currentHole - 1] = newScore;
    setPlayers(updatedPlayers);
  };

  const getLeaderboard = () => {
      return players.map(p => {
          const total = p.scores.reduce((a,b) => a + b, 0);
          // Only count par for played holes (where score > 0)
          let parTotal = 0;
          p.scores.forEach((s, i) => { if(s > 0) parTotal += pars[i] });
          const relative = total - parTotal;
          return { ...p, total, relative };
      }).sort((a,b) => a.relative - b.relative);
  };

  // --- PDF GENERATOR ---
  const generatePDF = () => {
      const doc = new jsPDF({ orientation: 'landscape' });
      const sortedPlayers = getLeaderboard();

      // 1. BRANDING HEADER
      doc.setFillColor(0, 0, 0); // Black Header Box
      doc.rect(0, 0, 297, 30, 'F');
      
      doc.setFont("courier", "bold");
      doc.setTextColor(223, 255, 0); // Acid Green
      doc.setFontSize(22);
      doc.text("ZINC FIELD OPERATIONS // GOLF PROTOCOL", 14, 18);

      // 2. METADATA
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("courier", "normal");
      doc.text(`SESSION ID: ${Date.now().toString().slice(-8)}`, 220, 12);
      doc.text(`DATE: ${new Date().toLocaleDateString().toUpperCase()}`, 220, 18);
      doc.text(`OPERATIVES: ${players.length}`, 220, 24);

      // 3. TABLE DATA PREP
      const tableHead = [
          ['OPERATIVE', ...Array.from({length: 18}, (_, i) => `${i+1}`), 'TOT', '+/-']
      ];

      const tableBody = [];

      // Row: PAR
      tableBody.push([
          'COURSE PAR',
          ...pars.map(p => p.toString()),
          pars.reduce((a,b) => a+b, 0),
          '-'
      ]);

      // Row: PLAYERS
      sortedPlayers.forEach(p => {
          tableBody.push([
              p.name,
              ...p.scores.map(s => s === 0 ? '-' : s.toString()),
              p.total,
              p.relative > 0 ? `+${p.relative}` : p.relative
          ]);
      });

      // 4. DRAW TABLE
      autoTable(doc, {
          head: tableHead,
          body: tableBody,
          startY: 40,
          theme: 'grid',
          headStyles: { 
              fillColor: [0, 0, 0], 
              textColor: [223, 255, 0], 
              font: 'courier', 
              fontStyle: 'bold',
              lineWidth: 0.1,
              lineColor: [50, 50, 50]
          },
          bodyStyles: { 
              font: 'courier', 
              fontSize: 10, 
              textColor: [0, 0, 0],
              lineWidth: 0.1,
              lineColor: [200, 200, 200]
          },
          alternateRowStyles: { 
              fillColor: [245, 245, 245] 
          },
          // Highlight Par Row
          didParseCell: function(data) {
              if (data.section === 'body' && data.row.index === 0) {
                  data.cell.styles.fontStyle = 'bold';
                  data.cell.styles.fillColor = [230, 230, 230];
              }
          }
      });

      // 5. FOOTER
      // FIX: Use doc.getNumberOfPages() instead of doc.internal.getNumberOfPages()
      const pageCount = doc.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text('CONFIDENTIAL // AUTHORIZED EYES ONLY // GENERATED BY ZINC ARCHIVES', 14, doc.internal.pageSize.height - 10);
      }

      doc.save(`Zinc_Mission_Report_${Date.now()}.pdf`);
  };

  // --- RENDER: SETUP ---
  if (mode === 'SETUP') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-8">
          
          {/* LEFT: ROSTER */}
          <div className="border border-zinc-800 bg-zinc-900/50 p-8 flex flex-col justify-between min-h-[400px]">
             <div>
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-800">
                    <Users className="text-[#DFFF00]" size={24} />
                    <h2 className="text-2xl font-black uppercase tracking-tight">Mission Roster</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={inputName}
                            onChange={(e) => setInputName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                            placeholder="ENTER OPERATIVE NAME"
                            className="w-full bg-black border border-zinc-700 p-4 text-sm font-mono text-white outline-none focus:border-[#DFFF00] uppercase placeholder:text-zinc-700 transition-colors"
                        />
                        <button 
                            onClick={handleAddPlayer}
                            disabled={players.length >= 4}
                            className="bg-[#DFFF00] text-black px-6 font-bold hover:bg-white transition-colors disabled:opacity-50"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {players.map((p, i) => (
                            <div key={p.id} className="flex justify-between items-center bg-zinc-950 border-l-2 border-[#DFFF00] p-4 animate-in slide-in-from-left-2">
                                <span className="font-mono font-bold text-sm">0{i+1} // {p.name}</span>
                                <button onClick={() => handleRemovePlayer(p.id)} className="text-[10px] text-zinc-600 hover:text-red-500 font-mono uppercase transition-colors">[DISMISS]</button>
                            </div>
                        ))}
                        {players.length === 0 && (
                            <div className="text-center py-12 border border-dashed border-zinc-800 text-zinc-600 font-mono text-xs italic">
                                AWAITING ASSIGNMENTS...
                            </div>
                        )}
                    </div>
                 </div>
             </div>

             <button 
                onClick={() => setMode('ACTIVE')}
                disabled={players.length === 0}
                className="w-full mt-8 bg-zinc-100 text-black font-black uppercase py-4 tracking-widest hover:bg-[#DFFF00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <Play size={16} /> INITIALIZE PROTOCOL
            </button>
          </div>

          {/* RIGHT: DECO / INSTRUCTIONS */}
          <div className="hidden lg:flex flex-col justify-center text-zinc-500 space-y-6">
               <h3 className="text-xl font-bold uppercase text-white">System Instructions</h3>
               <ul className="space-y-4 font-mono text-xs border-l border-zinc-800 pl-6">
                   <li>1. Assign up to 4 Operatives to the current session.</li>
                   <li>2. Configure PAR parameters for each sector (Hole) manually.</li>
                   <li>3. Input telemetry (Scores) after completing each sector.</li>
                   <li>4. Generate "Mission Report" (PDF) upon completion.</li>
               </ul>
          </div>
      </div>
    );
  }

  // --- RENDER: ACTIVE HOLE CARD ---
  if (mode === 'ACTIVE') {
      return (
        <div className="max-w-3xl mx-auto">
            
            {/* TOP BAR: NAVIGATION */}
            <div className="flex items-center justify-between mb-8">
                <button 
                    onClick={() => setCurrentHole(h => h > 1 ? h - 1 : h)}
                    disabled={currentHole === 1}
                    className="flex items-center gap-2 text-zinc-500 hover:text-[#DFFF00] disabled:opacity-30 disabled:hover:text-zinc-500 transition-colors uppercase font-mono text-xs font-bold"
                >
                    <ChevronLeft size={16}/> PREV SECTOR
                </button>
                
                <div className="flex gap-1">
                    {Array.from({length: 18}).map((_, i) => (
                        <div 
                            key={i} 
                            className={`w-1 h-1 rounded-full ${i + 1 === currentHole ? 'bg-[#DFFF00]' : i + 1 < currentHole ? 'bg-zinc-600' : 'bg-zinc-800'}`}
                        />
                    ))}
                </div>

                <button 
                    onClick={() => setCurrentHole(h => h < 18 ? h + 1 : h)}
                    disabled={currentHole === 18}
                    className="flex items-center gap-2 text-zinc-500 hover:text-[#DFFF00] disabled:opacity-30 disabled:hover:text-zinc-500 transition-colors uppercase font-mono text-xs font-bold"
                >
                    NEXT SECTOR <ChevronRight size={16}/>
                </button>
            </div>

            {/* MAIN DATA ENTRY CARD */}
            <div className="border border-zinc-800 bg-zinc-900 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-800 via-[#DFFF00] to-zinc-800 opacity-50" />
                
                <div className="p-8 md:p-12">
                    
                    {/* HOLE HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-zinc-800 pb-8">
                        <div>
                            <div className="text-[#DFFF00] font-mono text-xs font-bold uppercase tracking-widest mb-2">Current Location</div>
                            <h2 className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter">
                                HOLE <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-600">{currentHole.toString().padStart(2, '0')}</span>
                            </h2>
                        </div>

                        {/* PAR INPUT */}
                        <div className="bg-black border border-zinc-800 p-4 flex flex-col items-center min-w-[120px]">
                            <label className="text-zinc-500 font-mono text-[10px] uppercase mb-2 tracking-widest">Sector Par</label>
                            <div className="flex items-center gap-4">
                                <button onClick={() => updatePar(-1)} className="text-zinc-600 hover:text-white p-2"><Minus size={16}/></button>
                                <span className="text-4xl font-black text-[#DFFF00]">{pars[currentHole-1]}</span>
                                <button onClick={() => updatePar(1)} className="text-zinc-600 hover:text-white p-2"><Plus size={16}/></button>
                            </div>
                        </div>
                    </div>

                    {/* PLAYER INPUTS */}
                    <div className="space-y-4">
                        {players.map((p, i) => {
                             const score = p.scores[currentHole - 1];
                             const isBirdie = score > 0 && score < pars[currentHole - 1];
                             const isBogey = score > pars[currentHole - 1];

                             return (
                                <div key={p.id} className="group bg-zinc-950 border border-zinc-800 p-4 flex items-center justify-between hover:border-zinc-600 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="text-zinc-600 font-mono text-xs font-bold">0{i+1}</div>
                                        <div className="text-xl font-bold uppercase text-white">{p.name}</div>
                                    </div>
                                    
                                    <div className="flex items-center gap-6">
                                        <button 
                                            onClick={() => updateScore(i, -1)}
                                            className="w-10 h-10 border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-[#DFFF00] flex items-center justify-center transition-all"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        
                                        <div className={`w-12 text-center text-3xl font-black font-mono ${
                                            score === 0 ? 'text-zinc-700' :
                                            isBirdie ? 'text-[#DFFF00]' :
                                            isBogey ? 'text-red-500' :
                                            'text-white'
                                        }`}>
                                            {score === 0 ? '-' : score}
                                        </div>

                                        <button 
                                            onClick={() => updateScore(i, 1)}
                                            className="w-10 h-10 border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-[#DFFF00] flex items-center justify-center transition-all"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                             )
                        })}
                    </div>

                </div>

                {/* BOTTOM ACTION BAR */}
                <div className="bg-black p-4 border-t border-zinc-800 flex justify-between items-center">
                     <button onClick={() => setMode('SUMMARY')} className="text-xs font-mono text-zinc-500 hover:text-white uppercase flex items-center gap-2">
                        <Trophy size={14} /> View Leaderboard
                     </button>
                     
                     {currentHole < 18 ? (
                         <button 
                            onClick={() => setCurrentHole(h => h + 1)}
                            className="bg-white text-black px-6 py-3 font-black uppercase text-xs tracking-widest hover:bg-[#DFFF00] transition-colors flex items-center gap-2"
                         >
                            Next Sector <ChevronRight size={14} />
                         </button>
                     ) : (
                         <button 
                            onClick={() => setMode('SUMMARY')}
                            className="bg-[#DFFF00] text-black px-6 py-3 font-black uppercase text-xs tracking-widest hover:bg-white transition-colors flex items-center gap-2"
                         >
                            Finish Protocol <Check size={14} />
                         </button>
                     )}
                </div>
            </div>
        </div>
      );
  }

  // --- RENDER: SUMMARY / LEADERBOARD ---
  if (mode === 'SUMMARY') {
      const sortedPlayers = getLeaderboard();
      
      return (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8">
              <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                  <div>
                    <h2 className="text-4xl font-black uppercase text-white">Mission Debrief</h2>
                    <p className="text-zinc-500 font-mono text-xs mt-1">FINAL TELEMETRY ANALYSIS</p>
                  </div>
                  
                  <div className="flex gap-2">
                      <button onClick={() => setMode('ACTIVE')} className="text-xs font-mono text-zinc-500 hover:text-white uppercase px-4 py-2 border border-zinc-800 bg-zinc-900">
                          Edit Data
                      </button>
                      <button 
                        onClick={generatePDF}
                        className="bg-[#DFFF00] text-black px-4 py-2 font-black uppercase text-xs tracking-widest hover:bg-white transition-colors flex items-center gap-2"
                      >
                          <FileText size={14} /> DOWNLOAD REPORT
                      </button>
                  </div>
              </div>

              {/* WINNER CARD */}
              <div className="bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 p-8 mb-8 relative overflow-hidden group">
                   <div className="absolute right-0 top-0 opacity-10 text-[#DFFF00] transform translate-x-12 -translate-y-12">
                       <Trophy size={200} />
                   </div>
                   <div className="relative z-10">
                       <div className="text-[#DFFF00] font-mono text-xs font-bold uppercase mb-2">Current Lead</div>
                       <div className="text-6xl font-black uppercase text-white mb-2">{sortedPlayers[0]?.name || 'N/A'}</div>
                       <div className="text-2xl font-mono text-zinc-400">
                           {sortedPlayers[0]?.relative > 0 ? '+' : ''}{sortedPlayers[0]?.relative} <span className="text-sm text-zinc-600">({sortedPlayers[0]?.total})</span>
                       </div>
                   </div>
              </div>

              {/* FULL TABLE */}
              <div className="border border-zinc-800 bg-zinc-900/50">
                  <div className="grid grid-cols-4 p-4 border-b border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      <div className="col-span-2">Operative</div>
                      <div className="text-center">Total</div>
                      <div className="text-right">To Par</div>
                  </div>
                  {sortedPlayers.map((p, i) => (
                      <div key={p.id} className="grid grid-cols-4 p-4 border-b border-zinc-800 text-white items-center hover:bg-zinc-800/50 transition-colors">
                          <div className="col-span-2 flex items-center gap-3">
                              <span className="text-zinc-600 font-mono text-xs font-bold">0{i+1}</span>
                              <span className="font-bold uppercase">{p.name}</span>
                          </div>
                          <div className="text-center font-mono text-zinc-400">{p.total}</div>
                          <div className={`text-right font-mono font-bold ${p.relative < 0 ? 'text-[#DFFF00]' : p.relative > 0 ? 'text-red-500' : 'text-white'}`}>
                              {p.relative > 0 ? '+' : ''}{p.relative}
                          </div>
                      </div>
                  ))}
              </div>

              <div className="mt-8 flex justify-center">
                   <button 
                        onClick={() => { if(confirm('Terminate Session? Data will be purged.')) { setMode('SETUP'); setPlayers([]); } }}
                        className="text-red-500 hover:text-red-400 text-xs font-mono uppercase border border-red-900/30 hover:bg-red-900/10 px-6 py-3 transition-colors flex items-center gap-2"
                   >
                       <RotateCcw size={14}/> Terminate Protocol
                   </button>
              </div>
          </div>
      );
  }

  return null;
}