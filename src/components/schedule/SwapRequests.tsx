import { Clock, CheckCircle } from 'lucide-react';

export default function SwapRequests() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Trip Swap Requests</h2>
          <p className="text-gray-600">Request to swap trips with other crew members</p>
        </div>
        <button className="bg-yellow-500 text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400">
          + New Swap Request
        </button>
      </div>

      <div className="flex space-x-4 mb-6 border-b">
        <button className="px-4 py-2 border-b-2 border-blue-900 text-blue-900 font-semibold">
          My Requests (3)
        </button>
        <button className="px-4 py-2 text-gray-600 hover:text-blue-900">
          Received (2)
        </button>
        <button className="px-4 py-2 text-gray-600 hover:text-blue-900">
          History
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-md border-l-4 border-orange-500 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Swap Request to John Smith</h3>
                <p className="text-sm text-gray-600">Sent Nov 20, 2024 at 3:45 PM</p>
              </div>
            </div>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
              Pending
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-xs text-red-600 font-semibold mb-2">YOU GIVE UP</p>
              <p className="font-bold text-blue-900 mb-1">Trip CM450</p>
              <p className="text-sm text-gray-700">Dec 15: PTY → LAX → PTY</p>
              <p className="text-sm text-gray-600">Credit: 12.5 hrs</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-xs text-green-600 font-semibold mb-2">YOU GET</p>
              <p className="font-bold text-blue-900 mb-1">Trip CM380</p>
              <p className="text-sm text-gray-700">Dec 15: BUR → SFO → BUR</p>
              <p className="text-sm text-gray-600">Credit: 8.3 hrs</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded p-3 mb-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Your message:</span> "Hi John, I have a family event in LA that day. Would you be willing to swap? Your trip works better for my schedule."
            </p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              ⏱️ Awaiting response from John Smith
            </p>
            <button className="text-red-600 hover:underline text-sm font-semibold">
              Cancel Request
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border-l-4 border-green-500 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Swap with Patricia Lee - Approved!</h3>
                <p className="text-sm text-gray-600">Completed Nov 18, 2024</p>
              </div>
            </div>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              ✓ Approved
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-semibold mb-2">GAVE UP</p>
              <p className="font-bold text-gray-600 mb-1">Trip CM230</p>
              <p className="text-sm text-gray-600">Dec 1: BUR → MIA → BUR</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-semibold mb-2">RECEIVED</p>
              <p className="font-bold text-gray-600 mb-1">Trip CM105</p>
              <p className="text-sm text-gray-600">Dec 1: PTY → BOG → PTY</p>
            </div>
          </div>

          <div className="bg-green-50 rounded p-3">
            <p className="text-sm text-green-800">
              ✓ Swap approved by Crew Scheduler on Nov 18. Both trips have been updated in your schedule.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
