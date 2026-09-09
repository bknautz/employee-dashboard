import { useAuth } from '../../context/useAuth';
import { useMyEnrollments } from '../../hooks/useMyEnrollments';
import { useCourses } from '../../hooks/useCourses';
import { useEnroll } from '../../hooks/useEnroll';
import EnrollmentRow from './EnrollmentRow';

function EmployeeDashboardPage() {
  const { user, logout } = useAuth();
  const {
    data: enrollments,
    isLoading: enrollmentsLoading,
    isError: enrollmentsError,
    error: enrollmentsErrorObj,
  } = useMyEnrollments();
  const { data: courses, isLoading: coursesLoading, isError: coursesError } = useCourses();
  const enroll = useEnroll();

  const enrolledCourseIds = new Set((enrollments ?? []).map((e) => e.course._id));
  const availableCourses = (courses ?? []).filter(
    (course) => !enrolledCourseIds.has(course._id)
  );

  return (
    <div>
      <h1>Dashboard</h1>
      <p>
        Logged in as {user?.name} ({user?.role})
      </p>
      <button type="button" onClick={logout}>
        Log out
      </button>

      <h2>My Courses</h2>

      {enrollmentsLoading && <p>Loading your courses...</p>}

      {enrollmentsError && <p>Couldn't load your courses: {enrollmentsErrorObj.message}</p>}

      {!enrollmentsLoading && !enrollmentsError && enrollments?.length === 0 && (
        <p>You aren't enrolled in any courses yet.</p>
      )}

      {enrollments?.length > 0 && (
        <ul>
          {enrollments.map((enrollment) => (
            <EnrollmentRow key={enrollment._id} enrollment={enrollment} />
          ))}
        </ul>
      )}

      <h2>Browse Courses</h2>

      {coursesLoading && <p>Loading courses...</p>}

      {coursesError && <p>Couldn't load courses.</p>}

      {!coursesLoading && !coursesError && availableCourses.length === 0 && (
        <p>No more courses to enroll in.</p>
      )}

      {availableCourses.length > 0 && (
        <ul>
          {availableCourses.map((course) => (
            <li key={course._id}>
              <strong>{course.title}</strong> ({course.provider}) - {course.hours}h
              <button type="button" disabled={enroll.isPending} onClick={() => enroll.mutate(course._id)}>
                Enroll
              </button>
            </li>
          ))}
        </ul>
      )}

      {enroll.isError && <p>Enroll failed: {enroll.error.response?.data?.error}</p>}
    </div>
  );
}

export default EmployeeDashboardPage;
