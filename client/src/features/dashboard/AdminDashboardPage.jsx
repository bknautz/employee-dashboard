import { useAuth } from '../../context/useAuth';

function AdminDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>
        Logged in as {user?.name} ({user?.role})
      </p>
      <button type="button" onClick={logout}>
        Log out
      </button>
      <p>Placeholder - manage courses/paths, assign employees to teams.</p>
    </div>
  );
}

export default AdminDashboardPage;
