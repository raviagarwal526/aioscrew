import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Plus, Edit, Shield, Calendar, CheckCircle } from 'lucide-react';

interface CrewManagementViewProps {
  onBack: () => void;
}

interface CrewMember {
  id: string;
  name: string;
  role: string;
  base: string;
  seniority: number;
}

interface Qualification {
  qualificationId: number;
  qualificationType: string;
  qualificationCode: string;
  issuedDate: string;
  expiryDate: string;
  status: string;
}

export default function CrewManagementView({ onBack }: CrewManagementViewProps) {
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<string | null>(null);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCrew();
  }, []);

  useEffect(() => {
    if (selectedCrew) {
      loadQualifications(selectedCrew);
    }
  }, [selectedCrew]);

  const loadCrew = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch from the API
      // For now, using mock data
      const res = await fetch('/api/crew-scheduling/crew/available?startDate=2024-01-01&endDate=2024-12-31');
      const data = await res.json();
      setCrew(data);
    } catch (error) {
      console.error('Error loading crew:', error);
      // Fallback to empty array
      setCrew([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadQualifications = async (crewId: string) => {
    try {
      const res = await fetch(`/api/crew-scheduling/crew/${crewId}/qualifications`);
      const data = await res.json();
      setQualifications(data);
    } catch (error) {
      console.error('Error loading qualifications:', error);
      setQualifications([]);
    }
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
            <h2 className="text-2xl font-bold text-gray-900">Crew Management</h2>
            <p className="text-gray-600">Manage crew profiles, qualifications, and availability</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Crew Member
        </button>
      </div>

      {/* Crew List */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading crew...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Crew List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Crew Members</h3>
            <div className="space-y-2">
              {crew.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No crew members found</p>
                </div>
              ) : (
                crew.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedCrew(member.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedCrew === member.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-600">{member.role}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {member.base} • Seniority: {member.seniority}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Crew Details */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            {selectedCrew ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    {crew.find(c => c.id === selectedCrew)?.name || 'Crew Member'}
                  </h3>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </div>

                {/* Qualifications */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Qualifications
                    </h4>
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                      Add Qualification
                    </button>
                  </div>
                  {qualifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                      <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No qualifications found</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {qualifications.map((qual) => (
                        <div
                          key={qual.qualificationId}
                          className="p-3 border border-gray-200 rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-gray-900">
                              {qual.qualificationCode}
                            </div>
                            <div className="text-sm text-gray-600">
                              {qual.qualificationType}
                            </div>
                            {qual.expiryDate && (
                              <div className="text-xs text-gray-500 mt-1">
                                Expires: {new Date(qual.expiryDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            qual.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {qual.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Availability */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Availability & Leave
                  </h4>
                  <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No availability records</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Select a crew member to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
