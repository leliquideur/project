import supabase from '../lib/supabaseClient';
import { Ticket } from '../types';
import { getCurrentProfile } from './profilesService';

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
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Récupère les tickets en fonction du tri, de la page actuelle, etc.
 * @param sortField - Le champ de tri.
 * @param sortOrder - L'ordre de tri ('asc' ou 'desc').
 * @param currentPage - La page actuelle.
 * @param pageSize - Le nombre d'éléments par page.
 * @returns Une promesse contenant les données des tickets et le nombre total.
 */
export const fetchTickets = async (
sortField: string = 'created_at', p0: string, p1: number, p2: number, sortOrder: 'asc' | 'desc' = 'desc', currentPage: number = 1, pageSize: number = 10): Promise<{ data: Ticket[]; count: number }> => {
  // Récupérer le profil courant de l'utilisateur
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Utilisateur non authentifié');

  const { role, id } = profile;

  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('tickets')
    .select('*', { count: 'exact' })
    .order(sortField, { ascending: sortOrder === 'asc' })
    .range(from, to);

  if (role !== 'admin' && role !== 'technician') {
    if (!id) {
      throw new Error('User ID is required for non-admin/non-technician roles');
    }
    query = query.or(`created_by.eq.${id},assigned_to.eq.${id}`);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return { data: data as Ticket[], count: count || 0 };
};