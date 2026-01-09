'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeftRight, Check, Lock, Plus, X, RefreshCw } from 'lucide-react'

// --- Types ---
type TradeItem = {
  id: string
  name: string
  rarity: string
  image_url?: string
}

type TradeSession = {
  id: string
  initiator_id: string
  receiver_id: string
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  initiator_offer: TradeItem[]
  receiver_offer: TradeItem[]
  initiator_ready: boolean
  receiver_ready: boolean
}

// [FIX] Required for static export

export default function TradeSessionPage() {
  const { sessionId } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [trade, setTrade] = useState<TradeSession | null>(null)
  const [inventory, setInventory] = useState<TradeItem[]>([])
  const [showInventory, setShowInventory] = useState(false)

  // 1. Init: Get User & Initial Trade Data
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setCurrentUser(user)

      // Fetch Trade
      const { data: tradeData, error } = await supabase
        .from('market_trades')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (error || !tradeData) {
        console.error('Trade not found')
        return
      }

      setTrade(tradeData)
      
      // Fetch User Inventory (for the "Add Item" modal)
      const { data: invData } = await supabase
        .from('user_cards') 
        .select('id, name, rarity, image_url')
        .eq('user_id', user.id)
        .eq('is_locked', false) 

      if (invData) setInventory(invData)
      setLoading(false)
    }

    init()
  }, [sessionId, supabase, router])

  // 2. Real-time Subscription: Listen for Trade Updates
  useEffect(() => {
    const channel = supabase
      .channel(`trade-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'market_trades',
          filter: `id=eq.${sessionId}`,
        },
        (payload: any) => {
          // Update local state when DB changes
          setTrade(payload.new as TradeSession)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, supabase])

  // --- Helpers ---

  const isInitiator = currentUser?.id === trade?.initiator_id
  
  const myOffer = isInitiator ? trade?.initiator_offer : trade?.receiver_offer
  const theirOffer = isInitiator ? trade?.receiver_offer : trade?.initiator_offer
  const amIReady = isInitiator ? trade?.initiator_ready : trade?.receiver_ready
  const areTheyReady = isInitiator ? trade?.receiver_ready : trade?.initiator_ready

  // --- Actions ---

  const toggleReady = async () => {
    if (!trade) return
    const field = isInitiator ? 'initiator_ready' : 'receiver_ready'
    
    await supabase
      .from('market_trades')
      .update({ [field]: !amIReady })
      .eq('id', sessionId)
  }

  const addToOffer = async (item: TradeItem) => {
    if (!trade || amIReady) return 

    const currentOffer = (isInitiator ? trade.initiator_offer : trade.receiver_offer) || []
    if (currentOffer.find((i) => i.id === item.id)) return

    const newOffer = [...currentOffer, item]
    const field = isInitiator ? 'initiator_offer' : 'receiver_offer'

    await supabase
      .from('market_trades')
      .update({ 
        [field]: newOffer,
        initiator_ready: false, // Reset ready status on change
        receiver_ready: false 
      })
      .eq('id', sessionId)
    
    setShowInventory(false)
  }

  const removeFromOffer = async (itemId: string) => {
    if (!trade || amIReady) return

    const currentOffer = (isInitiator ? trade.initiator_offer : trade.receiver_offer) || []
    const newOffer = currentOffer.filter((i) => i.id !== itemId)
    const field = isInitiator ? 'initiator_offer' : 'receiver_offer'

    await supabase
      .from('market_trades')
      .update({ 
        [field]: newOffer,
        initiator_ready: false, 
        receiver_ready: false 
      })
      .eq('id', sessionId)
  }

  const finalizeTrade = async () => {
    const { error } = await supabase.rpc('execute_trade', { trade_id: sessionId })
    if (error) {
        alert('Error executing trade: ' + error.message)
    } else {
        alert('Trade Complete!')
        router.push('/play/market') 
    }
  }

  if (loading || !trade) return <div className="p-10 text-center text-zinc-400">Loading Trade Session...</div>

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ArrowLeftRight className="text-emerald-500" /> 
            Trade Session 
            <span className="text-zinc-500 text-sm">#{typeof sessionId === 'string' ? sessionId.slice(0,8) : ''}</span>
          </h1>
          <p className="text-zinc-400 text-sm">
            Status: <span className="uppercase font-semibold text-emerald-400">{trade.status}</span>
          </p>
        </div>
        
        {/* Finalize Button (Only shows if both are ready) */}
        {amIReady && areTheyReady && (
          <button 
            onClick={finalizeTrade}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"
          >
            CONFIRM TRADE
          </button>
        )}
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: MY OFFER */}
        <div className={`border-2 rounded-xl p-6 transition-colors ${amIReady ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-zinc-800 bg-zinc-900'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Your Offer</h2>
            {amIReady ? (
              <span className="flex items-center gap-1 text-emerald-400 text-sm font-bold bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                <Lock size={14} /> LOCKED
              </span>
            ) : (
              <span className="text-zinc-500 text-sm">Editing...</span>
            )}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[200px] content-start">
            {myOffer?.map((item) => (
              <div key={item.id} className="relative group bg-zinc-800 border border-zinc-700 rounded-lg p-2 aspect-[3/4] flex flex-col items-center justify-center">
                {/* Remove Button */}
                {!amIReady && (
                  <button 
                    onClick={() => removeFromOffer(item.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                )}
                <div className="w-full h-20 bg-zinc-900 mb-2 rounded flex items-center justify-center text-xs text-zinc-600">
                  {item.image_url ? <img src={item.image_url} alt={item.name} className="h-full object-contain"/> : 'Img'}
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm truncate w-24">{item.name}</div>
                  <div className="text-xs text-zinc-500">{item.rarity}</div>
                </div>
              </div>
            ))}

            {/* Add Button */}
            {!amIReady && (
              <button 
                onClick={() => setShowInventory(true)}
                className="border-2 border-dashed border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50 rounded-lg flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 transition-all aspect-[3/4]"
              >
                <Plus size={24} />
                <span className="text-xs font-bold">Add Item</span>
              </button>
            )}
          </div>

          {/* Action Bar */}
          <div className="mt-6 pt-6 border-t border-zinc-700/50">
            <button
              onClick={toggleReady}
              className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                amIReady 
                  ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              {amIReady ? (
                <>Unlock to Edit</>
              ) : (
                <><Check size={18} /> Lock & Ready</>
              )}
            </button>
          </div>
        </div>


        {/* RIGHT COLUMN: THEIR OFFER */}
        <div className={`border-2 rounded-xl p-6 relative ${areTheyReady ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-zinc-800 bg-zinc-900'}`}>
          {/* Overlay if waiting */}
          {!areTheyReady && (
            <div className="absolute top-4 right-4 flex items-center gap-2 text-zinc-500 text-xs animate-pulse">
              <RefreshCw size={12} className="animate-spin" /> They are thinking...
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-zinc-400">Their Offer</h2>
            {areTheyReady ? (
              <span className="flex items-center gap-1 text-emerald-400 text-sm font-bold bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                <Check size={14} /> READY
              </span>
            ) : (
              <span className="text-zinc-600 text-sm">Not Ready</span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[200px] content-start opacity-90">
             {theirOffer?.map((item) => (
              <div key={item.id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-2 aspect-[3/4] flex flex-col items-center justify-center">
                <div className="w-full h-20 bg-zinc-900 mb-2 rounded flex items-center justify-center text-xs text-zinc-600">
                  {item.image_url ? <img src={item.image_url} alt={item.name} className="h-full object-contain"/> : 'Img'}
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm truncate w-24 text-zinc-300">{item.name}</div>
                  <div className="text-xs text-zinc-600">{item.rarity}</div>
                </div>
              </div>
            ))}
            
            {(!theirOffer || theirOffer.length === 0) && (
              <div className="col-span-full h-32 flex items-center justify-center text-zinc-600 text-sm italic">
                No items added yet.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* INVENTORY MODAL (Simple overlay) */}
      {showInventory && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 w-full max-w-2xl rounded-xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-lg">Select Item to Trade</h3>
              <button onClick={() => setShowInventory(false)}><X /></button>
            </div>
            <div className="p-4 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {inventory.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => addToOffer(item)}
                  className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-emerald-500 transition-all rounded p-2 text-center"
                >
                  <div className="h-16 bg-zinc-950 mb-2 rounded"></div> {/* Image Placeholder */}
                  <p className="text-xs font-bold truncate">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}