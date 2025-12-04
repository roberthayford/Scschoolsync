import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Timeline from './components/Timeline';
import Actions from './components/Actions';
import Inbox from './components/Inbox';
import Children from './components/Children';
import { CHILDREN_MOCK, EMAILS_MOCK, EVENTS_MOCK, ACTIONS_MOCK } from './constants';
import { Email, SchoolEvent, ActionItem } from './types';

const App: React.FC = () => {
  // Global State
  // In a real app, this would be managed by Context API, Redux, or Zustand
  // and persisted to a database.
  const [childrenList] = useState(CHILDREN_MOCK);
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
  const handleEmailProcessed = (newEmail: Email, newEvents: SchoolEvent[], newActions: ActionItem[]) => {
    setEmails(prev => [newEmail, ...prev]);
    setEvents(prev => [...prev, ...newEvents]);
    setActions(prev => [...prev, ...newActions]);
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
            <Children childrenList={childrenList} />
          } />

          <Route path="/inbox" element={
            <Inbox 
              emails={emails} 
              childrenList={childrenList}
              onEmailProcessed={handleEmailProcessed}
            />
          } />

          <Route path="/settings" element={
            <div className="flex flex-col items-center justify-center h-96 text-slate-400">
               <p>Settings placeholder</p>
            </div>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;