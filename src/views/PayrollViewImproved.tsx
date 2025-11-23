import { useState } from 'react';
import { BarChart3, DollarSign, FileText, TrendingUp, Users, Play, RefreshCw } from 'lucide-react';
import AgentActivityFeed from '../components/agents/AgentActivityFeed';
import ClaimCard from '../components/agents/ClaimCard';
import AIValidationPipeline from '../components/agents/AIValidationPipeline';
import TechnologySelectionMatrix from '../components/agents/TechnologySelectionMatrix';
import { ClaimData, AgentActivity } from '../types/agents';
import { mockClaims, validateClaimWithAgents, createAgentActivity } from '../services/agentService';

export default function PayrollViewImproved() {
  const [claims, setClaims] = useState<ClaimData[]>([]);
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | undefined>();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [stepDurations, setStepDurations] = useState<Record<string, number>>({});
  const [hasStarted, setHasStarted] = useState(false);
  const [stats, setStats] = useState({
    aiApproved: 0,
    needsReview: 0,
    approvalRate: 0
  });

  const startValidation = async () => {
    setIsProcessing(true);
    setHasStarted(true);
    setCompletedSteps([]);
    setStepDurations({});
    const processedClaims: ClaimData[] = [];
    const newActivities: AgentActivity[] = [];

    newActivities.push(
      createAgentActivity('orchestrator', 'Orchestrator', 'processing', `Starting AI validation for ${mockClaims.length} claims...`)
    );
    setActivities([...newActivities]);

    for (const claim of mockClaims) {
      // Simulate parallel agent execution
      setCurrentStep('flight-time');
      await new Promise(resolve => setTimeout(resolve, 300));

      const flightTimeStart = Date.now();
      setCurrentStep('premium-pay');
      await new Promise(resolve => setTimeout(resolve, 300));

      const premiumPayStart = Date.now();
      setCurrentStep('compliance');
      await new Promise(resolve => setTimeout(resolve, 300));

      const complianceStart = Date.now();
      setCurrentStep('decision');

      const validation = await validateClaimWithAgents(claim);

      // Record durations (simulated parallel execution)
      setStepDurations({
        'flight-time': (Date.now() - flightTimeStart) / 1000,
        'premium-pay': (Date.now() - premiumPayStart) / 1000,
        'compliance': (Date.now() - complianceStart) / 1000,
        'decision': 0.5
      });

      setCompletedSteps(['flight-time', 'premium-pay', 'compliance', 'decision']);
      setCurrentStep(undefined);

      const processedClaim: ClaimData = {
        ...claim,
        agentValidation: validation
      };
      processedClaims.push(processedClaim);

      if (validation.overallStatus === 'approved') {
        newActivities.push(
          createAgentActivity(
            validation.steps[validation.steps.length - 1].agentType,
            validation.steps[validation.steps.length - 1].agentName,
            'completed',
            `✅ ${claim.claimNumber} validated and approved`
          )
        );
      } else if (validation.overallStatus === 'flagged') {
        newActivities.push(
          createAgentActivity(
            'compliance',
            'Compliance Validator',
            'flagged',
            `⚠️ ${claim.claimNumber} flagged for manual review`
          )
        );
      }

      setActivities([...newActivities]);
    }

    setClaims(processedClaims);
    setIsProcessing(false);

    const aiApproved = processedClaims.filter(c => c.status === 'ai-validated').length;
    const needsReview = processedClaims.filter(c => c.status === 'needs-review').length;
    setStats({
      aiApproved,
      needsReview,
      approvalRate: Math.round((aiApproved / processedClaims.length) * 100)
    });

    newActivities.push(
      createAgentActivity(
        'orchestrator',
        'Orchestrator',
        'completed',
        `🎉 Validation complete: ${aiApproved} approved, ${needsReview} need review`
      )
    );
    setActivities([...newActivities]);
  };

  const handleApprove = (claimId: string) => {
    setClaims(claims.map(c =>
      c.id === claimId ? { ...c, status: 'approved' as const } : c
    ));
    const claim = claims.find(c => c.id === claimId);
    if (claim) {
      const newActivity = createAgentActivity(
        'orchestrator',
        'Orchestrator',
        'completed',
        `${claim.claimNumber} approved by payroll admin`
      );
      setActivities([newActivity, ...activities.slice(0, 4)]);
    }
  };

  const handleReject = (claimId: string) => {
    setClaims(claims.map(c =>
      c.id === claimId ? { ...c, status: 'rejected' as const } : c
    ));
    const claim = claims.find(c => c.id === claimId);
    if (claim) {
      const newActivity = createAgentActivity(
        'orchestrator',
        'Orchestrator',
        'completed',
        `${claim.claimNumber} rejected by payroll admin`
      );
      setActivities([newActivity, ...activities.slice(0, 4)]);
    }
  };

  const handleRequestInfo = (claimId: string) => {
    const claim = claims.find(c => c.id === claimId);
    if (claim) {
      const newActivity = createAgentActivity(
        'communications',
        'Communications Agent',
        'processing',
        `Requesting additional information for ${claim.claimNumber}`
      );
      setActivities([newActivity, ...activities.slice(0, 4)]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md border-l-4 border-blue-900 p-4">
          <div className="flex items-center justify-between mb-2">
            <FileText className="text-blue-900" size={24} />
            <TrendingUp className="text-green-600" size={16} />
          </div>
          <div className="text-2xl font-bold text-gray-900">{claims.length || mockClaims.length}</div>
          <div className="text-sm text-gray-600">Total Claims</div>
        </div>

        <div className="bg-white rounded-lg shadow-md border-l-4 border-green-600 p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-green-600" size={24} />
            <span className="text-xs font-semibold text-green-600">{stats.approvalRate}%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.aiApproved}</div>
          <div className="text-sm text-gray-600">AI Auto-Approved</div>
        </div>

        <div className="bg-white rounded-lg shadow-md border-l-4 border-orange-500 p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="text-orange-500" size={24} />
            <span className="text-xs font-semibold text-orange-600">
              {claims.length > 0 ? Math.round((stats.needsReview / claims.length) * 100) : 0}%
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.needsReview}</div>
          <div className="text-sm text-gray-600">Needs Review</div>
        </div>

        <div className="bg-white rounded-lg shadow-md border-l-4 border-blue-600 p-4">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="text-blue-600" size={24} />
            <span className="text-xs font-semibold text-blue-600">~20s avg</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">20</div>
          <div className="text-sm text-gray-600">Agents Active</div>
        </div>
      </div>

      {/* AI Validation Control Panel */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-blue-900">AI Claim Validation</h2>
            <p className="text-sm text-gray-600 mt-1">
              Validate claims using AI agents powered by Claude Sonnet 4.5
            </p>
          </div>
          <button
            onClick={startValidation}
            disabled={isProcessing}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Play size={20} />
                <span>{hasStarted ? 'Run Again' : 'Start AI Validation'}</span>
              </>
            )}
          </button>
        </div>

        {/* AI Pipeline Visualization */}
        {hasStarted && (
          <AIValidationPipeline
            isRunning={isProcessing}
            currentStep={currentStep}
            completedSteps={completedSteps}
            stepDurations={stepDurations}
          />
        )}
      </div>

      {/* Activity Feed */}
      {hasStarted && activities.length > 0 && (
        <AgentActivityFeed activities={activities.slice(0, 5)} isProcessing={isProcessing} />
      )}

      {/* Claims Queue */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-blue-900">Claims Queue</h3>
            {claims.length > 0 && (
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="text-gray-600">AI Auto-Approved:</span>
                  <span className="font-bold text-green-600 ml-2">
                    {stats.aiApproved} ({stats.approvalRate}%)
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Needs Review:</span>
                  <span className="font-bold text-orange-600 ml-2">
                    {stats.needsReview} ({Math.round((stats.needsReview / claims.length) * 100)}%)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {claims.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="mb-4">
              <FileText className="mx-auto text-gray-300" size={64} />
            </div>
            <p className="text-lg font-medium">No claims validated yet</p>
            <p className="text-sm mt-2">Click "Start AI Validation" to begin processing claims</p>
          </div>
        ) : (
          claims.map(claim => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              onApprove={handleApprove}
              onReject={handleReject}
              onRequestInfo={handleRequestInfo}
            />
          ))
        )}
      </div>

      {/* Technology Selection Matrix */}
      <TechnologySelectionMatrix />
    </div>
  );
}
