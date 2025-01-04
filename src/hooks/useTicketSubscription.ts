import { useEffect } from 'react';
import supabase from '../api/supabaseClient';
import { useTicketStore } from '../store/ticketStore';

export function useTicketSubscription() {
  const fetchTickets = useTicketStore((state: { fetchTickets: () => void }) => state.fetchTickets);

  useEffect(() => {
    const subscription = supabase
      .channel('tickets')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchTickets]);
}