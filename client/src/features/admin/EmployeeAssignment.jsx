import { useUsers } from '../../hooks/useUsers';
import { useTeams } from '../../hooks/useTeams';
import { useAssignTeam } from '../../hooks/useAssignTeam';
import { getErrorMessage } from '../../utils/getErrorMessage';

function EmployeeAssignment() {
  const { data: users, isLoading: usersLoading, isError: usersError } = useUsers();
  const { data: teams, isLoading: teamsLoading, isError: teamsError } = useTeams();
  const assignTeam = useAssignTeam();

  return (
    <section>
      <h3>Assign Employees to Teams</h3>

      {(usersLoading || teamsLoading) && <p>Loading...</p>}
      {(usersError || teamsError) && <p>Couldn't load users/teams.</p>}

      {assignTeam.isError && <p>{getErrorMessage(assignTeam.error)}</p>}

      {users?.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Current Team</th>
              <th>Assign To</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.team?.name ?? 'None'}</td>
                <td>
                  <select
                    defaultValue=""
                    disabled={assignTeam.isPending}
                    onChange={(e) => {
                      if (e.target.value) {
                        assignTeam.mutate({ userId: user._id, teamId: e.target.value });
                      }
                    }}
                  >
                    <option value="" disabled>
                      Select a team
                    </option>
                    {teams?.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default EmployeeAssignment;
