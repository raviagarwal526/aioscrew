import { useState } from 'react';
import { ArrowLeft, ChevronRight, Info } from 'lucide-react';
import OperationalCard from './OperationalCard';
import { executiveCards, vpCrewCards } from '../../data/executiveDashboardData';
import { ViewLevel } from '../../types/executive-dashboard';

export default function ExecutiveDashboard() {
  const [currentView, setCurrentView] = useState<ViewLevel>('executive');
  const [selectedSubsystem, setSelectedSubsystem] = useState<string | null>(null);
  const isCrewView = currentView === 'vp-crew';

  const handleCrewOpsClick = () => {
    setSelectedSubsystem(null);
    setCurrentView('vp-crew');
  };

  const handleBackToExecutive = () => {
    setCurrentView('executive');
    setSelectedSubsystem(null);
  };

  const renderCardGrid = () => {
    const cards = currentView === 'executive' ? executiveCards : vpCrewCards;

    return (
      <div
        key={currentView}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 view-transition"
      >
        {cards.map((card) => {
          const cardOnClick =
            currentView === 'executive' && card.id === 'crew-ops'
              ? handleCrewOpsClick
              : currentView === 'vp-crew'
              ? () => setSelectedSubsystem(card.title)
              : undefined;

          return (
            <OperationalCard
              key={card.id}
              card={card}
              onClick={cardOnClick}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isCrewView ? 'bg-slate-950' : 'bg-gray-50'
      }`}
    >
      <div
        className={
          isCrewView
            ? 'bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-800 text-white shadow-2xl'
            : 'bg-white border-b border-gray-200 shadow-sm'
        }
      >
        <div className="container mx-auto px-6 py-6">
          {isCrewView && (
            <button
              onClick={handleBackToExecutive}
              className="mb-4 flex items-center gap-2 rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Executive Dashboard
            </button>
          )}
          <h1
            className={`text-4xl font-bold mb-2 ${
              isCrewView ? 'text-white' : 'text-gray-900'
            }`}
          >
            {isCrewView
              ? 'VP/SVP of Crew Operations Dashboard'
              : 'Executive Dashboard'}
          </h1>
          <p className={isCrewView ? 'text-indigo-100' : 'text-gray-600'}>
            {isCrewView
              ? 'Crew Operations Command Center'
              : 'Complete Airline Operating System Overview'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pb-12 space-y-8">
        {currentView === 'executive' && (
          <div className="view-transition flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <Info className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-gray-800">
              <strong>Crew Operations</strong> is currently active and fully
              operational. Click on the Crew Operations card to explore the
              detailed VP/SVP dashboard. All other operational areas are in our
              product roadmap and will be prioritized based on customer needs.
            </p>
          </div>
        )}

        {isCrewView && (
          <div className="view-transition rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center text-xs uppercase tracking-[0.35em] text-indigo-200">
                  CEO OVERVIEW
                  <ChevronRight className="mx-2 h-3 w-3" />
                  SVP/VP CREW OPS
                </div>
                <h2 className="mt-3 text-2xl font-semibold">Crew Command Handoff</h2>
                <p className="mt-2 max-w-2xl text-sm text-indigo-100">
                  You're now inside the dedicated crew operations workspace.
                  Agent-driven automations, payroll, training, and compliance
                  streams stay synchronized with the CEO view while you drill
                  into subsystems.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-indigo-100">
                  <span className="rounded-full border border-white/30 px-3 py-1 text-white">
                    {selectedSubsystem
                      ? `Focused: ${selectedSubsystem}`
                      : 'All subsystems active'}
                  </span>
                  {selectedSubsystem && (
                    <button
                      onClick={() => setSelectedSubsystem(null)}
                      className="rounded-full border border-white/30 px-3 py-1 text-white/80 transition hover:bg-white/10"
                    >
                      Clear focus
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-8 text-sm">
                <div>
                  <div className="text-xs uppercase text-indigo-200">
                    Active subsystems
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {vpCrewCards.length}
                  </div>
                  <div className="text-xs text-indigo-200">
                    Crew command modules
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase text-indigo-200">
                    Crew in operation
                  </div>
                  <div className="text-3xl font-bold text-white">127</div>
                  <div className="text-xs text-indigo-200">
                    Linked to payroll + ops
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase text-indigo-200">
                    Automation coverage
                  </div>
                  <div className="text-3xl font-bold text-white">92%</div>
                  <div className="text-xs text-indigo-200">
                    AI copilots engaged
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {renderCardGrid()}

        {currentView === 'executive' && (
          <div className="view-transition rounded-2xl border-t-4 border-gray-200 bg-white p-6 shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Product Roadmap</h3>
            <p className="text-sm text-gray-600 mb-4">
              Our vision is to build a comprehensive Airline Operating System
              that covers all operational areas. We're starting with Crew
              Operations—the most complex and high-ROI area—and expanding to
              other operational domains based on customer priorities and
              business needs.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-5">
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
