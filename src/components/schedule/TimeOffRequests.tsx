import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function TimeOffRequests() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Time Off Requests</h2>
          <p className="text-gray-600">Request vacation, sick leave, or personal time</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-yellow-500 text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400"
        >
          + Request Time Off
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm mb-1">Vacation Days</p>
          <p className="text-3xl font-bold text-blue-900">14</p>
          <p className="text-xs text-gray-500">of 21 remaining</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm mb-1">Sick Days</p>
          <p className="text-3xl font-bold text-blue-900">10</p>
          <p className="text-xs text-gray-500">of 12 remaining</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm mb-1">Personal Days</p>
          <p className="text-3xl font-bold text-blue-900">3</p>
          <p className="text-xs text-gray-500">of 5 remaining</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm mb-1">Pending Requests</p>
          <p className="text-3xl font-bold text-orange-600">2</p>
          <p className="text-xs text-gray-500">awaiting approval</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-blue-900 mb-1">
                Vacation Request
              </h3>
              <p className="text-gray-600">Dec 20-27, 2024 (8 days)</p>
            </div>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
              Pending Approval
            </span>
          </div>

          <div className="bg-gray-50 rounded p-4 mb-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Reason:</span> Family holiday in Europe. Flights already booked.
            </p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-600">
              Submitted: Nov 15, 2024 • Will be reviewed by Nov 25
            </p>
            <button className="text-red-600 hover:underline font-semibold">
              Cancel Request
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-blue-900 mb-1">
                Personal Day
              </h3>
              <p className="text-gray-600">Nov 28, 2024 (1 day)</p>
            </div>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              ✓ Approved
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Approved by Maria Rodriguez on Nov 18, 2024
          </p>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">
                Request Time Off
              </h3>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Request Type
                  </label>
                  <select className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-900 focus:outline-none">
                    <option>Vacation</option>
                    <option>Sick Leave</option>
                    <option>Personal Day</option>
                    <option>Emergency Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Total days requested:</span> 8 days
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Remaining vacation balance after approval: 6 days
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about your time off request..."
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-900 focus:outline-none"
                  ></textarea>
                </div>

                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-orange-800 mb-1">
                        Conflicting Trips Detected
                      </p>
                      <p className="text-sm text-orange-700">
                        You have 2 trips scheduled during this period (CM450, CM460). These trips will need to be reassigned if your request is approved.
                      </p>
                      <button className="text-blue-900 hover:underline text-sm mt-2">
                        View Conflicting Trips →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800"
                  >
                    Submit Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
