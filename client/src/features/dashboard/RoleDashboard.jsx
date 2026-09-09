import { useAuth } from '../../context/useAuth';
import EmployeeDashboardPage from './EmployeeDashboardPage';
import ManagerDashboardPage from './ManagerDashboardPage';
import AdminDashboardPage from '../admin/AdminDashboardPage';

function RoleDashboard() {
  const { user } = useAuth();

  if (user?.role === 'admin') return <AdminDashboardPage />;
  if (user?.role === 'manager') return <ManagerDashboardPage />;
  return <EmployeeDashboardPage />;
}

export default RoleDashboard;
