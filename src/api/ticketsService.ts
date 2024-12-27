import supabase from './supabaseClient';
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

export async function getTickets(): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Ticket[];
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

export async function loadTickets(setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>, setIsLoading: React.Dispatch<React.SetStateAction<boolean>>, setError: React.Dispatch<React.SetStateAction<string | null>>) {
  setIsLoading(true);
  setError(null);
  try {
    const newTickets = await getTickets();
    setTickets(newTickets);
  } catch (err: any) {
    setError('Erreur lors de la récupération des tickets');
    console.error(err);
  } finally {
    setIsLoading(false);
  }
}

export async function loadTicketsWithPagination(
  sortField: string,
  sortOrder: 'asc' | 'desc',
  currentPage: number,
  pageSize: number,
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>,
  setTotalPages: React.Dispatch<React.SetStateAction<number>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  setIsLoading(true);
  setError(null);
  try {
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('tickets')
      .select('*', { count: 'exact' })
      .order(sortField, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) throw error;

    setTickets(data as Ticket[]);
    setTotalPages(Math.ceil((count ?? 0) / pageSize));
  } catch (err: any) {
    setError('Erreur lors de la récupération des tickets');
    console.error(err);
  } finally {
    setIsLoading(false);
  }
}