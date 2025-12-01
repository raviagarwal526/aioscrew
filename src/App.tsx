import { useEffect, useState } from 'react';
import { UserRole } from './types';
import LandingPage from './components/LandingPage';
import SmartLayout from './components/SmartLayout';
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
    const [currentRole, setCurrentRole] = useState<UserRole | null>('crew-member');
    const [activeView, setActiveView] = useState('dashboard');
    const [showDashboard, setShowDashboard] = useState(false);
    const [dashboardType, setDashboardType] = useState<string | null>(null);

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
    setShowDashboard(false);
    setDashboardType(null);
  };

  const handleLogout = () => {
    setCurrentRole(null);
    setShowDashboard(false);
    setDashboardType(null);
  };

  const handleDashboardTrigger = (type: string, context: any) => {
    setDashboardType(type);
    setShowDashboard(true);
    // Set the appropriate view based on the type
    if (type === 'schedule') {
      setActiveView('schedule');
    } else if (type === 'payroll' || type === 'claims') {
      setActiveView('pay');
    } else if (type === 'training') {
      setActiveView('dashboard');
    } else if (type === 'bidding') {
      setActiveView('dashboard');
    } else {
      setActiveView('dashboard');
    }
  };

  const handleCloseDashboard = () => {
    setShowDashboard(false);
    setDashboardType(null);
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
    return <DatabaseInit onComplete={() => setDbInitialized(true)} />;
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

  // Chat-first interface: Use SmartLayout instead of DashboardLayout
  // If dashboard is not shown, SmartLayout renders just the chat
  // If dashboard is shown, SmartLayout renders split view
  return (
    <SmartLayout
      role={currentRole}
      onLogout={handleLogout}
      dashboardComponent={showDashboard ? currentView.component : undefined}
      showDashboard={showDashboard}
      onCloseDashboard={handleCloseDashboard}
      activeView={activeView}
      onViewChange={setActiveView}
      onDashboardTrigger={handleDashboardTrigger}
    />
  );
}

export default App;
