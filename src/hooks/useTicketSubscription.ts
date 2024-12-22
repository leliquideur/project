import { useEffect } from 'react';
import supabase from '../lib/supabaseClient';
import { useTicketStore } from '../api/store/ticketStore';

export function useTicketSubscription() {
  const fetchTickets = useTicketStore((state) => state.fetchTickets);

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