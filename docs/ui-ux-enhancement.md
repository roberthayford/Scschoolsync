# SchoolSync UI/UX Enhancement Recommendations

> **Document Version:** 1.0  
> **Date:** 5 December 2025  
> **Purpose:** Comprehensive guide for enhancing the SchoolSync application UI/UX based on design principles from Apple, Google, and Amazon.

---

## Table of Contents

1. [Current State Assessment](#1-current-state-assessment)
2. [Design Philosophy](#2-design-philosophy)
3. [Colour Strategy](#3-colour-strategy)
4. [Micro-Motion & Animation](#4-micro-motion--animation)
5. [Enhanced Dashboard Layout](#5-enhanced-dashboard-layout)
6. [Component Specifications](#6-component-specifications)
7. [Notification Strategy](#7-notification-strategy)
8. [Accessibility Requirements](#8-accessibility-requirements)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [Technical Implementation Notes](#10-technical-implementation-notes)

---

## 1. Current State Assessment

### 1.1 What's Working Well

- Clean card-based layout
- Clear visual hierarchy with the AI Assistant prominently placed
- Good use of the purple gradient for the AI component
- Activity Overview chart provides useful at-a-glance data
- Mobile navigation is well-structured with appropriate icons

### 1.2 Areas for Enhancement

| Area | Current Issue | Impact |
|------|---------------|--------|
| Information density | Too sparse, requires scrolling | Slower decision making |
| Empty states | Lack actionable guidance | Missed engagement opportunity |
| Colour usage | Decorative only, not meaningful | No visual urgency cues |
| "Process New Emails" button | Suggests manual action | Undermines automation value |
| Time-based tabs | Requires mental mapping | Cognitive load |
| Child attribution | Not visually distinct | Harder to scan quickly |

---

## 2. Design Philosophy

### 2.1 Apple's Approach: Clarity Through Reduction

**Core Principle:** "At a glance, not at a search"

The dashboard should answer "What do I need to know RIGHT NOW?" within 2 seconds.

#### Implementation Guidelines

| Guideline | Action |
|-----------|--------|
| Reduce decisions | Show smart defaults, hide complexity |
| Progressive disclosure | Summary first, details on demand |
| Single scrolling timeline | Remove Today/This Week/Next Week tabs |
| Automated processing | Replace manual button with "Last synced" indicator |
| Contextual empty states | Show what's next, not just "nothing here" |

### 2.2 Google's Approach: Helpful Intelligence

**Core Principle:** "Anticipate, don't just display"

Use AI to surface what matters most, not just list everything chronologically.

#### Implementation Guidelines

| Guideline | Action |
|-----------|--------|
| Proactive suggestions | AI should offer reminders: "Emma has swimming tomorrow" |
| Smart grouping | "This morning" / "This afternoon" / "Coming up" |
| Urgency indicators | Visual deadline countdowns |
| Personalisation | Learn from user behaviour patterns |
| Contextual help | Suggest queries in AI Assistant |

### 2.3 Amazon's Approach: Action-Oriented Design

**Core Principle:** "Reduce friction to zero"

Every action should be completable in minimal taps.

#### Implementation Guidelines

| Guideline | Action |
|-----------|--------|
| Inline actions | "Mark as Done" / "Add to Calendar" buttons on cards |
| Swipe gestures | Quick management without opening details |
| Feedback loops | Satisfying animations on completion |
| Clear CTAs | Primary actions visually prominent |
| Confirmation | Brief toast messages, not modal dialogs |

---

## 3. Colour Strategy

### 3.1 Child Attribution Colours

Each child should have a consistent, distinct colour throughout the app for instant recognition.

| Child | Primary Colour | Hex Code | Light Tint | Tint Hex | Usage |
|-------|----------------|----------|------------|----------|-------|
| Olivia | Indigo | `#6366F1` | Indigo Light | `#EEF2FF` | Left border, avatar ring, chart bar |
| Annabelle | Pink | `#EC4899` | Pink Light | `#FDF2F8` | Left border, avatar ring, chart bar |
| Both/Shared | Purple | `#8B5CF6` | Purple Light | `#F5F3FF` | Events affecting multiple children |

### 3.2 Urgency Colours

| Urgency Level | Colour Name | Hex Code | When to Use |
|---------------|-------------|----------|-------------|
| Critical | Red | `#EF4444` | Due today or overdue |
| Needs Attention | Amber | `#F59E0B` | Due within 3 days |
| Upcoming | Blue | `#3B82F6` | Due within 7 days |
| Informational | Grey | `#6B7280` | Default state, no urgency |

### 3.3 Category Colours

| Category | Background Hex | Icon Colour Hex | Example Use |
|----------|----------------|-----------------|-------------|
| Action Required | `#FEF3C7` | `#D97706` | Consent forms, bookings |
| Event - Child Attends | `#DBEAFE` | `#2563EB` | Swimming, gymnastics |
| Event - Parent Attends | `#FCE7F3` | `#DB2777` | Parents' evening, plays |
| Payment Due | `#FEE2E2` | `#DC2626` | Trip payments, dinner money |
| Information Only | `#F3F4F6` | `#6B7280` | Newsletters, updates |

### 3.4 Colour Application Rules

1. **Left border** on cards indicates child (3-4px width)
2. **Badge colour** indicates urgency level
3. **Background tint** indicates category (subtle, 10-20% opacity)
4. **Never rely on colour alone** - always pair with icons and text

### 3.5 Dark Mode Considerations

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Child colours | Full saturation | Slightly desaturated |
| Urgency badges | Solid colours | Outlined with fill |
| Card backgrounds | White | `#1F2937` |
| Tinted backgrounds | Light tints | Darker tints (15% opacity) |

---

## 4. Micro-Motion & Animation

### 4.1 Animation Principles

#### Do

- Use easing curves (ease-out for entrances, ease-in for exits)
- Keep interactions under 400ms
- Ensure animations are interruptible
- Respect `prefers-reduced-motion` system setting

#### Don't

- Animate everything (causes fatigue)
- Use bouncy animations for serious content
- Block user interaction during animations
- Delay access to information

### 4.2 Entry Animations

| Element | Animation Type | Duration | Delay | Easing |
|---------|----------------|----------|-------|--------|
| Dashboard cards | Fade up (20px) | 150ms | 50ms stagger | ease-out |
| Urgent item badges | Subtle pulse | 2000ms loop | - | ease-in-out |
| AI Assistant gradient | Colour shift | 3000ms loop | - | linear |
| List items | Fade in | 100ms | 30ms stagger | ease-out |

### 4.3 Interaction Feedback

| User Action | Animation | Duration | Visual Effect |
|-------------|-----------|----------|---------------|
| Tap card | Scale down/up | 100ms | 0.98 → 1.0 scale |
| Complete action | Checkmark draw + confetti | 400ms | Green check, particles |
| Swipe dismiss | Slide out + slide up | 200ms | Card exits, next rises |
| Pull to refresh | Elastic overscroll | Variable | Rubber band effect |
| New item appears | Slide from top | 300ms | Highlight flash |
| Error state | Shake horizontal | 300ms | 3x subtle shake |

### 4.4 Navigation Transitions

| Transition Type | Animation | Duration | Notes |
|-----------------|-----------|----------|-------|
| Tab switch | Crossfade | 200ms | Content only, not tabs |
| Open detail view | Shared element expand | 300ms | Card morphs to full screen |
| Bottom sheet | Slide up + backdrop fade | 250ms | Backdrop opacity 0.5 |
| Modal dismiss | Slide down + fade | 200ms | Can also swipe to dismiss |
| Page navigation | Slide left/right | 250ms | iOS-style push |

### 4.5 Celebration Animations

| Achievement | Animation | When to Trigger |
|-------------|-----------|-----------------|
| Action completed | Confetti burst (subtle) | Any action marked done |
| All actions cleared | Larger celebration | Zero actions remaining |
| Weekly streak | Badge animation | Sunday summary if no missed items |

---

## 5. Enhanced Dashboard Layout

### 5.1 Mobile Dashboard Structure

```
┌────────────────────────────────────────┐
│ Header: App name, notifications, avatar │
├────────────────────────────────────────┤
│ Greeting: "Good morning, Rob 👋"       │
│ Date: "Friday, 5 December"             │
├────────────────────────────────────────┤
│ PRIORITY: Actions Banner (if any)      │
│ "🔴 2 actions need your attention"     │
├────────────────────────────────────────┤
│ TODAY Section                          │
│ - Event cards with child colour coding │
│ - Or "All clear" with next event hint  │
├────────────────────────────────────────┤
│ TOMORROW Section                       │
│ - Upcoming events                      │
├────────────────────────────────────────┤
│ THIS WEEK Section                      │
│ - Compact list view                    │
│ - Scannable, tap to expand             │
├────────────────────────────────────────┤
│ AI Schedule Assistant                  │
│ - Query input                          │
│ - Suggested prompts                    │
├────────────────────────────────────────┤
│ Bottom Navigation                      │
│ Home | Timeline | Actions | Kids | More │
└────────────────────────────────────────┘
```

### 5.2 Mobile Layout Specifications

| Section | Height | Behaviour |
|---------|--------|-----------|
| Header | 56px fixed | Always visible |
| Greeting | Auto | Collapses on scroll |
| Actions Banner | 64px (if present) | Sticky until dismissed |
| Content | Scrollable | Continuous timeline |
| AI Assistant | Auto | In scroll flow |
| Bottom Nav | 56px fixed | Always visible |

### 5.3 Desktop Dashboard Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ Header: Logo, Search, Notifications, Last Synced, Avatar       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Greeting + Date                                                │
│                                                                 │
│  ┌─────────────────────────┐  ┌─────────────────────────┐      │
│  │ ACTIONS REQUIRED        │  │ THIS WEEK               │      │
│  │ - Action cards          │  │ - Calendar/list view    │      │
│  │ - Inline complete       │  │ - Filter by child       │      │
│  └─────────────────────────┘  └─────────────────────────┘      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ AI SCHEDULE ASSISTANT                                   │   │
│  │ - Full width query bar                                  │   │
│  │ - Suggested prompts                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────┐  ┌─────────────────────────┐      │
│  │ ACTIVITY CHART          │  │ RECENT EMAILS           │      │
│  │ - Events/actions by     │  │ - Last 5 processed      │      │
│  │   child                 │  │ - Link to inbox         │      │
│  └─────────────────────────┘  └─────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.4 Key Layout Changes from Current

| Change | Rationale | Priority |
|--------|-----------|----------|
| Actions banner at top | Critical items unmissable | P0 |
| Continuous timeline | Removes tab-switching cognitive load | P0 |
| Child colour borders | Instant visual attribution | P0 |
| Inline contextual details | Reduces need to tap into items | P1 |
| AI Assistant lower | Tool, not primary content | P1 |
| Compact week view | Scannable planning view | P1 |
| "Last synced" indicator | Builds trust in automation | P2 |

---

## 6. Component Specifications

### 6.1 Event Card Component

#### Anatomy

```
┌────────────────────────────────────────────────────┐
│ ▌[Child colour border]                             │
│ ▌ [Category Icon] [Event Title]      [Time/Badge] │
│ ▌                [Child] • [School]               │
│ ▌                [Contextual note - optional]     │
│ ▌                [Action button - if applicable]  │
└────────────────────────────────────────────────────┘
```

#### Visual Specifications

| Element | Specification |
|---------|---------------|
| Card padding | 16px |
| Border radius | 12px |
| Left border width | 4px |
| Shadow | `0 1px 3px rgba(0,0,0,0.1)` |
| Icon size | 24px |
| Title font | 16px, semibold |
| Subtitle font | 14px, regular, grey-600 |
| Note font | 14px, regular, grey-500 |

#### Card States

| State | Background | Border | Shadow | Other |
|-------|------------|--------|--------|-------|
| Default | White | Child colour | Subtle | - |
| Pressed | Grey-50 | Child colour | None | Scale 0.98 |
| Urgent | Amber-50 | Child colour | Subtle | Pulsing badge |
| Completed | Grey-100 | Grey-300 | None | Strikethrough title |

#### Swipe Actions (Mobile)

| Direction | Action | Background | Icon |
|-----------|--------|------------|------|
| Right | Complete/Acknowledge | Green-500 | ✓ Checkmark |
| Left | Snooze/Remind Later | Blue-500 | 🔔 Bell |

### 6.2 Action Item Component

#### Anatomy

```
┌────────────────────────────────────────────────────┐
│ ▌[Child colour border]                             │
│ ▌                                                  │
│ ▌ [Icon]                              [URGENCY]   │
│ ▌ [Action Title]                      [BADGE]     │
│ ▌ [Child] • [School]                              │
│ ▌                                                  │
│ ▌ [Description text - 2 lines max]               │
│ ▌                                                  │
│ ▌ ┌──────────────┐ ┌──────────────┐              │
│ ▌ │ View Email   │ │ ✓ Mark Done │              │
│ ▌ └──────────────┘ └──────────────┘              │
└────────────────────────────────────────────────────┘
```

#### Urgency Badge Specifications

| Days Until Due | Badge Text | Badge Colour | Background | Animation |
|----------------|------------|--------------|------------|-----------|
| Overdue | OVERDUE | White on Red-500 | Red-50 | Pulse |
| Due today | TODAY | White on Amber-500 | Amber-50 | Subtle pulse |
| 1-3 days | DUE [DAY] | Amber-700 on Amber-100 | Amber-50 | None |
| 4-7 days | DUE [DAY] | Blue-700 on Blue-100 | White | None |
| 7+ days | [DATE] | Grey-600 on Grey-100 | White | None |

### 6.3 Child Filter Component

#### Horizontal Pill Navigation

```
┌─────────────────────────────────────────────────────┐
│ ┌─────────┐ ┌────────────┐ ┌──────────────┐        │
│ │   All   │ │ ● Olivia   │ │ ● Annabelle  │        │
│ └─────────┘ └────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────┘
```

#### Specifications

| Element | Default State | Selected State |
|---------|---------------|----------------|
| Background | Transparent | Child's primary colour |
| Text colour | Grey-700 | White |
| Border | 1px Grey-300 | None |
| Dot colour | Child's colour | White |
| Padding | 8px 16px | 8px 16px |
| Border radius | 20px (pill) | 20px (pill) |

### 6.4 Empty State Component

#### Structure

```
┌────────────────────────────────────────────────────┐
│                                                    │
│              [Illustration - optional]             │
│                                                    │
│              [Headline]                            │
│              [Supportive text]                     │
│                                                    │
│              [CTA Button - if applicable]          │
│                                                    │
└────────────────────────────────────────────────────┘
```

#### Context-Specific Copy

| Context | Headline | Supportive Text | CTA |
|---------|----------|-----------------|-----|
| No events today | All clear today! ✨ | Next up: Swimming with Olivia on Thursday | View Timeline |
| No actions | You're all caught up! 🎉 | We'll notify you when something needs attention | - |
| No emails | No school emails yet | Connect Gmail to start monitoring | Connect Gmail |
| First time | Welcome to SchoolSync | Let's set up your children's schools | Get Started |
| Empty search | No results found | Try different keywords or check spelling | - |

---

## 7. Notification Strategy

### 7.1 Notification Types & Timing

| Notification Type | Trigger | Time | Priority | Groupable |
|-------------------|---------|------|----------|-----------|
| New action required | Email processed | Immediate | High | No |
| Deadline - 3 days | Countdown | 9am | Medium | Yes |
| Deadline - 1 day | Countdown | 9am | High | No |
| Deadline - day of | Countdown | 7am | High | No |
| Event tomorrow | Day before | 6pm | Medium | Yes |
| Event today | Day of | 7am | Medium | Yes |
| Weekly summary | Scheduled | Sunday 6pm | Low | N/A |
| Email processed | Batch | Hourly | Low | Yes |

### 7.2 Notification Content Structure

#### Action Notification

```
┌─────────────────────────────────────────┐
│ SCHOOLSYNC                      2m ago │
│                                        │
│ ⚠️ Action due tomorrow                 │
│ Consent form for Olivia's trip to      │
│ Science Museum - deadline Friday       │
│                                        │
│ [View Details]  [Mark Complete]        │
└─────────────────────────────────────────┘
```

#### Event Reminder

```
┌─────────────────────────────────────────┐
│ SCHOOLSYNC                     6:00pm  │
│                                        │
│ 📅 Tomorrow's events                   │
│ • 9:15am - Swimming (Olivia)           │
│ • 3:00pm - Play rehearsal (Annabelle)  │
│                                        │
│ [View All]                             │
└─────────────────────────────────────────┘
```

### 7.3 Notification Settings (User Configurable)

| Setting | Options | Default |
|---------|---------|---------|
| Action alerts | On / Off | On |
| Event reminders | On / Off | On |
| Reminder timing | 1 day / 3 days / 1 week | 1 day |
| Weekly summary | On / Off | On |
| Summary day/time | Day + Time picker | Sunday 6pm |
| Quiet hours | Time range | 9pm - 7am |

---

## 8. Accessibility Requirements

### 8.1 Visual Accessibility

| Requirement | Standard | Implementation |
|-------------|----------|----------------|
| Colour contrast (text) | WCAG AA 4.5:1 | Test all text/background combinations |
| Colour contrast (UI) | WCAG AA 3:1 | Test buttons, borders, icons |
| Colour independence | Not sole indicator | Icons + text labels with colours |
| Focus indicators | Visible | 2px outline on focus |
| Text scaling | Up to 200% | Support dynamic type |

### 8.2 Motor Accessibility

| Requirement | Standard | Implementation |
|-------------|----------|----------------|
| Touch targets | 44x44pt minimum | All buttons, links, cards |
| Gesture alternatives | Button fallback | Swipe actions have button alternatives |
| Timeout extensions | User control | No auto-timeouts on actions |

### 8.3 Screen Reader Support

| Element | Accessible Label Format |
|---------|------------------------|
| Event card | "[Category]: [Title] for [Child] at [School], [Time/Date]" |
| Action card | "Action required: [Title] for [Child], due [Date]" |
| Urgency badge | "[Urgency level]: due [timeframe]" |
| Child filter | "Filter by [Child name], [selected/not selected]" |
| Complete button | "Mark [action title] as complete" |

### 8.4 Reduced Motion

When `prefers-reduced-motion` is enabled:

| Normal Behaviour | Reduced Motion Alternative |
|------------------|---------------------------|
| Fade + slide animations | Instant appear |
| Pulse animations | Static state |
| Confetti celebrations | Simple checkmark |
| Shared element transitions | Crossfade |
| Swipe gestures | Still available, no animation |

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-3)

**Priority: P0 - Must Have**

| Task | Component | Effort | Dependencies |
|------|-----------|--------|--------------|
| Implement colour system | Global styles | 2 days | Design tokens |
| Child colour coding | Event cards | 2 days | Colour system |
| Urgency badges | Action cards | 2 days | Colour system |
| Redesign event cards | Cards | 3 days | Colours, badges |
| Actions banner | Dashboard | 2 days | Cards |
| Continuous timeline | Dashboard | 3 days | Cards |
| Empty states | All screens | 2 days | Copy writing |

**Phase 1 Deliverables:**
- [x] Colour system implemented
- [x] Event cards with child attribution
- [x] Action cards with urgency indicators
- [x] Dashboard with actions banner
- [x] Continuous timeline view
- [x] Improved empty states

### Phase 2: Interaction Polish (Weeks 4-5)

**Priority: P1 - Should Have**

| Task | Component | Effort | Dependencies |
|------|-----------|--------|--------------|
| Entry animations | All cards | 2 days | Phase 1 complete |
| Tap feedback | Interactive elements | 1 day | - |
| Swipe actions | Mobile cards | 3 days | Gesture library |
| Pull to refresh | Lists | 1 day | - |
| Completion animations | Actions | 2 days | - |
| Child filter pills | Dashboard, Timeline | 2 days | - |
| Contextual details | Event cards | 2 days | AI extraction |

**Phase 2 Deliverables:**
- [x] Smooth entry animations
- [x] Swipe to complete/snooze
- [x] Pull to refresh
- [x] Celebration animations
- [x] Child filter component
- [x] Inline event details

### Phase 3: Advanced Features (Weeks 6-8)

**Priority: P2 - Nice to Have**

| Task | Component | Effort | Dependencies |
|------|-----------|--------|--------------|
| Shared element transitions | Navigation | 3 days | Animation library |
| Push notification design | System | 2 days | Backend support |
| Home screen widgets | iOS/Android | 5 days | Native modules |
| AI proactive suggestions | AI Assistant | 3 days | AI integration |
| Dark mode | Global | 3 days | Colour system |
| Accessibility audit | All | 3 days | Phase 1-2 complete |

**Phase 3 Deliverables:**
- [ ] Page transitions
- [ ] Rich push notifications
- [ ] Home screen widgets
- [ ] AI suggestions
- [ ] Dark mode
- [ ] WCAG AA compliance

### Implementation Checklist

#### Design System Setup
- [x] Create colour tokens file
- [x] Define typography scale
- [x] Create spacing scale
- [x] Document component variants
- [x] Set up icon library

#### Component Library
- [x] EventCard component
- [x] ActionCard component
- [x] ChildFilterPills component
- [x] UrgencyBadge component
- [x] EmptyState component
- [x] ActionsBanner component

#### Animations
- [x] Configure animation library (Reanimated/Framer Motion)
- [ ] Create reusable animation hooks
- [ ] Implement reduced motion support
- [ ] Test performance on low-end devices

#### Testing
- [ ] Visual regression tests
- [ ] Accessibility audit (axe, Lighthouse)
- [ ] Screen reader testing (VoiceOver, TalkBack)
- [ ] Animation performance profiling

---

## 10. Technical Implementation Notes

### 10.1 Colour System Code

```typescript
// src/theme/colours.ts

export const childColours = {
  olivia: {
    primary: '#6366F1',
    light: '#EEF2FF',
    dark: '#4338CA',
  },
  annabelle: {
    primary: '#EC4899',
    light: '#FDF2F8',
    dark: '#BE185D',
  },
  shared: {
    primary: '#8B5CF6',
    light: '#F5F3FF',
    dark: '#6D28D9',
  },
} as const;

export const urgencyColours = {
  critical: {
    background: '#FEE2E2',
    text: '#DC2626',
    badge: '#EF4444',
    badgeText: '#FFFFFF',
  },
  attention: {
    background: '#FEF3C7',
    text: '#D97706',
    badge: '#F59E0B',
    badgeText: '#FFFFFF',
  },
  upcoming: {
    background: '#DBEAFE',
    text: '#2563EB',
    badge: '#3B82F6',
    badgeText: '#FFFFFF',
  },
  default: {
    background: '#F9FAFB',
    text: '#6B7280',
    badge: '#9CA3AF',
    badgeText: '#FFFFFF',
  },
} as const;

export const categoryColours = {
  actionRequired: { bg: '#FEF3C7', icon: '#D97706' },
  eventChild: { bg: '#DBEAFE', icon: '#2563EB' },
  eventParent: { bg: '#FCE7F3', icon: '#DB2777' },
  payment: { bg: '#FEE2E2', icon: '#DC2626' },
  information: { bg: '#F3F4F6', icon: '#6B7280' },
} as const;

export type ChildKey = keyof typeof childColours;
export type UrgencyKey = keyof typeof urgencyColours;
export type CategoryKey = keyof typeof categoryColours;
```

### 10.2 Animation Configuration

```typescript
// src/theme/animations.ts

export const animationDurations = {
  instant: 0,
  fast: 100,
  normal: 200,
  slow: 300,
  celebration: 400,
} as const;

export const animationEasing = {
  easeOut: [0.0, 0.0, 0.2, 1],
  easeIn: [0.4, 0.0, 1, 1],
  easeInOut: [0.4, 0.0, 0.2, 1],
  spring: { damping: 15, stiffness: 150 },
} as const;

export const staggerDelays = {
  cards: 50,
  listItems: 30,
} as const;

// React Native Reanimated example
export const cardEntryAnimation = {
  entering: FadeInUp.duration(150).easing(Easing.out(Easing.ease)),
  exiting: FadeOutDown.duration(150).easing(Easing.in(Easing.ease)),
};

// Framer Motion example (web)
export const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.15, ease: [0.0, 0.0, 0.2, 1] }
  },
};
```

### 10.3 Recommended Libraries

| Platform | Library | Purpose |
|----------|---------|---------|
| React Native | react-native-reanimated | Complex animations |
| React Native | moti | Declarative animations |
| React Native | react-native-gesture-handler | Swipe gestures |
| Web (React) | framer-motion | All animations |
| Both | lottie-react / lottie-react-native | Celebration animations |

### 10.4 Accessibility Implementation

```typescript
// src/components/EventCard/EventCard.tsx

interface EventCardProps {
  event: Event;
  child: Child;
  onPress: () => void;
  onComplete?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  child,
  onPress,
  onComplete,
}) => {
  const accessibilityLabel = useMemo(() => {
    const urgency = event.urgency ? `, ${event.urgency}` : '';
    return `${event.category}: ${event.title} for ${child.name} at ${child.school}, ${event.dateTime}${urgency}`;
  }, [event, child]);

  return (
    <Pressable
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityHint="Double tap to view details"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderLeftColor: childColours[child.colourKey].primary },
        pressed && styles.cardPressed,
      ]}
    >
      {/* Card content */}
    </Pressable>
  );
};
```

### 10.5 Reduced Motion Hook

```typescript
// src/hooks/useReducedMotion.ts

import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

export const useReducedMotion = (): boolean => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReduceMotion(mediaQuery.matches);
      
      const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
      const subscription = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        setReduceMotion
      );
      return () => subscription.remove();
    }
  }, []);

  return reduceMotion;
};
```

---

## Appendix A: Design Token Reference

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| spacing-xs | 4px | Icon padding |
| spacing-sm | 8px | Tight spacing |
| spacing-md | 16px | Default padding |
| spacing-lg | 24px | Section spacing |
| spacing-xl | 32px | Large gaps |
| spacing-2xl | 48px | Page margins |

### Typography Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| heading-lg | 24px | Bold | 32px | Page titles |
| heading-md | 20px | Semibold | 28px | Section headers |
| heading-sm | 16px | Semibold | 24px | Card titles |
| body-lg | 16px | Regular | 24px | Primary content |
| body-md | 14px | Regular | 20px | Secondary content |
| body-sm | 12px | Regular | 16px | Captions, metadata |
| label | 12px | Medium | 16px | Badges, labels |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| radius-sm | 4px | Small elements |
| radius-md | 8px | Buttons, inputs |
| radius-lg | 12px | Cards |
| radius-xl | 16px | Modals |
| radius-full | 9999px | Pills, avatars |

---

## Appendix B: Component Checklist

### EventCard
- [ ] Child colour left border
- [ ] Category icon
- [ ] Title and subtitle
- [ ] Time/date display
- [ ] Urgency badge (when applicable)
- [ ] Contextual note (optional)
- [ ] Pressed state animation
- [ ] Swipe actions (mobile)
- [ ] Accessibility labels

### ActionCard
- [ ] Child colour left border
- [ ] Category icon
- [ ] Title and subtitle
- [ ] Urgency badge with countdown
- [ ] Description (2 lines)
- [ ] View Email button
- [ ] Mark Done button
- [ ] Completion animation
- [ ] Swipe to complete

### Dashboard
- [ ] Greeting with time-aware message
- [ ] Actions banner (when actions exist)
- [ ] Today section
- [ ] Tomorrow section
- [ ] This Week compact view
- [ ] AI Assistant card
- [ ] Pull to refresh
- [ ] "Last synced" indicator

### Empty States
- [ ] No events today
- [ ] No actions
- [ ] No emails processed
- [ ] First time user
- [ ] Empty search results

---

*Document ends*