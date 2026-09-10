import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { computeStatusCounts } from '../../utils/computeStatusCounts';

// Provisional status-progression palette (neutral -> in-progress -> good),
// order matched to computeStatusCounts' dict insertion order: Completed,
// Not Started, In Progress. Treat as a placeholder - not run through a
// contrast/colorblind-safety check.
const STATUS_COLORS = ['#22c55e', '#9ca3af', '#f59e0b'];

function TeamStatusChart({ members }) {
  // Pie's <Cell> is deprecated as of Recharts 3 (removed in 4.0) - the
  // replacement is embedding a `fill` on each datum directly rather than
  // rendering separate <Cell> children per slice.
  const data = computeStatusCounts(members).map((entry, index) => ({
    ...entry,
    fill: STATUS_COLORS[index % STATUS_COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" />
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default TeamStatusChart;
