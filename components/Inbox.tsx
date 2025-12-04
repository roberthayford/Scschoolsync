
import React, { useState } from 'react';
import { Email, Child, CategoryType, SchoolEvent, ActionItem } from '../types';
import { Mail, RefreshCw, Plus, ArrowRight, Loader2, Sparkles, CheckCircle2, MessageSquare, Copy } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { analyzeEmailWithGemini, generateDraftReply } from '../services/geminiService';

interface InboxProps {
  emails: Email[];
  childrenList: Child[];
  onEmailProcessed: (email: Email, events: SchoolEvent[], actions: ActionItem[]) => void;
}

const Inbox: React.FC<InboxProps> = ({ emails, childrenList, onEmailProcessed }) => {
  const [showProcessor, setShowProcessor] = useState(false);
  const [rawEmailText, setRawEmailText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [processingEmailId, setProcessingEmailId] = useState<string | null>(null);

  // Draft Reply State
  const [draftingForId, setDraftingForId] = useState<string | null>(null);
  const [draftResult, setDraftResult] = useState<{ id: string, text: string } | null>(null);

  // Function to handle the AI Processing
  const handleAnalyze = async () => {
    if (!rawEmailText.trim()) return;
    setIsAnalyzing(true);
    
    // Simulate API delay for UX if local
    const minDelay = new Promise(resolve => setTimeout(resolve, 1500));
    
    const childNames = childrenList.map(c => c.name);
    
    try {
        const [result] = await Promise.all([
            analyzeEmailWithGemini(rawEmailText, childNames),
            minDelay
        ]);
        setAnalysisResult(result);
    } catch (e) {
        console.error(e);
        alert("Failed to analyze email.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleSaveProcessed = () => {
    if (!analysisResult) return;

    // Map the analysis result to our internal data structures
    const matchedChild = childrenList.find(c => c.name === analysisResult.childName) || childrenList[0];
    
    let processedEmail: Email;

    if (processingEmailId) {
        // Update existing email
        const original = emails.find(e => e.id === processingEmailId);
        if (!original) return; // Should not happen given logic

        processedEmail = {
            ...original,
            isProcessed: true,
            childId: matchedChild.id,
            category: analysisResult.category as CategoryType,
            summary: analysisResult.summary
        };
    } else {
        // Create new manual email
        processedEmail = {
            id: `m-${Date.now()}`,
            subject: "Manually Processed Email", // In a real app we'd extract this too
            sender: "Manual Input",
            preview: rawEmailText.substring(0, 50) + "...",
            receivedAt: new Date().toISOString(),
            isProcessed: true,
            childId: matchedChild.id,
            category: analysisResult.category as CategoryType,
            summary: analysisResult.summary
        };
    }

    const newEvents: SchoolEvent[] = analysisResult.events.map((evt: any, idx: number) => ({
      id: `e-${Date.now()}-${idx}`,
      title: evt.title,
      date: evt.date,
      time: evt.time,
      location: evt.location,
      childId: matchedChild.id,
      category: analysisResult.category === CategoryType.EVENT_PARENT ? CategoryType.EVENT_PARENT : CategoryType.EVENT_ATTENDANCE // Simplification
    }));

    const newActions: ActionItem[] = analysisResult.actions.map((act: any, idx: number) => ({
      id: `a-${Date.now()}-${idx}`,
      title: act.title,
      deadline: act.deadline,
      childId: matchedChild.id,
      isCompleted: false,
      urgency: analysisResult.urgency,
      relatedEmailId: processedEmail.id
    }));

    onEmailProcessed(processedEmail, newEvents, newActions);
    
    // Reset State
    setShowProcessor(false);
    setRawEmailText('');
    setAnalysisResult(null);
    setProcessingEmailId(null);
  };

  const handleDraftReply = async (e: React.MouseEvent, email: Email) => {
    e.stopPropagation();
    setDraftingForId(email.id);
    setDraftResult(null);

    const draft = await generateDraftReply(email.subject, email.sender, email.summary);
    setDraftResult({ id: email.id, text: draft });
    setDraftingForId(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Draft copied to clipboard!");
    setDraftResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Inbox</h2>
        <button 
          onClick={() => {
              setRawEmailText('');
              setProcessingEmailId(null);
              setShowProcessor(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={18} />
          <span>Process New Email</span>
        </button>
      </div>

      {/* Main Inbox List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {emails.map((email, idx) => {
          const child = childrenList.find(c => c.id === email.childId);
          const isDrafting = draftingForId === email.id;
          const showDraft = draftResult?.id === email.id;

          // Prepare extended preview text
          const previewText = email.body 
            ? email.body.substring(0, 500).replace(/\s+/g, ' ') 
            : email.preview;

          return (
            <div 
              key={email.id} 
              className={`p-5 flex flex-col gap-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100 last:border-0`}
            >
              <div className="flex gap-4">
                <div className="mt-1 text-slate-400">
                    <Mail size={20} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-slate-900">{email.subject}</h3>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{format(parseISO(email.receivedAt), 'MMM d, h:mm a')}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-slate-500">{email.sender}</span>
                    {child && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full bg-${child.color}-100 text-${child.color}-700 font-bold uppercase tracking-wider`}>
                        {child.name}
                        </span>
                    )}
                    {email.isProcessed && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={10} /> AI Processed
                        </span>
                    )}
                    </div>
                    {email.summary ? (
                        <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                            <span className="font-semibold text-indigo-600">Summary: </span>{email.summary}
                        </p>
                    ) : (
                        <p className="text-sm text-slate-500 line-clamp-3">{previewText}</p>
                    )}
                </div>
                <div className="flex flex-col items-center justify-start gap-2">
                   {!email.isProcessed && (
                       <button
                           onClick={(e) => {
                               e.stopPropagation();
                               setRawEmailText(email.body || email.preview);
                               setProcessingEmailId(email.id);
                               setShowProcessor(true);
                           }}
                           className="p-2 rounded-full text-slate-400 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                           title="Analyze with AI"
                       >
                           <Sparkles size={20} />
                       </button>
                   )}
                   <button 
                     onClick={(e) => handleDraftReply(e, email)}
                     className={`p-2 rounded-full transition-colors ${isDrafting ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'}`}
                     title="Draft Reply with Gemini"
                     disabled={isDrafting}
                   >
                      {isDrafting ? <Loader2 size={20} className="animate-spin" /> : <MessageSquare size={20} />}
                   </button>
                </div>
              </div>

              {/* Generated Draft UI */}
              {showDraft && (
                  <div className="ml-9 p-4 bg-indigo-50 border border-indigo-100 rounded-xl relative animate-in fade-in slide-in-from-top-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1">
                          <Sparkles size={12} /> Gemini Draft Suggestion
                      </h4>
                      <div className="text-sm text-slate-800 whitespace-pre-line mb-3 bg-white p-3 rounded-lg border border-indigo-100">
                          {draftResult.text}
                      </div>
                      <div className="flex gap-2">
                          <button 
                             onClick={(e) => { e.stopPropagation(); copyToClipboard(draftResult.text); }}
                             className="text-xs font-medium bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 flex items-center gap-1.5"
                          >
                              <Copy size={12} /> Copy to Clipboard
                          </button>
                          <button 
                             onClick={(e) => { e.stopPropagation(); setDraftResult(null); }}
                             className="text-xs font-medium text-slate-500 hover:text-slate-800 px-3 py-1.5"
                          >
                              Discard
                          </button>
                      </div>
                  </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Email Processor Modal/Overlay */}
      {showProcessor && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="text-indigo-600" /> AI Email Processor
                </h3>
                <p className="text-sm text-slate-500">
                    {processingEmailId ? 'Analysing existing email content.' : 'Paste an email to automatically extract events and actions.'}
                </p>
              </div>
              <button onClick={() => setShowProcessor(false)} className="text-slate-400 hover:text-slate-600">Close</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {!analysisResult ? (
                <div className="space-y-4">
                  <textarea
                    className="w-full h-64 p-4 bg-white text-slate-900 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none font-mono text-sm"
                    placeholder="Paste email content here..."
                    value={rawEmailText}
                    onChange={(e) => setRawEmailText(e.target.value)}
                  ></textarea>
                  
                  <div className="flex justify-end">
                    <button 
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !rawEmailText}
                      className="bg-indigo-600 disabled:bg-indigo-300 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all hover:bg-indigo-700"
                    >
                      {isAnalyzing ? <Loader2 className="animate-spin" /> : <Sparkles />}
                      {isAnalyzing ? 'Analyzing...' : 'Analyze with Gemini'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <CheckCircle2 className="text-indigo-600" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-900">Analysis Complete</h4>
                      <p className="text-sm text-indigo-700 mt-1">{analysisResult.summary}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                        <span className="text-xs uppercase font-bold text-slate-400">Child</span>
                        <p className="font-semibold text-slate-900">{analysisResult.childName || 'Unknown'}</p>
                     </div>
                     <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                        <span className="text-xs uppercase font-bold text-slate-400">Category</span>
                        <p className="font-semibold text-slate-900">{analysisResult.category}</p>
                     </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-slate-900 mb-2">Extracted Events</h5>
                    {analysisResult.events.length > 0 ? (
                        <div className="space-y-2">
                        {analysisResult.events.map((e: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg">
                                <span className="font-medium text-slate-800">{e.title}</span>
                                <span className="text-sm text-slate-500">{format(parseISO(e.date), 'MMM d')} at {e.time}</span>
                            </div>
                        ))}
                        </div>
                    ) : <p className="text-sm text-slate-400 italic">No events found.</p>}
                  </div>

                  <div>
                    <h5 className="font-semibold text-slate-900 mb-2">Extracted Actions</h5>
                    {analysisResult.actions.length > 0 ? (
                        <div className="space-y-2">
                        {analysisResult.actions.map((a: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg">
                                <span className="font-medium text-slate-800">{a.title}</span>
                                <span className="text-sm text-red-500 font-medium">Due {format(parseISO(a.deadline), 'MMM d')}</span>
                            </div>
                        ))}
                        </div>
                    ) : <p className="text-sm text-slate-400 italic">No actions found.</p>}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                     <button onClick={() => setAnalysisResult(null)} className="px-4 py-2 text-slate-600 hover:text-slate-900 mr-2">Back</button>
                     <button 
                        onClick={handleSaveProcessed}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-medium shadow-sm transition-colors"
                     >
                        Confirm & Save
                     </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;
