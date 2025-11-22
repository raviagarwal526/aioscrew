import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarViewProps {
  onTripClick: (trip: any) => void;
}

export default function CalendarView({ onTripClick }: CalendarViewProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">My Schedule</h2>
          <p className="text-gray-600">November 2024 • BUR Base</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Export Calendar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-900">
          <p className="text-gray-600 text-sm">Credit Hours</p>
          <p className="text-2xl font-bold text-blue-900">87.5</p>
          <p className="text-xs text-green-600">↑ 12% vs Oct</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm">Trips</p>
          <p className="text-2xl font-bold text-blue-900">14</p>
          <p className="text-xs text-gray-500">8 Int'l, 6 Dom</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-gray-600 text-sm">Days Off</p>
          <p className="text-2xl font-bold text-blue-900">12</p>
          <p className="text-xs text-gray-500">Includes 4 weekends</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm">Duty Time</p>
          <p className="text-2xl font-bold text-blue-900">156.3</p>
          <p className="text-xs text-gray-500">Legal: ✓ 78% utilized</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 text-center py-8">Calendar view with trips will appear here</p>
      </div>
    </div>
  );
}
