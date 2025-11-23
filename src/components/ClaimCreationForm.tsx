import { useState, useEffect } from 'react';
import {
  X, DollarSign, Calendar, Clock, Plane, MapPin, AlertCircle,
  CheckCircle, Info, FileText, Globe, Utensils, Moon, Briefcase,
  TrendingUp, Award, Users
} from 'lucide-react';
import type { CrewMember, Trip, Claim } from '../types';

interface ClaimCreationFormProps {
  currentUser: CrewMember;
  userTrips: Trip[];
  onClose: () => void;
  onSubmit: (claim: Omit<Claim, 'id'>) => Promise<void>;
  prefilledData?: Partial<ClaimFormData>;
}

interface ClaimFormData {
  type: string;
  tripId: string;
  amount: string;
  description: string;
  // Additional fields for different claim types
  startDate?: string;
  endDate?: string;
  hours?: string;
  layoverCity?: string;
  numberOfDays?: string;
  mealCount?: string;
  numberOfCrewMembers?: string;
  premiumRate?: string;
}

const CLAIM_TYPES = [
  {
    id: 'international_premium',
    label: 'International Premium',
    icon: Globe,
    description: 'Premium pay for international flights',
    baseAmount: 125,
    requiresTrip: true,
    contractRef: 'CBA Section 12.4.1'
  },
  {
    id: 'per_diem',
    label: 'Per Diem',
    icon: Utensils,
    description: 'Daily meal and incidental expenses',
    baseAmount: 75,
    requiresTrip: true,
    contractRef: 'CBA Section 8.2'
  },
  {
    id: 'holiday_pay',
    label: 'Holiday Pay',
    icon: Calendar,
    description: 'Premium for working on holidays',
    baseAmount: 150,
    requiresTrip: true,
    contractRef: 'CBA Section 11.3'
  },
  {
    id: 'overtime',
    label: 'Overtime',
    icon: Clock,
    description: 'Overtime compensation for hours over limit',
    baseAmount: 0,
    requiresTrip: false,
    contractRef: 'CBA Section 7.1'
  },
  {
    id: 'layover_premium',
    label: 'Layover Premium',
    icon: Moon,
    description: 'Premium for extended layovers',
    baseAmount: 50,
    requiresTrip: true,
    contractRef: 'CBA Section 9.5'
  },
  {
    id: 'training_pay',
    label: 'Training Pay',
    icon: Award,
    description: 'Compensation for required training',
    baseAmount: 200,
    requiresTrip: false,
    contractRef: 'CBA Section 14.2'
  },
  {
    id: 'lead_premium',
    label: 'Lead/Check Airman Premium',
    icon: Users,
    description: 'Premium for serving as check airman or lead',
    baseAmount: 100,
    requiresTrip: true,
    contractRef: 'CBA Section 13.1'
  },
  {
    id: 'deadhead',
    label: 'Deadhead Compensation',
    icon: Plane,
    description: 'Compensation for deadhead positioning',
    baseAmount: 75,
    requiresTrip: true,
    contractRef: 'CBA Section 10.4'
  },
  {
    id: 'other',
    label: 'Other',
    icon: FileText,
    description: 'Other types of claims',
    baseAmount: 0,
    requiresTrip: false,
    contractRef: 'CBA Section 15'
  }
];

export default function ClaimCreationForm({ currentUser, userTrips, onClose, onSubmit, prefilledData }: ClaimCreationFormProps) {
  const [step, setStep] = useState<'type' | 'details' | 'review'>(prefilledData?.type ? 'details' : 'type');
  const [formData, setFormData] = useState<ClaimFormData>({
    type: prefilledData?.type || '',
    tripId: prefilledData?.tripId || '',
    amount: prefilledData?.amount || '',
    description: prefilledData?.description || '',
    hours: prefilledData?.hours || '',
    numberOfDays: prefilledData?.numberOfDays || ''
  });
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedClaimType = CLAIM_TYPES.find(ct => ct.id === formData.type);

  // Auto-select trip when trip ID changes
  useEffect(() => {
    if (formData.tripId) {
      const trip = userTrips.find(t => t.id === formData.tripId);
      setSelectedTrip(trip || null);
    } else {
      setSelectedTrip(null);
    }
  }, [formData.tripId, userTrips]);

  // Auto-calculate amount based on claim type and trip details
  useEffect(() => {
    if (!selectedClaimType || !selectedTrip) {
      setCalculatedAmount(0);
      return;
    }

    let amount = 0;

    switch (formData.type) {
      case 'international_premium':
        amount = selectedTrip.is_international ? 125 : 0;
        break;
      case 'per_diem':
        const days = parseInt(formData.numberOfDays || '1');
        amount = (selectedTrip.is_international ? 95 : 75) * days;
        break;
      case 'holiday_pay':
        amount = 150;
        break;
      case 'overtime':
        const hours = parseFloat(formData.hours || '0');
        const hourlyRate = 85; // Base hourly rate, could come from user profile
        amount = hours * hourlyRate * 1.5; // 1.5x for overtime
        break;
      case 'layover_premium':
        amount = 50;
        break;
      case 'training_pay':
        amount = 200;
        break;
      case 'lead_premium':
        amount = 100 * parseFloat(selectedTrip.credit_hours?.toString() || '1');
        break;
      case 'deadhead':
        amount = 75;
        break;
      default:
        amount = parseFloat(formData.amount) || 0;
    }

    setCalculatedAmount(amount);
    if (amount > 0 && formData.type !== 'other') {
      setFormData(prev => ({ ...prev, amount: amount.toString() }));
    }
  }, [formData.type, selectedTrip, formData.hours, formData.numberOfDays]);

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.type) {
      errors.push('Please select a claim type');
    }

    if (selectedClaimType?.requiresTrip && !formData.tripId) {
      errors.push('Please select a trip for this claim type');
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.push('Amount must be greater than zero');
    }

    if (formData.type === 'international_premium' && selectedTrip && !selectedTrip.is_international) {
      errors.push('International Premium requires an international flight');
    }

    if (formData.type === 'overtime' && (!formData.hours || parseFloat(formData.hours) <= 0)) {
      errors.push('Please enter overtime hours');
    }

    if (formData.type === 'per_diem' && (!formData.numberOfDays || parseInt(formData.numberOfDays) <= 0)) {
      errors.push('Please enter number of days for per diem');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (step === 'type' && formData.type) {
      setStep('details');
    } else if (step === 'details') {
      if (validateForm()) {
        setStep('review');
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const claim: Omit<Claim, 'id'> = {
        crew_id: currentUser.id,
        claim_type: selectedClaimType?.label || formData.type,
        trip_id: formData.tripId || 'N/A',
        claim_date: new Date().toISOString().split('T')[0],
        amount: parseFloat(formData.amount),
        status: 'pending',
        ai_validated: false,
        ai_explanation: '',
        contract_reference: selectedClaimType?.contractRef || 'CBA Section 15',
        notes: formData.description
      };

      await onSubmit(claim);
      onClose();
    } catch (error) {
      console.error('Error submitting claim:', error);
      setValidationErrors(['Failed to submit claim. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Create New Claim</h3>
            <p className="text-sm text-gray-600 mt-1">
              Step {step === 'type' ? '1' : step === 'details' ? '2' : '3'} of 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className={`flex-1 h-2 rounded-full ${step !== 'type' ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex-1 h-2 rounded-full ${step === 'review' ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex-1 h-2 rounded-full bg-gray-300`} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Select Claim Type */}
          {step === 'type' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Select Claim Type</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Choose the type of claim you want to submit. Each type has different requirements and contract references.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {CLAIM_TYPES.map((claimType) => {
                  const Icon = claimType.icon;
                  const isSelected = formData.type === claimType.id;

                  return (
                    <button
                      key={claimType.id}
                      onClick={() => setFormData({ ...formData, type: claimType.id })}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          isSelected ? 'bg-blue-600' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            isSelected ? 'text-white' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{claimType.label}</div>
                          <div className="text-sm text-gray-600 mt-1">{claimType.description}</div>
                          {claimType.baseAmount > 0 && (
                            <div className="text-sm text-blue-600 mt-2 font-medium">
                              Base: ${claimType.baseAmount}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Enter Details */}
          {step === 'details' && selectedClaimType && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">Claim Details</h4>
                <p className="text-sm text-gray-600">
                  Selected: <span className="font-medium">{selectedClaimType.label}</span>
                </p>
              </div>

              {/* Trip Selection (if required) */}
              {selectedClaimType.requiresTrip && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Trip <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.tripId}
                    onChange={(e) => setFormData({ ...formData, tripId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a trip</option>
                    {userTrips
                      .filter(trip => trip.status === 'completed' || trip.status === 'scheduled')
                      .map(trip => (
                        <option key={trip.id} value={trip.id}>
                          {trip.id} - {trip.route} - {new Date(trip.trip_date).toLocaleDateString()}
                          {trip.is_international ? ' (International)' : ''}
                        </option>
                      ))}
                  </select>

                  {/* Trip Details Preview */}
                  {selectedTrip && (
                    <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700">Route:</span>
                          <span className="font-medium">{selectedTrip.route}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700">Date:</span>
                          <span className="font-medium">
                            {new Date(selectedTrip.trip_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700">Credit Hours:</span>
                          <span className="font-medium">{selectedTrip.credit_hours}h</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700">Type:</span>
                          <span className="font-medium">
                            {selectedTrip.is_international ? 'International' : 'Domestic'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Claim Type Specific Fields */}
              {formData.type === 'overtime' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overtime Hours <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.hours || ''}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="8.0"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Overtime is paid at 1.5x the base rate for hours over the monthly limit
                  </p>
                </div>
              )}

              {formData.type === 'per_diem' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Days <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfDays || ''}
                    onChange={(e) => setFormData({ ...formData, numberOfDays: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedTrip?.is_international
                      ? 'International per diem: $95/day'
                      : 'Domestic per diem: $75/day'}
                  </p>
                </div>
              )}

              {/* Amount Display/Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ($) <span className="text-red-500">*</span>
                </label>
                {calculatedAmount > 0 && formData.type !== 'other' ? (
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-3 pr-32 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly={formData.type !== 'other'}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Auto-calculated
                    </div>
                  </div>
                ) : (
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="125.00"
                  />
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description/Notes
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Add any additional details or notes about this claim..."
                />
              </div>

              {/* Contract Reference Info */}
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-amber-900">Contract Reference</div>
                    <div className="text-sm text-amber-700 mt-1">
                      This claim will be validated against {selectedClaimType.contractRef}
                    </div>
                  </div>
                </div>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-red-900">Please fix the following:</div>
                      <ul className="list-disc list-inside text-sm text-red-700 mt-1 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 'review' && selectedClaimType && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">Review Your Claim</h4>
                <p className="text-sm text-gray-600">
                  Please review the details before submitting
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    {(() => {
                      const Icon = selectedClaimType.icon;
                      return <Icon className="w-6 h-6 text-white" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <h5 className="text-xl font-bold text-gray-900">{selectedClaimType.label}</h5>
                    <p className="text-sm text-gray-600 mt-1">{selectedClaimType.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      ${parseFloat(formData.amount).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-blue-300">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Crew Member</div>
                    <div className="font-medium text-gray-900">
                      {currentUser.role} {currentUser.name}
                    </div>
                  </div>
                  {selectedTrip && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Trip</div>
                      <div className="font-medium text-gray-900">
                        {selectedTrip.id} - {selectedTrip.route}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Claim Date</div>
                    <div className="font-medium text-gray-900">
                      {new Date().toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Contract Reference</div>
                    <div className="font-medium text-gray-900">
                      {selectedClaimType.contractRef}
                    </div>
                  </div>
                </div>

                {formData.description && (
                  <div className="mt-4 pt-4 border-t border-blue-300">
                    <div className="text-sm text-gray-600 mb-1">Notes</div>
                    <div className="text-gray-900">{formData.description}</div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <div className="font-medium mb-1">What happens next?</div>
                    <ul className="list-disc list-inside space-y-1 text-green-700">
                      <li>Your claim will be submitted with status "Pending"</li>
                      <li>AI agents will validate your claim against the CBA contract</li>
                      <li>Payroll admin will review and approve/reject</li>
                      <li>You'll be notified of the decision</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between">
          {step !== 'type' && (
            <button
              onClick={() => setStep(step === 'review' ? 'details' : 'type')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Back
            </button>
          )}
          {step === 'type' && <div />}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            {step !== 'review' ? (
              <button
                onClick={handleNext}
                disabled={!formData.type}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || validationErrors.length > 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Submit Claim
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
