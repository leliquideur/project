import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Layout() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const error = searchParams.get('error');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          {error === 'invalid-path' && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              Chemin erroné. Vous avez été redirigé vers la page d'accueil.
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}