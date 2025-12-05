
import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, RefreshCw, Loader2, LogOut, Trash2, UserPlus, Plus } from 'lucide-react';
import {
  initializeGmailApi,
  handleAuthClick,
  handleSignoutClick,
  getGmailUserProfile,
  isUserSignedIn,
} from '../services/gmailService';
import { Email, Child } from '../types';
import { AutoFetchSettings } from '../src/hooks/useAutoSync';
import { supabaseService } from '../src/services/supabaseService';

interface SettingsProps {
  onEmailsImported: (emails: Email[]) => void;
  onDataCleared?: () => void;
  onChildAdded?: (child: Child) => void;
  onSync?: () => void;
  isSyncing?: boolean;
  syncStatus?: string | null;
  lastSyncTime?: string | null;
  autoFetchSettings?: AutoFetchSettings;
  onUpdateAutoFetchSettings?: (settings: Partial<AutoFetchSettings>) => void;
}

const Settings: React.FC<SettingsProps> = ({
  onEmailsImported,
  onDataCleared,
  onChildAdded,
  onSync,
  isSyncing = false,
  syncStatus,
  lastSyncTime,
  autoFetchSettings,
  onUpdateAutoFetchSettings
}) => {
  const [isGapiReady, setIsGapiReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state for manual credentials
  const [emailInput, setEmailInput] = useState('');

  // Delete all data state
  const [isDeleting, setIsDeleting] = useState(false);

  // Add child form state
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildSchool, setNewChildSchool] = useState('');
  const [newChildEmailRules, setNewChildEmailRules] = useState('');
  const [isAddingChild, setIsAddingChild] = useState(false);

  useEffect(() => {
    initGmail();
  }, []);

  const initGmail = async () => {
    setIsInitializing(true);
    try {
      const ready = await initializeGmailApi();
      setIsGapiReady(ready);

      if (ready && isUserSignedIn()) {
        try {
          const profile = await getGmailUserProfile();
          setUserProfile(profile);
          setIsConnected(true);
        } catch (e) {
          console.warn("Session expired or invalid, please reconnect.", e);
          handleSignoutClick();
          setIsConnected(false);
        }
      }
    } catch (e) {
      console.error("Failed to initialize Gmail API", e);
      setIsGapiReady(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleConnect = async () => {
    try {
      setError(null);
      await handleAuthClick(emailInput);

      const profile = await getGmailUserProfile();
      setUserProfile(profile);
      setIsConnected(true);

      // Trigger background sync after connecting
      onSync?.();
    } catch (err: any) {
      console.error(err);
      setError("Failed to connect to Google. Please check your popup blocker or credentials.");
    }
  };

  const handleDisconnect = () => {
    handleSignoutClick();
    setIsConnected(false);
    setUserProfile(null);
  };

  const handleDeleteAllData = async () => {
    if (!confirm('⚠️ WARNING: This will permanently delete ALL your data including children, emails, events, and actions. This cannot be undone. Are you sure?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await supabaseService.deleteAllData();
      alert('All data has been deleted successfully!');
      onDataCleared?.();
      window.location.reload();
    } catch (e: any) {
      alert('Error deleting data: ' + e.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddChild = async () => {
    if (!newChildName.trim()) {
      alert('Please enter a child name.');
      return;
    }

    setIsAddingChild(true);
    try {
      const emailRulesArray = newChildEmailRules
        .split(',')
        .map(r => r.trim())
        .filter(r => r.length > 0);

      const newChild = await supabaseService.createChild({
        name: newChildName.trim(),
        schoolName: newChildSchool.trim(),
        color: ['blue', 'green', 'purple', 'orange', 'pink'][Math.floor(Math.random() * 5)],
        avatarUrl: '',
        emailRules: emailRulesArray
      });

      alert(`Child "${newChild.name}" added successfully!`);
      onChildAdded?.(newChild);

      // Reset form
      setNewChildName('');
      setNewChildSchool('');
      setNewChildEmailRules('');
      setShowAddChild(false);
    } catch (e: any) {
      alert('Error adding child: ' + e.message);
    } finally {
      setIsAddingChild(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
      </div>

      <div className="max-w-3xl space-y-6">

        {/* Connection Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Mail className="text-indigo-600" />
              Email Connection
            </h3>
            <p className="text-sm text-slate-500 mt-1">Connect your Gmail account to automatically scan for school communications.</p>
          </div>

          <div className="p-6">
            {isConnected ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4 bg-green-50 p-4 rounded-xl border border-green-100">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Connected to Gmail</p>
                    <p className="text-sm text-slate-600">{userProfile?.emailAddress}</p>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="ml-auto text-sm text-slate-500 hover:text-red-600 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
                  >
                    <LogOut size={14} /> Disconnect
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    <p className="font-medium">Sync Status</p>
                    <p className="text-slate-500">
                      {isSyncing ? syncStatus : (lastSyncTime ? `Last checked at ${lastSyncTime}` : 'Not synced yet')}
                    </p>
                  </div>

                  <button
                    onClick={() => onSync?.()}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                  >
                    {isSyncing ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>

                <p className="text-xs text-slate-400 italic">
                  Note: Sync runs in the background. You can navigate to other pages while it processes.
                </p>

                {/* Auto-Fetch Scheduler UI */}
                {autoFetchSettings && onUpdateAutoFetchSettings && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-slate-900">Auto-Fetch Schedule</h4>
                        <p className="text-xs text-slate-500">Automatically check for new emails periodically.</p>
                      </div>
                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={autoFetchSettings.enabled}
                            onChange={(e) => onUpdateAutoFetchSettings({ enabled: e.target.checked })}
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    </div>

                    {autoFetchSettings.enabled && (
                      <div className="bg-slate-50 p-4 rounded-xl space-y-4">
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="intervalType"
                              checked={autoFetchSettings.intervalType === 'interval'}
                              onChange={() => onUpdateAutoFetchSettings({ intervalType: 'interval' })}
                              className="text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-700">Every few hours</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="intervalType"
                              checked={autoFetchSettings.intervalType === 'daily'}
                              onChange={() => onUpdateAutoFetchSettings({ intervalType: 'daily' })}
                              className="text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-700">Daily at specific time</span>
                          </label>
                        </div>

                        {autoFetchSettings.intervalType === 'interval' ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600">Check every:</span>
                            <select
                              value={autoFetchSettings.intervalHours}
                              onChange={(e) => onUpdateAutoFetchSettings({ intervalHours: Number(e.target.value) })}
                              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                            >
                              <option value={1}>1 Hour</option>
                              <option value={3}>3 Hours</option>
                              <option value={5}>5 Hours</option>
                            </select>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600">Check at:</span>
                            <input
                              type="time"
                              value={autoFetchSettings.dailyTime}
                              onChange={(e) => onUpdateAutoFetchSettings({ dailyTime: e.target.value })}
                              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">

                {/* Main Connect State */}
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <Mail size={32} className="text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">No account connected</p>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                    Connect Gmail to enable AI analysis of your school emails.
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg text-sm">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                {/* Email Input for Connection */}
                <div className="w-full max-w-md space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gmail Address</label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    />
                    <p className="text-xs text-slate-500 mt-1">Enter your email to help us connect to the right account.</p>
                  </div>

                  <button
                    onClick={handleConnect}
                    disabled={isInitializing || !isGapiReady || !emailInput}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isInitializing ? (
                      <>
                        <Loader2 className="animate-spin" size={18} /> Loading Client...
                      </>
                    ) : isGapiReady ? (
                      <>
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white rounded-full p-0.5" alt="G" />
                        Connect with Google
                      </>
                    ) : (
                      <>
                        <AlertCircle size={18} /> Service Unavailable
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add New Child */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <UserPlus className="text-green-600" />
                Add New Child
              </h3>
              <p className="text-sm text-slate-500 mt-1">Add a child to track their school communications.</p>
            </div>
            <button
              onClick={() => setShowAddChild(!showAddChild)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              {showAddChild ? 'Cancel' : 'Add Child'}
            </button>
          </div>

          {showAddChild && (
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Child's Name *</label>
                <input
                  type="text"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  placeholder="e.g., Emma"
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">School Name</label>
                <input
                  type="text"
                  value={newChildSchool}
                  onChange={(e) => setNewChildSchool(e.target.value)}
                  placeholder="e.g., Greenwood Primary School"
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">School Email Addresses</label>
                <input
                  type="text"
                  value={newChildEmailRules}
                  onChange={(e) => setNewChildEmailRules(e.target.value)}
                  placeholder="e.g., office@school.com, teacher@school.com"
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
                <p className="text-xs text-slate-500 mt-1">Separate multiple emails with commas. These are used to filter which emails to sync.</p>
              </div>
              <button
                onClick={handleAddChild}
                disabled={isAddingChild || !newChildName.trim()}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAddingChild ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                {isAddingChild ? 'Adding...' : 'Save Child'}
              </button>
            </div>
          )}
        </div>

        {/* Preferences Placeholder */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 opacity-60">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Daily Digest</span>
              <div className="w-10 h-6 bg-indigo-200 rounded-full relative"><div className="w-4 h-4 bg-indigo-600 rounded-full absolute right-1 top-1"></div></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Urgent Action Alerts</span>
              <div className="w-10 h-6 bg-indigo-200 rounded-full relative"><div className="w-4 h-4 bg-indigo-600 rounded-full absolute right-1 top-1"></div></div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <Trash2 className="text-red-600" />
            Data Management
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Delete all your data including children, emails, events, and actions. Use this to start fresh.
          </p>
          <button
            onClick={handleDeleteAllData}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
            {isDeleting ? 'Deleting...' : 'Delete All Data & Start Fresh'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
