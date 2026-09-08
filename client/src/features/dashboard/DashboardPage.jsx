import { useAuth } from '../../context/useAuth';

function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Logged in as {user?.name} ({user?.role})</p>
      <button type="button" onClick={logout}>
        Log out
      </button>
      <p>Placeholder - wire this up to TanStack Query once auth is working.</p>
    </div>
  );
}

export default DashboardPage;
