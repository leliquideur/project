
{/**
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
 */}

 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { Signup } from './pages/loginAnSignup/Signup';
import { Login } from './pages/loginAnSignup/Login';
import { TicketList } from './pages/ticket/TicketList';
import TicketDetail  from './pages/ticket/TicketDetail';
import { CreateTicket } from './pages/ticket/CreateTicket';
import { Profiles } from './pages/profile/Profiles';
import { ProfileDetails } from './pages/profile/ProfileDetails';
import { Settings } from "./pages/Settings";
import ErrorBoundary from './components/ErrorBoundary';
import React from 'react';
import { useAuth } from "./hooks/useAuth";
import { Loading } from "./components/Loading";

function App() {


  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route path="/" element={<HomeRedirectLogin />} />
              <Route path="/signup" element={<HomeRedirectsignup />} />
              <Route path="/login" element={<HomeRedirectLogin />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tickets" element={<TicketList />} />
                <Route path="/tickets/:id" element={<TicketDetail />} />
                <Route path="/tickets/new" element={<CreateTicket />} />
                <Route path="/profiles" element={<Profiles />} />
                <Route path="/profiles/:id" element={<ProfileDetails />} />
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
    </ErrorBoundary>
  );
}

function HomeRedirectLogin() {
  const { user, loading } = useAuth();

  if (loading) {
    return Loading();
  }

  return user ? <Navigate to="/dashboard" /> : <Login />;
}
function HomeRedirectsignup() {
  const { user, loading } = useAuth();

  if (loading) {
    return Loading();
  }

  return user ? <Navigate to="/dashboard" /> : <Signup />;
}


export default App;