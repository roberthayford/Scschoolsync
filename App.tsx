
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

const App: React.FC = () => {
  // Global State
  // In a real app, this would be managed by Context API, Redux, or Zustand
  // and persisted to a database.
  const [childrenList, setChildrenList] = useState<Child[]>(CHILDREN_MOCK);
  const [emails, setEmails] = useState<Email[]>(EMAILS_MOCK);
  const [events, setEvents] = useState<SchoolEvent[]>(EVENTS_MOCK);
  const [actions, setActions] = useState<ActionItem[]>(ACTIONS_MOCK);

  // Handler to toggle action completion
  const handleToggleAction = (id: string) => {
    setActions(prev => prev.map(a => 
      a.id === id ? { ...a, isCompleted: !a.isCompleted } : a
    ));
  };

  // Handler for when an email is processed via AI in the Inbox
  const handleEmailProcessed = (processedEmail: Email, newEvents: SchoolEvent[], newActions: ActionItem[]) => {
    setEmails(prev => {
      const index = prev.findIndex(e => e.id === processedEmail.id);
      if (index !== -1) {
        // Update existing email
        const updated = [...prev];
        updated[index] = processedEmail;
        return updated;
      }
      // Add new email
      return [processedEmail, ...prev];
    });
    setEvents(prev => [...prev, ...newEvents]);
    setActions(prev => [...prev, ...newActions]);
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

export default App;