import { create } from 'zustand';
import supabase from '../services/supabaseClient';
import type { Ticket } from '../types';

interface TicketState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  fetchTickets: () => Promise<void>;
  createTicket: (ticket: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
}

export const useTicketStore = create<TicketState>((set) => ({
  tickets: [],
  loading: false,
  error: null,

  fetchTickets: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ tickets: data, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createTicket: async (ticket) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.from('tickets').insert([ticket]).select().single();
      if (error) throw error;
      set((state) => ({ tickets: [data, ...state.tickets], error: null }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  updateTicket: async (id, updates) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        tickets: state.tickets.map((ticket) =>
          ticket.id === id ? { ...ticket, ...updates } : ticket
        ),
        error: null,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));