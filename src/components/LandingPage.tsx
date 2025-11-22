import { Plane, Calendar, Target, DollarSign, BarChart3, Scale } from 'lucide-react';
import { UserRole } from '../types';

interface LandingPageProps {
  onSelectRole: (role: UserRole) => void;
}

const personas = [
  {
    role: 'crew-member' as UserRole,
    icon: Plane,
    title: 'Crew Member',
    subtitle: 'Captain Sarah Martinez',
    capabilities: [
      'View schedule & trip details',
      'Submit & track pay claims',
      'Check training requirements'
    ],
    color: 'from-blue-500 to-blue-600'
  },
  {
    role: 'scheduler' as UserRole,
    icon: Calendar,
    title: 'Crew Scheduler',
    subtitle: 'Planning Team',
    capabilities: [
      'AI-powered roster optimization',
      'Pairing assignment & bidding',
      'Cost analysis & forecasting'
    ],
    color: 'from-purple-500 to-purple-600'
  },
  {
    role: 'controller' as UserRole,
    icon: Target,
    title: 'Crew Controller',
    subtitle: 'Real-time Operations',
    capabilities: [
      'Live disruption management',
      'Instant crew reassignment',
      'Reserve crew coordination'
    ],
    color: 'from-red-500 to-red-600'
  },
  {
    role: 'payroll' as UserRole,
    icon: DollarSign,
    title: 'Payroll Admin',
    subtitle: 'Finance Team',
    capabilities: [
      'AI-validated claim processing',
      'Automated pay calculations',
      'Compliance audit trails'
    ],
    color: 'from-green-500 to-green-600'
  },
  {
    role: 'management' as UserRole,
    icon: BarChart3,
    title: 'Operations Manager',
    subtitle: 'Executive Leadership',
    capabilities: [
      'Real-time KPI dashboards',
      'Cost optimization insights',
      'Predictive staffing analytics'
    ],
    color: 'from-amber-500 to-amber-600'
  },
  {
    role: 'union' as UserRole,
    icon: Scale,
    title: 'Union Representative',
    subtitle: 'Workplace Advocacy',
    capabilities: [
      'Contract compliance monitoring',
      'Violation detection & alerts',
      'Member advocacy analytics'
    ],
    color: 'from-teal-500 to-teal-600'
  }
];

export default function LandingPage({ onSelectRole }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <img
            src="/image copy.png"
            alt="Copa Airlines"
            className="h-24 w-auto mx-auto mb-6"
          />
          <h1 className="text-5xl font-bold text-white mb-4">
            Airline Crew Operating System
          </h1>
          <p className="text-xl text-blue-400 mb-2">
            Powered by AI from dCortex
          </p>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Unified platform for airline crew operations across all departments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {personas.map((persona) => {
            const Icon = persona.icon;
            return (
              <button
                key={persona.role}
                onClick={() => onSelectRole(persona.role)}
                className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-left overflow-hidden"
              >
                <div className={`bg-gradient-to-r ${persona.color} p-6`}>
                  <Icon className="w-12 h-12 text-white mb-3" />
                  <h3 className="text-xl font-bold text-white">{persona.title}</h3>
                  <p className="text-white/80 text-sm">{persona.subtitle}</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-2 text-sm text-gray-700 mb-6">
                    {persona.capabilities.map((capability, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        {capability}
                      </li>
                    ))}
                  </ul>
                  <div className={`w-full bg-gradient-to-r ${persona.color} text-white py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold text-center`}>
                    Login as {persona.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-blue-400/50">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-sm text-white">
              Demo Mode - Select any persona to explore the platform
            </span>
          </div>
        </div>

        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>© 2024 Airline Crew Operating System</p>
        </div>
      </div>
    </div>
  );
}
