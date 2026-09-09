import { useState } from 'react';
import { useUpdateProgress } from '../../hooks/useUpdateProgress';
import { useMarkComplete } from '../../hooks/useMarkComplete';

function EnrollmentRow({ enrollment }) {
  const [progressInput, setProgressInput] = useState(enrollment.progressPercent);
  const updateProgress = useUpdateProgress();
  const markComplete = useMarkComplete();

  const isCompleted = enrollment.status === 'completed';

  return (
    <li>
      <strong>{enrollment.course.title}</strong> ({enrollment.course.provider})
      <br />
      Status: {enrollment.status} - {enrollment.progressPercent}% complete
      {!isCompleted && (
        <div>
          <input
            type="number"
            min="0"
            max="100"
            value={progressInput}
            onChange={(e) => setProgressInput(e.target.value)}
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
          >
            Update Progress
          </button>
          <button
            type="button"
            disabled={markComplete.isPending}
            onClick={() => markComplete.mutate(enrollment._id)}
          >
            Mark Complete
          </button>
          {updateProgress.isError && <p>{updateProgress.error.response?.data?.error}</p>}
          {markComplete.isError && <p>{markComplete.error.response?.data?.error}</p>}
        </div>
      )}
    </li>
  );
}

export default EnrollmentRow;
