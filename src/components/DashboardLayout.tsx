import { ReactNode } from 'react';
import { LogOut, ChevronRight } from 'lucide-react';
import { UserRole } from '../types';
import HorizontalNavigation from './HorizontalNavigation';
import AIAssistantPanel from './AIAssistantPanel';

interface DashboardLayoutProps {
  role: UserRole;
  onLogout: () => void;
  children: ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
  title: string;
  aiContext?: string;
  showAIAssistant?: boolean;
  aiAssistantDefaultWidth?: number;
}

const roleConfig = {
  'crew-member': { name: 'Crew Member', color: 'blue' },
  'scheduler': { name: 'Crew Scheduler', color: 'purple' },
  'crew-scheduler': { name: 'Crew Scheduling System', color: 'indigo' },
  'controller': { name: 'Crew Controller', color: 'red' },
  'payroll': { name: 'Payroll Admin', color: 'green' },
  'management': { name: 'Operations Manager', color: 'amber' },
  'union': { name: 'Union Representative', color: 'teal' },
  'executive': { name: 'Executive', color: 'indigo' }
};

export default function DashboardLayout({ 
  role, 
  onLogout, 
  children, 
  activeView,
  onViewChange,
  title,
  aiContext,
  showAIAssistant = true,
  aiAssistantDefaultWidth = 40
}: DashboardLayoutProps) {
  const config = roleConfig[role];

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg flex-shrink-0 h-20">
        <div className="container mx-auto px-6 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-4">
              <img
                src="/image copy.png"
                alt="Copa Airlines"
                className="h-12 w-auto"
              />
              <div className="border-l border-white/30 pl-4">
                <h1 className="text-xl font-bold">{title}</h1>
                <p className="text-xs text-blue-400">Crew Operating System</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <span className="text-sm font-medium">Captain Sarah Martinez</span>
                <div className="text-xs text-white/80">{config?.name || 'User'}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
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
      </header>

      {/* Main Content Area - Two Separate Panels */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel - Independent with own scrollbar */}
        <div className="flex flex-col flex-1 min-w-0 h-full">
          {/* Horizontal Navigation */}
          <HorizontalNavigation 
            role={role} 
            activeView={activeView} 
            onViewChange={onViewChange} 
          />
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="container mx-auto px-4 py-6">
              {children}
            </div>
          </div>
        </div>

        {/* Right Panel - AI Assistant with full height */}
        {showAIAssistant && (
          <AIAssistantPanel
            role={role}
            context={aiContext}
            defaultWidth={aiAssistantDefaultWidth}
            className="flex-shrink-0 h-full"
          />
        )}
      </div>
    </div>
  );
}
