import { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Plus, Clock, Users, Plane, CheckCircle, XCircle } from 'lucide-react';

interface DisruptionManagementViewProps {
  onBack: () => void;
}

interface Disruption {
  disruptionId: number;
  disruptionType: string;
  severity: string;
  affectedFlightId?: string;
  affectedPairingId?: string;
  affectedCrewIds: string[];
  disruptionStart: Date;
  rootCause?: string;
  description: string;
  status: string;
}

export default function DisruptionManagementView({ onBack }: DisruptionManagementViewProps) {
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('open');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDisruptions();
  }, [filterStatus]);

  const loadDisruptions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/crew-scheduling/disruptions?status=${filterStatus}`);
      const data = await res.json();
      setDisruptions(data.map((d: any) => ({
        ...d,
        disruptionStart: new Date(d.disruptionStart)
      })));
    } catch (error) {
      console.error('Error loading disruptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const severityColors: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 border-red-300',
    major: 'bg-orange-100 text-orange-700 border-orange-300',
    moderate: 'bg-amber-100 text-amber-700 border-amber-300',
    minor: 'bg-blue-100 text-blue-700 border-blue-300'
  };

  const typeIcons: Record<string, any> = {
    delay: Clock,
    cancellation: XCircle,
    crew_unavailable: Users,
    aircraft_change: Plane,
    weather: AlertTriangle
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Disruption Management</h2>
            <p className="text-gray-600">Monitor and resolve operational disruptions</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Report Disruption
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>
        </div>
      </div>

      {/* Disruptions List */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading disruptions...</p>
        </div>
      ) : disruptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No {filterStatus} Disruptions</h3>
          <p className="text-gray-600">
            {filterStatus === 'open' 
              ? 'All systems operating normally.'
              : `No ${filterStatus} disruptions found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {disruptions.map((disruption) => {
            const TypeIcon = typeIcons[disruption.disruptionType] || AlertTriangle;
            const severityClass = severityColors[disruption.severity] || severityColors.moderate;
            
            return (
              <div
                key={disruption.disruptionId}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                  disruption.severity === 'critical' ? 'border-red-500' :
                  disruption.severity === 'major' ? 'border-orange-500' :
                  disruption.severity === 'moderate' ? 'border-amber-500' : 'border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      disruption.severity === 'critical' ? 'bg-red-100' :
                      disruption.severity === 'major' ? 'bg-orange-100' :
                      disruption.severity === 'moderate' ? 'bg-amber-100' : 'bg-blue-100'
                    }`}>
                      <TypeIcon className={`w-5 h-5 ${
                        disruption.severity === 'critical' ? 'text-red-600' :
                        disruption.severity === 'major' ? 'text-orange-600' :
                        disruption.severity === 'moderate' ? 'text-amber-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {disruption.disruptionType.replace('_', ' ').toUpperCase()}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full border ${severityClass}`}>
                          {disruption.severity}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          {disruption.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{disruption.description}</p>
                      {disruption.rootCause && (
                        <p className="text-xs text-gray-500">
                          <strong>Root Cause:</strong> {disruption.rootCause}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Affected</div>
                    <div className="text-sm text-gray-900">
                      {disruption.affectedFlightId && (
                        <div>Flight: {disruption.affectedFlightId}</div>
                      )}
                      {disruption.affectedPairingId && (
                        <div>Pairing: {disruption.affectedPairingId}</div>
                      )}
                      {disruption.affectedCrewIds.length > 0 && (
                        <div>Crew: {disruption.affectedCrewIds.length} member(s)</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Time</div>
                    <div className="text-sm text-gray-900">
                      {disruption.disruptionStart.toLocaleString()}
                    </div>
                  </div>
                </div>

                {disruption.status === 'open' && (
                  <div className="mt-4 flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                      Suggest Reassignment
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">
                      View Details
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
