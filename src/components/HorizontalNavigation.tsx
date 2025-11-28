import { Home, Calendar, Users, DollarSign, BarChart3, FileText, Settings, Upload, MessageSquare, AlertTriangle, Shield } from 'lucide-react';
import { UserRole } from '../types';

interface HorizontalNavigationProps {
  role: UserRole;
  activeView: string;
  onViewChange: (view: string) => void;
}

const navigationMenus: Record<UserRole, Array<{ icon: any; label: string; view: string }>> = {
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
  'crew-scheduler': [
    { icon: Home, label: 'Dashboard', view: 'dashboard' },
    { icon: Calendar, label: 'Roster Builder', view: 'roster-builder' },
    { icon: Shield, label: 'Rule Engine', view: 'rule-engine' },
    { icon: AlertTriangle, label: 'Disruptions', view: 'disruptions' },
    { icon: BarChart3, label: 'Compliance Reports', view: 'compliance-reports' },
    { icon: Users, label: 'Crew Management', view: 'crew-management' },
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
    { icon: AlertTriangle, label: 'Excess Payments', view: 'excess-payments' },
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
    { icon: Upload, label: 'CBA Upload', view: 'cba-upload' },
    { icon: MessageSquare, label: 'CBA Chat', view: 'cba-chat' },
    { icon: BarChart3, label: 'Reports', view: 'reports' },
    { icon: Settings, label: 'Settings', view: 'settings' }
  ],
  'executive': [
    { icon: Home, label: 'Executive Dashboard', view: 'dashboard' },
    { icon: BarChart3, label: 'Analytics', view: 'analytics' },
    { icon: DollarSign, label: 'Financial Overview', view: 'financial' },
    { icon: Users, label: 'Strategic Planning', view: 'strategic' },
    { icon: Settings, label: 'Settings', view: 'settings' }
  ]
};

export default function HorizontalNavigation({ role, activeView, onViewChange }: HorizontalNavigationProps) {
  const menuItems = navigationMenus[role] || [];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0" style={{ height: '49px' }}>
      <div className="h-full">
        <div className="flex items-center h-full overflow-x-auto scrollbar-hide">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeView === item.view;
            return (
              <button
                key={idx}
                onClick={() => onViewChange(item.view)}
                className={`
                  flex items-center gap-2 px-5 py-3.5 transition-all whitespace-nowrap relative h-full
                  ${isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }
                `}
                style={{
                  borderRadius: '0',
                  margin: '0'
                }}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-700"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

