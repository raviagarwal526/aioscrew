import { AlertCircle, CheckCircle, Users, Plane, Clock, MapPin } from 'lucide-react';
import ConversationalAI from '../components/ConversationalAI';
import { trips, alerts, crewMembers } from '../data/mockData';

export default function ControllerView() {
  const operatingFlights = trips.filter(t => t.status === 'scheduled' || t.status === 'active').length;
  const delayedFlights = trips.filter(t => t.status === 'delayed').length;
  const cancelledFlights = trips.filter(t => t.status === 'cancelled').length;
  const activeAlerts = alerts.filter(a => !a.resolved);
  const reserveCrew = crewMembers.filter(c => c.base === 'PTY').slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-2">Operations Control Center</h2>
        <div className="flex items-center gap-4 text-red-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Live Operations</span>
          </div>
          <span>|</span>
          <span>{new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Plane className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">OPERATING</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{operatingFlights}</div>
          <div className="text-sm text-gray-600">Flights operating</div>
          <div className="text-xs text-gray-500 mt-1">On schedule</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-amber-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs text-amber-600 font-medium">DELAYED</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{delayedFlights}</div>
          <div className="text-sm text-gray-600">Delays active</div>
          <div className="text-xs text-gray-500 mt-1">Monitoring crew legality</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs text-red-600 font-medium">CANCELLED</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{cancelledFlights}</div>
          <div className="text-sm text-gray-600">Cancellations</div>
          <div className="text-xs text-gray-500 mt-1">Crew reassignment required</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-blue-600 font-medium">AVAILABLE</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{reserveCrew.length}</div>
          <div className="text-sm text-gray-600">Reserve crew</div>
          <div className="text-xs text-gray-500 mt-1">Ready for call-out</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          Active Alerts & Disruptions
        </h3>
        <div className="space-y-3">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-4 p-4 rounded-lg border-l-4 ${
                alert.type === 'critical' ? 'bg-red-50 border-red-500' :
                alert.type === 'warning' ? 'bg-amber-50 border-amber-500' :
                'bg-blue-50 border-blue-500'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                alert.type === 'critical' ? 'bg-red-100' :
                alert.type === 'warning' ? 'bg-amber-100' :
                'bg-blue-100'
              }`}>
                <AlertCircle className={`w-5 h-5 ${
                  alert.type === 'critical' ? 'text-red-600' :
                  alert.type === 'warning' ? 'text-amber-600' :
                  'text-blue-600'
                }`} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{alert.message}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {alert.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <button className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                alert.type === 'critical' ? 'bg-red-600 hover:bg-red-700 text-white' :
                alert.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700 text-white' :
                'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
                Take Action
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Reserve Crew Available
          </h3>
          <div className="space-y-3">
            {reserveCrew.map((crew) => (
              <div key={crew.id} className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{crew.name}</div>
                  <div className="text-sm text-gray-600">{crew.role}</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    {crew.base} | {crew.qualification}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-green-600 font-medium">RESTED</div>
                  <div className="text-xs text-gray-500">2hr call-out</div>
                </div>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                  Call
                </button>
              </div>
            ))}
          </div>
        </div>

        <ConversationalAI
          role="controller"
          context="Real-time Operations Control"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Plane className="w-5 h-5 text-red-600" />
          Disruption Recovery Plans
        </h3>
        <div className="space-y-4">
          {trips.filter(t => t.disruption).map((trip) => {
            const affectedCrew = crewMembers.filter(c => trip.crewAffected?.includes(c.id));
            return (
              <div key={trip.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-bold text-gray-900">{trip.id} - {trip.route}</div>
                    <div className="text-sm text-red-600 font-medium">
                      {trip.status === 'cancelled' ? 'CANCELLED' : `DELAYED ${trip.delayMinutes}min`}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                    {trip.crewAffected?.length} crew affected
                  </span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                  <div className="text-sm font-semibold text-blue-900 mb-1">AI Recommended Recovery</div>
                  <div className="text-sm text-gray-700">
                    Reassign to CM460 departing 3hrs later (same route). Keeps crew legal and saves $1,200 vs hotel + repositioning.
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-xs text-gray-600">Affected Crew:</div>
                  {affectedCrew.slice(0, 4).map(crew => (
                    <span key={crew.id} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {crew.name}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                    Approve AI Plan
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                    Manual Override
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <button className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left">
          <Plane className="w-6 h-6 text-blue-600 mb-2" />
          <div className="font-semibold">Active Crew</div>
          <div className="text-xs text-gray-600">Real-time tracking</div>
        </button>

        <button className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left">
          <Users className="w-6 h-6 text-green-600 mb-2" />
          <div className="font-semibold">Reserve Pool</div>
          <div className="text-xs text-gray-600">Availability management</div>
        </button>

        <button className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left">
          <AlertCircle className="w-6 h-6 text-red-600 mb-2" />
          <div className="font-semibold">Disruptions</div>
          <div className="text-xs text-gray-600">All active issues</div>
        </button>

        <button className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left">
          <CheckCircle className="w-6 h-6 text-purple-600 mb-2" />
          <div className="font-semibold">Recovery Plans</div>
          <div className="text-xs text-gray-600">AI-generated solutions</div>
        </button>
      </div>
    </div>
  );
}
