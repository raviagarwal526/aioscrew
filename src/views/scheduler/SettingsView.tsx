import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Users,
  Bell,
  FileText,
  ArrowLeft,
  Save,
  RotateCcw,
  Download,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface SettingsViewProps {
  onBack?: () => void;
}

export default function SettingsView({ onBack }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState('planning-rules');
  const [settings, setSettings] = useState({
    // Planning Rules
    reservePoolSize: 10,
    targetUtilization: { min: 85, max: 90 },
    maxConsecutiveDutyDays: 6,
    minDaysOff: 12,
    maxConsecutiveRedEyes: 2,
    commuterBuffer: 2,
    bidWindow: 7,
    costOptimizationPriority: 'balanced',
    crewPreferenceWeight: 60,
    deadheadMinimization: true,
    overnightReduction: true,
    weekendDistribution: 'fair',
    aiAutoAssignment: false,
    
    // System Preferences
    defaultView: 'month',
    weekStartsOn: 'sunday',
    timeFormat: '24-hour',
    dateFormat: 'MM/DD/YYYY',
    timezone: 'Pacific Time (PT)',
    autoSaveFrequency: 30,
    undoHistory: 50,
    showLegalWarnings: true,
    showAISuggestions: true,
    dragDrop: true,
    dataRefresh: 5,
    offlineMode: true,
    exportFormat: 'excel',
    
    // Notification Settings
    emailDailySummary: true,
    emailUncoveredTrips: true,
    emailComplianceViolations: true,
    emailBidSubmissions: true,
    emailCostAlerts: true,
    emailSystemMaintenance: false,
    smsCriticalOnly: true,
    smsEmergencyStaffing: true,
    smsDailyUpdates: false,
    inAppAgentProcessing: true,
    inAppOptimizationComplete: true,
    inAppCrewStatusChanges: true,
    inAppTrainingExpirations: true,
    quietHoursFrom: '22:00',
    quietHoursTo: '06:00',
    
    // User Management
    users: [
      { id: '1', name: 'Maria Rodriguez', role: 'Sr Manager', accessLevel: 'Full Admin', lastActive: '2 hours ago' },
      { id: '2', name: 'John Wilson', role: 'Scheduler', accessLevel: 'Read/Write', lastActive: '15 minutes ago' },
      { id: '3', name: 'Lisa Chen', role: 'Scheduler', accessLevel: 'Read/Write', lastActive: '1 hour ago' },
      { id: '4', name: 'Mike Taylor', role: 'Analyst', accessLevel: 'Read Only', lastActive: '3 hours ago' }
    ]
  });

  const tabs = [
    { id: 'planning-rules', label: 'Planning Rules', icon: FileText },
    { id: 'system-preferences', label: 'System Preferences', icon: SettingsIcon },
    { id: 'notifications', label: 'Notification Settings', icon: Bell },
    { id: 'user-management', label: 'User Management', icon: Users }
  ];

  const handleSave = () => {
    // Save settings to backend
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg p-6">
        <div className="flex items-center gap-4 mb-2">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <h2 className="text-3xl font-bold">Scheduler Settings</h2>
        </div>
        <p className="text-blue-100">
          Configure roster planning rules, system preferences, and team access
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-semibold text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* TAB 1: PLANNING RULES */}
          {activeTab === 'planning-rules' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-bold text-lg mb-2">FAA Part 117 Limits</h3>
                <p className="text-sm text-gray-600 mb-4">Read-only - Federal Law</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Maximum Duty Period: 12 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Minimum Rest Period: 10 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Maximum Flight Time: 100 hours/month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Maximum Flight Time: 1,000 hours/year</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-bold text-lg mb-2">CBA Contract Rules</h3>
                <p className="text-sm text-gray-600 mb-4">Read-only - Union Agreement</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Minimum Monthly Guarantee: 75 credit hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Maximum Monthly Credit: 95 credit hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Per Diem: $75/night domestic, $85 int'l</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>International Premium: $125/flight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Holiday Pay: 2.0x regular rate</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg mb-4">Company Policies</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Reserve Pool Size</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        value={settings.reservePoolSize}
                        onChange={(e) => setSettings({ ...settings, reservePoolSize: parseInt(e.target.value) })}
                        className="w-24 px-3 py-2 border rounded-lg"
                      />
                      <span className="text-sm text-gray-600">% of total crew</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Target Utilization</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        value={settings.targetUtilization.min}
                        onChange={(e) => setSettings({
                          ...settings,
                          targetUtilization: { ...settings.targetUtilization, min: parseInt(e.target.value) }
                        })}
                        className="w-24 px-3 py-2 border rounded-lg"
                      />
                      <span className="text-sm text-gray-600">to</span>
                      <input
                        type="number"
                        value={settings.targetUtilization.max}
                        onChange={(e) => setSettings({
                          ...settings,
                          targetUtilization: { ...settings.targetUtilization, max: parseInt(e.target.value) }
                        })}
                        className="w-24 px-3 py-2 border rounded-lg"
                      />
                      <span className="text-sm text-gray-600">credit hours</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Max Consecutive Duty Days</label>
                    <input
                      type="number"
                      value={settings.maxConsecutiveDutyDays}
                      onChange={(e) => setSettings({ ...settings, maxConsecutiveDutyDays: parseInt(e.target.value) })}
                      className="w-24 px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Days Off</label>
                    <input
                      type="number"
                      value={settings.minDaysOff}
                      onChange={(e) => setSettings({ ...settings, minDaysOff: parseInt(e.target.value) })}
                      className="w-24 px-3 py-2 border rounded-lg"
                    />
                    <span className="text-sm text-gray-600 ml-2">days/month</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Max Consecutive Red-eyes</label>
                    <input
                      type="number"
                      value={settings.maxConsecutiveRedEyes}
                      onChange={(e) => setSettings({ ...settings, maxConsecutiveRedEyes: parseInt(e.target.value) })}
                      className="w-24 px-3 py-2 border rounded-lg"
                    />
                    <span className="text-sm text-gray-600 ml-2">trips</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={true}
                      readOnly
                      className="rounded"
                    />
                    <span className="text-sm">Commuter Considerations</span>
                  </div>
                  <div className="ml-6">
                    <label className="block text-sm font-medium mb-2">Commuter Buffer</label>
                    <input
                      type="number"
                      value={settings.commuterBuffer}
                      onChange={(e) => setSettings({ ...settings, commuterBuffer: parseInt(e.target.value) })}
                      className="w-24 px-3 py-2 border rounded-lg"
                    />
                    <span className="text-sm text-gray-600 ml-2">hours before sign-in</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={true}
                      readOnly
                      className="rounded"
                    />
                    <span className="text-sm">Seniority-based Bidding</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Bid Window</label>
                    <input
                      type="number"
                      value={settings.bidWindow}
                      onChange={(e) => setSettings({ ...settings, bidWindow: parseInt(e.target.value) })}
                      className="w-24 px-3 py-2 border rounded-lg"
                    />
                    <span className="text-sm text-gray-600 ml-2">days before new month</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg mb-4">Advanced Optimization Rules</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cost Optimization Priority</label>
                    <select
                      value={settings.costOptimizationPriority}
                      onChange={(e) => setSettings({ ...settings, costOptimizationPriority: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="minimize-cost">Minimize Cost</option>
                      <option value="maximize-satisfaction">Maximize Satisfaction</option>
                      <option value="balanced">Balanced</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Crew Preference Weight: {settings.crewPreferenceWeight}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.crewPreferenceWeight}
                      onChange={(e) => setSettings({ ...settings, crewPreferenceWeight: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-600 mt-1">Higher = More consideration for crew preferences</p>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.deadheadMinimization}
                        onChange={(e) => setSettings({ ...settings, deadheadMinimization: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Deadhead Minimization</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.overnightReduction}
                        onChange={(e) => setSettings({ ...settings, overnightReduction: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Overnight Reduction</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={true}
                        readOnly
                        className="rounded"
                      />
                      <span className="text-sm">Weekend Distribution: Fair rotation</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.aiAutoAssignment}
                        onChange={(e) => setSettings({ ...settings, aiAutoAssignment: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">AI Auto-Assignment</span>
                      <span className="text-xs text-yellow-600 ml-2">⚠️ Requires management approval</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <RotateCcw className="w-4 h-4" />
                  Reset to Defaults
                </button>
                <button className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                  Export Rules
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEM PREFERENCES */}
          {activeTab === 'system-preferences' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg mb-4">Display Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Default View</label>
                    <select
                      value={settings.defaultView}
                      onChange={(e) => setSettings({ ...settings, defaultView: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="month">Month</option>
                      <option value="week">Week</option>
                      <option value="day">Day</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Week Starts On</label>
                    <select
                      value={settings.weekStartsOn}
                      onChange={(e) => setSettings({ ...settings, weekStartsOn: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="sunday">Sunday</option>
                      <option value="monday">Monday</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Time Format</label>
                    <select
                      value={settings.timeFormat}
                      onChange={(e) => setSettings({ ...settings, timeFormat: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="24-hour">24-hour</option>
                      <option value="12-hour">12-hour</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Date Format</label>
                    <select
                      value={settings.dateFormat}
                      onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Timezone</label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="Pacific Time (PT)">Pacific Time (PT)</option>
                      <option value="Eastern Time (ET)">Eastern Time (ET)</option>
                      <option value="Central Time (CT)">Central Time (CT)</option>
                      <option value="Mountain Time (MT)">Mountain Time (MT)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg mb-4">Color Coding</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: '#003087' }}></div>
                    <span className="text-sm">International Trips</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: '#10B981' }}></div>
                    <span className="text-sm">Domestic Trips</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
                    <span className="text-sm">Reserve Days</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: '#8B5CF6' }}></div>
                    <span className="text-sm">Training</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: '#6B7280' }}></div>
                    <span className="text-sm">Days Off</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    Reset Colors
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    Preview
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg mb-4">Roster Builder</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Auto-save Frequency</label>
                    <select
                      value={settings.autoSaveFrequency}
                      onChange={(e) => setSettings({ ...settings, autoSaveFrequency: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="15">15 seconds</option>
                      <option value="30">30 seconds</option>
                      <option value="60">60 seconds</option>
                      <option value="300">5 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Undo History</label>
                    <input
                      type="number"
                      value={settings.undoHistory}
                      onChange={(e) => setSettings({ ...settings, undoHistory: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    <span className="text-sm text-gray-600">actions</span>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.showLegalWarnings}
                        onChange={(e) => setSettings({ ...settings, showLegalWarnings: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Show Legal Warnings: Real-time</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.showAISuggestions}
                        onChange={(e) => setSettings({ ...settings, showAISuggestions: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Show AI Suggestions</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.dragDrop}
                        onChange={(e) => setSettings({ ...settings, dragDrop: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Drag & Drop</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg mb-4">Data & Sync</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Data Refresh</label>
                    <select
                      value={settings.dataRefresh}
                      onChange={(e) => setSettings({ ...settings, dataRefresh: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="1">Every 1 minute</option>
                      <option value="5">Every 5 minutes</option>
                      <option value="15">Every 15 minutes</option>
                      <option value="30">Every 30 minutes</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.offlineMode}
                      onChange={(e) => setSettings({ ...settings, offlineMode: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Offline Mode: Cache last 30 days</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Export Format</label>
                    <select
                      value={settings.exportFormat}
                      onChange={(e) => setSettings({ ...settings, exportFormat: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                Save Preferences
              </button>
            </div>
          )}

          {/* TAB 3: NOTIFICATION SETTINGS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg mb-4">Email Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Daily Roster Summary</p>
                      <p className="text-sm text-gray-600">8:00 AM</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.emailDailySummary}
                      onChange={(e) => setSettings({ ...settings, emailDailySummary: e.target.checked })}
                      className="h-5 w-5 text-blue-900"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Uncovered Trips Alert</p>
                      <p className="text-sm text-gray-600">Immediate</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.emailUncoveredTrips}
                      onChange={(e) => setSettings({ ...settings, emailUncoveredTrips: e.target.checked })}
                      className="h-5 w-5 text-blue-900"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Compliance Violations</p>
                      <p className="text-sm text-gray-600">Immediate</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.emailComplianceViolations}
                      onChange={(e) => setSettings({ ...settings, emailComplianceViolations: e.target.checked })}
                      className="h-5 w-5 text-blue-900"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Crew Bid Submissions</p>
                      <p className="text-sm text-gray-600">Daily digest</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.emailBidSubmissions}
                      onChange={(e) => setSettings({ ...settings, emailBidSubmissions: e.target.checked })}
                      className="h-5 w-5 text-blue-900"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Cost Budget Alerts</p>
                      <p className="text-sm text-gray-600">Weekly</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.emailCostAlerts}
                      onChange={(e) => setSettings({ ...settings, emailCostAlerts: e.target.checked })}
                      className="h-5 w-5 text-blue-900"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">System Maintenance Notices</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.emailSystemMaintenance}
                      onChange={(e) => setSettings({ ...settings, emailSystemMaintenance: e.target.checked })}
                      className="h-5 w-5 text-blue-900"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg mb-4">SMS/Text Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Critical Compliance Issues Only</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.smsCriticalOnly}
                      onChange={(e) => setSettings({ ...settings, smsCriticalOnly: e.target.checked })}
                      className="h-5 w-5 text-blue-900"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Emergency Staffing Needs</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.smsEmergencyStaffing}
                      onChange={(e) => setSettings({ ...settings, smsEmergencyStaffing: e.target.checked })}
                      className="h-5 w-5 text-blue-900"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Daily Updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.smsDailyUpdates}
                      onChange={(e) => setSettings({ ...settings, smsDailyUpdates: e.target.checked })}
                      className="h-5 w-5 text-blue-900"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg mb-4">In-App Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Real-time agent processing</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.inAppAgentProcessing}
                      onChange={(e) => setSettings({ ...settings, inAppAgentProcessing: e.target.checked })}
                      className="h-5 w-5 text-blue-900"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Roster optimization complete</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.inAppOptimizationComplete}
                      onChange={(e) => setSettings({ ...settings, inAppOptimizationComplete: e.target.checked })}
                      className="h-5 w-5 text-blue-900"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Crew status changes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.inAppCrewStatusChanges}
                      onChange={(e) => setSettings({ ...settings, inAppCrewStatusChanges: e.target.checked })}
                      className="h-5 w-5 text-blue-900"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Training expirations</p>
                      <p className="text-sm text-gray-600">30 day warning</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.inAppTrainingExpirations}
                      onChange={(e) => setSettings({ ...settings, inAppTrainingExpirations: e.target.checked })}
                      className="h-5 w-5 text-blue-900"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-lg mb-4">Notification Quiet Hours</h3>
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">From</label>
                    <input
                      type="time"
                      value={settings.quietHoursFrom}
                      onChange={(e) => setSettings({ ...settings, quietHoursFrom: e.target.value })}
                      className="px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">To</label>
                    <input
                      type="time"
                      value={settings.quietHoursTo}
                      onChange={(e) => setSettings({ ...settings, quietHoursTo: e.target.value })}
                      className="px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked readOnly className="rounded" />
                    <span className="text-sm">Apply to: Non-critical only</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  Save Settings
                </button>
                <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Test Notification
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: USER MANAGEMENT */}
          {activeTab === 'user-management' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Crew Scheduling Team</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                  Add New User
                </button>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold">NAME</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">ROLE</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">ACCESS LEVEL</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">LAST ACTIVE</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.users.map((user, idx) => (
                      <tr key={user.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3">
                          <div className="font-semibold">{user.name}</div>
                          {user.id === '1' && <span className="text-xs text-gray-500">(you)</span>}
                        </td>
                        <td className="px-4 py-3 text-sm">{user.role}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.accessLevel === 'Full Admin' ? 'bg-purple-100 text-purple-700' :
                            user.accessLevel === 'Read/Write' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {user.accessLevel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.lastActive}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {user.id === '1' ? (
                              <button className="text-blue-600 text-sm hover:underline">Edit Profile</button>
                            ) : (
                              <>
                                <button className="text-blue-600 text-sm hover:underline">Edit</button>
                                <button className="text-red-600 text-sm hover:underline">Remove</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="font-bold text-lg mb-4">Access Levels</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Full Admin</h4>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                      <li>Build rosters</li>
                      <li>Approve/publish rosters</li>
                      <li>Run AI optimizations</li>
                      <li>Manage crew data</li>
                      <li>Access analytics</li>
                      <li>Modify system settings</li>
                      <li>Add/remove users</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Read/Write</h4>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                      <li>Build rosters</li>
                      <li>Run AI optimizations (draft only)</li>
                      <li>View crew data</li>
                      <li>Access analytics</li>
                      <li className="text-gray-500">✗ Publish rosters (requires approval)</li>
                      <li className="text-gray-500">✗ Modify system settings</li>
                      <li className="text-gray-500">✗ Add/remove users</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Manage Permissions
                </button>
                <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  View Audit Log
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-600 py-4">
        Powered by AI from dCortex
      </div>
    </div>
  );
}
