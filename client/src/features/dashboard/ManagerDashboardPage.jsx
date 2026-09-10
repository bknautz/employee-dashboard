import { PieChart as PieChartIcon, Users } from 'lucide-react';
import { useMyTeamProgress } from '../../hooks/useMyTeamProgress';
import AppShell from '../../components/AppShell';
import StatusBadge from '../../components/StatusBadge';
import TeamStatusChart from './TeamStatusChart';

const NAV_ITEMS = [
  { label: 'Overview', icon: PieChartIcon, href: '#overview' },
  { label: 'Team', icon: Users, href: '#team' },
];

function ManagerDashboardPage() {
  const { data, isLoading, isError, error } = useMyTeamProgress();

  const noTeam = error?.response?.status === 404;

  return (
    <AppShell title={data ? data.team.name : 'Team Progress'} navItems={NAV_ITEMS}>
      {isLoading && <p className="text-sm text-fg-muted">Loading your team...</p>}

      {isError && noTeam && <p className="text-sm text-fg-muted">You don't manage a team yet.</p>}
      {isError && !noTeam && <p className="text-sm text-warn">Couldn't load your team: {error.message}</p>}

      {data && data.members.length === 0 && (
        <p className="text-sm text-fg-muted">No employees on this team yet.</p>
      )}

      {data && data.members.length > 0 && (
        <>
          <section id="overview" className="mb-10 scroll-mt-8">
            <h2 className="mb-3 text-sm font-medium text-fg-muted">Overview</h2>
            <div className="rounded-lg border border-border bg-surface p-4">
              <TeamStatusChart members={data.members} />
            </div>
          </section>

          <section id="team" className="scroll-mt-8">
            <h2 className="mb-3 text-sm font-medium text-fg-muted">Team</h2>
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-fg-subtle">
                    <th className="px-4 py-2.5 font-medium">Employee</th>
                    <th className="px-4 py-2.5 font-medium">Email</th>
                    <th className="px-4 py-2.5 font-medium">Courses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.members.map((member) => (
                    <tr key={member.user.id}>
                      <td className="px-4 py-3 font-medium text-fg">{member.user.name}</td>
                      <td className="px-4 py-3 text-fg-muted">{member.user.email}</td>
                      <td className="px-4 py-3">
                        {member.enrollments.length === 0 && (
                          <span className="text-fg-subtle">Not enrolled in anything yet</span>
                        )}
                        {member.enrollments.length > 0 && (
                          <ul className="space-y-1.5">
                            {member.enrollments.map((enrollment) => (
                              <li key={enrollment._id} className="flex items-center gap-2">
                                <span className="text-fg">{enrollment.course.title}</span>
                                <StatusBadge status={enrollment.status} />
                                <span className="text-fg-subtle">{enrollment.progressPercent}%</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}

export default ManagerDashboardPage;
