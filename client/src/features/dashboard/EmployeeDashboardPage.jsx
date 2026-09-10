import { GraduationCap, Compass } from 'lucide-react';
import { useMyEnrollments } from '../../hooks/useMyEnrollments';
import { useCourses } from '../../hooks/useCourses';
import { useEnroll } from '../../hooks/useEnroll';
import AppShell from '../../components/AppShell';
import EnrollmentRow from './EnrollmentRow';

const NAV_ITEMS = [
  { label: 'My Courses', icon: GraduationCap, href: '#my-courses' },
  { label: 'Browse Courses', icon: Compass, href: '#browse-courses' },
];

function EmployeeDashboardPage() {
  const {
    data: enrollments,
    isLoading: enrollmentsLoading,
    isError: enrollmentsError,
    error: enrollmentsErrorObj,
  } = useMyEnrollments();
  const { data: courses, isLoading: coursesLoading, isError: coursesError } = useCourses();
  const enroll = useEnroll();

  const enrolledCourseIds = new Set(
    (enrollments ?? []).filter((e) => e.course).map((e) => e.course._id)
  );
  const availableCourses = (courses ?? []).filter(
    (course) => !enrolledCourseIds.has(course._id)
  );

  return (
    <AppShell title="My Courses" navItems={NAV_ITEMS}>
      <section id="my-courses" className="mb-10 scroll-mt-8">
        {enrollmentsLoading && <p className="text-sm text-fg-muted">Loading your courses...</p>}

        {enrollmentsError && (
          <p className="text-sm text-warn">Couldn't load your courses: {enrollmentsErrorObj.message}</p>
        )}

        {!enrollmentsLoading && !enrollmentsError && enrollments?.length === 0 && (
          <p className="text-sm text-fg-muted">You aren't enrolled in any courses yet.</p>
        )}

        {enrollments?.length > 0 && (
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
            {enrollments.map((enrollment) => (
              <EnrollmentRow key={enrollment._id} enrollment={enrollment} />
            ))}
          </ul>
        )}
      </section>

      <section id="browse-courses" className="scroll-mt-8">
        <h2 className="mb-3 text-sm font-medium text-fg-muted">Browse Courses</h2>

        {coursesLoading && <p className="text-sm text-fg-muted">Loading courses...</p>}
        {coursesError && <p className="text-sm text-warn">Couldn't load courses.</p>}

        {!coursesLoading && !coursesError && availableCourses.length === 0 && (
          <p className="text-sm text-fg-muted">No more courses to enroll in.</p>
        )}

        {availableCourses.length > 0 && (
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
            {availableCourses.map((course) => (
              <li key={course._id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-fg">{course.title}</p>
                  <p className="text-xs text-fg-subtle">
                    {course.provider} &middot; {course.hours}h
                  </p>
                </div>
                <button
                  type="button"
                  disabled={enroll.isPending}
                  onClick={() => enroll.mutate(course._id)}
                  className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
                >
                  Enroll
                </button>
              </li>
            ))}
          </ul>
        )}

        {enroll.isError && (
          <p className="mt-2 text-sm text-warn">Enroll failed: {enroll.error.response?.data?.error}</p>
        )}
      </section>
    </AppShell>
  );
}

export default EmployeeDashboardPage;
