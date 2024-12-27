import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './Sidebar';

export function Layout() {
  const location = useLocation();
  const { t } = useTranslation();
  const searchParams = new URLSearchParams(location.search);
  const error = searchParams.get('error');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="md:hidden flex justify-between p-4 bg-white shadow z-20 relative">
        <button onClick={() => setIsSidebarOpen(true)}>
          Menu
        </button>
      </header>
      <div className="flex flex-1 relative">
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <Sidebar className={`${isSidebarOpen ? 'block' : 'hidden'} md:block z-20`} />
        <main className="flex-1 p-6 relative">
          {error === 'invalid-path' && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              {t('layout.invalidPath')}
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}