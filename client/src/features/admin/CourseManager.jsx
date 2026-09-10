import { useState } from 'react';
import { useCourses } from '../../hooks/useCourses';
import { useCreateCourse } from '../../hooks/useCreateCourse';
import { useDeleteCourse } from '../../hooks/useDeleteCourse';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { inputClass } from '../../utils/formStyles';

const emptyForm = { title: '', provider: '', description: '', hours: '', expirationMonths: '' };

function CourseManager() {
  const { data: courses, isLoading, isError } = useCourses();
  const createCourse = useCreateCourse();
  const deleteCourse = useDeleteCourse();
  const [form, setForm] = useState(emptyForm);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createCourse.mutate(
      {
        title: form.title,
        provider: form.provider,
        description: form.description,
        hours: Number(form.hours),
        expirationMonths: form.expirationMonths ? Number(form.expirationMonths) : null,
      },
      {
        onSuccess: () => setForm(emptyForm),
      }
    );
  };

  return (
    <div className="space-y-4">
      {isLoading && <p className="text-sm text-fg-muted">Loading courses...</p>}
      {isError && <p className="text-sm text-warn">Couldn't load courses.</p>}

      {courses?.length > 0 && (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {courses.map((course) => (
            <li key={course._id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-fg">{course.title}</p>
                <p className="text-xs text-fg-subtle">
                  {course.provider} &middot; {course.hours}h
                </p>
              </div>
              <button
                type="button"
                disabled={deleteCourse.isPending}
                onClick={() => deleteCourse.mutate(course._id)}
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
        <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">Add a Course</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
            className={inputClass}
          />
          <input
            name="provider"
            placeholder="Provider"
            value={form.provider}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className={inputClass}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            name="hours"
            type="number"
            placeholder="Hours"
            value={form.hours}
            onChange={handleChange}
            required
            className={inputClass}
          />
          <input
            name="expirationMonths"
            type="number"
            placeholder="Expiration (months, optional)"
            value={form.expirationMonths}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={createCourse.isPending}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          Create Course
        </button>
        {createCourse.isError && (
          <p className="text-sm text-warn">{getErrorMessage(createCourse.error)}</p>
        )}
      </form>
    </div>
  );
}

export default CourseManager;
