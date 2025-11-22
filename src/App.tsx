import { useState } from 'react';
import { UserRole } from './types';
import LandingPage from './components/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import Sidebar from './components/Sidebar';
import CrewMemberView from './views/CrewMemberView';
import SchedulerView from './views/SchedulerView';
import ControllerView from './views/ControllerView';
import PayrollView from './views/PayrollView';
import ManagementView from './views/ManagementView';
import UnionView from './views/UnionView';

function App() {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);

  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  const handleLogout = () => {
    setCurrentRole(null);
  };

  const roleViews: Record<UserRole, { component: JSX.Element; title: string }> = {
    'crew-member': {
      component: <CrewMemberView />,
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
      component: <PayrollView />,
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
