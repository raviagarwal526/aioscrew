import { TrendingDown, TrendingUp, Users, DollarSign, Activity, BarChart3 } from 'lucide-react';
import ConversationalAI from '../components/ConversationalAI';

export default function ManagementView() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-2">Operations Management Dashboard</h2>
        <p className="text-amber-100">
          Executive Overview | Q4 2024 Performance Metrics
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <TrendingDown className="w-3 h-3" />
              4%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">$2.3M</div>
          <div className="text-sm text-gray-600">Monthly crew cost</div>
          <div className="text-xs text-gray-500 mt-1">vs $2.4M budget</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <TrendingUp className="w-3 h-3" />
              2%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">87.2 hrs</div>
          <div className="text-sm text-gray-600">Productivity per crew</div>
          <div className="text-xs text-gray-500 mt-1">Target: 85 hrs</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-teal-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-teal-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-teal-600" />
            </div>
            <span className="text-xs text-teal-600 font-medium">EXCELLENT</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">99.8%</div>
          <div className="text-sm text-gray-600">Legality compliance</div>
          <div className="text-xs text-gray-500 mt-1">2 minor violations YTD</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-amber-500">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs text-amber-600 font-medium">CURRENT</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">94%</div>
          <div className="text-sm text-gray-600">Training current</div>
          <div className="text-xs text-gray-500 mt-1">119 of 127 crew</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Crew Cost Trend - Q4 2024
          </h3>
          <div className="space-y-4">
            <div className="relative">
              <div className="flex justify-between items-end h-48 gap-4">
                <div className="flex-1 flex flex-col justify-end">
                  <div className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg" style={{ height: '75%' }}>
                    <div className="p-2 text-white text-center">
                      <div className="text-lg font-bold">$2.4M</div>
                      <div className="text-xs">Oct</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <div className="bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg" style={{ height: '70%' }}>
                    <div className="p-2 text-white text-center">
                      <div className="text-lg font-bold">$2.3M</div>
                      <div className="text-xs">Nov</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <div className="bg-gradient-to-t from-green-600 to-green-500 rounded-t-lg" style={{ height: '68%' }}>
                    <div className="p-2 text-white text-center">
                      <div className="text-lg font-bold">$2.35M</div>
                      <div className="text-xs">Dec*</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t-2 border-gray-200 mt-2"></div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">October</div>
                <div className="font-bold text-red-600">-3%</div>
                <div className="text-xs text-gray-500">vs budget</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">November</div>
                <div className="font-bold text-green-600">-4%</div>
                <div className="text-xs text-gray-500">vs budget</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">December*</div>
                <div className="font-bold text-green-600">-5%</div>
                <div className="text-xs text-gray-500">projected</div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="font-semibold text-green-900 mb-1">Q4 Performance</div>
              <div className="text-sm text-gray-700">
                Forecast: $7.05M total vs $7.36M budget
              </div>
              <div className="text-lg font-bold text-green-600 mt-2">$310K under budget</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Utilization by Base - November
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">BUR Base</span>
                <span className="text-sm font-bold text-gray-900">87.2 hrs/crew</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full flex items-center justify-end pr-2" style={{ width: '102.6%' }}>
                  <span className="text-xs text-white font-medium">+2.6%</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Target: 85 hrs | Status: Above target (good)</div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">PTY Base</span>
                <span className="text-sm font-bold text-gray-900">89.4 hrs/crew</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-4 rounded-full flex items-center justify-end pr-2" style={{ width: '105.2%' }}>
                  <span className="text-xs text-white font-medium">+5.2%</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Target: 85 hrs | Status: Monitor for burnout</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="font-semibold text-amber-900 mb-1">Recommendation</div>
              <div className="text-sm text-gray-700">
                Hire 2 crew for PTY to reduce utilization to 86 hrs/crew by January
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">65</div>
                <div className="text-xs text-gray-600">BUR Crew</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">62</div>
                <div className="text-xs text-gray-600">PTY Crew</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-green-600" />
          Key Cost Optimization Drivers - November
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-3xl font-bold text-green-600 mb-1">$45K</div>
            <div className="text-sm font-semibold text-gray-900">Reserve Utilization</div>
            <div className="text-xs text-gray-600 mt-1">Reduced callouts, better planning</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-3xl font-bold text-blue-600 mb-1">$38K</div>
            <div className="text-sm font-semibold text-gray-900">Reduced Deadheads</div>
            <div className="text-xs text-gray-600 mt-1">7 fewer positioning flights</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-3xl font-bold text-purple-600 mb-1">$52K</div>
            <div className="text-sm font-semibold text-gray-900">Optimized Positioning</div>
            <div className="text-xs text-gray-600 mt-1">AI-driven crew placement</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Summer Staffing Forecast
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="text-sm font-semibold text-blue-900 mb-2">Predictive Analysis: Jun-Aug 2025</div>
            <div className="text-3xl font-bold text-blue-600 mb-1">+18 crew needed</div>
            <div className="text-sm text-gray-700">+14% increase vs current staffing</div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-16 text-center">
                <div className="text-xl font-bold text-gray-900">12</div>
                <div className="text-xs text-gray-600">Pilots</div>
              </div>
              <div className="flex-1 text-sm text-gray-700">
                6 Captains + 6 First Officers for increased flight schedule
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-16 text-center">
                <div className="text-xl font-bold text-gray-900">6</div>
                <div className="text-xs text-gray-600">FAs</div>
              </div>
              <div className="flex-1 text-sm text-gray-700">
                Flight Attendants for cabin crew coverage
              </div>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <div className="font-semibold text-amber-900 mb-1">Hiring Recommendation</div>
            <div className="text-sm text-gray-700">
              Start hiring by February to complete training by May. Cost: ~$890K (training + onboarding)
            </div>
          </div>
        </div>

        <ConversationalAI
          role="management"
          context="Q4 2024 Executive Dashboard"
        />
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <button className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left">
          <BarChart3 className="w-6 h-6 text-blue-600 mb-2" />
          <div className="font-semibold">Full Analytics</div>
          <div className="text-xs text-gray-600">Detailed reports</div>
        </button>

        <button className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left">
          <DollarSign className="w-6 h-6 text-green-600 mb-2" />
          <div className="font-semibold">Cost Analysis</div>
          <div className="text-xs text-gray-600">Budget tracking</div>
        </button>

        <button className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left">
          <Users className="w-6 h-6 text-purple-600 mb-2" />
          <div className="font-semibold">Staffing Plans</div>
          <div className="text-xs text-gray-600">Workforce planning</div>
        </button>

        <button className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow-md transition-colors text-left">
          <TrendingUp className="w-6 h-6 text-amber-600 mb-2" />
          <div className="font-semibold">Forecasting</div>
          <div className="text-xs text-gray-600">Predictive models</div>
        </button>
      </div>
    </div>
  );
}
