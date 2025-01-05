import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  getTicketById,
  getCommentsByTicketId,
  postCommentReply,
  getUserById,
  getLastStatusHistory,
  fetchTicketData,
  deleteComment,
} from "../../api/ticketsService";
import { getFullNameById } from '../../api/profilesService';
import { Ticket, Comment, TicketStatusHistory } from "../../types";
import TextAreaWithCounter from '../../components/TextAreaWithCounter';
import { handleCloseTicket } from "../../api/ticketsService";
import { AuthContext } from '../../contexts/AuthContext';

interface ExtendedTicketStatusHistory extends TicketStatusHistory {
  full_name: string;
}

/**
 * Component for displaying the details of a ticket, including its comments and the ability to reply.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 *
 * @remarks
 * This component fetches the ticket details and comments from the server using the ticket ID from the URL parameters.
 * It allows the user to reply to the ticket and paginate through the comments.
 *
 * @example
 * ```tsx
 * <TicketDetail />
 * ```
 *
 * @requires useParams
 * @requires useNavigate
 * @requires useState
 * @requires useEffect
 * @requires useAuth
 * @requires getFullNameById
 * @requires getCommentsByTicketId
 * @requires getTicketById
 * @requires getUserById
 * @requires postCommentReply
 * @requires closeTicket
 *
 * @function
 * @name TicketDetail
 *
 * @typedef {Object} Ticket
 * @property {string} id - The ID of the ticket.
 * @property {string} title - The title of the ticket.
 * @property {string} description - The description of the ticket.
 * @property {string} created_by - The ID of the user who created the ticket.
 * @property {string} created_at - The creation date of the ticket.
 *
 * @typedef {Object} Comment
 * @property {string} id - The ID of the comment.
 * @property {string} user_id - The ID of the user who made the comment.
 * @property {string} content - The content of the comment.
 * @property {string} created_at - The creation date of the comment.
 *
 * @typedef {Object} User
 * @property {string} id - The ID of the user.
 * @property {string} full_name - Le nom complet de l'utilisateur.
 * @property {string} email - The email of the user.
 *
 * @typedef {Object} AuthContext
 * @property {User} user - L'utilisateur authentifié.
 *
 * @param {Object} props - The component props.
 * @param {string} props.id - The ID of the ticket from the URL parameters.
 * @param {Function} props.navigate - The navigation function to redirect the user.
 * @param {Ticket | null} props.ticket - The ticket details.
 * @param {Function} props.setTicket - The function to set the ticket details.
 * @param {Comment[]} props.comments - The list of comments for the ticket.
 * @param {Function} props.setComments - The function to set the comments.
 * @param {boolean} props.loading - The loading state of the component.
 * @param {Function} props.setLoading - The function to set the loading state.
 * @param {string | null} props.error - The error message, if any.
 * @param {Function} props.setError - The function to set the error message.
 * @param {User | null} props.createdByUser - The user who created the ticket.
 * @param {Function} props.setCreatedByUser - The function to set the user who created the ticket.
 * @param {string} props.replyText - The text of the reply.
 * @param {Function} props.setReplyText - The function to set the reply text.
 * @param {number} props.currentPage - The current page of comments.
 * @param {Function} props.setCurrentPage - The function to set the current page of comments.
 * @param {Record<string, string>} props.userNames - The map of user IDs to user names.
 * @param {Function} props.setUserNames - The function to set the user names.
 * @param {number} props.commentsPerPage - The number of comments per page.
 * @param {number} props.maxReplyLength - The maximum length of the reply text.
 * @param {AuthContext} props.auth - The authentication context.
 */
const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [createdByUser, setCreatedByUser] = useState<{
    full_name: string;
    email: string;
  } | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [lastStatusHistory, setLastStatusHistory] =
    useState<ExtendedTicketStatusHistory | null>(null);
  const commentsPerPage = 5;
  const maxReplyLength = 1000;
  const authContext = useContext(AuthContext); // Déstructuration pour obtenir user du contexte
  const user = authContext?.user;
  const currentUserId = user?.id;

  const fetchUserNames = async (userIds: string[]) => {
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

    setUserNames((prev) => ({ ...prev, ...userNamesMap }));
  };

  const refreshComments = async () => {
    try {
      const commentsData = await getCommentsByTicketId(id!);
      setComments(commentsData);
      setReplyText("");

      const userIds = commentsData.map((comment) => comment.user_id);
      await fetchUserNames(userIds);
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de la mise à jour des commentaires.");
    }
  };

  useEffect(() => {
    if (!id) {
      console.error("ID du ticket manquant.");
      setError("ID du ticket manquant.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        //if(process.env.NODE_ENV === 'development') console.log(`Fetching ticket with ID: ${id}`);
        const ticketData = await getTicketById(id);
        setTicket(ticketData);

        const userData = await getUserById(ticketData.created_by);
        setCreatedByUser(userData);


        await refreshComments();
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchHistory = async () => {
      const history = await getLastStatusHistory(id!);
      setLastStatusHistory(history);
    };
    fetchHistory();
  }, [id]);

  const handleReplyChange = (text: string) => {
    setReplyText(text);
  };

  const handleReplySubmit = async () => {
    if (!replyText) return;

    try {
      await postCommentReply(id!, replyText, user?.id || "");
      await refreshComments();
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de l'envoi de la réponse.");
    }
  };

  // Fonction pour gérer le changement de page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = comments.slice(
    indexOfFirstComment,
    indexOfLastComment
  );

  if (loading) return <div className="text-center py-12">Chargement...</div>;
  if (error)
    return <div className="text-center py-12 text-red-500">{error}</div>;

  const handleClose = async () => {
    try {
      setLoading(true);
      if (user) {
        await handleCloseTicket(id!, user.id); // Passez user.id ici
      } else {
        setError("User not authenticated.");
      }
      if (user) {
        const { ticketData, commentsData } = await fetchTicketData(
          id!,
          user.id
        );
        setTicket(ticketData);
        setComments(commentsData);
        const history = await getLastStatusHistory(id!);
        setLastStatusHistory(history);
        console.log("Ticket closed successfully", ticketData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

const handleDelete = async (commentId: string) => {
  try {
    await deleteComment(commentId);
    // Mettre à jour l'état des commentaires après suppression
    setComments((prevComments) =>
      prevComments.filter((comment) => comment.id !== commentId)
    );
  } catch (error) {
    console.error("Erreur lors de la suppression du commentaire:", error);
    // Optionnel : afficher une notification d'erreur à l'utilisateur
  }
};

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        {lastStatusHistory && ticket?.status == "resolved" && (
          <div className="mb-4 p-4 bg-gray-100 border rounded">
            <h3 className="text-md text-center font-semibold">
              Ticket résolut le{" "}
              {new Date(lastStatusHistory.created_at).toLocaleString()} par{" "}
              {lastStatusHistory.full_name}
            </h3>
          </div>
        )}
        <h1 className="text-lg font-medium text-gray-900">
          Détails du Ticket{" "}
          {!(ticket?.status == "resolved") && (
            <button
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 float-right"
              onClick={handleClose}
            >
              Clôturer le ticket
            </button>
          )}
        </h1>
        {ticket && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {ticket.status} : {ticket.title}
            </h2>
            <p className="mt-2 text-gray-600">{ticket.description}</p>
            <p className="mt-2 text-gray-500">
              Créé par: {createdByUser?.full_name} ({createdByUser?.email})
            </p>
            <p className="mt-2 text-gray-500">
              Date de création: {new Date(ticket.created_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>
      {!(ticket?.status == "resolved") && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">
            Répondre au ticket
          </h3>
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
      )}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900">Commentaires</h2>
        {currentComments.map((comment, index) => (
          <div
            key={comment.id}
            className="mt-4 p-4 border border-gray-200 rounded-lg relative"
          >
            <p
              className={`text-sm font-medium ${
                comment.user_id === user?.id ? "text-left" : "text-right"
              } text-gray-500`}
            >
              {comment.user_id === user?.id ? (
                "Vous"
              ) : (
                <Link
                  to={`/profiles/${comment.user_id}`}
                  className="text-blue-600 hover:underline"
                >
                  {comment.user?.full_name}
                </Link>
              )}
            </p>
            <p className="mt-1 text-gray-700">{comment.content}</p>
            {index === 0 &&
              comment.user_id === currentUserId &&
              currentPage === 1 && (
                <button
                  className="absolute top-0 right-2 mt-0 ml-0 text-red-500 hover:text-red-700"
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Êtes-vous sûr de vouloir supprimer ce commentaire ?"
                      )
                    ) {
                      await handleDelete(comment.id);
                    }
                  }}
                >
                  &times;
                </button>
              )}
          </div>
        ))}

        <div className="mt-4 flex justify-center space-x-2">
          {Array.from(
            { length: Math.ceil(comments.length / commentsPerPage) },
            (_, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-md ${
                  currentPage === index + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
