
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Timeline from './components/Timeline';
import Actions from './components/Actions';
import Inbox from './components/Inbox';
import Children from './components/Children';
import Settings from './components/Settings';
import { CHILDREN_MOCK, EMAILS_MOCK, EVENTS_MOCK, ACTIONS_MOCK } from './constants';
import { Email, SchoolEvent, ActionItem, Child } from './types';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import Login from './src/components/Login';

import { supabaseService } from './src/services/supabaseService';
import { searchEmails } from './services/gmailService';
import { analyzeEmailWithGemini } from './services/geminiService';

const AppContent: React.FC = () => {
  const { session, loading } = useAuth();

  // Global State
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);

  // Background Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const syncAbortRef = useRef(false);

  useEffect(() => {
    if (session) {
      const fetchData = async () => {
        try {
          const [fetchedChildren, fetchedEvents, fetchedActions, fetchedEmails] = await Promise.all([
            supabaseService.getChildren(),
            supabaseService.getEvents(),
            supabaseService.getActions(),
            supabaseService.getEmails()
          ]);

          setChildrenList(fetchedChildren);
          setEvents(fetchedEvents);
          setActions(fetchedActions);
          setEmails(fetchedEmails);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    } else {
      // Clear data when not authenticated
      setChildrenList([]);
      setEvents([]);
      setActions([]);
      setEmails([]);
    }
  }, [session]);

  // Helper: Find child by email rules (sender or domain)
  const findMatchingChildren = (email: Partial<Email>, children: Child[]): Child[] => {
    if (!email.sender) return [];

    const sender = email.sender.toLowerCase();
    const matched: Child[] = [];

    // Check specific sender match first (highest priority if we had weighted rules, but strictly boolean here)
    // Then check domain match
    children.forEach(child => {
      const rules = child.emailRules || [];
      const hasMatch = rules.some(rule => {
        const r = rule.toLowerCase().trim();
        // Exact email match or Domain match (@school.com or school.com)
        return sender.includes(r) || (r.startsWith('@') && sender.endsWith(r)) || sender.endsWith(`@${r}`);
      });
      if (hasMatch) {
        matched.push(child);
      }
    });

    return matched;
  };

  // Background Sync Function - runs at App level so it persists across navigation
  const handleBackgroundSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setSyncStatus('Fetching children...');
    syncAbortRef.current = false;

    try {
      // 1. Fetch children to get their email rules
      const children = await supabaseService.getChildren();
      setChildrenList(children); // Update local state
      const childNames = children.map(c => c.name);

      // 2. Extract all email rules (domains or emails)
      const allRules = children.flatMap(child => child.emailRules || []);
      const validRules = allRules.filter(rule => rule && rule.trim().length > 0);

      if (validRules.length === 0) {
        setSyncStatus('No school email addresses configured.');
        setIsSyncing(false);
        return;
      }

      // 3. Search for emails matching these rules
      setSyncStatus('Searching Gmail...');
      const fetchedEmails = await searchEmails(validRules, 2);

      // 4. Process each email: Check duplicate -> Analyze -> Save
      const processedEmails: Email[] = [];
      let processedCount = 0;

      for (const email of fetchedEmails) {
        if (syncAbortRef.current) {
          setSyncStatus('Sync cancelled.');
          break;
        }

        // Check if already exists
        const existing = await supabaseService.findEmailByDetails(email.subject, email.receivedAt);
        if (existing) {
          console.log(`Skipping duplicate email: ${email.subject}`);
          continue;
        }

        // --- IMPROVED MATCHING LOGIC ---
        // Step A: deterministic rule matching
        const matchingChildren = findMatchingChildren(email, children);
        let preferredChildName: string | undefined = undefined;
        let candidateNames = childNames; // Default to all if unknown

        if (matchingChildren.length === 1) {
          // Perfect match
          preferredChildName = matchingChildren[0].name;
          candidateNames = [matchingChildren[0].name];
        } else if (matchingChildren.length > 1) {
          // Ambiguous match (multiple siblings at same school?)
          // We limit the AI choice to just these children
          candidateNames = matchingChildren.map(c => c.name);
        }

        // Analyze with Gemini
        processedCount++;
        setSyncStatus(`Analyzing email ${processedCount}...`);
        console.log(`Analyzing email: ${email.subject}. Candidates: ${candidateNames.join(', ')}`);

        const analysis = await analyzeEmailWithGemini(
          email.body || email.preview,
          candidateNames,
          preferredChildName
        );

        // Find matched child from analysis result
        let matchedChild = children.find(c => c.name.toLowerCase() === analysis.childName?.toLowerCase());

        // Fallback Logic
        if (!matchedChild) {
          if (preferredChildName) {
            // If AI failed but we had a strict rule match, trust the rule
            matchedChild = matchingChildren[0];
            console.log(`AI returned unknown child. Falling back to rule match: ${matchedChild.name}`);
          } else if (matchingChildren.length > 0) {
            // If AI failed and we had candidates from rules, pick the first one (better than arbitrary global first)
            matchedChild = matchingChildren[0];
            console.log(`AI returned unknown child. Falling back to first candidate: ${matchedChild.name}`);
          } else {
            // Total fail. Assign to first child globally (legacy behavior) or maybe an "Unassigned" bucket?
            // For now, keep legacy behavior but log it.
            matchedChild = children[0];
            console.warn(`Could not attribute email to any child. Defaulting to ${matchedChild?.name}`);
          }
        }

        if (!matchedChild) continue; // Should not happen if children array is not empty

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
            const savedEvt = await supabaseService.createEvent({
              title: evt.title,
              date: evt.date,
              time: evt.time,
              location: evt.location,
              childId: matchedChild.id,
              category: analysis.category as any,
              description: "Extracted from email"
            });
            setEvents(prev => [...prev, savedEvt]);
          }
        }

        // Save Actions
        if (analysis.actions && analysis.actions.length > 0) {
          for (const act of analysis.actions) {
            const savedAct = await supabaseService.createAction({
              title: act.title,
              deadline: act.deadline,
              childId: matchedChild.id,
              isCompleted: false,
              urgency: analysis.urgency,
              relatedEmailId: savedEmail.id
            });
            setActions(prev => [...prev, savedAct]);
          }
        }

        // Update emails state incrementally
        setEmails(prev => [savedEmail, ...prev]);
      }

      if (processedEmails.length > 0) {
        setSyncStatus(`Synced ${processedEmails.length} new emails!`);
      } else {
        setSyncStatus('No new emails found.');
      }

      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
      setSyncStatus('Sync failed. Check console for details.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handler to toggle action completion
  const handleToggleAction = async (id: string) => {
    // Optimistic update
    setActions(prev => prev.map(a =>
      a.id === id ? { ...a, isCompleted: !a.isCompleted } : a
    ));

    try {
      const action = actions.find(a => a.id === id);
      if (action) {
        await supabaseService.toggleAction(id, !action.isCompleted);
      }
    } catch (error) {
      console.error("Failed to toggle action", error);
      // Revert on error
      setActions(prev => prev.map(a =>
        a.id === id ? { ...a, isCompleted: !a.isCompleted } : a
      ));
    }
  };

  // Handler for when an email is processed via AI in the Inbox
  const handleEmailProcessed = async (processedEmail: Email, newEvents: SchoolEvent[], newActions: ActionItem[]) => {
    try {
      let savedEmail: Email;

      // 1. Save/Update Email
      if (processedEmail.id.startsWith('m-') || processedEmail.id.length < 30) {
        // Assume temp ID or Gmail ID (short) -> Create new
        savedEmail = await supabaseService.createEmail(processedEmail, processedEmail.childId!);
      } else {
        // Assume UUID -> Update existing
        savedEmail = await supabaseService.updateEmail(processedEmail.id, processedEmail);
      }

      // 2. Save Events
      const savedEvents: SchoolEvent[] = [];
      for (const evt of newEvents) {
        const savedEvt = await supabaseService.createEvent({ ...evt, childId: savedEmail.childId! });
        savedEvents.push(savedEvt);
      }

      // 3. Save Actions
      const savedActions: ActionItem[] = [];
      for (const act of newActions) {
        const savedAct = await supabaseService.createAction({ ...act, childId: savedEmail.childId!, relatedEmailId: savedEmail.id });
        savedActions.push(savedAct);
      }

      // 4. Update Local State with Saved Data (Real UUIDs)
      setEmails(prev => {
        const index = prev.findIndex(e => e.id === processedEmail.id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = savedEmail;
          return updated;
        }
        return [savedEmail, ...prev];
      });
      setEvents(prev => [...prev, ...savedEvents]);
      setActions(prev => [...prev, ...savedActions]);

    } catch (error) {
      console.error("Failed to save processed data", error);
      alert("Failed to save changes to database.");
    }
  };

  // Handler for bulk import from Gmail (legacy, kept for compatibility)
  const handleEmailsImported = (importedEmails: Email[]) => {
    const existingIds = new Set(emails.map(e => e.id));
    const uniqueNewEmails = importedEmails.filter(e => !existingIds.has(e.id));

    if (uniqueNewEmails.length > 0) {
      setEmails(prev => [...uniqueNewEmails, ...prev]);
    }
  };

  const handleUpdateChildren = (updatedList: Child[]) => {
    setChildrenList(updatedList);
  };

  const handleDataCleared = () => {
    setChildrenList([]);
    setEmails([]);
    setEvents([]);
    setActions([]);
  };

  const handleChildAdded = (child: Child) => {
    setChildrenList(prev => [...prev, child]);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <Router>
      <Layout isSyncing={isSyncing} syncStatus={syncStatus}>
        <Routes>
          <Route path="/" element={
            <Dashboard
              childrenList={childrenList}
              events={events}
              actions={actions}
            />
          } />

          <Route path="/timeline" element={
            <Timeline
              childrenList={childrenList}
              events={events}
            />
          } />

          <Route path="/actions" element={
            <Actions
              childrenList={childrenList}
              actions={actions}
              onToggleAction={handleToggleAction}
            />
          } />

          <Route path="/children" element={
            <Children
              childrenList={childrenList}
              onUpdateChildren={handleUpdateChildren}
              onEmailsImported={handleEmailsImported}
            />
          } />

          <Route path="/inbox" element={
            <Inbox
              emails={emails}
              childrenList={childrenList}
              onEmailProcessed={handleEmailProcessed}
            />
          } />

          <Route path="/settings" element={
            <Settings
              onEmailsImported={handleEmailsImported}
              onDataCleared={handleDataCleared}
              onChildAdded={handleChildAdded}
              onSync={handleBackgroundSync}
              isSyncing={isSyncing}
              syncStatus={syncStatus}
              lastSyncTime={lastSyncTime}
            />
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;