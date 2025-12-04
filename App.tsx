
import React, { useState, useEffect } from 'react';
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

const AppContent: React.FC = () => {
  const { session, loading } = useAuth();

  // Global State
  // In a real app, this would be managed by Context API, Redux, or Zustand
  // and persisted to a database.
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);

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

  // Handler for bulk import from Gmail
  const handleEmailsImported = (importedEmails: Email[]) => {
    // Filter out duplicates based on ID if necessary, or just prepend
    // For now, we prepend and let React key warnings handle dupes if any (simple approach)
    // A better approach is to check IDs:
    const existingIds = new Set(emails.map(e => e.id));
    const uniqueNewEmails = importedEmails.filter(e => !existingIds.has(e.id));

    if (uniqueNewEmails.length > 0) {
      setEmails(prev => [...uniqueNewEmails, ...prev]);
    }
  };

  const handleUpdateChildren = (updatedList: Child[]) => {
    setChildrenList(updatedList);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <Router>
      <Layout>
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
            <Settings onEmailsImported={handleEmailsImported} />
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