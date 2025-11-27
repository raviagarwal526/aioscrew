import { useState, useEffect } from 'react';
import { Calendar, DollarSign, FileText, Settings as SettingsIcon, Plus, X, MessageCircle } from 'lucide-react';
import ScheduleView from '../components/schedule/ScheduleView';
import ConversationalAI from '../components/ConversationalAI';
import ClaimCreationForm from '../components/ClaimCreationForm';
import ConversationalClaimBuilder from '../components/ConversationalClaimBuilder';
import { crewService } from '../services/crewService';
import type { CrewMember, Trip, Claim } from '../types';

interface CrewMemberViewCompleteProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function CrewMemberViewComplete({ activeView, onViewChange }: CrewMemberViewCompleteProps) {
  const [currentUser, setCurrentUser] = useState<CrewMember | null>(null);
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [userClaims, setUserClaims] = useState<Claim[]>([]);
  const [showClaimOptions, setShowClaimOptions] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [showConversationalBuilder, setShowConversationalBuilder] = useState(false);
  const [prefilledClaimData, setPrefilledClaimData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await crewService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        const trips = await crewService.getUserTrips(user.id);
        const claims = await crewService.getUserClaims(user.id);
        setUserTrips(trips);
        setUserClaims(claims);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClaim = async (claim: Omit<Claim, 'id'>) => {
    const result = await crewService.submitClaim(claim);
    if (result) {
      await loadData();
    }
  };

  const handleConversationalClaimReady = (claimData: any) => {
    setPrefilledClaimData(claimData);
    setShowConversationalBuilder(false);
    setShowClaimForm(true);
  };

  const handleNewClaimClick = () => {
    setShowClaimOptions(true);
  };

  const handleClaimOptionSelected = (option: 'form' | 'conversational') => {
    setShowClaimOptions(false);
    if (option === 'form') {
      setShowClaimForm(true);
    } else {
      setShowConversationalBuilder(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-900 font-semibold text-lg mb-2">No Crew Member Found</p>
          <p className="text-gray-600 mb-4">Unable to load crew member data. Please ensure the database has been initialized with crew member data.</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-2">Good morning, {currentUser.role} {currentUser.name}</h2>
        <p className="text-blue-100">
          Based on {currentUser.seniority} years seniority, Copa {currentUser.base} base, {currentUser.qualification} qualified
        </p>
      </div>

      <div>
        {activeView === 'dashboard' && (
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow border-l-4 border-green-500 p-4">
                  <div className="text-sm text-gray-600">Current Pay</div>
                  <div className="text-2xl font-bold text-gray-900">${currentUser.currentPay?.amount?.toLocaleString() || '0'}</div>
                  <div className="text-xs text-green-600">✓ Verified</div>
                </div>
                {currentUser.upcomingTraining && (
                  <div className="bg-white rounded-lg shadow border-l-4 border-amber-500 p-4">
                    <div className="text-sm text-gray-600">Training Due</div>
                    <div className="text-2xl font-bold text-gray-900">{currentUser.upcomingTraining.daysUntil} days</div>
                    <div className="text-xs text-amber-600">{currentUser.upcomingTraining.type}</div>
                  </div>
                )}
                <div className="bg-white rounded-lg shadow border-l-4 border-blue-500 p-4">
                  <div className="text-sm text-gray-600">Next Trip</div>
                  <div className="text-2xl font-bold text-gray-900">Tomorrow</div>
                  <div className="text-xs text-blue-600">CM100 BUR-PTY</div>
                </div>
                <div className="bg-white rounded-lg shadow border-l-4 border-teal-500 p-4">
                  <div className="text-sm text-gray-600">YTD Earnings</div>
                  <div className="text-2xl font-bold text-gray-900">${currentUser.ytdEarnings?.toLocaleString() || '0'}</div>
                  <div className="text-xs text-teal-600">+8% vs last year</div>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <button
                  onClick={() => onViewChange('schedule')}
                  className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow transition-colors text-left"
                >
                  <Calendar className="w-6 h-6 text-blue-600 mb-2" />
                  <div className="font-semibold">View Schedule</div>
                  <div className="text-xs text-gray-600">Calendar & trip details</div>
                </button>
                <button
                  onClick={() => onViewChange('pay')}
                  className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow transition-colors text-left"
                >
                  <DollarSign className="w-6 h-6 text-green-600 mb-2" />
                  <div className="font-semibold">Submit Claim</div>
                  <div className="text-xs text-gray-600">Pay & per diem claims</div>
                </button>
                <button
                  onClick={() => onViewChange('documents')}
                  className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow transition-colors text-left"
                >
                  <FileText className="w-6 h-6 text-purple-600 mb-2" />
                  <div className="font-semibold">Documents</div>
                  <div className="text-xs text-gray-600">Licenses & certificates</div>
                </button>
                <button
                  onClick={() => onViewChange('settings')}
                  className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow transition-colors text-left"
                >
                  <SettingsIcon className="w-6 h-6 text-amber-600 mb-2" />
                  <div className="font-semibold">Settings</div>
                  <div className="text-xs text-gray-600">Preferences & profile</div>
                </button>
              </div>

              <ConversationalAI
                role="crew-member"
                context={`${currentUser.role} ${currentUser.name} - ${currentUser.base} base`}
              />
            </div>
          )}

        {activeView === 'schedule' && <ScheduleView />}

        {activeView === 'pay' && (
            <div className="p-6">
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl shadow-xl p-8 text-white mb-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-yellow-400 text-sm mb-2">Current Pay Period</p>
                    <h3 className="text-5xl font-bold mb-2">$4,875.00</h3>
                    <div className="flex items-center space-x-2">
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        ✓ VERIFIED BY AI
                      </span>
                      <span className="text-sm text-white/80">Calculated 2 hours ago</span>
                    </div>
                  </div>
                  <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors">
                    Download Pay Stub
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-yellow-400 mb-1">Credit Hours</p>
                    <p className="text-2xl font-bold">87.5</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-yellow-400 mb-1">Trips Flown</p>
                    <p className="text-2xl font-bold">14</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-yellow-400 mb-1">Premium Pay</p>
                    <p className="text-2xl font-bold">$375</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-yellow-400 mb-1">Per Diem</p>
                    <p className="text-2xl font-bold">$600</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-blue-900">My Claims</h3>
                  <button
                    onClick={handleNewClaimClick}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    <Plus className="w-5 h-5" />
                    New Claim
                  </button>
                </div>
                <div className="space-y-4">
                  {userClaims.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium mb-1">No claims yet</p>
                      <p className="text-sm">Click "New Claim" to submit your first claim</p>
                    </div>
                  ) : (
                    userClaims.map((claim) => (
                      <div
                        key={claim.id}
                        className={`border-l-4 bg-gray-50 p-4 rounded-r-lg ${
                          claim.status === 'approved' ? 'border-green-500' :
                          claim.status === 'rejected' ? 'border-red-500' :
                          'border-orange-500'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{claim.claim_type}</p>
                            <p className="text-sm text-gray-600">
                              {claim.trip_id} • {new Date(claim.claim_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold text-lg ${
                              claim.status === 'approved' ? 'text-green-600' :
                              claim.status === 'rejected' ? 'text-red-600' :
                              'text-orange-600'
                            }`}>
                              ${typeof claim.amount === 'number' ? claim.amount.toFixed(2) : parseFloat(claim.amount || '0').toFixed(2)}
                            </p>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                              claim.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        {activeView === 'documents' && (
            <div className="p-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">My Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-4 border-b bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-lg">
                    <h4 className="font-bold">ATP License</h4>
                    <p className="text-xs text-yellow-400">License #AT12345678</p>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Issued:</span>
                        <span className="font-semibold">Jan 15, 2020</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expires:</span>
                        <span className="font-semibold">Jan 31, 2026</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-900 text-white px-3 py-2 rounded text-sm hover:bg-blue-800">
                        View
                      </button>
                      <button className="flex-1 border border-blue-900 text-blue-900 px-3 py-2 rounded text-sm hover:bg-blue-900 hover:text-white">
                        Download
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-4 border-b bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-lg">
                    <h4 className="font-bold">737-800 Type Rating</h4>
                    <p className="text-xs text-yellow-400">Certificate #B737-2020-456</p>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completed:</span>
                        <span className="font-semibold">Mar 20, 2020</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expires:</span>
                        <span className="font-semibold">Dec 31, 2025</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-900 text-white px-3 py-2 rounded text-sm hover:bg-blue-800">
                        View
                      </button>
                      <button className="flex-1 border border-blue-900 text-blue-900 px-3 py-2 rounded text-sm hover:bg-blue-900 hover:text-white">
                        Download
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-orange-500">
                  <div className="p-4 border-b bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                    <h4 className="font-bold">Medical Certificate</h4>
                    <p className="text-xs text-orange-100">Class 1 • FAA</p>
                  </div>
                  <div className="p-4">
                    <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4">
                      <p className="text-sm text-orange-800 font-semibold mb-1">
                        Expires in 180 days
                      </p>
                      <p className="text-xs text-orange-700">
                        Due June 30, 2025
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-orange-500 text-white px-3 py-2 rounded text-sm font-semibold hover:bg-orange-600">
                        Schedule Renewal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {activeView === 'settings' && (
            <div className="p-6 max-w-4xl mx-auto space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4">Personal Information</h3>
                <form className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      defaultValue="Sarah"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      defaultValue="Martinez"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="s.martinez@copa.com"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <button type="submit" className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 font-semibold">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Schedule Changes</p>
                      <p className="text-sm text-gray-600">Get notified when your schedule is updated</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5 text-blue-900" />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Pay & Claims Status</p>
                      <p className="text-sm text-gray-600">Updates on your pay claims</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5 text-blue-900" />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Training Reminders</p>
                      <p className="text-sm text-gray-600">Upcoming training and expirations</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5 text-blue-900" />
                  </label>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Claim Creation Options Modal */}
      {showClaimOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Create a New Claim</h3>
                <p className="text-sm text-gray-600 mt-1">Choose how you'd like to submit your claim</p>
              </div>
              <button
                onClick={() => setShowClaimOptions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => handleClaimOptionSelected('conversational')}
                className="p-6 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-600 transition-colors">
                    <MessageCircle className="w-6 h-6 text-blue-600 group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">Describe Your Claim</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Tell us about your claim in natural language and our AI will ask clarifying questions.
                    </p>
                    <div className="text-xs text-blue-600 font-medium">
                      ✨ Recommended for quick submissions
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleClaimOptionSelected('form')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-600 transition-colors">
                    <FileText className="w-6 h-6 text-gray-600 group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">Use Traditional Form</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Fill out a structured form with all the claim details step by step.
                    </p>
                    <div className="text-xs text-gray-600 font-medium">
                      📋 Detailed and structured
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Try the conversational method! Just say something like "I need to claim
                international premium for my Panama trip last Tuesday" and the AI will handle the rest.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conversational Claim Builder */}
      {showConversationalBuilder && currentUser && (
        <ConversationalClaimBuilder
          currentUser={currentUser}
          userTrips={userTrips}
          onClaimDataReady={handleConversationalClaimReady}
          onCancel={() => setShowConversationalBuilder(false)}
        />
      )}

      {/* Enhanced Claim Creation Form */}
      {showClaimForm && currentUser && (
        <ClaimCreationForm
          currentUser={currentUser}
          userTrips={userTrips}
          onClose={() => {
            setShowClaimForm(false);
            setPrefilledClaimData(null);
          }}
          onSubmit={handleSubmitClaim}
          prefilledData={prefilledClaimData}
        />
      )}
    </div>
  );
}
