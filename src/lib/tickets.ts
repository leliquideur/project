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