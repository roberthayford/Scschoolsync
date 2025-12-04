
import { CategoryType, Child, UrgencyLevel, Email, SchoolEvent, ActionItem } from './types';

export const CHILDREN_MOCK: Child[] = [
  {
    id: 'c1',
    name: 'Emma',
    schoolName: 'St. Mary\'s Primary',
    color: 'pink',
    avatarUrl: 'https://picsum.photos/seed/emma/100/100',
    emailRules: ['stmarys.school.uk', 'class4@stmarys.school.uk', 'gymnastics-club.com']
  },
  {
    id: 'c2',
    name: 'Oliver',
    schoolName: 'Oakwood High',
    color: 'blue',
    avatarUrl: 'https://picsum.photos/seed/oliver/100/100',
    emailRules: ['oakwood.high.sch']
  }
];

export const EVENTS_MOCK: SchoolEvent[] = [
  {
    id: 'e1',
    title: 'Swimming Gala',
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    time: '14:00',
    location: 'School Pool',
    childId: 'c1',
    category: CategoryType.EVENT_ATTENDANCE,
  },
  {
    id: 'e2',
    title: 'Parents Evening',
    date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    time: '17:30',
    location: 'Main Hall',
    childId: 'c2',
    category: CategoryType.EVENT_PARENT,
  },
  {
    id: 'e3',
    title: 'Inset Day',
    date: new Date(Date.now() + 604800000).toISOString(), // Next week
    childId: 'c1',
    category: CategoryType.DATE_TO_NOTE,
  }
];

export const ACTIONS_MOCK: ActionItem[] = [
  {
    id: 'a1',
    title: 'Sign Trip Consent Form',
    deadline: new Date(Date.now() + 172800000).toISOString(),
    childId: 'c1',
    isCompleted: false,
    urgency: UrgencyLevel.HIGH,
  },
  {
    id: 'a2',
    title: 'Pay Dinner Money',
    deadline: new Date(Date.now() + 432000000).toISOString(),
    childId: 'c2',
    isCompleted: false,
    urgency: UrgencyLevel.MEDIUM,
  },
  {
    id: 'a3',
    title: 'Order School Photos',
    deadline: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    childId: 'c1',
    isCompleted: true,
    urgency: UrgencyLevel.LOW,
  }
];

export const EMAILS_MOCK: Email[] = [
  {
    id: 'm1',
    subject: 'Important: Year 4 Residential Trip',
    sender: 'office@stmarys.school.uk',
    preview: 'Dear Parents, Please find attached the details for the upcoming residential...',
    receivedAt: new Date(Date.now() - 3600000).toISOString(),
    isProcessed: true,
    childId: 'c1',
    category: CategoryType.ACTION_REQUIRED,
    summary: 'Consent form required for Year 4 Residential. Cost is £45.',
  },
  {
    id: 'm2',
    subject: 'Weekly Newsletter - Term 3',
    sender: 'news@oakwood.high.sch',
    preview: 'This week has been fantastic for our sports teams...',
    receivedAt: new Date(Date.now() - 86400000).toISOString(),
    isProcessed: true,
    childId: 'c2',
    category: CategoryType.INFO_ONLY,
    summary: 'Weekly wrap-up. Sports day dates announced (July 15th).',
  }
];
