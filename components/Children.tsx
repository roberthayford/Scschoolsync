
import React, { useState } from 'react';
import { Child, Email } from '../types';
import { Plus, Edit2, Trash2, Mail, School, X, Save, RefreshCw, Loader2, Calendar, CheckCircle2 } from 'lucide-react';
import { searchEmails, isUserSignedIn } from '../services/gmailService';

interface ChildrenProps {
  childrenList: Child[];
  onUpdateChildren?: (updatedList: Child[]) => void;
  onEmailsImported: (emails: Email[]) => void;
}

const Children: React.FC<ChildrenProps> = ({ childrenList, onUpdateChildren, onEmailsImported }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncOptions, setShowSyncOptions] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  
  // New state for the Save & Sync prompt flow
  const [showSaveSyncPrompt, setShowSaveSyncPrompt] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Child>>({
    name: '',
    schoolName: '',
    color: 'blue',
    emailRules: []
  });
  const [newRule, setNewRule] = useState('');

  const colors = ['blue', 'pink', 'green', 'purple', 'orange', 'red'];

  const validateEmailOrDomain = (value: string): boolean => {
    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Domain regex: starts optional @, then alphanumeric/hyphen parts separated by dots, ending in 2+ chars
    const domainRegex = /^@?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return emailRegex.test(value) || domainRegex.test(value);
  };

  const handleEdit = (child: Child) => {
    setFormData({ ...child });
    setEditingId(child.id);
    setIsModalOpen(true);
    setShowSyncOptions(false);
    setShowSaveSyncPrompt(false);
    setInputError(null);
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      schoolName: '',
      color: 'blue',
      emailRules: [],
      avatarUrl: `https://picsum.photos/seed/${Date.now()}/100/100`
    });
    setEditingId(null);
    setIsModalOpen(true);
    setShowSyncOptions(false);
    setShowSaveSyncPrompt(false);
    setInputError(null);
  };

  const handleInitialSave = () => {
    if (!formData.name || !formData.schoolName) return;

    // Handle pending input in the text field
    let currentRules = formData.emailRules || [];
    const pendingRule = newRule.trim();

    if (pendingRule) {
      if (!validateEmailOrDomain(pendingRule)) {
        setInputError("Please fix the invalid email source before saving.");
        return;
      }
      if (!currentRules.includes(pendingRule)) {
        currentRules = [...currentRules, pendingRule];
        // Update state so it reflects in UI if we pause (sync prompt)
        setFormData(prev => ({ ...prev, emailRules: currentRules }));
        setNewRule('');
      }
    }

    // If adding a new child (not editing) and they have email rules, prompt for sync
    if (!editingId && currentRules.length > 0) {
      setShowSaveSyncPrompt(true);
    } else {
      finalizeSave(currentRules);
    }
  };

  const finalizeSave = (rulesOverride?: string[]) => {
    const rulesToUse = rulesOverride || formData.emailRules || [];
    const dataToSave = { ...formData, emailRules: rulesToUse };

    if (onUpdateChildren) {
      if (editingId) {
        // Update existing
        const updated = childrenList.map(c => c.id === editingId ? { ...c, ...dataToSave } as Child : c);
        onUpdateChildren(updated);
      } else {
        // Add new
        const newChild = { ...dataToSave, id: `c-${Date.now()}` } as Child;
        onUpdateChildren([...childrenList, newChild]);
      }
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowSaveSyncPrompt(false);
    setIsSyncing(false);
    setInputError(null);
    setNewRule('');
  };

  const handleSyncAndSave = async (months: number | null) => {
    // If null, user chose to skip sync
    if (months === null) {
      finalizeSave();
      return;
    }

    if (!isUserSignedIn()) {
      alert("Please connect your Gmail account in Settings to sync history. Profile will be saved without sync.");
      finalizeSave();
      return;
    }

    setIsSyncing(true);
    try {
      const emails = await searchEmails(formData.emailRules || [], months);
      if (emails.length > 0) {
        onEmailsImported(emails);
      }
    } catch (e) {
      console.error("Sync failed during save", e);
      // We continue to save even if sync fails
    } finally {
      setIsSyncing(false);
      finalizeSave();
    }
  };

  const addRule = () => {
    const trimmed = newRule.trim();
    if (!trimmed) return;

    if (formData.emailRules?.includes(trimmed)) {
      // Already exists, just clear input
      setNewRule('');
      setInputError(null);
      return;
    }

    if (!validateEmailOrDomain(trimmed)) {
      setInputError("Please enter a valid email (e.g. name@school.com) or domain (e.g. school.com)");
      return;
    }

    setFormData(prev => ({ ...prev, emailRules: [...(prev.emailRules || []), trimmed] }));
    setNewRule('');
    setInputError(null);
  };

  const removeRule = (rule: string) => {
    setFormData(prev => ({ ...prev, emailRules: prev.emailRules?.filter(r => r !== rule) }));
  };

  const handleManualSyncHistory = async (months: number) => {
    if (!isUserSignedIn()) {
      alert("Please connect your Gmail account in Settings first.");
      return;
    }
    
    if (!formData.emailRules || formData.emailRules.length === 0) {
      alert("Please add at least one email source (domain or address) to sync.");
      return;
    }

    setIsSyncing(true);
    try {
      const emails = await searchEmails(formData.emailRules, months);
      if (emails.length > 0) {
        onEmailsImported(emails);
        alert(`Successfully synced ${emails.length} emails from the past ${months} month(s).`);
      } else {
        alert("No emails found matching these rules in that time range.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to sync history. Check console for details.");
    } finally {
      setIsSyncing(false);
      setShowSyncOptions(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Children & Profiles</h2>
        <button 
          onClick={handleAdd}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          <span>Add Child</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {childrenList.map((child) => (
          <div key={child.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
            <div className={`h-24 bg-${child.color}-100 flex items-center justify-center`}>
              <div className={`w-20 h-20 bg-${child.color}-200 rounded-full flex items-center justify-center border-4 border-white shadow-sm mt-10`}>
                 <span className={`text-2xl font-bold text-${child.color}-600`}>{child.name[0]}</span>
              </div>
            </div>
            
            <div className="pt-12 p-6 text-center">
              <h3 className="text-xl font-bold text-slate-900">{child.name}</h3>
              <p className="text-slate-500 font-medium flex items-center justify-center gap-1.5 mt-1">
                <School size={14} />
                {child.schoolName}
              </p>

              <div className="mt-6 space-y-3 text-left">
                <div className="flex justify-between items-end">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Sources</div>
                    <span className="text-xs text-slate-400">{child.emailRules?.length || 0} configured</span>
                </div>
                
                <div className="space-y-2">
                    {child.emailRules?.slice(0, 2).map((rule, idx) => (
                         <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <Mail size={14} className="text-slate-400 mt-1" />
                            <p className="text-xs font-medium text-slate-600 break-all">{rule}</p>
                        </div>
                    ))}
                    {(child.emailRules?.length || 0) > 2 && (
                        <p className="text-xs text-center text-slate-400 italic">+{ (child.emailRules?.length || 0) - 2 } more</p>
                    )}
                     {(child.emailRules?.length || 0) === 0 && (
                        <p className="text-xs text-center text-slate-400 italic py-2">No email sources configured</p>
                    )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between">
                <button 
                    onClick={() => handleEdit(child)}
                    className="text-slate-500 hover:text-indigo-600 text-sm font-medium flex items-center gap-1 transition-colors"
                >
                    <Edit2 size={14} /> Edit
                </button>
                <button className="text-slate-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 transition-colors">
                    <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Placeholder */}
        <button 
            onClick={handleAdd}
            className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-slate-50 transition-all min-h-[300px]"
        >
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Plus size={32} />
            </div>
            <span className="font-semibold">Add another child</span>
        </button>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900">
                        {showSaveSyncPrompt ? 'Sync History?' : (editingId ? 'Edit Profile' : 'Add Child')}
                    </h3>
                    <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                {showSaveSyncPrompt ? (
                  /* STEP 2: Sync Prompt View */
                  <div className="p-6 flex flex-col items-center text-center animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        {isSyncing ? <Loader2 className="animate-spin text-indigo-600" size={32} /> : <RefreshCw className="text-indigo-600" size={32} />}
                     </div>
                     <h4 className="text-xl font-bold text-slate-900 mb-2">Scan for past emails?</h4>
                     <p className="text-slate-500 mb-8 max-w-xs">
                       We can check your inbox for recent emails matching {formData.name}'s school sources to populate your timeline immediately.
                     </p>
                     
                     {isSyncing ? (
                       <div className="flex flex-col items-center gap-2 mb-4">
                         <span className="text-indigo-600 font-medium">Scanning your inbox...</span>
                         <span className="text-xs text-slate-400">This might take a moment</span>
                       </div>
                     ) : (
                       <div className="w-full space-y-3">
                          <button 
                            onClick={() => handleSyncAndSave(1)}
                            className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border border-indigo-200"
                          >
                            <Calendar size={18} /> Sync Last 1 Month
                          </button>
                          <button 
                            onClick={() => handleSyncAndSave(3)}
                            className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200 shadow-sm"
                          >
                            <Calendar size={18} /> Sync Last 3 Months
                          </button>
                          <button 
                            onClick={() => handleSyncAndSave(6)}
                            className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200 shadow-sm"
                          >
                            <Calendar size={18} /> Sync Last 6 Months
                          </button>
                       </div>
                     )}
                     
                     {!isSyncing && (
                       <button 
                         onClick={() => handleSyncAndSave(null)}
                         className="mt-6 text-slate-400 hover:text-slate-600 text-sm font-medium"
                       >
                         No thanks, just save
                       </button>
                     )}
                  </div>
                ) : (
                  /* STEP 1: Edit Form View */
                  <>
                    <div className="p-6 overflow-y-auto space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Child Name</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none"
                                    placeholder="e.g. Emma"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Primary School Name</label>
                                <input 
                                    type="text" 
                                    value={formData.schoolName}
                                    onChange={e => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none"
                                    placeholder="e.g. St Mary's Primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Color Tag</label>
                                <div className="flex gap-2">
                                    {colors.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setFormData(prev => ({ ...prev, color: c }))}
                                            className={`w-8 h-8 rounded-full bg-${c}-500 ${formData.color === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-medium text-slate-900">Email Sources</label>
                                
                                {/* Manual Sync History Button (Only for existing children) */}
                                {editingId && (
                                  <div className="relative">
                                      {!showSyncOptions ? (
                                          <button 
                                              onClick={() => setShowSyncOptions(true)}
                                              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md"
                                          >
                                              <RefreshCw size={12} /> Sync History
                                          </button>
                                      ) : (
                                          <div className="absolute right-0 top-0 bg-white border border-slate-200 shadow-lg rounded-xl p-2 z-10 w-48 animate-in fade-in slide-in-from-top-1">
                                              <div className="text-xs font-bold text-slate-400 px-2 pb-1 mb-1 border-b border-slate-100">Fetch emails from...</div>
                                              <button onClick={() => handleManualSyncHistory(1)} className="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-50 rounded flex items-center gap-2 text-slate-700">
                                                  <Calendar size={12} /> Last 1 Month
                                              </button>
                                              <button onClick={() => handleManualSyncHistory(3)} className="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-50 rounded flex items-center gap-2 text-slate-700">
                                                  <Calendar size={12} /> Last 3 Months
                                              </button>
                                              <button onClick={() => handleManualSyncHistory(6)} className="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-50 rounded flex items-center gap-2 text-slate-700">
                                                  <Calendar size={12} /> Last 6 Months
                                              </button>
                                              <button onClick={() => setShowSyncOptions(false)} className="w-full text-center mt-1 text-xs text-slate-400 hover:text-slate-600">Cancel</button>
                                          </div>
                                      )}
                                  </div>
                                )}
                            </div>
                            
                            <p className="text-xs text-slate-500 mb-4">Add school domains (e.g., <code className="bg-slate-100 px-1 rounded">school.com</code>) or specific sender addresses (e.g., <code className="bg-slate-100 px-1 rounded">coach@club.com</code>).</p>

                            <div className="flex gap-2 mb-1">
                                <input 
                                    type="text"
                                    value={newRule}
                                    onChange={e => { setNewRule(e.target.value); setInputError(null); }}
                                    onKeyDown={e => e.key === 'Enter' && addRule()}
                                    placeholder="sender@email.com or @domain.com"
                                    className={`flex-1 px-3 py-2 bg-white text-slate-900 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 outline-none ${inputError ? 'border-red-300' : 'border-slate-300'}`}
                                />
                                <button 
                                    onClick={addRule}
                                    disabled={!newRule}
                                    className="bg-slate-100 text-slate-600 px-3 rounded-lg hover:bg-slate-200 disabled:opacity-50"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                            {inputError && (
                                <p className="text-xs text-red-500 ml-1">{inputError}</p>
                            )}

                            <div className="space-y-2 max-h-40 overflow-y-auto mt-3">
                                {formData.emailRules?.map((rule, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                        <span className="text-sm text-slate-700 font-mono">{rule}</span>
                                        <button onClick={() => removeRule(rule)} className="text-slate-400 hover:text-red-500">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {formData.emailRules?.length === 0 && (
                                    <p className="text-sm text-slate-400 italic text-center py-2">No email sources added yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                       <div className="flex items-center gap-2">
                          {isSyncing && !showSaveSyncPrompt && <span className="text-xs text-indigo-600 flex items-center gap-1"><Loader2 className="animate-spin" size={12} /> Syncing...</span>}
                       </div>
                       <div className="flex gap-3">
                            <button onClick={closeModal} className="px-4 py-2 text-slate-600 hover:text-slate-900">Cancel</button>
                            <button 
                                onClick={handleInitialSave}
                                disabled={!formData.name || !formData.schoolName}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {editingId ? 'Save Profile' : 'Save & Continue'}
                            </button>
                       </div>
                    </div>
                  </>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Children;
