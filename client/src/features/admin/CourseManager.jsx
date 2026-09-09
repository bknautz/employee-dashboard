import { useState } from 'react';
import { useCourses } from '../../hooks/useCourses';
import { useCreateCourse } from '../../hooks/useCreateCourse';
import { useDeleteCourse } from '../../hooks/useDeleteCourse';
import { getErrorMessage } from '../../utils/getErrorMessage';

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
    <section>
      <h3>Courses</h3>

      {isLoading && <p>Loading courses...</p>}
      {isError && <p>Couldn't load courses.</p>}

      {courses?.length > 0 && (
        <ul>
          {courses.map((course) => (
            <li key={course._id}>
              <strong>{course.title}</strong> ({course.provider}) - {course.hours}h
              <button
                type="button"
                disabled={deleteCourse.isPending}
                onClick={() => deleteCourse.mutate(course._id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <h4>Add a Course</h4>
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <input
          name="provider"
          placeholder="Provider"
          value={form.provider}
          onChange={handleChange}
          required
        />
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <input
          name="hours"
          type="number"
          placeholder="Hours"
          value={form.hours}
          onChange={handleChange}
          required
        />
        <input
          name="expirationMonths"
          type="number"
          placeholder="Expiration (months, optional)"
          value={form.expirationMonths}
          onChange={handleChange}
        />
        <button type="submit" disabled={createCourse.isPending}>
          Create Course
        </button>
        {createCourse.isError && <p>{getErrorMessage(createCourse.error)}</p>}
      </form>
    </section>
  );
}

export default CourseManager;
