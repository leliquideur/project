import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Ticket } from "../../../types";
import { getTicketById } from "../../../api/ticketsService";
import { useAuth } from "../../../hooks/useAuth";

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // Déstructuration pour obtenir user du contexte

  useEffect(() => {
    if (!id) {
      console.error("ID du ticket manquant.");
      setError("ID du ticket manquant.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        console.log(`Fetching ticket with ID: ${id}`);
        const data = await getTicketById(id);
        console.log(`Ticket data:`, data);
        // Vérification des permissions
        if ( user?.role === "admin" && data.assigned_to !== user?.id && data.created_by !== user?.id) {
          console.error("Accès refusé.");
          setError("Accès refusé.");
        } else {
          setTicket(data);
        }
      } catch (err: any) {
        console.error(`Error fetching ticket: ${err.message}`);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!ticket) {
    return <div>Ticket non trouvé.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{ticket.title}</h1>
      <p>
        <strong>Description:</strong> {ticket.description}
      </p>
      <p>
        <strong>Priorité:</strong> {ticket.priority}
      </p>
      <p>
        <strong>Status:</strong> {ticket.status}
      </p>
      <p>
        <strong>Type:</strong> {ticket.type}
      </p>
      <p>
        <strong>Créé le:</strong> {new Date(ticket.created_at).toLocaleString()}
      </p>
      <button
        onClick={() => navigate(-1)}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Retour
      </button>
    </div>
  );
}
