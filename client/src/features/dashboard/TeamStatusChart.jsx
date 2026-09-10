import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { computeStatusCounts } from '../../utils/computeStatusCounts';

// Matches the --color-good/--color-neutral/--color-warn tokens in index.css,
// order matched to computeStatusCounts' dict insertion order: Completed,
// Not Started, In Progress.
const STATUS_COLORS = ['#22c55e', '#71717a', '#f59e0b'];

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
        <Tooltip
          contentStyle={{
            backgroundColor: '#1c1c20',
            border: '1px solid #27272a',
            borderRadius: '8px',
            color: '#f4f4f5',
          }}
          itemStyle={{ color: '#f4f4f5' }}
        />
        <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: '14px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default TeamStatusChart;
