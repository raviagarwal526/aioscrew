import { CheckCircle, AlertCircle, Calendar, DollarSign, GraduationCap, Plane, Clock } from 'lucide-react';
import { crewMembers, trips } from '../data/mockData';

export default function CrewMemberView() {
  const currentUser = crewMembers[0];
  const userTrips = trips.filter(t => t.crewAssigned.includes(currentUser.id));
  const nextTrip = userTrips.find(t => t.status === 'scheduled');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-2">Good morning, {currentUser.role} {currentUser.name}</h2>
        <p className="text-blue-100">
          Based on {currentUser.seniority} years seniority, Copa {currentUser.base} base, {currentUser.qualification} qualified
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">VERIFIED</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">${currentUser.currentPay?.amount.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Pay verified</div>
          <div className="text-xs text-gray-500 mt-1">{currentUser.currentPay?.period}</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-amber-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs text-amber-600 font-medium">DUE SOON</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{currentUser.upcomingTraining?.daysUntil} days</div>
          <div className="text-sm text-gray-600">Recurrent training due</div>
          <div className="text-xs text-gray-500 mt-1">{currentUser.upcomingTraining?.type}</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-blue-600 font-medium">UPCOMING</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">Tomorrow</div>
          <div className="text-sm text-gray-600">Next trip</div>
          <div className="text-xs text-gray-500 mt-1">{nextTrip?.id} {nextTrip?.route}</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-teal-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-teal-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-teal-600" />
            </div>
            <span className="text-xs text-teal-600 font-medium">YTD</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">${currentUser.ytdEarnings.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Year-to-date earnings</div>
          <div className="text-xs text-gray-500 mt-1">+8% vs last year</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Upcoming Schedule
        </h3>
        <div className="space-y-3">
          {userTrips.slice(0, 4).map((trip) => (
            <div key={trip.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className={`p-2 rounded-lg ${
                trip.status === 'scheduled' ? 'bg-blue-100' :
                trip.status === 'cancelled' ? 'bg-red-100' :
                'bg-green-100'
              }`}>
                <Plane className={`w-4 h-4 ${
                  trip.status === 'scheduled' ? 'text-blue-600' :
                  trip.status === 'cancelled' ? 'text-red-600' :
                  'text-green-600'
                }`} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{trip.id}</div>
                <div className="text-sm text-gray-600">{trip.route}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {trip.creditHours}h credit
                </div>
              </div>
              {trip.international && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  INTL
                </span>
              )}
            </div>
          ))}
        </div>
        <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          View Full Schedule
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <button className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left">
          <Calendar className="w-6 h-6 text-blue-600 mb-2" />
          <div className="font-semibold">View Schedule</div>
          <div className="text-xs text-gray-600">Calendar & trip details</div>
        </button>

        <button className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left">
          <DollarSign className="w-6 h-6 text-green-600 mb-2" />
          <div className="font-semibold">Submit Claim</div>
          <div className="text-xs text-gray-600">Pay & per diem claims</div>
        </button>

        <button className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left">
          <Plane className="w-6 h-6 text-purple-600 mb-2" />
          <div className="font-semibold">Bid Trips</div>
          <div className="text-xs text-gray-600">Monthly bid system</div>
        </button>

        <button className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left">
          <GraduationCap className="w-6 h-6 text-amber-600 mb-2" />
          <div className="font-semibold">Training Status</div>
          <div className="text-xs text-gray-600">Requirements & courses</div>
        </button>
      </div>
    </div>
  );
}
