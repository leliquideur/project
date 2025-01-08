import React from 'react';
import type { TicketPriority } from '../../types';

const priorityColors: Record<TicketPriority, { bg: string; text: string }> = {
  low: { bg: 'bg-gray-100', text: 'text-gray-800' },
  medium: { bg: 'bg-blue-100', text: 'text-blue-800' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800' },
  //urgent: { bg: 'bg-red-100', text: 'text-red-800' },
};

interface Props {
  priority: TicketPriority;
}

export function TicketPriorityBadge({ priority }: Props) {
  const colors = priorityColors[priority];
  
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} capitalize`}
    >
      {priority}
    </span>
  );
}