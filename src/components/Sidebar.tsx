import { Home, Calendar, Users, DollarSign, BarChart3, FileText, Settings } from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  activeView: string;
  onViewChange: (view: string) => void;
}

const sidebarMenus: Record<UserRole, Array<{ icon: any; label: string; view: string }>> = {
  'crew-member': [
    { icon: Home, label: 'Dashboard', view: 'dashboard' },
    { icon: Calendar, label: 'Schedule', view: 'schedule' },
    { icon: DollarSign, label: 'Pay & Claims', view: 'pay' },
    { icon: FileText, label: 'Documents', view: 'documents' },
    { icon: Settings, label: 'Settings', view: 'settings' }
  ],
  'scheduler': [
    { icon: Home, label: 'Planning Dashboard', view: 'dashboard' },
    { icon: Calendar, label: 'Roster Builder', view: 'roster-builder' },
    { icon: Users, label: 'Crew Management', view: 'crew-management' },
    { icon: BarChart3, label: 'Analytics', view: 'analytics' },
    { icon: Settings, label: 'Settings', view: 'settings' }
  ],
  'controller': [
    { icon: Home, label: 'Operations Center', view: 'dashboard' },
    { icon: Users, label: 'Active Crew', view: 'active' },
    { icon: Calendar, label: 'Reserve Pool', view: 'reserve' },
    { icon: FileText, label: 'Disruptions', view: 'disruptions' },
    { icon: Settings, label: 'Settings', view: 'settings' }
  ],
  'payroll': [
    { icon: Home, label: 'Payroll Dashboard', view: 'dashboard' },
    { icon: FileText, label: 'Claims Review', view: 'claims' },
    { icon: DollarSign, label: 'Payments', view: 'payments' },
    { icon: BarChart3, label: 'Reports', view: 'reports' },
    { icon: Settings, label: 'Settings', view: 'settings' }
  ],
  'management': [
    { icon: Home, label: 'Executive Dashboard', view: 'dashboard' },
    { icon: BarChart3, label: 'Analytics', view: 'analytics' },
    { icon: DollarSign, label: 'Cost Management', view: 'costs' },
    { icon: Users, label: 'Workforce Planning', view: 'workforce' },
    { icon: Settings, label: 'Settings', view: 'settings' }
  ],
  'union': [
    { icon: Home, label: 'Compliance Dashboard', view: 'dashboard' },
    { icon: FileText, label: 'Violations', view: 'violations' },
    { icon: Users, label: 'Grievances', view: 'grievances' },
    { icon: BarChart3, label: 'Reports', view: 'reports' },
    { icon: Settings, label: 'Settings', view: 'settings' }
  ]
};

export default function Sidebar({ role, activeView, onViewChange }: SidebarProps) {
  const menuItems = sidebarMenus[role] || [];

  return (
    <nav className="space-y-1">
      {menuItems.map((item, idx) => {
        const Icon = item.icon;
        const isActive = activeView === item.view;
        return (
          <button
            key={idx}
            onClick={() => onViewChange(item.view)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
              isActive
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
