import { BookOpen, Route, Users } from 'lucide-react';
import AppShell from '../../components/AppShell';
import CourseManager from './CourseManager';
import LearningPathManager from './LearningPathManager';
import EmployeeAssignment from './EmployeeAssignment';

const NAV_ITEMS = [
  { label: 'Courses', icon: BookOpen, href: '#courses' },
  { label: 'Learning Paths', icon: Route, href: '#learning-paths' },
  { label: 'Team Assignment', icon: Users, href: '#team-assignment' },
];

function AdminDashboardPage() {
  return (
    <AppShell title="Admin" navItems={NAV_ITEMS}>
      <section id="courses" className="mb-10 scroll-mt-8">
        <h2 className="mb-3 text-sm font-medium text-fg-muted">Courses</h2>
        <CourseManager />
      </section>

      <section id="learning-paths" className="mb-10 scroll-mt-8">
        <h2 className="mb-3 text-sm font-medium text-fg-muted">Learning Paths</h2>
        <LearningPathManager />
      </section>

      <section id="team-assignment" className="scroll-mt-8">
        <h2 className="mb-3 text-sm font-medium text-fg-muted">Team Assignment</h2>
        <EmployeeAssignment />
      </section>
    </AppShell>
  );
}

export default AdminDashboardPage;
