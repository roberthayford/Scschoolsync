export enum CategoryType {
  ACTION_REQUIRED = 'Action Required',
  EVENT_ATTENDANCE = 'Event - Attendance',
  EVENT_PARENT = 'Event - Parent Attendance',
  DATE_TO_NOTE = 'Date to Note',
  INFO_ONLY = 'Information Only',
  PAYMENT_DUE = 'Payment Due',
}

export enum UrgencyLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export interface Child {
  id: string;
  name: string;
  schoolName: string;
  color: string; // Tailwind class component e.g., 'blue'
  avatarUrl: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: string; // ISO String
  time?: string;
  location?: string;
  childId: string;
  category: CategoryType;
  description?: string;
}

export interface ActionItem {
  id: string;
  title: string;
  deadline: string; // ISO String
  childId: string;
  isCompleted: boolean;
  urgency: UrgencyLevel;
  relatedEmailId?: string;
}

export interface Email {
  id: string;
  subject: string;
  sender: string;
  preview: string;
  receivedAt: string; // ISO String
  isProcessed: boolean;
  childId?: string; // AI Attributed
  category?: CategoryType; // AI Attributed
  summary?: string; // AI Generated
  extractedEvents?: SchoolEvent[];
  extractedActions?: ActionItem[];
}

export interface AIAnalysisResult {
  childName: string | null;
  category: CategoryType;
  summary: string;
  urgency: UrgencyLevel;
  events: Array<{
    title: string;
    date: string;
    time: string;
    location: string;
  }>;
  actions: Array<{
    title: string;
    deadline: string;
  }>;
}