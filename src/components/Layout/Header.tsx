import React from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="flex items-center justify-between bg-gray-800 text-white p-4">
      <button
        className="md:hidden focus:outline-none"
        onClick={onMenuClick}
      >
        <Menu size={24} />
      </button>
      <h1 className="text-xl font-bold">Heurtier fiX</h1>
      {/* Ajoutez d'autres éléments du header si nécessaire */}
    </header>
  );
};

export default Header;