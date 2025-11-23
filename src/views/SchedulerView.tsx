import { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, AlertTriangle, TrendingDown, Sparkles, Settings } from 'lucide-react';
import ConversationalAI from '../components/ConversationalAI';
import { crewMembers, trips } from '../data/mockData';
import RosterBuilderView from './scheduler/RosterBuilderView';
import CrewManagementView from './scheduler/CrewManagementView';
import AnalyticsView from './scheduler/AnalyticsView';
import SettingsView from './scheduler/SettingsView';

interface SchedulerViewProps {
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export default function SchedulerView({ activeView = 'dashboard', onViewChange }: SchedulerViewProps) {
  const [activeSubView, setActiveSubView] = useState<string>(activeView);
  const uncoveredTrips = trips.filter(t => !(t as any).crewAssigned || (t as any).crewAssigned.length === 0);
  const totalCrew = crewMembers.length;
  const totalPairings = trips.length;

  // Sync with parent activeView
  useEffect(() => {
    if (activeView && activeView !== activeSubView) {
      setActiveSubView(activeView);
    }
  }, [activeView]);

  const handleViewChange = (view: string) => {
    setActiveSubView(view);
    if (onViewChange) {
      onViewChange(view);
    }
  };

  // Route to submenus
  if (activeSubView === 'roster-builder') {
    return <RosterBuilderView onBack={() => handleViewChange('dashboard')} />;
  }

  if (activeSubView === 'crew-management') {
    return <CrewManagementView onBack={() => handleViewChange('dashboard')} />;
  }

  if (activeSubView === 'analytics') {
    return <AnalyticsView />;
  }

  if (activeSubView === 'settings') {
    return <SettingsView onBack={() => handleViewChange('dashboard')} />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-2">December 2024 Roster Planning</h2>
        <p className="text-purple-100">
          BUR Base | {totalCrew} crew members | {totalPairings} pairings
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs text-red-600 font-medium">HIGH PRIORITY</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{uncoveredTrips.length}</div>
          <div className="text-sm text-gray-600">Uncovered trips</div>
          <div className="text-xs text-gray-500 mt-1">Require immediate attention</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-amber-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs text-amber-600 font-medium">MONITOR</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">5</div>
          <div className="text-sm text-gray-600">Crew near duty limits</div>
          <div className="text-xs text-gray-500 mt-1">Projected for month-end</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">SAVINGS</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">$45K</div>
          <div className="text-sm text-gray-600">Cost optimization found</div>
          <div className="text-xs text-gray-500 mt-1">AI-identified opportunities</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-blue-600 font-medium">PREDICTED</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">3</div>
          <div className="text-sm text-gray-600">Potential violations</div>
          <div className="text-xs text-gray-500 mt-1">If current plan continues</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">AI Optimization Insights</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm font-semibold text-gray-900 mb-1">Cost Reduction Opportunity</div>
                <div className="text-xs text-gray-600">Reduce deadheads by 7 flights to save $12K in positioning costs</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm font-semibold text-gray-900 mb-1">Crew Utilization</div>
                <div className="text-xs text-gray-600">Better reserve usage could save $15K while improving satisfaction</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm font-semibold text-gray-900 mb-1">Legality Compliance</div>
                <div className="text-xs text-gray-600">3 crew projected to exceed duty limits - reassignment recommended</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm font-semibold text-gray-900 mb-1">Positioning Optimization</div>
                <div className="text-xs text-gray-600">Smart crew positioning could reduce hotel costs by $18K</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Uncovered Trips - Priority Action Required
          </h3>
          <div className="space-y-3">
            {uncoveredTrips.map((trip) => (
              <div key={trip.id} className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{trip.id}</div>
                  <div className="text-sm text-gray-600">{trip.route}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(trip.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600">Credit: {trip.creditHours}h</div>
                  {trip.international && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full mt-1 inline-block">
                      International
                    </span>
                  )}
                </div>
                <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors">
                  Assign
                </button>
              </div>
            ))}
          </div>
          {uncoveredTrips.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>All trips are covered!</p>
            </div>
          )}
        </div>

        <ConversationalAI
          role="scheduler"
          context="December 2024 Roster Planning"
        />
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveSubView('roster-builder')}
          className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left"
        >
          <Calendar className="w-6 h-6 text-purple-600 mb-2" />
          <div className="font-semibold">Roster Builder</div>
          <div className="text-xs text-gray-600">Crew assignment tool</div>
        </button>

        <button
          onClick={() => setActiveSubView('crew-management')}
          className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left"
        >
          <Users className="w-6 h-6 text-blue-600 mb-2" />
          <div className="font-semibold">Crew Management</div>
          <div className="text-xs text-gray-600">Directory & qualifications</div>
        </button>

        <button
          onClick={() => alert('Bidding System - Coming soon!')}
          className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left"
        >
          <Sparkles className="w-6 h-6 text-green-600 mb-2" />
          <div className="font-semibold">Bidding System</div>
          <div className="text-xs text-gray-600">Manage crew bids</div>
        </button>

        <button
          onClick={() => setActiveSubView('analytics')}
          className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left"
        >
          <DollarSign className="w-6 h-6 text-amber-600 mb-2" />
          <div className="font-semibold">Analytics & Reports</div>
          <div className="text-xs text-gray-600">Metrics & forecasting</div>
        </button>

        <button
          onClick={() => setActiveSubView('settings')}
          className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left"
        >
          <Settings className="w-6 h-6 text-gray-600 mb-2" />
          <div className="font-semibold">Settings</div>
          <div className="text-xs text-gray-600">Configuration & preferences</div>
        </button>
      </div>
    </div>
  );
}
