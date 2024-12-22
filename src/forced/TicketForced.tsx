import { Ticket } from "../types";


export function ForcedTickets() {
  const forcedTickets: Ticket[] = [
    {
      id: "1",
      status: "in_progress",
      priority: "high",
      title: "Ticket 1",
      description:
        "Ticket N°12345 Sujet: Problème de redémarrage automatique de l'automate",
      type: "problem",
      created_by: "User1",
      created_at: Date.now().toString(),
      updated_at: Date.now().toString(),
      assigned_to: null,
    },
    {
      id: "2",
      status: "resolved",
      priority: "low",
      title: "Ticket 2",
      description: "Description 2",
      type: "task",
      created_by: "User2",
      created_at: Date.now().toString(),
      updated_at: Date.now().toString(),
      assigned_to: null,
    },
    {
      id: "3",
      status: "new",
      priority: "medium",
      title: "Ticket 3",
      description: "Description 3",
      type: "service_request",
      created_by: "User2",
      created_at: Date.now().toString(),
      updated_at: Date.now().toString(),
      assigned_to: "chris",
    },
    {
      id: "4",
      status: "new",
      priority: "medium",
      title: "Ticket 4",
      description: "Description 3",
      type: "service_request",
      created_by: "User2",
      created_at: Date.now().toString(),
      updated_at: Date.now().toString(),
      assigned_to: "chris",
    },
    {
      id: "5",
      status: "new",
      priority: "medium",
      title: "Ticket 5",
      description: "Description 3",
      type: "service_request",
      created_by: "User2",
      created_at: Date.now().toString(),
      updated_at: Date.now().toString(),
      assigned_to: "chris",
    },
    {
      id: "6",
      status: "new",
      priority: "medium",
      title: "Ticket 6",
      description: "Description 3",
      type: "service_request",
      created_by: "User2",
      created_at: Date.now().toString(),
      updated_at: Date.now().toString(),
      assigned_to: "chris",
    },
    // Ajoutez d'autres tickets forcés ici
  ];

  return forcedTickets;
}