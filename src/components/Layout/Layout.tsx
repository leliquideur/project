import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './Sidebar';

export function Layout() {
  const location = useLocation();
  const { t } = useTranslation();
  const searchParams = new URLSearchParams(location.search);
  const error = searchParams.get('error');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
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