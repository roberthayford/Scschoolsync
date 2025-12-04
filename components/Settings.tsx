import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, RefreshCw, Loader2, LogOut } from 'lucide-react';
import { initializeGmailApi, handleAuthClick, handleSignoutClick, getGmailUserProfile, fetchRecentEmails } from '../services/gmailService';
import { Email } from '../types';

interface SettingsProps {
  onEmailsImported: (emails: Email[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ onEmailsImported }) => {
  const [isGapiReady, setIsGapiReady] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const ready = await initializeGmailApi();
      setIsGapiReady(ready);
    };
    init();
  }, []);

  const handleConnect = async () => {
    try {
      setError(null);
      await handleAuthClick();
      setIsConnected(true);
      const profile = await getGmailUserProfile();
      setUserProfile(profile);
      
      // Auto-sync on first connect as per requirements
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
      // Requirement: Monitor past 2 months
      const emails = await fetchRecentEmails(2);
      onEmailsImported(emails);
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

                 <button 
                   onClick={handleConnect}
                   disabled={!isGapiReady}
                   className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isGapiReady ? (
                     <>
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white rounded-full p-0.5" alt="G" />
                        Connect with Google
                     </>
                   ) : (
                     <>
                        <Loader2 className="animate-spin" size={18} /> Loading Client...
                     </>
                   )}
                 </button>
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
      </div>
    </div>
  );
};

export default Settings;
