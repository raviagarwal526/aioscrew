import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Calendar, DollarSign, Clock, Plane, Plus, X, MessageCircle, FileText } from 'lucide-react';
import ConversationalAI from '../components/ConversationalAI';
import ClaimCreationForm from '../components/ClaimCreationForm';
import ConversationalClaimBuilder from '../components/ConversationalClaimBuilder';
import { crewService } from '../services/crewService';
import type { CrewMember, Trip, Claim } from '../types';

export default function CrewMemberViewEnhanced() {
  const [currentUser, setCurrentUser] = useState<CrewMember | null>(null);
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [userClaims, setUserClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClaimOptions, setShowClaimOptions] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [showConversationalBuilder, setShowConversationalBuilder] = useState(false);
  const [prefilledClaimData, setPrefilledClaimData] = useState<any>(null);

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
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Unable to load user data</p>
      </div>
    );
  }

  const nextTrip = userTrips.find(t => new Date(t.trip_date) > new Date() && t.status === 'scheduled');
  const upcomingTraining = currentUser.upcomingTraining;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-2">Good morning, {currentUser.role} {currentUser.name}</h2>
        <p className="text-blue-100">
          Based on {currentUser.seniority} years seniority, {currentUser.base} base, {currentUser.qualification} qualified
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
          <div className="text-2xl font-bold text-gray-900">${currentUser.currentPay?.amount.toLocaleString() || '0'}</div>
          <div className="text-sm text-gray-600">Pay verified</div>
          <div className="text-xs text-gray-500 mt-1">{currentUser.currentPay?.period || 'Current period'}</div>
        </div>

        {upcomingTraining && (
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-amber-500">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs text-amber-600 font-medium">DUE SOON</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{upcomingTraining.daysUntil} days</div>
            <div className="text-sm text-gray-600">Training due</div>
            <div className="text-xs text-gray-500 mt-1">{upcomingTraining.type}</div>
          </div>
        )}

        {nextTrip && (
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs text-blue-600 font-medium">UPCOMING</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {new Date(nextTrip.trip_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="text-sm text-gray-600">Next trip</div>
            <div className="text-xs text-gray-500 mt-1">{nextTrip.id} - {nextTrip.route}</div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-teal-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-teal-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-teal-600" />
            </div>
            <span className="text-xs text-teal-600 font-medium">YTD</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">${currentUser.ytdEarnings?.toLocaleString() || '0'}</div>
          <div className="text-sm text-gray-600">Year-to-date earnings</div>
          <div className="text-xs text-gray-500 mt-1">+8% vs last year</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Upcoming Schedule
            </h3>
            <span className="text-sm text-gray-600">{userTrips.length} trips</span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {userTrips.slice(0, 5).map((trip) => (
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
                    {new Date(trip.trip_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {trip.credit_hours}h
                  </div>
                </div>
                {trip.is_international && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    INTL
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                My Claims
              </h3>
              <button
                onClick={handleNewClaimClick}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Claim
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {userClaims.map((claim) => (
                <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{claim.claim_type}</div>
                    <div className="text-xs text-gray-600">{claim.trip_id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">${claim.amount}</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      claim.status === 'approved' ? 'bg-green-100 text-green-700' :
                      claim.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {claim.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
              {userClaims.length === 0 && (
                <p className="text-center text-gray-500 py-4">No claims submitted yet</p>
              )}
            </div>
          </div>

          <ConversationalAI
            role="crew-member"
            context={`${currentUser.role} ${currentUser.name} - ${currentUser.base} base`}
          />
        </div>
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
