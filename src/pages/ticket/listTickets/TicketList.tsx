import React, { useEffect, useState } from "react";
import supabase from "../../../lib/supabaseClient";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";


interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "problem" | "task" | "service_request";
  type: string;
  created_at: string;
}

export function TicketList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Nouveaux états pour la pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const from = (currentPage - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, error, count } = await supabase
          .from("tickets")
          .select("*", { count: 'exact' })
          .order(sortField, { ascending: sortOrder === 'asc' })
          .range(from, to);

        if (error) {
          setError(t("Ticket.errorFetchingTickets"));
          console.error(error);
        } else {
          setTickets(data as Ticket[]);
          setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
        }
      } catch (err) {
        setError(t("Ticket.errorFetchingTickets"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [sortField, sortOrder, currentPage, t]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <div>{t("Ticket.loading")}</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50 items justify-center p-2">
      <div className="overflow-x-auto w-90% p-4">
        <h1 className="text-2xl font-bold mb-4 text-center p-3">
          {t("Ticket.title")}
        </h1>
        <table className="w-4/5 mx-auto bg-white mx-auto p-3">
          <thead>
            <tr>
              <th
                className="py-2 cursor-pointer text-center"
                onClick={() => handleSort("title")}
              >
                {t("Ticket.title")}{" "}
                {sortField === "title" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th
                className="py-2 cursor-pointer text-center"
                onClick={() => handleSort("description")}
              >
                {t("Ticket.description")}{" "}
                {sortField === "description"
                  ? sortOrder === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </th>
              <th
                className="py-2 cursor-pointer text-center"
                onClick={() => handleSort("priority")}
              >
                {t("Ticket.priority")}{" "}
                {sortField === "priority"
                  ? sortOrder === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </th>
              <th
                className="py-2 cursor-pointer text-center"
                onClick={() => handleSort("status")}
              >
                {t("Ticket.status")}{" "}
                {sortField === "status"
                  ? sortOrder === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </th>
              <th
                className="py-2 cursor-pointer text-center"
                onClick={() => handleSort("type")}
              >
                {t("Ticket.type")}{" "}
                {sortField === "type" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th
                className="py-2 cursor-pointer text-center"
                onClick={() => handleSort("created_at")}
              >
                {t("Ticket.createdAt")}{" "}
                {sortField === "created_at"
                  ? sortOrder === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="text-center p-3 cursor-pointer hover:bg-gray-100"
                onClick={() => navigate(`/ticket/${ticket.id}`)}
              >
                <td className="border px-4 py-2 truncate w-10">
                  {ticket.title.length > 30
                    ? `${ticket.title.substring(0, 30)}...`
                    : ticket.title}
                </td>
                <td className="border px-4 py-2 truncate w-10 truncate overflow-ellipsis overflow-hidden">
                  {ticket.description.length > 30
                    ? `${ticket.description.substring(0, 30)}...`
                    : ticket.description}
                </td>
                <td className="border px-4 py-2 truncate w-30">
                  {t(`Ticket.priority_${ticket.priority}`)}
                </td>
                <td className="border px-4 py-2 truncate w-30">
                  {t(`Ticket.status_${ticket.status}`)}
                </td>
                <td className="border px-4 py-2 truncate w-30">
                  {t(`Ticket.type_${ticket.type}`)}
                </td>
                <td className="border px-4 py-2 truncate w-30">
                  {new Date(ticket.created_at).toLocaleString(
                    t("Ticket.date"),
                    {
                      dateStyle: "long",
                      timeStyle: "long",
                    }
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center bottom-3 w-full bg-white shadow mt-4 p-3">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white"
            }`}
          >
            {t("Ticket.previous")}
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => handlePageClick(page)}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === page
                    ? "bg-blue-700 text-white"
                    : "bg-blue-500 text-white"
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === totalPages
                ? "bg-gray-300"
                : "bg-blue-500 text-white"
            }`}
          >
            {t("Ticket.next")}
          </button>
        </div>
      </div>
    </div>
  );
}
