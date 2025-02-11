import supabase  from './supabaseClient';
import { Ticket, Comment, TicketStatusHistory } from '../types';
import { getCurrentProfile, getFullNameById } from './profilesService';
import { User } from 'lucide-react';

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userError) throw userError;

  const isAdmin = userData.role === 'admin';

  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Si l'utilisateur est un administrateur, retourner tous les tickets
  if (isAdmin) {
    return data as Ticket[];
  }

  // Sinon, filtrer les tickets par utilisateur
  return data.filter(ticket => ticket.created_by === user.id) as Ticket[];
}

export async function getTicketById(id: string): Promise<Ticket> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userError) throw userError;

  const isAdmin = userData.role === 'admin';

  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  // Si l'utilisateur est un administrateur, retourner le ticket
  if (isAdmin) {
    return data as Ticket;
  }

  // Sinon, vérifier si l'utilisateur est le créateur du ticket
  if (data.created_by !== user.id) {
    throw new Error('Access denied');
  }

  return data as Ticket;
}

/**
 * Récupère les commentaires associés à un ticket donné.
 * @param ticketId - L'ID du ticket.
 * @returns Une promesse contenant un tableau de commentaires.
 */
export async function getCommentsByTicketId(ticketId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('ticket_comments')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const comments = data as Comment[];

  // Récupérer les profils des utilisateurs
  const userIds = comments.map(comment => comment.user_id);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds);

  if (profilesError) throw profilesError;

  const profilesMap = profiles.reduce((acc, profile) => {
    acc[profile.id] = profile.full_name;
    return acc;
  }, {} as Record<string, string>);

  return comments.map(comment => ({
    ...comment,
    user_full_name: profilesMap[comment.user_id]
  }));
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
sortField: string = 'created_at', _p0: string, _p1: number, _p2: number, sortOrder: 'asc' | 'desc' = 'desc', currentPage: number = 1, pageSize: number = 10): Promise<{ data: Ticket[]; count: number }> => {
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

/**
 * Récupère les données du ticket et les commentaires associés.
 * @param id - L'ID du ticket.
 * @param userId - L'ID de l'utilisateur.
 * @returns Une promesse contenant les données du ticket et les commentaires associés.
 */
export async function fetchTicketData(id: string, userId: string) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Utilisateur non authentifié');
  const ticketData = await getTicketById(id);
  if(process.env.NODE_ENV === 'development') {
    console.log('ticketData', ticketData);
    console.log('userId', userId);
    console.log('User.name', User.name);
  }
  if (ticketData.assigned_to !== userId && ticketData.created_by !== userId  && profile.role != 'admin') {
    throw new Error("Accès refusé.");
  }
  const commentsData = await getCommentsByTicketId(id);
  return { ticketData, commentsData };
}

/**
 * Récupère les informations de l'utilisateur par ID.
 * @param userId - L'ID de l'utilisateur.
 * @returns Une promesse contenant les informations de l'utilisateur.
 */
export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Envoie une réponse à un commentaire.
 * @param ticketId - L'ID du ticket.
 * @param content - Le texte de la réponse.
 * @param userId - L'ID de l'utilisateur qui répond.
 * @returns Une promesse résolue lorsque la réponse est ajoutée.
 */
export async function postCommentReply(ticketId: string, text: string, userId: string) {
  const { data, error } = await supabase
    .from('ticket_comments')
    .insert([
      { ticket_id: ticketId, content: text, user_id: userId }
    ]);

  if (error) throw error;
  return data;
}

export async function closeTicket(id: string, userId: string): Promise<void> {
  // Récupérer le statut actuel du ticket
  const { data: ticket, error: fetchError } = await supabase
    .from('tickets')
    .select('status')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error(fetchError);
    throw fetchError;
  }

  const oldStatus = ticket.status;
  const isClosed = 'resolved';

  // Mettre à jour le statut du ticket
  const { data, error } = await supabase
    .from('tickets')
    .update({ status: isClosed })
    .eq('id', id);

  if (error) {
    console.error(error);
    throw error;
  }

  // Insérer un nouvel historique de statut
  const { error: historyError } = await supabase
    .from('ticket_status_history')
    .insert([
      {
        ticket_id: id,
        old_status: oldStatus,
        new_status: isClosed,
        changed_by: userId,
        created_at: new Date().toISOString(),
      },
    ]);

  if (historyError) {
    console.error(historyError);
    throw historyError;
  }
}
export async function startProgress(ticketId: string, userId: string): Promise<void> {
  // Récupérer le statut actuel du ticket
  const { data: ticket, error: fetchError } = await supabase
    .from('tickets')
    .select('status')
    .eq('id', ticketId)
    .single();

  if (fetchError) {
    console.error(fetchError);
    throw fetchError;
  }

  const oldStatus = ticket.status;

  if (oldStatus === 'new' || oldStatus === 'resolved') {
    const newStatus = 'in_progress';

    // Mettre à jour le statut du ticket
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ status: newStatus })
      .eq('id', ticketId);

    if (updateError) {
      console.error(updateError);
      throw updateError;
    }

    // Insérer un nouvel historique de statut
    const { error: historyError } = await supabase
      .from('ticket_status_history')
      .insert([
        {
          ticket_id: ticketId,
          old_status: oldStatus,
          new_status: newStatus,
          changed_by: userId,
          created_at: new Date().toISOString(),
        },
      ]);

    if (historyError) {
      console.error(historyError);
      throw historyError;
    }
  }
}

export async function handleCloseTicket(id: string, userId: string): Promise<void> {
  try {
    await closeTicket(id, userId);
  } catch (error: any) {
    console.error(error);
    throw new Error("Erreur lors de la clôture du ticket.");
  }
}

export async function getLastStatusHistory(ticketId: string): Promise<(TicketStatusHistory & { full_name: string }) | null> {
  const { data, error } = await supabase
    .from('ticket_status_history')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  if (data) {
    const fullName = await getFullNameById(data.changed_by);
    return { ...data, full_name: fullName };
  }

  return null;
}
export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase
    .from('ticket_comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    throw new Error(error.message);
  }
  else {
    console.log('Comment deleted');
  }
}

export async function updateTicket(ticket: Ticket): Promise<void> {
  const { error } = await supabase
    .from('tickets')
    .update({
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      type: ticket.type,
      assigned_to: ticket.assigned_to,
    })
    .eq('id', ticket.id);

  if (error) {
    throw new Error(error.message);
  }
}
