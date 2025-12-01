import { ReactNode, useState } from 'react';
import { LogOut, X, LayoutDashboard } from 'lucide-react';
import { UserRole } from '../types';
import ConversationalAI from './ConversationalAI';

interface SmartLayoutProps {
  role: UserRole;
  onLogout: () => void;
  dashboardComponent?: ReactNode;
  showDashboard: boolean;
  onCloseDashboard: () => void;
  activeView?: string;
  onViewChange?: (view: string) => void;
  onDashboardTrigger?: (dashboardType: string, context: any) => void;
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

export default function SmartLayout({
  role,
  onLogout,
  dashboardComponent,
  showDashboard,
  onCloseDashboard,
  activeView,
  onViewChange,
  onDashboardTrigger
}: SmartLayoutProps) {
  const [isDashboardCollapsed, setIsDashboardCollapsed] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const config = roleConfig[role];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* Conditional Header Rendering */}
      {!showDashboard ? (
        // Minimal Chat Header
        <header className="bg-white border-b border-gray-200 flex-shrink-0 h-14 transition-all duration-300">
          <div className="container mx-auto px-6 h-full max-w-5xl">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center gap-3">
                <img
                  src="/image copy.png"
                  alt="Copa Airlines"
                  className="h-8 w-auto"
                />
                <div className="hidden sm:flex items-center gap-2 border-l border-gray-300 pl-3">
                  <h1 className="text-sm font-semibold text-gray-900">AI Assistant</h1>
                  <span className="text-xs text-gray-400">•</span>
                  <p className="text-xs text-gray-500">Crew Operating System</p>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>
      ) : (
        // Full Dashboard Header
        <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg flex-shrink-0 h-20 transition-all duration-300">
          <div className="container mx-auto px-6 h-full">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center space-x-4">
                <img
                  src="/image copy.png"
                  alt="Copa Airlines"
                  className="h-12 w-auto"
                />
                <div className="border-l border-white/30 pl-4">
                  <h1 className="text-xl font-bold">Crew Member Portal</h1>
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
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        
        {/* Dashboard Panel (Left) - Animates width/opacity */}
        <div 
          className={`flex flex-col bg-white border-r border-gray-200 transition-all duration-500 ease-in-out overflow-hidden ${
            showDashboard 
              ? (isDashboardCollapsed ? 'w-0 opacity-0' : 'flex-1 opacity-100') 
              : 'w-0 opacity-0 border-none'
          }`}
        >
          <div className="flex flex-col h-full min-w-[300px]"> {/* Min-width prevents content squishing during animation */}
            {/* Dashboard Controls */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">Dashboard</h2>
              </div>
              <button
                onClick={onCloseDashboard}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                title="Close Dashboard"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Dashboard Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {dashboardComponent}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Panel (Right) - Adjusts width based on dashboard state and collapsed state */}
        <div 
          className={`flex flex-col transition-all duration-500 ease-in-out bg-white border-l border-gray-200 ${
            showDashboard 
              ? (isChatCollapsed 
                  ? 'w-12 min-w-[3rem]' // Minimal collapsed width
                  : (isDashboardCollapsed ? 'flex-1' : 'w-[600px] shadow-xl z-10') // Expanded state
                )
              : 'flex-1' // Full screen state
          }`}
        >
          <ConversationalAI 
            role={role} 
            fullWidth={!showDashboard}
            onToggleDashboard={showDashboard ? () => setIsDashboardCollapsed(!isDashboardCollapsed) : undefined}
            isDashboardCollapsed={isDashboardCollapsed}
            onDashboardTrigger={onDashboardTrigger}
            // New props for chat collapse
            onToggleChat={showDashboard ? () => setIsChatCollapsed(!isChatCollapsed) : undefined}
            isChatCollapsed={isChatCollapsed}
            // Pass the dashboard close handler as the reset callback
            onReset={onCloseDashboard}
          />
        </div>
      </div>
    </div>
  );
}
