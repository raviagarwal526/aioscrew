import { useState } from 'react';
import { Calendar, DollarSign, FileText, Settings as SettingsIcon } from 'lucide-react';
import ScheduleView from '../components/schedule/ScheduleView';
import ConversationalAI from '../components/ConversationalAI';
import { crewMembers } from '../data/mockData';

type TabType = 'dashboard' | 'schedule' | 'pay' | 'documents' | 'settings';

export default function CrewMemberViewComplete() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const currentUser = crewMembers[0];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-2">Good morning, {currentUser.role} {currentUser.name}</h2>
        <p className="text-blue-100">
          Based on {currentUser.seniority} years seniority, Copa {currentUser.base} base, {currentUser.qualification} qualified
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="flex space-x-1 border-b p-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-blue-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'schedule'
                ? 'bg-blue-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Schedule
          </button>
          <button
            onClick={() => setActiveTab('pay')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'pay'
                ? 'bg-blue-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Pay & Claims
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'documents'
                ? 'bg-blue-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Documents
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-blue-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            Settings
          </button>
        </div>

        <div className="min-h-screen">
          {activeTab === 'dashboard' && (
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow border-l-4 border-green-500 p-4">
                  <div className="text-sm text-gray-600">Current Pay</div>
                  <div className="text-2xl font-bold text-gray-900">${currentUser.currentPay?.amount.toLocaleString()}</div>
                  <div className="text-xs text-green-600">✓ Verified</div>
                </div>
                <div className="bg-white rounded-lg shadow border-l-4 border-amber-500 p-4">
                  <div className="text-sm text-gray-600">Training Due</div>
                  <div className="text-2xl font-bold text-gray-900">{currentUser.upcomingTraining?.daysUntil} days</div>
                  <div className="text-xs text-amber-600">{currentUser.upcomingTraining?.type}</div>
                </div>
                <div className="bg-white rounded-lg shadow border-l-4 border-blue-500 p-4">
                  <div className="text-sm text-gray-600">Next Trip</div>
                  <div className="text-2xl font-bold text-gray-900">Tomorrow</div>
                  <div className="text-xs text-blue-600">CM100 BUR-PTY</div>
                </div>
                <div className="bg-white rounded-lg shadow border-l-4 border-teal-500 p-4">
                  <div className="text-sm text-gray-600">YTD Earnings</div>
                  <div className="text-2xl font-bold text-gray-900">${currentUser.ytdEarnings.toLocaleString()}</div>
                  <div className="text-xs text-teal-600">+8% vs last year</div>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow transition-colors text-left"
                >
                  <Calendar className="w-6 h-6 text-blue-600 mb-2" />
                  <div className="font-semibold">View Schedule</div>
                  <div className="text-xs text-gray-600">Calendar & trip details</div>
                </button>
                <button
                  onClick={() => setActiveTab('pay')}
                  className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow transition-colors text-left"
                >
                  <DollarSign className="w-6 h-6 text-green-600 mb-2" />
                  <div className="font-semibold">Submit Claim</div>
                  <div className="text-xs text-gray-600">Pay & per diem claims</div>
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow transition-colors text-left"
                >
                  <FileText className="w-6 h-6 text-purple-600 mb-2" />
                  <div className="font-semibold">Documents</div>
                  <div className="text-xs text-gray-600">Licenses & certificates</div>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg shadow transition-colors text-left"
                >
                  <SettingsIcon className="w-6 h-6 text-amber-600 mb-2" />
                  <div className="font-semibold">Settings</div>
                  <div className="text-xs text-gray-600">Preferences & profile</div>
                </button>
              </div>

              <ConversationalAI
                role="crew-member"
                context={`${currentUser.role} ${currentUser.name} - ${currentUser.base} base`}
              />
            </div>
          )}

          {activeTab === 'schedule' && <ScheduleView />}

          {activeTab === 'pay' && (
            <div className="p-6">
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl shadow-xl p-8 text-white mb-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-yellow-400 text-sm mb-2">Current Pay Period</p>
                    <h3 className="text-5xl font-bold mb-2">$4,875.00</h3>
                    <div className="flex items-center space-x-2">
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        ✓ VERIFIED BY AI
                      </span>
                      <span className="text-sm text-white/80">Calculated 2 hours ago</span>
                    </div>
                  </div>
                  <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors">
                    Download Pay Stub
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-yellow-400 mb-1">Credit Hours</p>
                    <p className="text-2xl font-bold">87.5</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-yellow-400 mb-1">Trips Flown</p>
                    <p className="text-2xl font-bold">14</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-yellow-400 mb-1">Premium Pay</p>
                    <p className="text-2xl font-bold">$375</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-yellow-400 mb-1">Per Diem</p>
                    <p className="text-2xl font-bold">$600</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-4">Recent Claims</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 bg-gray-50 p-4 rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">International Premium - CM450</p>
                        <p className="text-sm text-gray-600">Flight to Guatemala on Nov 18</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 text-lg">$125.00</p>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                          Approved
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-l-4 border-orange-500 bg-gray-50 p-4 rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">Per Diem - Portland Layover</p>
                        <p className="text-sm text-gray-600">Nov 10-11, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-600 text-lg">$75.00</p>
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold">
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="p-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">My Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-4 border-b bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-lg">
                    <h4 className="font-bold">ATP License</h4>
                    <p className="text-xs text-yellow-400">License #AT12345678</p>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Issued:</span>
                        <span className="font-semibold">Jan 15, 2020</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expires:</span>
                        <span className="font-semibold">Jan 31, 2026</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-900 text-white px-3 py-2 rounded text-sm hover:bg-blue-800">
                        View
                      </button>
                      <button className="flex-1 border border-blue-900 text-blue-900 px-3 py-2 rounded text-sm hover:bg-blue-900 hover:text-white">
                        Download
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="p-4 border-b bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-lg">
                    <h4 className="font-bold">737-800 Type Rating</h4>
                    <p className="text-xs text-yellow-400">Certificate #B737-2020-456</p>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completed:</span>
                        <span className="font-semibold">Mar 20, 2020</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expires:</span>
                        <span className="font-semibold">Dec 31, 2025</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-900 text-white px-3 py-2 rounded text-sm hover:bg-blue-800">
                        View
                      </button>
                      <button className="flex-1 border border-blue-900 text-blue-900 px-3 py-2 rounded text-sm hover:bg-blue-900 hover:text-white">
                        Download
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-orange-500">
                  <div className="p-4 border-b bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                    <h4 className="font-bold">Medical Certificate</h4>
                    <p className="text-xs text-orange-100">Class 1 • FAA</p>
                  </div>
                  <div className="p-4">
                    <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4">
                      <p className="text-sm text-orange-800 font-semibold mb-1">
                        Expires in 180 days
                      </p>
                      <p className="text-xs text-orange-700">
                        Due June 30, 2025
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-orange-500 text-white px-3 py-2 rounded text-sm font-semibold hover:bg-orange-600">
                        Schedule Renewal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6 max-w-4xl mx-auto space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4">Personal Information</h3>
                <form className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      defaultValue="Sarah"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      defaultValue="Martinez"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="s.martinez@copa.com"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <button type="submit" className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 font-semibold">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Schedule Changes</p>
                      <p className="text-sm text-gray-600">Get notified when your schedule is updated</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5 text-blue-900" />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Pay & Claims Status</p>
                      <p className="text-sm text-gray-600">Updates on your pay claims</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5 text-blue-900" />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Training Reminders</p>
                      <p className="text-sm text-gray-600">Upcoming training and expirations</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5 text-blue-900" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
