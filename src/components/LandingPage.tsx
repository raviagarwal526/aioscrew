import { useState } from 'react';
import { Plane, Calendar, Target, DollarSign, BarChart3, Scale, Building2, Cpu } from 'lucide-react';
import { UserRole } from '../types';
import AutomationLabsPage from './AutomationLabsPage';

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
    color: 'from-slate-900 via-blue-900 to-indigo-900',
    accent: 'from-blue-500/80 to-cyan-500/80'
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
    color: 'from-slate-900 via-violet-900 to-purple-900',
    accent: 'from-purple-500/80 to-pink-500/80'
  },
  {
    role: 'crew-scheduler' as UserRole,
    icon: Calendar,
    title: 'Crew Scheduling System',
    subtitle: 'Regulatory Compliance & Rostering',
    capabilities: [
      'Regulatory rule engine & compliance',
      'Automated roster generation',
      'Disruption management & reassignment'
    ],
    color: 'from-slate-900 via-indigo-900 to-blue-900',
    accent: 'from-indigo-500/80 to-blue-500/80'
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
    color: 'from-slate-900 via-rose-900 to-red-900',
    accent: 'from-rose-500/80 to-orange-500/80'
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
    color: 'from-slate-900 via-emerald-900 to-teal-900',
    accent: 'from-emerald-500/80 to-teal-500/80'
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
    color: 'from-slate-900 via-amber-900 to-orange-900',
    accent: 'from-amber-500/80 to-orange-500/80'
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
    color: 'from-slate-900 via-teal-900 to-cyan-900',
    accent: 'from-teal-500/80 to-cyan-500/80'
  },
  {
    role: 'executive' as UserRole,
    icon: Building2,
    title: 'Executive Dashboard',
    subtitle: 'C-Suite Leadership',
    capabilities: [
      'Complete airline operations overview',
      'Multi-level operational dashboards',
      'Strategic KPI monitoring'
    ],
    color: 'from-slate-900 via-indigo-900 to-slate-900',
    accent: 'from-indigo-500/80 to-blue-500/80'
  }
] as const;

export default function LandingPage({ onSelectRole }: LandingPageProps) {
  const [showAutomationLab, setShowAutomationLab] = useState(false);

  // If showing automation lab, render it full screen
  if (showAutomationLab) {
    return <AutomationLabsPage onBack={() => setShowAutomationLab(false)} />;
  }

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

        {/* Persona Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {personas.map((persona) => {
              const Icon = persona.icon;
              return (
                <button
                  key={persona.role}
                  onClick={() => onSelectRole(persona.role)}
                  className="bg-slate-900/60 border border-white/10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-left overflow-hidden backdrop-blur"
                >
                  <div className={`relative bg-gradient-to-br ${persona.color} p-6`}>
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.3),_transparent_45%)]" />
                    <Icon className="relative w-12 h-12 text-white mb-3" />
                    <h3 className="relative text-xl font-bold text-white">{persona.title}</h3>
                    <p className="relative text-white/80 text-sm">{persona.subtitle}</p>
                  </div>
                  <div className="p-6 bg-slate-950/40">
                    <ul className="space-y-2 text-sm text-slate-200 mb-6">
                      {persona.capabilities.map((capability, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-emerald-300 mr-2">✓</span>
                          {capability}
                        </li>
                      ))}
                    </ul>
                    <div className={`w-full bg-gradient-to-r ${persona.accent} border border-white/10 text-white/90 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold text-center`}>
                      Login as {persona.title}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Automation Labs Card */}
            <button
              onClick={() => setShowAutomationLab(true)}
              className="bg-slate-900/60 border border-cyan-500/30 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-left overflow-hidden backdrop-blur"
            >
              <div className="relative bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 p-6">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.3),_transparent_45%)]" />
                <Cpu className="relative w-12 h-12 text-white mb-3" />
                <h3 className="relative text-xl font-bold text-white">Automation Lab</h3>
                <p className="relative text-white/80 text-sm">Data Generation & Testing</p>
              </div>
              <div className="p-6 bg-slate-950/40">
                <ul className="space-y-2 text-sm text-slate-200 mb-6">
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    Generate realistic test data
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    AI-powered scenario presets
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-300 mr-2">✓</span>
                    Ollama & Claude integration
                  </li>
                </ul>
                <div className="w-full bg-gradient-to-r from-cyan-500/80 to-blue-500/80 border border-white/10 text-white/90 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold text-center">
                  Open Automation Lab
                </div>
              </div>
            </button>
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
