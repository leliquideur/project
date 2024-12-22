import React from 'react';
import type { TicketStatus } from '../types';

const statusColors: Record<TicketStatus, { bg: string; text: string }> = {
  new: { bg: 'bg-blue-100', text: 'text-blue-800' },
  assigned: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  in_progress: { bg: 'bg-purple-100', text: 'text-purple-800' },
  on_hold: { bg: 'bg-orange-100', text: 'text-orange-800' },
  resolved: { bg: 'bg-green-100', text: 'text-green-800' },
  closed: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

interface Props {
  status: TicketStatus;
}

export function TicketStatusBadge({ status }: Props) {
  const colors = statusColors[status];
  
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} capitalize`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}