import { useState } from 'react';
import { useUpdateProgress } from '../../hooks/useUpdateProgress';
import { useMarkComplete } from '../../hooks/useMarkComplete';
import StatusBadge from '../../components/StatusBadge';

function EnrollmentRow({ enrollment }) {
  const [progressInput, setProgressInput] = useState(enrollment.progressPercent);
  const updateProgress = useUpdateProgress();
  const markComplete = useMarkComplete();

  const isCompleted = enrollment.status === 'completed';

  // Defense in depth: the backend now blocks deleting a course that has
  // enrollments, but any enrollment created before that guard existed could
  // still have course: null (the referenced course was already deleted).
  if (!enrollment.course) {
    return (
      <li className="px-4 py-3">
        <p className="text-sm text-fg-subtle">
          This course is no longer available (it was removed by an admin).
        </p>
      </li>
    );
  }

  return (
    <li className="px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-fg">{enrollment.course.title}</p>
          <p className="text-xs text-fg-subtle">{enrollment.course.provider}</p>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="w-32">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${enrollment.progressPercent}%` }}
              />
            </div>
          </div>
          <StatusBadge status={enrollment.status} />
        </div>
      </div>

      {!isCompleted && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="100"
            value={progressInput}
            onChange={(e) => setProgressInput(e.target.value)}
            className="w-16 rounded-md border border-border bg-bg px-2 py-1 text-sm text-fg focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            disabled={updateProgress.isPending}
            onClick={() =>
              updateProgress.mutate({
                enrollmentId: enrollment._id,
                progressPercent: Number(progressInput),
              })
            }
            className="rounded-md border border-border px-3 py-1 text-xs font-medium text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg disabled:opacity-50"
          >
            Update Progress
          </button>
          <button
            type="button"
            disabled={markComplete.isPending}
            onClick={() => markComplete.mutate(enrollment._id)}
            className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            Mark Complete
          </button>
        </div>
      )}

      {updateProgress.isError && (
        <p className="mt-1.5 text-xs text-warn">{updateProgress.error.response?.data?.error}</p>
      )}
      {markComplete.isError && (
        <p className="mt-1.5 text-xs text-warn">{markComplete.error.response?.data?.error}</p>
      )}
    </li>
  );
}

export default EnrollmentRow;
