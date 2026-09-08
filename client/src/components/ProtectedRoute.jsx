import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function ProtectedRoute() {
  // TODO: adjust this to match whatever AuthContext actually exposes for
  // "is someone logged in" (e.g. `user`, `accessToken`, an `isAuthenticated` flag).
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
