//export type UserRole = 'client' | 'technician' | 'admin';
export type TicketStatus = 'new' | 'assigned' | 'in_progress' | 'on_hold' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketType = 'problem' | 'task' | 'service_request';


export enum UserRole {
  Client = "client",
  Technician = "technician",
  Admin = "admin"
}
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}
export interface FormDataProfile {
  full_name: string;
  role: UserRole;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface TicketStatusHistory {
  id: string;
  ticket_id: string;
  changed_by: string;
  old_status: TicketStatus;
  new_status: TicketStatus;
  created_at: string;
}

// Ajout de l'interface Comment
export interface Comment {
  id: string;
  ticket_id: string;
  author: string;
  content: string;
  created_at: string;
}
