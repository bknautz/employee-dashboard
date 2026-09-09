import { useState } from 'react';
import { useLearningPaths } from '../../hooks/useLearningPaths';
import { useCreateLearningPath } from '../../hooks/useCreateLearningPath';
import { useDeleteLearningPath } from '../../hooks/useDeleteLearningPath';
import { useCourses } from '../../hooks/useCourses';
import { getErrorMessage } from '../../utils/getErrorMessage';

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
    <section>
      <h3>Learning Paths</h3>

      {isLoading && <p>Loading learning paths...</p>}
      {isError && <p>Couldn't load learning paths.</p>}

      {learningPaths?.length > 0 && (
        <ul>
          {learningPaths.map((path) => (
            <li key={path._id}>
              <strong>{path.title}</strong> - {path.courses.length} course(s)
              <button
                type="button"
                disabled={deleteLearningPath.isPending}
                onClick={() => deleteLearningPath.mutate(path._id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <h4>Add a Learning Path</h4>
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleTextChange}
          required
        />
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleTextChange}
        />
        <select multiple value={form.courses} onChange={handleCoursesChange}>
          {courses?.map((course) => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </select>
        <button type="submit" disabled={createLearningPath.isPending}>
          Create Learning Path
        </button>
        {createLearningPath.isError && <p>{getErrorMessage(createLearningPath.error)}</p>}
      </form>
    </section>
  );
}

export default LearningPathManager;
