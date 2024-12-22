import supabase from '../lib/supabaseClient';
import { Ticket } from '../types';

export async function createTicket(ticket: Omit<Ticket, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('tickets')
    .insert([
      {
        ...ticket,
        created_by: user.id
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTickets() {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      created_by:users!tickets_created_by_fkey(email),
      assigned_to:users!tickets_assigned_to_fkey(email)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getTicketById(id: string) {
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

export const fetchTickets = async (
  sortField: string = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc',
  currentPage: number = 1,
  pageSize: number = 10
): Promise<{ data: Ticket[]; count: number }> => {
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('tickets')
    .select('*', { count: 'exact' })
    .order(sortField, { ascending: sortOrder === 'asc' })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return { data: data as Ticket[], count: count || 0 };
};