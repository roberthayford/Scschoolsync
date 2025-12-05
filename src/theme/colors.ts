export const childColours = {
    olivia: {
        primary: '#6366F1', // Indigo
        light: '#EEF2FF',
        dark: '#4338CA',
    },
    annabelle: {
        primary: '#EC4899', // Pink
        light: '#FDF2F8',
        dark: '#BE185D',
    },
    shared: {
        primary: '#8B5CF6', // Purple
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
