import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  type: string;
  created_at: string;
}

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`/api/tickets/${id}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du ticket');
        }
        const data: Ticket = await response.json();
        setTicket(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  if (loading) {
    return <div className="flex min-h-screen bg-gray-50 justify-center items-center">Chargement...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen bg-gray-50 justify-center items-center text-red-500">{error}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow p-6 rounded">
        <h1 className="text-2xl font-bold mb-4">{ticket?.title}</h1>
        <p className="mb-2"><strong>Description:</strong> {ticket?.description}</p>
        <p className="mb-2"><strong>Priorité:</strong> {ticket?.priority}</p>
        <p className="mb-2"><strong>Statut:</strong> {ticket?.status}</p>
        <p className="mb-2"><strong>Type:</strong> {ticket?.type}</p>
        <p className="mb-4"><strong>Créé le:</strong> {new Date(ticket?.created_at ?? '').toLocaleString()}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retour
        </button>
      </div>
    </div>
  );
}