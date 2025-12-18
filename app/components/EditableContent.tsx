'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { Pencil, Check, X, Loader2 } from 'lucide-react';

interface EditableContentProps {
  id: string;             // Unique key for this specific text (e.g. 'home-title')
  defaultContent: string; // The fallback text hardcoded in your app
  className?: string;     // Styles for the text
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
}

export default function EditableContent({ 
  id, 
  defaultContent, 
  className = "", 
  tag = 'span' 
}: EditableContentProps) {
  const { isAdmin } = useAuth();
  const supabase = createClient();
  
  const [content, setContent] = useState(defaultContent);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch override from DB on load
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await supabase
          .from('content_overrides')
          .select('content')
          .eq('id', id)
          .single();

        if (data) {
          setContent(data.content);
        }
      } catch (err) {
        // use default if fetch fails or no row exists
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [id, supabase]);

  const handleSave = async () => {
    if (!editValue.trim()) return;
    setSaving(true);

    const { error } = await supabase
      .from('content_overrides')
      .upsert({ 
        id, 
        content: editValue,
        updated_at: new Date().toISOString()
      });

    if (!error) {
      setContent(editValue);
      setIsEditing(false);
    } else {
      alert('Failed to save: ' + error.message);
    }
    setSaving(false);
  };

  const startEditing = () => {
    setEditValue(content);
    setIsEditing(true);
  };

  // Determine which tag to render
  const Tag = tag as keyof JSX.IntrinsicElements;

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input 
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className={`bg-zinc-900 border border-[#DFFF00] text-white px-2 py-1 outline-none rounded min-w-[200px] ${className}`}
        />
        <button onClick={handleSave} disabled={saving} className="bg-[#DFFF00] text-black p-1 rounded hover:bg-white">
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
        </button>
        <button onClick={() => setIsEditing(false)} className="bg-red-500 text-white p-1 rounded hover:bg-red-600">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative group inline-block">
      <Tag className={className}>
        {content}
      </Tag>
      
      {/* Only show Edit Pencil if Admin and not loading */}
      {isAdmin && !loading && (
        <button 
          onClick={startEditing}
          className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-[#DFFF00] p-1 rounded-full border border-zinc-700 hover:bg-zinc-700 z-50"
          title="Edit Text"
        >
          <Pencil size={12} />
        </button>
      )}
    </div>
  );
}