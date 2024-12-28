import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { fetchTicketData, getUserById, postCommentReply } from '../../api/ticketsService';
import { Ticket, Comment } from '../../types';

const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [createdByUser, setCreatedByUser] = useState<{ full_name: string; email: string } | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const commentsPerPage = 5;
  const maxReplyLength = 1000;
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
        const { ticketData, commentsData } = await fetchTicketData(id, user?.id || '');
        setTicket(ticketData);
        setComments(commentsData.reverse()); // Trier les commentaires du plus récent au plus vieux

        // Récupérer les informations de l'utilisateur qui a créé le ticket
        const userData = await getUserById(ticketData.created_by);
        setCreatedByUser(userData);
      } catch (err: any) {
        console.error(`Error fetching ticket: ${err.message}`);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleReplyChange = (text: string) => {
    if (text.length <= maxReplyLength) {
      setReplyText(text);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyText) return;

    try {
      await postCommentReply(id!, replyText, user?.id || '');
      // Re-fetch comments after posting reply
      const { commentsData } = await fetchTicketData(id!, user?.id || '');
      setComments(commentsData.reverse());
      setReplyText('');
    } catch (err: any) {
      console.error(`Error posting reply: ${err.message}`);
      setError(err.message);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = comments.slice(indexOfFirstComment, indexOfLastComment);

  if (loading) return <div className="text-center py-12">Chargement...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-lg font-medium text-gray-900">Détails du Ticket</h1>
        {ticket && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-gray-800">{ticket.title}</h2>
            <p className="mt-2 text-gray-600">{ticket.description}</p>
            <p className="mt-2 text-gray-500">Créé par: {createdByUser?.full_name} ({createdByUser?.email})</p>
          </div>
        )}
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900">Répondre au ticket</h3>
        <div className="relative">
          <textarea
            className="mt-2 w-full p-2 border border-gray-300 rounded-md"
            value={replyText}
            onChange={(e) => handleReplyChange(e.target.value)}
            maxLength={maxReplyLength}
          />
          <div className="absolute bottom-2 right-2 text-gray-400 text-sm">
            {replyText.length}/{maxReplyLength}
          </div>
        </div>
        <button
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={handleReplySubmit}
        >
          Répondre
        </button>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900">Commentaires</h2>
        {currentComments.map(comment => (
          <div key={comment.id} className="mt-4 p-4 border border-gray-200 rounded-lg">
            <p className="text-gray-800">{comment.content}</p>
          </div>
        ))}
        <div className="mt-4 flex justify-center space-x-2">
          {Array.from({ length: Math.ceil(comments.length / commentsPerPage) }, (_, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-md ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
