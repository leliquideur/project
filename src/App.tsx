/**
 * The main application component that sets up the routing and authentication context.
 *
 * @component
 *
 * @example
 * // Usage in a React application
 * import React from 'react';
 * import ReactDOM from 'react-dom';
 * import App from './App';
 *
 * ReactDOM.render(<App />, document.getElementById('root'));
 *
 * @returns {JSX.Element} The rendered application component.
 *
 * @remarks
 * This component uses `react-router-dom` for client-side routing and `AuthProvider` for managing authentication state.
 * It defines routes for login, dashboard, ticket list, ticket creation, and ticket details.
 * The `ProtectedRoute` component is used to guard routes that require authentication.
 *
 * @see {@link https://reactrouter.com/} for more information about React Router.
 * @see {@link ./components/AuthProvider} for more information about the authentication provider.
 * @see {@link ./components/pages/Dashboard} for the dashboard page component.
 * @see {@link ./components/pages/Login} for the login page component.
 * @see {@link ./components/pages/TicketList} for the ticket list page component.
 * @see {@link ./components/pages/CreateTicket} for the ticket creation page component.
 * @see {@link ./components/pages/TicketDetail} for the ticket detail page component.
 * @see {@link ./components/components/ProtectedRoute} for the protected route component.
 */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { Signup } from './pages/loginAnSignup/Signup';
import { Login } from './pages/loginAnSignup/Login';
import { TicketList } from './pages/ticket/listTickets/TicketList';
import { TicketDetail } from './pages/ticket/listTickets/TicketDetail';
import { CreateTicket } from './pages/ticket/newTicketAndModify/CreateTicket';
import { Profiles } from './pages/user/Profiles';
import { ProfileDetails } from './pages/user/ProfileDetails';
import { Settings } from "./pages/Settings";

// Import temporaire, à supprimer en production
import { ForcedTickets } from './forced/TicketForced';

function App() {
  const forcedTickets = ForcedTickets(); // À supprimer après les tests

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profiles" element={<Profiles />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/profiles/:id" element={<ProfileDetails />} />
              <Route
                path="/dashboard"
                element={<Dashboard tickets={forcedTickets} />}
              />
              <Route path="/tickets" element={<TicketList />} />
              <Route path="/tickets/new" element={<CreateTicket />} />
              <Route path="/tickets/:id" element={<TicketDetail />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route
              path="*"
              element={<Navigate to="/?error=invalid-path" />}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;