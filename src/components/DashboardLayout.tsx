import { ReactNode } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { UserRole } from '../types';
import { useState } from 'react';

interface DashboardLayoutProps {
  role: UserRole;
  onLogout: () => void;
  children: ReactNode;
  sidebar: ReactNode;
  title: string;
}

const roleConfig = {
  'crew-member': { name: 'Crew Member', color: 'blue' },
  'scheduler': { name: 'Crew Scheduler', color: 'purple' },
  'controller': { name: 'Crew Controller', color: 'red' },
  'payroll': { name: 'Payroll Admin', color: 'green' },
  'management': { name: 'Operations Manager', color: 'amber' },
  'union': { name: 'Union Representative', color: 'teal' }
};

export default function DashboardLayout({ role, onLogout, children, sidebar, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const config = roleConfig[role];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className={`bg-gradient-to-r from-${config.color}-600 to-${config.color}-700 text-white shadow-lg`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div>
                <h1 className="text-xl font-bold">{title}</h1>
                <p className="text-xs text-white/80">{config.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium">Demo Mode</div>
                <div className="text-xs text-white/80">Logged in as {config.name}</div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside
            className={`
              fixed lg:static inset-y-0 left-0 z-40
              w-64 bg-white rounded-lg shadow-lg p-4
              transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              mt-0 lg:mt-0 top-16 lg:top-0
            `}
          >
            {sidebar}
          </aside>

          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
