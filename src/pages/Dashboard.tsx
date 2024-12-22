import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { fetchTickets } from '../lib/ticketService';
import { Ticket } from "../types";
import StatCard from "../components/StatCard";

export const Dashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    const getTickets = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, count } = await fetchTickets('created_at', 'desc', 1, 100); // Ajustez les paramètres si nécessaire
        setTickets(data);
      } catch (err: any) {
        setError('Erreur lors de la récupération des tickets');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    getTickets();
  }, []);

  const stats = {
    new: tickets.filter((t) => t.status === "new").length, 
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    highPriority: tickets.filter((t) => t.priority === "high").length,
  };

  const filteredTickets = filter
    ? filter === "high"
      ? tickets.filter((t) => t.priority === "high")
      : tickets.filter((t) => t.status === filter)
    : tickets.slice(0, 10);

  const handleFilterClick = (filterType: string) => {
    setFilter((prevFilter) => (prevFilter === filterType ? null : filterType));
  };

  if (isLoading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Haute Priorité"
          value={stats.highPriority}
          icon={AlertCircle}
          color="text-red-600"
          bgColor={filter === "high" ? "bg-red-200" : "bg-red-50"}
          onClick={() => handleFilterClick("high")}
        />
        <StatCard
          title="Nouveaux"
          value={stats.new}
          icon={Clock}
          color="text-yellow-600"
          bgColor={filter === "new" ? "bg-yellow-200" : "bg-yellow-50"}
          onClick={() => handleFilterClick("new")}
        />
        <StatCard
          title="En Progression"
          value={stats.inProgress}
          icon={BarChart3}
          color="text-blue-600"
          bgColor={filter === "in_progress" ? "bg-blue-200" : "bg-blue-50"}
          onClick={() => handleFilterClick("in_progress")}
        />
        <StatCard
          title="Résolus"
          value={stats.resolved}
          icon={CheckCircle2}
          color="text-green-600"
          bgColor={filter === "resolved" ? "bg-green-200" : "bg-green-50"}
          onClick={() => handleFilterClick("resolved")}
        />
        <StatCard
          title="Sans filtre"
          value={null}
          icon={XCircle}
          color="text-red-600"
          bgColor={filter === null ? "bg-purple-200" : "bg-purple-50"}
          onClick={() => setFilter(null)}
        />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Tickets</h2>
        </div>
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/tickets/${ticket.id}`}
              className="block p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-gray-50"
            >
              <div className="flex justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  {ticket.title}
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    ticket.priority === "high"
                      ? "bg-red-100 text-red-800"
                      : ticket.priority === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {ticket.priority}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {ticket.description.slice(0, 100)}...
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
