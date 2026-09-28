import { useState } from 'react';
import { useTeams } from '../../hooks/useTeams';
import { useUsers } from '../../hooks/useUsers';
import { useCreateTeam } from '../../hooks/useCreateTeam';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { inputClass } from '../../utils/formStyles';

const emptyForm = { name: '', manager: '' };

function TeamManager() {
  const { data: teams, isLoading: teamsLoading, isError: teamsError } = useTeams();
  const { data: users, isLoading: usersLoading, isError: usersError } = useUsers();
  const createTeam = useCreateTeam();
  const [form, setForm] = useState(emptyForm);

  const managers = users?.filter((user) => user.role === 'manager') ?? [];
  const teamNameByManagerId = new Map((teams ?? []).map((team) => [team.manager?._id, team.name]));

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createTeam.mutate(form, {
      onSuccess: () => setForm(emptyForm),
    });
  };

  return (
    <div className="space-y-4">
      {(teamsLoading || usersLoading) && <p className="text-sm text-fg-muted">Loading...</p>}
      {(teamsError || usersError) && <p className="text-sm text-warn">Couldn't load teams.</p>}

      {teams?.length > 0 && (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {teams.map((team) => (
            <li key={team._id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-fg">{team.name}</p>
                <p className="text-xs text-fg-subtle">Managed by {team.manager?.name ?? 'Unknown'}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-lg border border-border bg-surface p-4"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">Create a Team</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            name="name"
            placeholder="Team name"
            value={form.name}
            onChange={handleChange}
            required
            className={inputClass}
          />
          <select
            name="manager"
            value={form.manager}
            onChange={handleChange}
            required
            className={inputClass}
          >
            <option value="" disabled>
              Select a manager
            </option>
            {managers.map((manager) => (
              <option key={manager._id} value={manager._id}>
                {manager.name}
                {teamNameByManagerId.has(manager._id) ? ' (already manages a team)' : ''}
              </option>
            ))}
          </select>
        </div>
        {managers.length === 0 && !usersLoading && (
          <p className="text-sm text-fg-subtle">
            No users with the manager role yet - promote a user to manager first.
          </p>
        )}
        <button
          type="submit"
          disabled={createTeam.isPending}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          Create Team
        </button>
        {createTeam.isError && (
          <p className="text-sm text-warn">{getErrorMessage(createTeam.error)}</p>
        )}
      </form>
    </div>
  );
}

export default TeamManager;
