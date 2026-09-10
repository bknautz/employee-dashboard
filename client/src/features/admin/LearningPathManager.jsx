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

  const handleCoursesChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setForm({ ...form, courses: selected });
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
        <select
          multiple
          value={form.courses}
          onChange={handleCoursesChange}
          className={`${inputClass} h-28`}
        >
          {courses?.map((course) => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </select>
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
