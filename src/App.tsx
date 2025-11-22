import { useState } from 'react';
import { UserRole } from './types';
import LandingPage from './components/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import Sidebar from './components/Sidebar';
import DatabaseInit from './components/DatabaseInit';
import CrewMemberViewComplete from './views/CrewMemberViewComplete';
import SchedulerView from './views/SchedulerView';
import ControllerView from './views/ControllerView';
import PayrollViewWithAgents from './views/PayrollViewWithAgents';
import ManagementView from './views/ManagementView';
import UnionView from './views/UnionView';

function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [activeView, setActiveView] = useState('dashboard');

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
      component: <SchedulerView />,
      title: 'Crew Scheduler Workspace'
    },
    'controller': {
      component: <ControllerView />,
      title: 'Operations Control Center'
    },
    'payroll': {
      component: <PayrollViewWithAgents />,
      title: 'Payroll Administration - AI Agent System'
    },
    'management': {
      component: <ManagementView />,
      title: 'Operations Management'
    },
    'union': {
      component: <UnionView />,
      title: 'Union Compliance Center'
    }
  };

  if (!dbInitialized) {
    return <DatabaseInit onComplete={() => setDbInitialized(true)} />;
  }

  if (!currentRole) {
    return <LandingPage onSelectRole={handleSelectRole} />;
  }

  const currentView = roleViews[currentRole];

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
