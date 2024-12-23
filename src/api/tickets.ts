import supabase from '../lib/supabaseClient';
import { Ticket } from '../types';

export async function getTickets(
  sortField: string,
  sortOrder: 'asc' | 'desc',
  page: number,
  pageSize: number
): Promise<{ data: Ticket[]; count: number }> {
  const { data, error, count } = await supabase
    .from('tickets')
    .select(`
      *,
      created_by:users!tickets_created_by_fkey(email),
      assigned_to:users!tickets_assigned_to_fkey(email)
    `)
    .order(sortField, { ascending: sortOrder === 'asc' })
    .range((page - 1) * pageSize, page * pageSize - 1)
    .single();

  if (error) throw error;
  return { data, count: count || data.length };
}

export async function getTicketById(id: string): Promise<Ticket> {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      created_by:users!tickets_created_by_fkey(email),
      assigned_to:users!tickets_assigned_to_fkey(email),
      comments(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}