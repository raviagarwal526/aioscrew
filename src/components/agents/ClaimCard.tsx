import { CheckCircle, AlertTriangle, Brain, BookOpen } from 'lucide-react';
import { ClaimData } from '../../types/agents';
import AgentProcessingTimeline from './AgentProcessingTimeline';

interface ClaimCardProps {
  claim: ClaimData;
  onApprove?: (claimId: string) => void;
  onReject?: (claimId: string) => void;
  onRequestInfo?: (claimId: string) => void;
}

export default function ClaimCard({ claim, onApprove, onReject, onRequestInfo }: ClaimCardProps) {
  const isValidated = claim.status === 'ai-validated';
  const isFlagged = claim.status === 'needs-review';
  const validation = claim.agentValidation;

  return (
    <div className={`p-6 border-b hover:bg-gray-50 ${isFlagged ? 'bg-orange-50' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-4">
          <div className={`h-16 w-16 rounded-lg flex items-center justify-center ${
            isValidated ? 'bg-green-100' : isFlagged ? 'bg-orange-100' : 'bg-gray-100'
          }`}>
            {isValidated ? (
              <CheckCircle className="text-green-600" size={32} />
            ) : isFlagged ? (
              <AlertTriangle className="text-orange-600" size={32} />
            ) : (
              <Brain className="text-gray-600" size={32} />
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-bold text-lg">{claim.claimNumber}</h4>
              {isValidated && (
                <>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                    ✓ AI VALIDATED
                  </span>
                  <span className="bg-blue-50 text-blue-900 px-2 py-1 rounded text-xs">
                    Processed in {validation?.processingTime}s
                  </span>
                </>
              )}
              {isFlagged && (
                <>
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold">
                    ⚠️ NEEDS REVIEW
                  </span>
                  <span className="bg-blue-50 text-blue-900 px-2 py-1 rounded text-xs">
                    Processed in {validation?.processingTime}s
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {claim.crewMember} • {claim.type} • {claim.flight} • ${claim.amount.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Submitted: {claim.submittedDate.toLocaleDateString()} at {claim.submittedDate.toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          {isValidated && onApprove && (
            <button
              onClick={() => onApprove(claim.id)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
            >
              Auto-Approve
            </button>
          )}
          {isFlagged && (
            <>
              {onApprove && (
                <button
                  onClick={() => onApprove(claim.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
                >
                  Approve
                </button>
              )}
              {onReject && (
                <button
                  onClick={() => onReject(claim.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
                >
                  Reject
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {validation && validation.steps && (
        <AgentProcessingTimeline steps={validation.steps} />
      )}

      {validation?.contractReferences && validation.contractReferences.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-900 rounded-r-lg p-4 mt-4">
          <div className="flex items-start space-x-2">
            <BookOpen className="text-blue-900 flex-shrink-0 mt-0.5" size={16} />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 mb-1">
                {validation.contractReferences[0].section} - {validation.contractReferences[0].title}
              </p>
              <p className="text-gray-700 text-xs">
                {validation.contractReferences[0].text}
              </p>
              <button className="text-blue-900 hover:underline text-xs mt-2">
                View full contract section in Neo4j Graph →
              </button>
            </div>
          </div>
        </div>
      )}

      {isFlagged && validation?.issues && validation.issues.length > 0 && (
        <div className="bg-white border-2 border-orange-500 rounded-lg p-4 mt-4">
          <h5 className="font-semibold text-sm text-orange-800 mb-3 flex items-center">
            <AlertTriangle className="mr-2" size={16} />
            Why This Was Flagged for Manual Review
          </h5>

          <div className="space-y-3">
            {validation.issues.map((issue, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-sm">{issue.title}</p>
                  <p className="text-xs text-gray-700">{issue.description}</p>
                  {issue.suggestedAction && (
                    <p className="text-xs text-orange-700 font-semibold mt-1">
                      → {issue.suggestedAction}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isFlagged && validation?.recommendation && (
        <div className="bg-blue-50 rounded-lg p-4 mt-4">
          <h5 className="font-semibold text-sm text-blue-900 mb-2 flex items-center">
            <Brain className="mr-2" size={16} />
            AI Recommendation
          </h5>
          <div className="bg-white rounded p-3 text-sm">
            <p className="font-semibold text-orange-700 mb-1">
              {validation.recommendation}
            </p>
            {onRequestInfo && (
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => onRequestInfo(claim.id)}
                  className="flex-1 bg-blue-900 text-white px-4 py-2 rounded text-sm hover:bg-blue-800"
                >
                  Request Info from Crew
                </button>
                <button className="flex-1 border-2 border-blue-900 text-blue-900 px-4 py-2 rounded text-sm hover:bg-blue-900 hover:text-white">
                  Contact Crew Scheduler
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {validation?.historicalAnalysis && (
        <div className="bg-gray-50 rounded-lg p-4 mt-4">
          <h5 className="font-semibold text-sm text-gray-700 mb-2">
            📊 Historical Analysis
          </h5>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-gray-600">Similar Claims</p>
              <p className="font-bold text-blue-900">
                {validation.historicalAnalysis.similarClaims} approved
              </p>
            </div>
            <div>
              <p className="text-gray-600">Average Amount</p>
              <p className="font-bold text-blue-900">
                ${validation.historicalAnalysis.averageAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Approval Rate</p>
              <p className="font-bold text-green-600">
                {Math.round(validation.historicalAnalysis.approvalRate * 100)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
