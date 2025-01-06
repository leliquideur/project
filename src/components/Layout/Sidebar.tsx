import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Ticket, PlusCircle, Settings, Users, Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import React from 'react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user } = useAuth(); // Déstructuration pour obtenir user du contexte
  const { signOut } = useAuthStore();
  const { i18n, t } = useTranslation();

  const isStaff = user?.role === 'technician' || user?.role === 'admin';
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <aside className={`bg-gray-900 text-white w-64 min-h-screen p-4 ${className}`}>
      <div className="mb-8">
        <img
          src="https://www.heurtiersas.com/images/logo.png"
          alt="Heurtier fiX"
        />
        <h3 className="text-2xl font-bold">Heurtier fiX</h3>
        <p className="text-sm">Quand chaque minute compte.</p>
      </div>
      <span className="block h-px bg-gray-700 my-4" />

      {/* Début du contenu déplacé depuis Header */}
      <div className="mb-4">
        <span className="text-gray-200 block">
          {t("header.welcome")}, {user?.full_name || user?.email}
        </span>
        <span className="px-2 py-1 rounded-full text-xs capitalize bg-blue-100 text-blue-800 inline-block mt-2">
          {user ? (
            <span>
              {t("header.role")}: {user.role}
            </span>
          ) : (
            <span>{t("header.disconnected")}</span>
          )}
        </span>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => changeLanguage("fr")}
            className="text-sm text-gray-200 hover:text-white"
          >
            Français
          </button>
          <button
            onClick={() => changeLanguage("en")}
            className="text-sm text-gray-200 hover:text-white"
          >
            English
          </button>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            className="p-2 hover:bg-gray-800 rounded-full"
            aria-label={t("header.notifications")}
          >
            <Bell className="w-5 h-5 text-gray-200" />
          </button>
          <button
            onClick={signOut}
            className="p-2 hover:bg-gray-800 rounded-full"
            aria-label={t("header.logout")}
          >
            <LogOut className="w-5 h-5 text-gray-200" />
          </button>
        </div>
      </div>
      {/* Fin du contenu déplacé depuis Header */}

      <span className="block h-px bg-gray-700 my-4" />

      <nav className="space-y-2">
        <NavLink
          to="/Dashboard"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800 ${
              isActive ? "bg-gray-800" : ""
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
              isActive ? "bg-gray-800" : ""
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
              isActive ? "bg-gray-800" : ""
            }`
          }
        >
          <PlusCircle size={20} />
          <span>Nouveau Ticket</span>
        </NavLink>

        <NavLink
          to="/profiles"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800 ${
              isActive ? "bg-gray-800" : ""
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
                isActive ? "bg-gray-800" : ""
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
export default Sidebar;