import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { loadTickets } from '../services/ticketsService';
import { Ticket } from "../types";
import StatCard from "../components/StatCard";
import { Loading } from "../components/Loading";

export const Dashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    loadTickets(setTickets, setIsLoading, setError);
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

  const handleFilterClick = (filterType: string | null) => {
    setFilter((prevFilter) => (prevFilter === filterType ? null : filterType));
  };

  const renderStatCard = (title: string, value: number, icon: React.ElementType, color: string, bgColor: string, filterType: string | null) => (
    <StatCard
      title={title}
      value={value}
      icon={icon}
      color={color}
      bgColor={filter === filterType ? bgColor.replace('50', '200') : bgColor}
      onClick={() => handleFilterClick(filterType)}
    />
  );

  if (isLoading) {
    return <div className="text-center py-12">{Loading()}</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {renderStatCard(
          "Haute Priorité",
          stats.highPriority,
          AlertCircle,
          "text-red-600",
          "bg-red-50",
          "high"
        )}
        {renderStatCard(
          "Nouveaux",
          stats.new,
          Clock,
          "text-yellow-600",
          "bg-yellow-50",
          "new"
        )}
        {renderStatCard(
          "En Progression",
          stats.inProgress,
          BarChart3,
          "text-blue-600",
          "bg-blue-50",
          "in_progress"
        )}
        {renderStatCard(
          "Résolus",
          stats.resolved,
          CheckCircle2,
          "text-green-600",
          "bg-green-50",
          "resolved"
        )}
        {renderStatCard(
          "Tous",
          tickets.length,
          XCircle,
          "text-red-600",
          "bg-purple-50",
          null
        )}
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
              className={`block p-4 rounded-lg border border-gray-200 hover:border-primary-300  ${
                ticket.status === "new"
                  ? "text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
                  : ticket.status === "in_progress"
                  ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                  : ticket.status === "resolved"
                  ? "text-green-600 bg-green-50 hover:bg-green-100"
                  : "text-gray-600 bg-gray-50 hover:bg-gray-100"
              }`}
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
