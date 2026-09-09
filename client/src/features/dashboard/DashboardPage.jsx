import { useAuth } from '../../context/useAuth';
import { useMyEnrollments } from '../../hooks/useMyEnrollments';

function DashboardPage() {
  const { user, logout } = useAuth();
  const { data: enrollments, isLoading, isError, error } = useMyEnrollments();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>
        Logged in as {user?.name} ({user?.role})
      </p>
      <button type="button" onClick={logout}>
        Log out
      </button>

      <h2>My Courses</h2>

      {isLoading && <p>Loading your courses...</p>}

      {isError && <p>Couldn't load your courses: {error.message}</p>}

      {!isLoading && !isError && enrollments?.length === 0 && (
        <p>You aren't enrolled in any courses yet.</p>
      )}

      {enrollments?.length > 0 && (
        <ul>
          {enrollments.map((enrollment) => (
            <li key={enrollment._id}>
              <strong>{enrollment.course.title}</strong> ({enrollment.course.provider})
              <br />
              Status: {enrollment.status} - {enrollment.progressPercent}% complete
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DashboardPage;
