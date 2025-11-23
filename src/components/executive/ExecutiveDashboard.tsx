import { useState } from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import OperationalCard from './OperationalCard';
import { executiveCards, vpCrewCards } from '../../data/executiveDashboardData';
import { ViewLevel } from '../../types/executive-dashboard';

export default function ExecutiveDashboard() {
  const [currentView, setCurrentView] = useState<ViewLevel>('executive');

  const handleCrewOpsClick = () => {
    setCurrentView('vp-crew');
  };

  const handleBackToExecutive = () => {
    setCurrentView('executive');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Title Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          {currentView === 'vp-crew' && (
            <button
              onClick={handleBackToExecutive}
              className="mb-4 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Executive Dashboard
            </button>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {currentView === 'executive' 
              ? 'Executive Dashboard' 
              : 'VP/SVP of Crew Operations Dashboard'}
          </h1>
          <p className="text-gray-600">
            {currentView === 'executive'
              ? 'Complete Airline Operating System Overview'
              : 'Crew Operations Command Center'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pb-12">
        {/* Info Banner - Only show on Executive view */}
        {currentView === 'executive' && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-800">
                <strong>Crew Operations</strong> is currently active and fully operational. 
                Click on the Crew Operations card to explore the detailed VP/SVP dashboard. 
                All other operational areas are in our product roadmap and will be prioritized 
                based on customer needs.
              </p>
            </div>
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentView === 'executive' 
            ? executiveCards.map((card) => (
                <OperationalCard
                  key={card.id}
                  card={card}
                  onClick={card.id === 'crew-ops' ? handleCrewOpsClick : undefined}
                />
              ))
            : vpCrewCards.map((card) => (
                <OperationalCard
                  key={card.id}
                  card={card}
                  onClick={() => {
                    // Future: Navigate to detailed subsystem view
                    console.log(`Navigate to ${card.id} detailed view`);
                  }}
                />
              ))
          }
        </div>

        {/* Roadmap Footer - Only show on Executive view */}
        {currentView === 'executive' && (
          <div className="mt-12 bg-white rounded-lg shadow-md p-6 border-t-4 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Product Roadmap</h3>
            <p className="text-sm text-gray-600 mb-4">
              Our vision is to build a comprehensive Airline Operating System that covers all 
              operational areas. We're starting with Crew Operations—the most complex and 
              high-ROI area—and expanding to other operational domains based on customer 
              priorities and business needs.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="text-gray-700">
                <div className="font-semibold mb-1">Phase 1: Crew Operations</div>
                <div className="text-green-600">✓ Complete</div>
              </div>
              <div className="text-gray-700">
                <div className="font-semibold mb-1">Phase 2: Flight Operations</div>
                <div className="text-gray-500">In Planning</div>
              </div>
              <div className="text-gray-700">
                <div className="font-semibold mb-1">Phase 3: Maintenance</div>
                <div className="text-gray-500">In Planning</div>
              </div>
              <div className="text-gray-700">
                <div className="font-semibold mb-1">Phase 4: Passenger Services</div>
                <div className="text-gray-500">In Planning</div>
              </div>
              <div className="text-gray-700">
                <div className="font-semibold mb-1">Phase 5+: Additional Areas</div>
                <div className="text-gray-500">Roadmap</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
