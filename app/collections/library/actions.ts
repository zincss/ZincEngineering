'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  content: string;
  category: string;
  cover_color: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export async function getBooks() {
  const supabase = createClient();
  
  // Try fetching with order_index first
  const { data, error } = await supabase
    .from('library_books')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Falling back to created_at sort:', error.message);
    // Fallback if order_index doesn't exist yet
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('library_books')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (fallbackError) {
      console.error('Final fetch error:', fallbackError);
      return [];
    }
    return fallbackData as Book[];
  }

  return data as Book[];
}

export async function updateBookOrder(id: string, newOrder: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from('library_books')
    .update({ order_index: newOrder })
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/collections/library');
}

export async function saveBook(book: Partial<Book>) {
  const supabase = createClient();
  
  // Check admin role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }

  const { data, error } = await supabase
    .from('library_books')
    .upsert({
      ...book,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving book:', error);
    throw error;
  }

  revalidatePath('/collections/library');
  return data as Book;
}

export async function deleteBook(id: string) {
  const supabase = createClient();
  
  // Check admin role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }

  const { error } = await supabase
    .from('library_books')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting book:', error);
    throw error;
  }

  revalidatePath('/collections/library');
}
