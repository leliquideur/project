import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Ticket, PlusCircle, Settings, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const isStaff = user?.role === 'technician' || user?.role === 'admin';

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Support System</h1>
      </div>
      
      <nav className="space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800 ${
              isActive ? 'bg-gray-800' : ''
            }`
          }
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/tickets"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800 ${
              isActive ? 'bg-gray-800' : ''
            }`
          }
        >
          <Ticket size={20} />
          <span>Tickets</span>
        </NavLink>

        <NavLink
          to="/tickets/new"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800 ${
              isActive ? 'bg-gray-800' : ''
            }`
          }
        >
          <PlusCircle size={20} />
          <span>New Ticket</span>
        </NavLink>

        <NavLink
          to="/profiles"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800 ${
              isActive ? 'bg-gray-800' : ''
            }`
          }
        >
          <Users size={20} />
          <span>Profiles</span>
        </NavLink>

        {isStaff && (
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800 ${
                isActive ? 'bg-gray-800' : ''
              }`
            }
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        )}
      </nav>
    </aside>
  );
}