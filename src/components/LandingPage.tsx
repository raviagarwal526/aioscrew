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
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Plane className="w-12 h-12" />
            <h1 className="text-5xl font-bold">Crew Operating System</h1>
          </div>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            The Unified Intelligence Platform for Airline Crew Operations
          </p>
          <p className="text-sm text-blue-300 mt-2">
            Multi-persona AI workspace where different roles access the same intelligence through contextual interfaces
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {personas.map((persona) => {
            const Icon = persona.icon;
            return (
              <button
                key={persona.role}
                onClick={() => onSelectRole(persona.role)}
                className="group relative bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${persona.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`} />

                <div className="relative">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${persona.color} mb-4`}>
                    <Icon className="w-8 h-8" />
                  </div>

                  <h3 className="text-2xl font-bold mb-1">{persona.title}</h3>
                  <p className="text-blue-300 text-sm mb-4">{persona.subtitle}</p>

                  <div className="space-y-2">
                    {persona.capabilities.map((capability, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${persona.color} mt-1.5 flex-shrink-0`} />
                        <span className="text-blue-100">{capability}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10">
                    <span className="text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
                      Login as {persona.title} →
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-blue-200">
              Demo Mode - Select any persona to explore the platform
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
