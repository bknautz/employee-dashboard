import { useUsers } from '../../hooks/useUsers';
import { useTeams } from '../../hooks/useTeams';
import { useAssignTeam } from '../../hooks/useAssignTeam';
import { getErrorMessage } from '../../utils/getErrorMessage';

function EmployeeAssignment() {
  const { data: users, isLoading: usersLoading, isError: usersError } = useUsers();
  const { data: teams, isLoading: teamsLoading, isError: teamsError } = useTeams();
  const assignTeam = useAssignTeam();

  return (
    <div className="space-y-3">
      {(usersLoading || teamsLoading) && <p className="text-sm text-fg-muted">Loading...</p>}
      {(usersError || teamsError) && <p className="text-sm text-warn">Couldn't load users/teams.</p>}
      {assignTeam.isError && <p className="text-sm text-warn">{getErrorMessage(assignTeam.error)}</p>}

      {users?.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-fg-subtle">
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Email</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="px-4 py-2.5 font-medium">Current Team</th>
                <th className="px-4 py-2.5 font-medium">Assign To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-4 py-3 font-medium text-fg">{user.name}</td>
                  <td className="px-4 py-3 text-fg-muted">{user.email}</td>
                  <td className="px-4 py-3 capitalize text-fg-muted">{user.role}</td>
                  <td className="px-4 py-3 text-fg-muted">{user.team?.name ?? 'None'}</td>
                  <td className="px-4 py-3">
                    <select
                      defaultValue=""
                      disabled={assignTeam.isPending}
                      onChange={(e) => {
                        if (e.target.value) {
                          assignTeam.mutate({ userId: user._id, teamId: e.target.value });
                        }
                      }}
                      className="rounded-md border border-border bg-bg px-2 py-1 text-sm text-fg focus:border-accent focus:outline-none"
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
        </div>
      )}
    </div>
  );
}

export default EmployeeAssignment;
