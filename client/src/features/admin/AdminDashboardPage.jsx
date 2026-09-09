import { useAuth } from '../../context/useAuth';
import CourseManager from './CourseManager';
import LearningPathManager from './LearningPathManager';
import EmployeeAssignment from './EmployeeAssignment';

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

      <CourseManager />
      <LearningPathManager />
      <EmployeeAssignment />
    </div>
  );
}

export default AdminDashboardPage;
