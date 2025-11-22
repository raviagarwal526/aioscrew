import { useState } from 'react';
import { UserRole } from './types';
import LandingPage from './components/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import Sidebar from './components/Sidebar';
import DatabaseInit from './components/DatabaseInit';
import CrewMemberViewComplete from './views/CrewMemberViewComplete';
import SchedulerView from './views/SchedulerView';
import ControllerView from './views/ControllerView';
import PayrollViewEnhanced from './views/PayrollViewEnhanced';
import ManagementView from './views/ManagementView';
import UnionView from './views/UnionView';

function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);

  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  const handleLogout = () => {
    setCurrentRole(null);
  };

  const roleViews: Record<UserRole, { component: JSX.Element; title: string }> = {
    'crew-member': {
      component: <CrewMemberViewComplete />,
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
      component: <PayrollViewEnhanced />,
      title: 'Payroll Administration'
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
      sidebar={<Sidebar role={currentRole} />}
    >
      {currentView.component}
    </DashboardLayout>
  );
}

export default App;
