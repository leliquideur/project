import React from "react";
import { Link } from "react-router-dom";
import { BarChart3, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { getTickets } from "../../lib/tickets";
import { Ticket } from "../../types";

export  function Dashboard() {
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadTickets() {
      try {
        const data = await getTickets();
        setTickets(data);
      } catch (error) {
        console.error("Error loading tickets:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadTickets();
  }, []);

  const stats = {
    pending: tickets.filter((t) => t.status === "in_progress").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    highPriority: tickets.filter((t) => t.priority === "high").length,
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Tickets"
          value={stats.pending}
          icon={Clock}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={BarChart3}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          title="High Priority"
          value={stats.highPriority}
          icon={AlertCircle}
          color="text-red-600"
          bgColor="bg-red-50"
        />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Tickets</h2>
          <Link
            to="/tickets"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all
          </Link>
        </div>
        <div className="space-y-4">
          {tickets.slice(0, 5).map((ticket) => (
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

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${bgColor} rounded-md p-3`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
