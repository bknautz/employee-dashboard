import { useAuth } from '../../context/useAuth';
import { useMyTeamProgress } from '../../hooks/useMyTeamProgress';

function ManagerDashboardPage() {
  const { user, logout } = useAuth();
  const { data, isLoading, isError, error } = useMyTeamProgress();

  const noTeam = error?.response?.status === 404;

  return (
    <div>
      <h1>Manager Dashboard</h1>
      <p>
        Logged in as {user?.name} ({user?.role})
      </p>
      <button type="button" onClick={logout}>
        Log out
      </button>

      {isLoading && <p>Loading your team...</p>}

      {isError && noTeam && <p>You don't manage a team yet.</p>}
      {isError && !noTeam && <p>Couldn't load your team: {error.message}</p>}

      {data && (
        <>
          <h2>{data.team.name}</h2>

          {data.members.length === 0 && <p>No employees on this team yet.</p>}

          {data.members.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Courses</th>
                </tr>
              </thead>
              <tbody>
                {data.members.map((member) => (
                  <tr key={member.user.id}>
                    <td>{member.user.name}</td>
                    <td>{member.user.email}</td>
                    <td>
                      {member.enrollments.length === 0 && 'Not enrolled in anything yet'}
                      {member.enrollments.length > 0 && (
                        <ul>
                          {member.enrollments.map((enrollment) => (
                            <li key={enrollment._id}>
                              {enrollment.course.title}: {enrollment.status} (
                              {enrollment.progressPercent}%)
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default ManagerDashboardPage;
