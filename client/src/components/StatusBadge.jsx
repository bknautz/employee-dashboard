import { STATUS_LABELS, STATUS_DOT_CLASSES } from '../utils/statusStyles';

function StatusBadge({ status }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-fg-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_CLASSES[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}

export default StatusBadge;
