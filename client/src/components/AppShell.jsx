import { LogOut } from 'lucide-react';
import { useAuth } from '../context/useAuth';

function AppShell({ title, navItems, children }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-bg text-fg">
      <aside className="flex w-60 flex-col border-r border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <div className="h-6 w-6 rounded bg-accent" />
          <span className="text-sm font-semibold">Employee Dashboard</span>
        </div>

        {navItems && navItems.length > 0 ? (
          <nav className="flex-1 space-y-0.5 px-2 py-3">
            {navItems.map(({ label, icon: Icon, href }) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
              >
                <Icon size={16} />
                {label}
              </a>
            ))}
          </nav>
        ) : (
          <div className="flex-1" />
        )}

        <div className="border-t border-border px-3 py-3">
          <p className="truncate text-sm font-medium text-fg">{user?.name}</p>
          <p className="mb-2 text-xs capitalize text-fg-subtle">{user?.role}</p>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">
          {title && <h1 className="mb-6 text-xl font-semibold text-fg">{title}</h1>}
          {children}
        </div>
      </main>
    </div>
  );
}

export default AppShell;
