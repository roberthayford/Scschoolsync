
import React, { useState, useEffect } from 'react';
import { Email, Child, CategoryType, SchoolEvent, ActionItem } from '../types';
import { Mail, RefreshCw, Plus, ArrowRight, Loader2, Sparkles, CheckCircle2, MessageSquare, Copy, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { analyzeEmailWithGemini, generateDraftReply } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { childColours } from '../src/theme/colors';
import { EmptyState } from './EmptyState';
import { useLocation } from 'react-router-dom';

interface InboxProps {
  emails: Email[];
  childrenList: Child[];
  onEmailProcessed: (email: Email, events: SchoolEvent[], actions: ActionItem[]) => void;
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    alert('Copied to clipboard!');
  }, (err) => {
    console.error('Could not copy text: ', err);
  });
};

const Inbox: React.FC<InboxProps> = ({ emails, childrenList, onEmailProcessed }) => {
  const [showProcessor, setShowProcessor] = useState(false);
  const [rawEmailText, setRawEmailText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [processingEmailId, setProcessingEmailId] = useState<string | null>(null);

  // Navigation / Scroll State
  const location = useLocation();
  const [highlightedEmailId, setHighlightedEmailId] = useState<string | null>(null);

  // Draft Reply State
  const [draftingForId, setDraftingForId] = useState<string | null>(null);
  const [draftResult, setDraftResult] = useState<{ id: string, text: string } | null>(null);

  // Handle deep linking / scrolling to email from URL (e.g., from ActionCard)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailId = params.get('emailId');

    if (emailId && emails.length > 0) {
      // Find the element
      const element = document.getElementById(`email-card-${emailId}`);
      if (element) {
        // Scroll into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Highlight temporarily
        setHighlightedEmailId(emailId);
        const timer = setTimeout(() => setHighlightedEmailId(null), 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [location.search, emails]);

  // Function to handle the AI Processing
  const handleAnalyze = async () => {
    if (!rawEmailText.trim()) return;
    setIsAnalyzing(true);

    // Simulate API delay for UX if local
    const minDelay = new Promise(resolve => setTimeout(resolve, 1500));

    const childNames = childrenList.map(c => c.name);

    try {
      const currentEmail = processingEmailId ? emails.find(e => e.id === processingEmailId) : null;
      const attachments = currentEmail?.attachments || [];

      const [result] = await Promise.all([
        analyzeEmailWithGemini(rawEmailText, childNames, undefined, attachments),
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
        summary: analysisResult.summary,
        extractedEvents: analysisResult.events.map((evt: any, idx: number) => ({
          id: `e-${Date.now()}-${idx}`,
          title: evt.title,
          date: evt.date,
          time: evt.time,
          location: evt.location,
          childId: matchedChild.id,
          category: analysisResult.category === CategoryType.EVENT_PARENT ? CategoryType.EVENT_PARENT : CategoryType.EVENT_ATTENDANCE
        })),
        extractedActions: analysisResult.actions.map((act: any, idx: number) => ({
          id: `a-${Date.now()}-${idx}`,
          title: act.title,
          deadline: act.deadline,
          childId: matchedChild.id,
          isCompleted: false,
          urgency: analysisResult.urgency,
          relatedEmailId: original.id
        }))
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

        summary: analysisResult.summary,
        extractedEvents: analysisResult.events.map((evt: any, idx: number) => ({
          id: `e-${Date.now()}-${idx}`,
          title: evt.title,
          date: evt.date,
          time: evt.time,
          location: evt.location,
          childId: matchedChild.id,
          category: analysisResult.category === CategoryType.EVENT_PARENT ? CategoryType.EVENT_PARENT : CategoryType.EVENT_ATTENDANCE
        })),
        extractedActions: analysisResult.actions.map((act: any, idx: number) => ({
          id: `a-${Date.now()}-${idx}`,
          title: act.title,
          deadline: act.deadline,
          childId: matchedChild.id,
          isCompleted: false,
          urgency: analysisResult.urgency,
          relatedEmailId: `m-${Date.now()}`
        }))
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



  const getChildTheme = (childName?: string) => {
    // Find theme by name if possible, else default
    if (!childName) return null;
    // Simple lookup for demo purposes since we don't have the color key stored in name
    const key = Object.keys(childColours).find(k => k === childName.toLowerCase()) as keyof typeof childColours;
    return childColours[key] || childColours.shared; // fallback
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Inbox</h2>
        <button
          onClick={() => {
            setRawEmailText('');
            setProcessingEmailId(null);
            setShowProcessor(true);
          }}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 md:py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all"
        >
          <Plus size={18} />
          <span>Process New Email</span>
        </button>
      </div>

      {/* Main Inbox List */}
      <div className="space-y-3">
        {emails.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="Inbox is empty"
            description="New school emails will appear here when synced."
          />
        ) : (
          <AnimatePresence mode='popLayout'>
            {emails.map((email, idx) => {
              const child = childrenList.find(c => c.id === email.childId);
              // Try to match theme color
              const theme = child ? (childColours[child.color as keyof typeof childColours] || childColours.shared) : childColours.shared;

              const isDrafting = draftingForId === email.id;
              const showDraft = draftResult?.id === email.id;
              const isHighlighted = highlightedEmailId === email.id;

              // Prepare extended preview text
              const previewText = email.body
                ? email.body.substring(0, 500).replace(/\s+/g, ' ')
                : email.preview;

              return (
                <motion.div
                  key={email.id}
                  id={`email-card-${email.id}`}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: isHighlighted ? 1.02 : 1,
                    borderColor: isHighlighted ? theme.primary : undefined,
                    boxShadow: isHighlighted ? `0 0 0 2px ${theme.primary}20` : undefined,
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className={`bg-white rounded-2xl border transition-all cursor-pointer relative overflow-hidden group
                    ${email.isProcessed ? 'border-slate-200 shadow-sm' : 'border-indigo-100 shadow-[0_2px_8px_rgba(99,102,241,0.1)]'}
                    hover:shadow-md hover:border-indigo-200
                    ${isHighlighted ? 'bg-indigo-50/50' : ''}
                  `}
                  onClick={() => {
                    // Expanding logic could go here, for now it just processes if not processed
                  }}
                >
                  {/* Unread/Process Indicator Strip */}
                  {!email.isProcessed && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}

                  <div className="p-4 md:p-5 flex flex-col gap-3 md:gap-4">
                    <div className="flex gap-3 md:gap-4">
                      <div className={`mt-1 shrink-0 p-2 rounded-full ${email.isProcessed ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        <Mail size={20} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={`font-semibold truncate pr-2 ${email.isProcessed ? 'text-slate-700' : 'text-slate-900'}`}>{email.subject}</h3>
                          <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">{format(parseISO(email.receivedAt), 'MMM d')}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-sm text-slate-500 truncate max-w-[120px]">{email.sender}</span>
                          {child && (
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                              style={{ backgroundColor: theme.light, color: theme.dark }}
                            >
                              {child.name}
                            </span>
                          )}
                          {email.isProcessed && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-bold uppercase tracking-wider flex items-center gap-1 border border-green-100">
                              <Sparkles size={10} /> <span className="hidden sm:inline">AI Processed</span><span className="sm:hidden">AI</span>
                            </span>
                          )}
                        </div>

                        {email.summary ? (
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                            <div>
                              <span className="font-semibold text-indigo-600 block mb-1 text-xs uppercase tracking-wide">Summary</span>
                              <p className="text-sm text-slate-600">{email.summary}</p>
                            </div>

                            {(email.extractedEvents && email.extractedEvents.length > 0) || (email.extractedActions && email.extractedActions.length > 0) ? (
                              <div className="pt-2 border-t border-slate-200 mt-2">
                                <span className="font-semibold text-slate-500 block mb-2 text-xs uppercase tracking-wide">Key Dates & Actions</span>
                                <div className="space-y-2">
                                  {email.extractedEvents?.map((evt, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                                      <span className="font-medium">{evt.title}</span>
                                      <span className="text-slate-400">-</span>
                                      <span className="text-slate-500">{format(parseISO(evt.date), 'MMM d')} {evt.time}</span>
                                    </div>
                                  ))}
                                  {email.extractedActions?.map((act, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></div>
                                      <span className="font-medium">{act.title}</span>
                                      <span className="text-slate-400">-</span>
                                      <span className="text-red-500 text-xs font-semibold uppercase">Due {format(parseISO(act.deadline), 'MMM d')}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 line-clamp-2 md:line-clamp-3">{previewText}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-center justify-start gap-2 shrink-0">
                        {!email.isProcessed && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRawEmailText(email.body || email.preview);
                              setProcessingEmailId(email.id);
                              setShowProcessor(true);
                            }}
                            className="p-2 rounded-full text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                            title="Analyze with AI"
                          >
                            <Sparkles size={20} />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDraftReply(e, email)}
                          className={`p-2 rounded-full transition-colors ${isDrafting ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                          title="Draft Reply with Gemini"
                          disabled={isDrafting}
                        >
                          {isDrafting ? <Loader2 size={20} className="animate-spin" /> : <MessageSquare size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* Generated Draft UI */}
                    {showDraft && (
                      <div className="ml-0 md:ml-12 p-4 bg-indigo-50 border border-indigo-100 rounded-xl relative animate-in fade-in slide-in-from-top-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1">
                          <Sparkles size={12} /> Gemini Draft Suggestion
                        </h4>
                        <div className="text-sm text-slate-800 whitespace-pre-line mb-3 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                          {draftResult.text}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(draftResult.text); }}
                            className="flex-1 md:flex-none text-xs font-medium bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Copy size={12} /> Copy
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDraftResult(null); }}
                            className="flex-1 md:flex-none text-xs font-medium text-slate-500 hover:text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-lg"
                          >
                            Discard
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Email Processor Modal/Overlay */}
      {showProcessor && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-xl w-full max-w-2xl h-[90vh] md:h-auto md:max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-4 duration-300">

            {/* Modal Header */}
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="text-indigo-600" /> AI Email Processor
                </h3>
                <p className="text-xs md:text-sm text-slate-500 line-clamp-1">
                  {processingEmailId ? 'Analysing existing email content.' : 'Paste content to extract events/actions.'}
                </p>
              </div>
              <button
                onClick={() => setShowProcessor(false)}
                className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {!analysisResult ? (
                <div className="space-y-4 h-full flex flex-col">
                  <textarea
                    className="w-full flex-1 p-4 bg-white text-slate-900 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none font-mono text-sm"
                    placeholder="Paste email content here..."
                    value={rawEmailText}
                    onChange={(e) => setRawEmailText(e.target.value)}
                  ></textarea>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !rawEmailText}
                      className="w-full md:w-auto bg-indigo-600 disabled:bg-indigo-300 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:bg-indigo-700"
                    >
                      {isAnalyzing ? <Loader2 className="animate-spin" /> : <Sparkles />}
                      {isAnalyzing ? 'Analyzing...' : 'Analyze with Gemini'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="bg-indigo-100 p-2 rounded-lg shrink-0">
                      <CheckCircle2 className="text-indigo-600" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-900">Analysis Complete</h4>
                      <p className="text-sm text-indigo-700 mt-1">{analysisResult.summary}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 md:p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <span className="text-xs uppercase font-bold text-slate-400">Child</span>
                      <p className="font-semibold text-slate-900">{analysisResult.childName || 'Unknown'}</p>
                    </div>
                    <div className="p-3 md:p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <span className="text-xs uppercase font-bold text-slate-400">Category</span>
                      <p className="font-semibold text-slate-900 text-sm md:text-base truncate">{analysisResult.category}</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-slate-900 mb-2">Extracted Events</h5>
                    {analysisResult.events.length > 0 ? (
                      <div className="space-y-2">
                        {analysisResult.events.map((e: any, i: number) => (
                          <div key={i} className="flex flex-col md:flex-row md:justify-between md:items-center p-3 bg-white border border-slate-200 rounded-lg gap-1">
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
                          <div key={i} className="flex flex-col md:flex-row md:justify-between md:items-center p-3 bg-white border border-slate-200 rounded-lg gap-1">
                            <span className="font-medium text-slate-800">{a.title}</span>
                            <span className="text-sm text-red-500 font-medium">Due {format(parseISO(a.deadline), 'MMM d')}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-sm text-slate-400 italic">No actions found.</p>}
                  </div>

                  <div className="flex flex-col-reverse md:flex-row justify-end pt-4 border-t border-slate-100 gap-3">
                    <button onClick={() => setAnalysisResult(null)} className="px-4 py-3 md:py-2 text-slate-600 hover:text-slate-900 w-full md:w-auto text-center">Back</button>
                    <button
                      onClick={handleSaveProcessed}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 md:py-2 rounded-xl font-medium shadow-sm transition-colors w-full md:w-auto"
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
