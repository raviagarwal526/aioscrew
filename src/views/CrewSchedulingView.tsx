import { useState, useEffect } from 'react';
import { 
  Calendar, Users, AlertTriangle, TrendingUp, Settings, 
  FileText, RefreshCw, CheckCircle, XCircle, Clock,
  Plane, Shield, BarChart3, Zap
} from 'lucide-react';
import RosterBuilderView from './crew-scheduling/RosterBuilderView';
import RuleEngineView from './crew-scheduling/RuleEngineView';
import DisruptionManagementView from './crew-scheduling/DisruptionManagementView';
import ComplianceReportsView from './crew-scheduling/ComplianceReportsView';
import CrewManagementView from './crew-scheduling/CrewManagementView';

interface CrewSchedulingViewProps {
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export default function CrewSchedulingView({ activeView = 'dashboard', onViewChange }: CrewSchedulingViewProps) {
  const [activeSubView, setActiveSubView] = useState<string>(activeView);
  const [metrics, setMetrics] = useState({
    totalCrew: 0,
    activeRosters: 0,
    openDisruptions: 0,
    complianceRate: 0,
    violations: 0
  });

  useEffect(() => {
    if (activeView && activeView !== activeSubView) {
      setActiveSubView(activeView);
    }
  }, [activeView]);

  useEffect(() => {
    // Fetch metrics
    fetch('/api/crew-scheduling/reports/compliance?periodStart=2024-01-01&periodEnd=2024-12-31')
      .then(res => res.json())
      .then(data => {
        setMetrics(prev => ({
          ...prev,
          violations: data.totalViolations || 0,
          complianceRate: data.totalEvaluations > 0 
            ? ((data.totalEvaluations - data.totalViolations) / data.totalEvaluations * 100) 
            : 100
        }));
      })
      .catch(err => console.error('Error fetching metrics:', err));
  }, []);

  const handleViewChange = (view: string) => {
    setActiveSubView(view);
    if (onViewChange) {
      onViewChange(view);
    }
  };

  // Route to sub-views
  if (activeSubView === 'roster-builder') {
    return <RosterBuilderView onBack={() => handleViewChange('dashboard')} />;
  }

  if (activeSubView === 'rule-engine') {
    return <RuleEngineView onBack={() => handleViewChange('dashboard')} />;
  }

  if (activeSubView === 'disruptions') {
    return <DisruptionManagementView onBack={() => handleViewChange('dashboard')} />;
  }

  if (activeSubView === 'compliance-reports') {
    return <ComplianceReportsView onBack={() => handleViewChange('dashboard')} />;
  }

  if (activeSubView === 'crew-management') {
    return <CrewManagementView onBack={() => handleViewChange('dashboard')} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Crew Scheduling System</h2>
            <p className="text-blue-100">
              Regulatory compliance, roster generation, and disruption management
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-blue-600 font-medium">TOTAL CREW</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{metrics.totalCrew}</div>
          <div className="text-sm text-gray-600">Active crew members</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">ACTIVE ROSTERS</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{metrics.activeRosters}</div>
          <div className="text-sm text-gray-600">Published rosters</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-amber-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs text-amber-600 font-medium">DISRUPTIONS</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{metrics.openDisruptions}</div>
          <div className="text-sm text-gray-600">Open disruptions</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs text-purple-600 font-medium">COMPLIANCE</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{metrics.complianceRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Regulatory compliance rate</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs text-red-600 font-medium">VIOLATIONS</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{metrics.violations}</div>
          <div className="text-sm text-gray-600">Rule violations</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          Quick Actions
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          <button
            onClick={() => handleViewChange('roster-builder')}
            className="px-4 py-3 bg-white hover:bg-blue-50 text-gray-900 rounded-lg shadow-sm transition-colors text-left border border-gray-200"
          >
            <Calendar className="w-6 h-6 text-blue-600 mb-2" />
            <div className="font-semibold">Roster Builder</div>
            <div className="text-xs text-gray-600">Generate monthly rosters</div>
          </button>

          <button
            onClick={() => handleViewChange('rule-engine')}
            className="px-4 py-3 bg-white hover:bg-blue-50 text-gray-900 rounded-lg shadow-sm transition-colors text-left border border-gray-200"
          >
            <Shield className="w-6 h-6 text-green-600 mb-2" />
            <div className="font-semibold">Rule Engine</div>
            <div className="text-xs text-gray-600">Configure compliance rules</div>
          </button>

          <button
            onClick={() => handleViewChange('disruptions')}
            className="px-4 py-3 bg-white hover:bg-blue-50 text-gray-900 rounded-lg shadow-sm transition-colors text-left border border-gray-200"
          >
            <AlertTriangle className="w-6 h-6 text-amber-600 mb-2" />
            <div className="font-semibold">Disruptions</div>
            <div className="text-xs text-gray-600">Manage disruptions</div>
          </button>

          <button
            onClick={() => handleViewChange('compliance-reports')}
            className="px-4 py-3 bg-white hover:bg-blue-50 text-gray-900 rounded-lg shadow-sm transition-colors text-left border border-gray-200"
          >
            <BarChart3 className="w-6 h-6 text-purple-600 mb-2" />
            <div className="font-semibold">Compliance Reports</div>
            <div className="text-xs text-gray-600">View compliance analytics</div>
          </button>

          <button
            onClick={() => handleViewChange('crew-management')}
            className="px-4 py-3 bg-white hover:bg-blue-50 text-gray-900 rounded-lg shadow-sm transition-colors text-left border border-gray-200"
          >
            <Users className="w-6 h-6 text-indigo-600 mb-2" />
            <div className="font-semibold">Crew Management</div>
            <div className="text-xs text-gray-600">Manage crew & qualifications</div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Recent Roster Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">December 2024 Roster Published</div>
                <div className="text-sm text-gray-600">2 hours ago</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Roster Optimization Completed</div>
                <div className="text-sm text-gray-600">5 hours ago</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">3 Compliance Warnings Detected</div>
                <div className="text-sm text-gray-600">1 day ago</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-600" />
            Active Disruptions
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Flight Delay - CM-123</div>
                <div className="text-sm text-gray-600">Crew reassignment required</div>
              </div>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Critical</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Crew Unavailability</div>
                <div className="text-sm text-gray-600">Reserve crew activated</div>
              </div>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Moderate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
