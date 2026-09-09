import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { computeStatusCounts } from '../../utils/computeStatusCounts';

// TODO: pick 3 colors, one per status (not_started / in_progress / completed).
// Since these represent state rather than arbitrary categories, consider a
// status-style palette (e.g. neutral -> warning-ish -> good) rather than
// unrelated hues. Validate contrast/colorblind-safety before committing to
// values - don't just eyeball it.
const STATUS_COLORS = [];

function TeamStatusChart({ members }) {
  const data = computeStatusCounts(members);

  // TODO: render a ResponsiveContainer > PieChart > Pie (data={data},
  // dataKey="value", nameKey="name") with one <Cell> per entry (fill from
  // STATUS_COLORS), plus <Tooltip /> and <Legend />.
  return null;
}

export default TeamStatusChart;
