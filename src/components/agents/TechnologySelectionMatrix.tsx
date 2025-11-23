import { Brain, Zap, Shield, Calculator, CheckCircle, DollarSign, AlertCircle } from 'lucide-react';

interface TechnologyChoice {
  problemType: string;
  technology: string;
  provider: string;
  icon: JSX.Element;
  reasoning: string;
  performance: string;
  cost: string;
  color: string;
}

export default function TechnologySelectionMatrix() {
  const technologyChoices: TechnologyChoice[] = [
    {
      problemType: 'Flight Time Calculations',
      technology: 'GPT-4o Mini',
      provider: 'OpenAI',
      icon: <Calculator className="text-blue-500" size={20} />,
      reasoning: 'Structured math calculations, fast inference, cost-effective for simple logic',
      performance: '~2-3s',
      cost: '$0.15 per 1M tokens',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      problemType: 'Premium Pay Validation',
      technology: 'Claude Sonnet 4.5',
      provider: 'Anthropic',
      icon: <Brain className="text-purple-500" size={20} />,
      reasoning: 'Complex contract reasoning, multi-step logic, excellent at nuanced interpretations',
      performance: '~5-8s',
      cost: '$3 per 1M tokens',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      problemType: 'Compliance & Legal Analysis',
      technology: 'Claude Opus',
      provider: 'Anthropic',
      icon: <Shield className="text-red-500" size={20} />,
      reasoning: 'Most powerful reasoning, handles ambiguous legal clauses, highest accuracy',
      performance: '~8-12s',
      cost: '$15 per 1M tokens',
      color: 'bg-red-50 border-red-200'
    },
    {
      problemType: 'Basic Eligibility Rules',
      technology: 'Rules Engine',
      provider: 'Native Code',
      icon: <Zap className="text-green-500" size={20} />,
      reasoning: 'Simple if/then logic, deterministic, no AI needed, instant results',
      performance: '<100ms',
      cost: '$0 (free)',
      color: 'bg-green-50 border-green-200'
    },
    {
      problemType: 'Data Validation',
      technology: 'Type Checking',
      provider: 'TypeScript',
      icon: <CheckCircle className="text-gray-500" size={20} />,
      reasoning: 'Schema validation, type safety, compile-time checking, no runtime cost',
      performance: '<10ms',
      cost: '$0 (free)',
      color: 'bg-gray-50 border-gray-200'
    },
    {
      problemType: 'Amount Calculations',
      technology: 'Native Math',
      provider: 'JavaScript',
      icon: <DollarSign className="text-yellow-500" size={20} />,
      reasoning: 'Deterministic arithmetic, precise to the cent, no AI hallucination risk',
      performance: '<1ms',
      cost: '$0 (free)',
      color: 'bg-yellow-50 border-yellow-200'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Brain className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Technology Selection Matrix</h3>
            <p className="text-sm text-gray-600">Intelligent routing: Right technology for each problem</p>
          </div>
        </div>
      </div>

      {/* Why Not Just One Technology? */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle size={18} />
          Why Use Multiple Technologies?
        </h4>
        <div className="grid grid-cols-3 gap-4 text-sm text-gray-700">
          <div>
            <strong className="text-blue-900">💰 Cost Optimization:</strong>
            <p className="text-xs mt-1">Use expensive LLMs only when needed. Simple calculations use free/cheap alternatives.</p>
          </div>
          <div>
            <strong className="text-blue-900">⚡ Performance:</strong>
            <p className="text-xs mt-1">Native code and rules engines are 100x faster than LLM calls for simple logic.</p>
          </div>
          <div>
            <strong className="text-blue-900">🎯 Accuracy:</strong>
            <p className="text-xs mt-1">Use deterministic code for math (no hallucinations), LLMs for reasoning.</p>
          </div>
        </div>
      </div>

      {/* Technology Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-4 font-bold text-gray-700">Problem Type</th>
              <th className="text-left py-3 px-4 font-bold text-gray-700">Technology</th>
              <th className="text-left py-3 px-4 font-bold text-gray-700">Why This Choice?</th>
              <th className="text-left py-3 px-4 font-bold text-gray-700">Performance</th>
              <th className="text-left py-3 px-4 font-bold text-gray-700">Cost</th>
            </tr>
          </thead>
          <tbody>
            {technologyChoices.map((choice, index) => (
              <tr
                key={index}
                className={`border-b border-gray-200 hover:bg-gray-50 transition-colors`}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    {choice.icon}
                    <span className="font-medium text-gray-900">{choice.problemType}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div>
                    <div className="font-semibold text-gray-900">{choice.technology}</div>
                    <div className="text-xs text-gray-500">{choice.provider}</div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-xs text-gray-700 leading-relaxed">{choice.reasoning}</p>
                </td>
                <td className="py-4 px-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                    {choice.performance}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-xs font-medium text-gray-700">{choice.cost}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Principles */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <h5 className="font-bold text-green-900 text-sm mb-1">Use Free When Possible</h5>
          <p className="text-xs text-gray-700">Native code, type checking, and rules engines cost $0</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
          <h5 className="font-bold text-blue-900 text-sm mb-1">Cheap for Simple Tasks</h5>
          <p className="text-xs text-gray-700">GPT-4o-mini for structured calculations (20x cheaper than Claude)</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <h5 className="font-bold text-purple-900 text-sm mb-1">Premium for Complex Reasoning</h5>
          <p className="text-xs text-gray-700">Claude Opus for ambiguous legal/contract analysis</p>
        </div>
      </div>

      {/* Real-time Usage Stats */}
      <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-3 text-sm">Current Session Usage</h4>
        <div className="grid grid-cols-4 gap-3 text-xs">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">2</div>
            <div className="text-gray-600">GPT-4o Mini calls</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">5</div>
            <div className="text-gray-600">Claude Sonnet calls</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">3</div>
            <div className="text-gray-600">Claude Opus calls</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">15</div>
            <div className="text-gray-600">Rules Engine checks</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-300 text-center">
          <span className="text-sm font-semibold text-gray-700">Total Cost This Session: </span>
          <span className="text-lg font-bold text-green-600">$0.24</span>
          <span className="text-xs text-gray-500 ml-2">(vs $2.10 if using only Claude Opus)</span>
        </div>
      </div>
    </div>
  );
}
