import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getTicketById, getCommentsByTicketId, postCommentReply, getUserById } from '../../api/ticketsService';
import { getFullNameById } from '../../api/profilesService';
import { Ticket, Comment } from '../../types';
import TextAreaWithCounter from '../../components/TextAreaWithCounter';

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
  const [userNames, setUserNames] = useState<Record<string, string>>({});
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
        const ticketData = await getTicketById(id);
        const commentsData = await getCommentsByTicketId(id);
        setTicket(ticketData);
        setComments(commentsData); // Trier les commentaires du plus récent au plus vieux

        // Récupérer les informations de l'utilisateur qui a créé le ticket
        const userData = await getUserById(ticketData.created_by);
        setCreatedByUser(userData);

        // Récupérer les noms complets des utilisateurs des commentaires
        const userIds = commentsData.map(comment => comment.user_id);
        const uniqueUserIds = Array.from(new Set(userIds));
        const userNamesMap: Record<string, string> = {};

        for (const userId of uniqueUserIds) {
          if (!userNames[userId]) {
            const fullName = await getFullNameById(userId);
            if (fullName) {
              userNamesMap[userId] = fullName;
            }
          }
        }

        setUserNames(prevUserNames => ({ ...prevUserNames, ...userNamesMap }));
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
    setReplyText(text);
  };

  const handleReplySubmit = async () => {
    if (!replyText) return;

    try {
      await postCommentReply(id!, replyText, user?.id || '');
      // Re-fetch comments after posting reply
      const commentsData = await getCommentsByTicketId(id!);
      setComments(commentsData);
      setReplyText('');

      // Récupérer les noms complets des nouveaux utilisateurs des commentaires
      const userIds = commentsData.map(comment => comment.user_id);
      const uniqueUserIds = Array.from(new Set(userIds));
      const userNamesMap: Record<string, string> = {};

      for (const userId of uniqueUserIds) {
        if (!userNames[userId]) {
          const fullName = await getFullNameById(userId);
          if (fullName) {
            userNamesMap[userId] = fullName;
          }
        }
      }

      setUserNames(prevUserNames => ({ ...prevUserNames, ...userNamesMap }));
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
            <p className="mt-2 text-gray-500">Date de création: {new Date(ticket.created_at).toLocaleString()}</p>
          </div>
        )}
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900">Répondre au ticket</h3>
        <TextAreaWithCounter
          value={replyText}
          onChange={handleReplyChange}
          maxLength={maxReplyLength}
        />
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
          <div key={comment.id} className="mt-4 p-4 border border-gray-200 rounded-lg relative">
            <p className={`text-sm font-medium ${comment.user_id === user?.id ? 'text-left' : 'text-right'} text-gray-500`}>
              {comment.user_id === user?.id ? 'Vous' : (
                <Link to={`/profiles/${comment.user_id}`} className="text-blue-600 hover:underline">
                  {userNames[comment.user_id] || comment.user_id}
                </Link>
              )} le: {new Date(comment.created_at).toLocaleString()}
            </p>
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
