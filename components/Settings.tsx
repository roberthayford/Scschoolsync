
import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, RefreshCw, Loader2, LogOut, Save, Database } from 'lucide-react';
import {
  initializeGmailApi,
  handleAuthClick,
  handleSignoutClick,
  getGmailUserProfile,
  fetchRecentEmails,
  searchEmails,
  isUserSignedIn,
  hasValidCredentials,
  updateGoogleCredentials
} from '../services/gmailService';
import { analyzeEmailWithGemini } from '../services/geminiService';
import { Email } from '../types';
import { supabaseService } from '../src/services/supabaseService';
import { CHILDREN_MOCK, EVENTS_MOCK, ACTIONS_MOCK, EMAILS_MOCK } from '../constants';

interface SettingsProps {
  onEmailsImported: (emails: Email[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ onEmailsImported }) => {
  const [isGapiReady, setIsGapiReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state for manual credentials
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    initGmail();
  }, []);

  const initGmail = async () => {
    setIsInitializing(true);
    try {
      const ready = await initializeGmailApi();
      setIsGapiReady(ready);

      // If not ready and we don't have creds, show form
      // if (!ready && !hasValidCredentials()) {
      //   setShowCredsForm(true);
      // } else {
      //   setShowCredsForm(false);
      // }

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

  // const handleSaveCredentials = async () => {
  //   if (!clientIdInput || !apiKeyInput) {
  //     setError("Please provide both Client ID and API Key");
  //     return;
  //   }
  //   updateGoogleCredentials(clientIdInput.trim(), apiKeyInput.trim());
  //   await initGmail();
  // };

  const handleConnect = async () => {
    try {
      setError(null);
      await handleAuthClick(emailInput);

      const profile = await getGmailUserProfile();
      setUserProfile(profile);
      setIsConnected(true);

      handleSync();
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

  const handleSync = async () => {
    if (!isConnected) return;

    setIsSyncing(true);
    setError(null);
    try {
      // 1. Fetch children to get their email rules
      const children = await supabaseService.getChildren();
      const childNames = children.map(c => c.name);

      // 2. Extract all email rules (domains or emails)
      const allRules = children.flatMap(child => child.emailRules || []);
      const validRules = allRules.filter(rule => rule && rule.trim().length > 0);

      if (validRules.length === 0) {
        setError("No school email addresses found. Please add email rules to your children's profiles.");
        setIsSyncing(false);
        return;
      }

      // 3. Search for emails matching these rules
      const emails = await searchEmails(validRules, 2);

      // 4. Process each email: Check duplicate -> Analyze -> Save
      const processedEmails: Email[] = [];

      for (const email of emails) {
        // Check if already exists
        const existing = await supabaseService.findEmailByDetails(email.subject, email.receivedAt);
        if (existing) {
          console.log(`Skipping duplicate email: ${email.subject}`);
          continue;
        }

        // Analyze with Gemini
        console.log(`Analyzing email: ${email.subject}`);
        const analysis = await analyzeEmailWithGemini(email.body || email.preview, childNames);

        // Find matched child
        const matchedChild = children.find(c => c.name === analysis.childName) || children[0];

        // Save Email
        const savedEmail = await supabaseService.createEmail({
          ...email,
          isProcessed: true,
          childId: matchedChild.id,
          category: analysis.category,
          summary: analysis.summary
        }, matchedChild.id);

        processedEmails.push(savedEmail);

        // Save Events
        if (analysis.events && analysis.events.length > 0) {
          for (const evt of analysis.events) {
            await supabaseService.createEvent({
              title: evt.title,
              date: evt.date,
              time: evt.time,
              location: evt.location,
              childId: matchedChild.id,
              category: analysis.category as any, // Simplification
              description: "Extracted from email"
            });
          }
        }

        // Save Actions
        if (analysis.actions && analysis.actions.length > 0) {
          for (const act of analysis.actions) {
            await supabaseService.createAction({
              title: act.title,
              deadline: act.deadline,
              childId: matchedChild.id,
              isCompleted: false,
              urgency: analysis.urgency,
              relatedEmailId: savedEmail.id
            });
          }
        }
      }

      if (processedEmails.length > 0) {
        onEmailsImported(processedEmails);
        alert(`Successfully synced and analyzed ${processedEmails.length} new emails!`);
      } else {
        alert("Sync complete. No new emails found.");
      }

      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
      setError("Failed to sync emails.");
    } finally {
      setIsSyncing(false);
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
                      {lastSyncTime ? `Last checked at ${lastSyncTime}` : 'Not synced yet'}
                    </p>
                  </div>

                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                  >
                    {isSyncing ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                    {isSyncing ? 'Scanning...' : 'Sync Now'}
                  </button>
                </div>

                <p className="text-xs text-slate-400 italic">
                  Note: On first connection, we scan the last 2 months of emails to catch any upcoming events you might have missed.
                </p>
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
                {!isConnected && (
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
                )}
              </div>
            )}
          </div>
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

        {/* Database Management */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Database Management</h3>
          <p className="text-sm text-slate-500 mb-4">
            Populate your database with sample data. This is useful for testing.
          </p>
          <button
            onClick={async () => {
              if (confirm('This will add sample data to your database. Continue?')) {
                try {
                  await supabaseService.seedData(CHILDREN_MOCK, EVENTS_MOCK, ACTIONS_MOCK, EMAILS_MOCK);
                  alert('Data seeded successfully!');
                } catch (e: any) {
                  alert('Error seeding data: ' + e.message);
                }
              }
            }}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
          >
            Seed Database with Mock Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
