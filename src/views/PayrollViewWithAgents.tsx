import { useState, useEffect } from 'react';
import { BarChart3, DollarSign, FileText, TrendingUp, Users } from 'lucide-react';
import AgentActivityFeed from '../components/agents/AgentActivityFeed';
import ClaimCard from '../components/agents/ClaimCard';
import { ClaimData, AgentActivity } from '../types/agents';
import { mockClaims, validateClaimWithAgents, createAgentActivity } from '../services/agentService';

export default function PayrollViewWithAgents() {
  const [claims, setClaims] = useState<ClaimData[]>([]);
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    aiApproved: 0,
    needsReview: 0,
    approvalRate: 0
  });

  useEffect(() => {
    processClaims();
  }, []);

  const processClaims = async () => {
    setIsProcessing(true);
    const processedClaims: ClaimData[] = [];
    const newActivities: AgentActivity[] = [];

    newActivities.push(
      createAgentActivity('orchestrator', 'Orchestrator', 'processing', `Analyzing ${mockClaims.length} new claims...`)
    );
    setActivities([...newActivities]);

    for (const claim of mockClaims) {
      await new Promise(resolve => setTimeout(resolve, 500));

      const validation = await validateClaimWithAgents(claim);

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
            `Validated ${claim.claimNumber} ✓`
          )
        );
      } else if (validation.overallStatus === 'flagged') {
        newActivities.push(
          createAgentActivity(
            'compliance',
            'Compliance Validator',
            'flagged',
            `${claim.claimNumber} flagged for review`
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
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md border-l-4 border-blue-900 p-4">
          <div className="flex items-center justify-between mb-2">
            <FileText className="text-blue-900" size={24} />
            <TrendingUp className="text-green-600" size={16} />
          </div>
          <div className="text-2xl font-bold text-gray-900">{claims.length}</div>
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
            <span className="text-xs font-semibold text-blue-600">1.4s avg</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">20</div>
          <div className="text-sm text-gray-600">Agents Active</div>
        </div>
      </div>

      <AgentActivityFeed activities={activities.slice(0, 5)} isProcessing={isProcessing} />

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-blue-900">Claims Queue</h3>
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
                  {stats.needsReview} ({claims.length > 0 ? Math.round((stats.needsReview / claims.length) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {claims.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-pulse mb-4">Processing claims with AI agents...</div>
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
    </div>
  );
}
