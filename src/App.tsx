import { useEffect, useState } from 'react';
import { UserRole } from './types';
import LandingPage from './components/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import Sidebar from './components/Sidebar';
import DatabaseInit from './components/DatabaseInit';
import CrewMemberViewComplete from './views/CrewMemberViewComplete';
import SchedulerView from './views/SchedulerView';
import CrewSchedulingView from './views/CrewSchedulingView';
import ControllerView from './views/ControllerView';
import PayrollViewImproved from './views/PayrollViewImproved';
import ManagementView from './views/ManagementView';
import UnionView from './views/UnionView';
import ExecutiveDashboard from './components/executive/ExecutiveDashboard';
import { LogOut } from 'lucide-react';

function App() {
    const [dbInitialized, setDbInitialized] = useState(false);
    const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
    const [activeView, setActiveView] = useState('dashboard');

    useEffect(() => {
      if (!dbInitialized || typeof window === 'undefined') return;
      // Scroll to top immediately and after a short delay to catch any late-rendering components
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      });
      // Additional scroll after components have rendered
      const timeoutId = setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }, 100);
      return () => clearTimeout(timeoutId);
    }, [dbInitialized, currentRole, activeView]);

  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setCurrentRole(null);
  };

  const roleViews: Record<UserRole, { component: JSX.Element; title: string }> = {
    'crew-member': {
      component: <CrewMemberViewComplete activeView={activeView} onViewChange={setActiveView} />,
      title: 'Crew Member Portal'
    },
    'scheduler': {
      component: <SchedulerView activeView={activeView} onViewChange={setActiveView} />,
      title: 'Crew Scheduler Workspace'
    },
    'crew-scheduler': {
      component: <CrewSchedulingView activeView={activeView} onViewChange={setActiveView} />,
      title: 'Crew Scheduling System'
    },
    'controller': {
      component: <ControllerView />,
      title: 'Operations Control Center'
    },
    'payroll': {
      component: <PayrollViewImproved activeView={activeView} />,
      title: 'Payroll Administration - AI Agent System'
    },
    'management': {
      component: <ManagementView />,
      title: 'Operations Management'
    },
    'union': {
      component: <UnionView activeView={activeView} />,
      title: 'Union Compliance Center'
    },
    'executive': {
      component: <ExecutiveDashboard />,
      title: 'Executive Dashboard'
    }
  };

  if (!dbInitialized) {
    return <DatabaseInit onComplete={() => setDbInitialized(true)} />;
  }

  if (!currentRole) {
    return <LandingPage onSelectRole={handleSelectRole} />;
  }

  const currentView = roleViews[currentRole];

  // Executive dashboard is a full-page component without the standard layout
  if (currentRole === 'executive') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-4">
                <img
                  src="/image copy.png"
                  alt="Copa Airlines"
                  className="h-12 w-auto"
                />
                <div className="border-l border-white/30 pl-4">
                  <h1 className="text-xl font-bold">{currentView.title}</h1>
                  <p className="text-xs text-blue-400">Crew Operating System</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
        {currentView.component}
      </div>
    );
  }

  return (
    <DashboardLayout
      role={currentRole}
      onLogout={handleLogout}
      title={currentView.title}
      sidebar={<Sidebar role={currentRole} activeView={activeView} onViewChange={setActiveView} />}
    >
      {currentView.component}
    </DashboardLayout>
  );
}

export default App;
