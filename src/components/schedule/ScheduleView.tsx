import { useState } from 'react';
import CalendarView from './CalendarView';
import SwapRequests from './SwapRequests';
import TimeOffRequests from './TimeOffRequests';
import TripDetailsModal from './TripDetailsModal';

type ScheduleTab = 'calendar' | 'swaps' | 'timeoff';

export default function ScheduleView() {
  const [activeTab, setActiveTab] = useState<ScheduleTab>('calendar');
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [showTripModal, setShowTripModal] = useState(false);

  const handleTripClick = (trip: any) => {
    setSelectedTrip(trip);
    setShowTripModal(true);
  };

  return (
    <div>
      <div className="bg-white border-b mb-6">
        <div className="flex space-x-1 p-2">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'calendar'
                ? 'bg-blue-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Calendar View
          </button>
          <button
            onClick={() => setActiveTab('swaps')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'swaps'
                ? 'bg-blue-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Swap Requests
          </button>
          <button
            onClick={() => setActiveTab('timeoff')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'timeoff'
                ? 'bg-blue-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Time Off
          </button>
        </div>
      </div>

      {activeTab === 'calendar' && <CalendarView onTripClick={handleTripClick} />}
      {activeTab === 'swaps' && <SwapRequests />}
      {activeTab === 'timeoff' && <TimeOffRequests />}

      <TripDetailsModal
        isOpen={showTripModal}
        onClose={() => setShowTripModal(false)}
        trip={selectedTrip}
      />
    </div>
  );
}
