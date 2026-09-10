import { useState } from 'react';
import { useLearningPaths } from '../../hooks/useLearningPaths';
import { useCreateLearningPath } from '../../hooks/useCreateLearningPath';
import { useDeleteLearningPath } from '../../hooks/useDeleteLearningPath';
import { useCourses } from '../../hooks/useCourses';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { inputClass } from '../../utils/formStyles';

const emptyForm = { title: '', description: '', courses: [] };

function LearningPathManager() {
  const { data: learningPaths, isLoading, isError } = useLearningPaths();
  const { data: courses } = useCourses();
  const createLearningPath = useCreateLearningPath();
  const deleteLearningPath = useDeleteLearningPath();
  const [form, setForm] = useState(emptyForm);

  const handleTextChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCourseToggle = (courseId) => {
    setForm((prev) => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter((id) => id !== courseId)
        : [...prev.courses, courseId],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createLearningPath.mutate(form, {
      onSuccess: () => setForm(emptyForm),
    });
  };

  return (
    <div className="space-y-4">
      {isLoading && <p className="text-sm text-fg-muted">Loading learning paths...</p>}
      {isError && <p className="text-sm text-warn">Couldn't load learning paths.</p>}

      {learningPaths?.length > 0 && (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {learningPaths.map((path) => (
            <li key={path._id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-fg">{path.title}</p>
                <p className="text-xs text-fg-subtle">{path.courses.length} course(s)</p>
              </div>
              <button
                type="button"
                disabled={deleteLearningPath.isPending}
                onClick={() => deleteLearningPath.mutate(path._id)}
                className="rounded-md border border-border px-3 py-1 text-xs font-medium text-fg-muted transition-colors hover:border-warn hover:text-warn disabled:opacity-50"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-lg border border-border bg-surface p-4"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
          Add a Learning Path
        </p>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleTextChange}
          required
          className={inputClass}
        />
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleTextChange}
          className={inputClass}
        />
        <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-md border border-border bg-bg p-3">
          {courses?.length === 0 && (
            <p className="text-sm text-fg-subtle">No courses yet - add one above first.</p>
          )}
          {courses?.map((course) => (
            <label
              key={course._id}
              className="flex cursor-pointer items-center gap-2 text-sm text-fg"
            >
              <input
                type="checkbox"
                checked={form.courses.includes(course._id)}
                onChange={() => handleCourseToggle(course._id)}
                className="h-4 w-4 rounded border-border bg-bg accent-accent"
              />
              {course.title}
            </label>
          ))}
        </div>
        <button
          type="submit"
          disabled={createLearningPath.isPending}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          Create Learning Path
        </button>
        {createLearningPath.isError && (
          <p className="text-sm text-warn">{getErrorMessage(createLearningPath.error)}</p>
        )}
      </form>
    </div>
  );
}

export default LearningPathManager;
