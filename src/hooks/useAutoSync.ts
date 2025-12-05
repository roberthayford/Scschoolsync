import { useState, useEffect, useRef } from 'react';

export interface AutoFetchSettings {
    enabled: boolean;
    intervalType: 'interval' | 'daily';
    intervalHours: number; // 1, 3, 5
    dailyTime: string; // "08:00" (24h format)
}

const DEFAULT_SETTINGS: AutoFetchSettings = {
    enabled: false,
    intervalType: 'interval',
    intervalHours: 1,
    dailyTime: '09:00',
};

const STORAGE_KEY = 'schoolsync_autofetch_settings';
const LAST_RUN_KEY = 'schoolsync_autofetch_lastrun';
const DAILY_TRIGGER_KEY = 'schoolsync_autofetch_daily_triggered';

// Helper to get today's date string for daily trigger tracking
const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
};

export const useAutoSync = (onSync: () => void) => {
    const [settings, setSettings] = useState<AutoFetchSettings>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
        } catch (e) {
            console.error("Failed to load auto-fetch settings", e);
            return DEFAULT_SETTINGS;
        }
    });

    // Initialize lastRun from localStorage so it persists across page reloads
    // Default to 0 so the first check can pass if enough time has elapsed
    const lastRunRef = useRef<number>(() => {
        try {
            const stored = localStorage.getItem(LAST_RUN_KEY);
            return stored ? parseInt(stored, 10) : 0;
        } catch {
            return 0;
        }
    });

    // Track when settings are first enabled to allow immediate check positioning
    const wasEnabledRef = useRef<boolean>(settings.enabled);

    // Persist settings whenever they change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

        // If settings just got enabled, reset last run for interval mode to allow quicker first sync
        // (But not for daily mode, which should respect the scheduled time)
        if (settings.enabled && !wasEnabledRef.current && settings.intervalType === 'interval') {
            console.log('[AutoSync] Scheduler just enabled (interval mode). Will sync on next interval check.');
        }
        wasEnabledRef.current = settings.enabled;
    }, [settings]);

    // Scheduler Logic
    useEffect(() => {
        if (!settings.enabled) {
            console.log('[AutoSync] Scheduler is disabled.');
            return;
        }

        console.log(`[AutoSync] Scheduler active. Mode: ${settings.intervalType}, ` +
            (settings.intervalType === 'interval'
                ? `every ${settings.intervalHours}h`
                : `daily at ${settings.dailyTime}`));

        const checkSchedule = () => {
            const now = new Date();
            const nowMs = now.getTime();
            const lastRun = typeof lastRunRef.current === 'function'
                ? (lastRunRef.current as () => number)()
                : lastRunRef.current;

            if (settings.intervalType === 'interval') {
                const intervalMs = settings.intervalHours * 60 * 60 * 1000;
                const elapsed = nowMs - lastRun;
                const remaining = intervalMs - elapsed;

                if (elapsed >= intervalMs) {
                    console.log(`[AutoSync] Interval of ${settings.intervalHours}h reached (elapsed: ${Math.round(elapsed / 60000)}min). Syncing...`);
                    onSync();
                    lastRunRef.current = nowMs;
                    localStorage.setItem(LAST_RUN_KEY, String(nowMs));
                } else {
                    // Debug log every 5 minutes
                    if (Math.round(elapsed / 60000) % 5 === 0) {
                        console.log(`[AutoSync] Interval mode: ${Math.round(remaining / 60000)}min until next sync`);
                    }
                }
            } else if (settings.intervalType === 'daily') {
                const [targetHour, targetMinute] = settings.dailyTime.split(':').map(Number);
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();

                // Check if we've already triggered today (persisted in localStorage)
                const todayStr = getTodayString();
                const lastDailyTrigger = localStorage.getItem(DAILY_TRIGGER_KEY);
                const alreadyTriggeredToday = lastDailyTrigger === todayStr;

                // Allow triggering if:
                // 1. We haven't triggered today yet
                // 2. Current time is within +/- 1 minute of target time (more forgiving window)
                const isWithinTimeWindow = currentHour === targetHour &&
                    (currentMinute === targetMinute || currentMinute === targetMinute + 1);

                if (!alreadyTriggeredToday && isWithinTimeWindow) {
                    console.log(`[AutoSync] Daily time ${settings.dailyTime} reached (current: ${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}). Syncing...`);
                    onSync();
                    lastRunRef.current = nowMs;
                    localStorage.setItem(LAST_RUN_KEY, String(nowMs));
                    localStorage.setItem(DAILY_TRIGGER_KEY, todayStr);
                } else if (alreadyTriggeredToday) {
                    // Silent - already ran today
                } else {
                    // Calculate time until next trigger for debugging
                    let targetTime = new Date(now);
                    targetTime.setHours(targetHour, targetMinute, 0, 0);
                    if (targetTime <= now) {
                        targetTime.setDate(targetTime.getDate() + 1);
                    }
                    const minsUntil = Math.round((targetTime.getTime() - nowMs) / 60000);
                    // Log occasionally
                    if (currentMinute % 30 === 0) {
                        console.log(`[AutoSync] Daily mode: ~${minsUntil}min until ${settings.dailyTime}`);
                    }
                }
            }
        };

        // Check more frequently (every 30 seconds) for better time accuracy
        // This ensures we don't miss the 1-minute window for daily mode
        const timer = setInterval(checkSchedule, 30 * 1000);

        // Also run an initial check immediately
        checkSchedule();

        return () => clearInterval(timer);
    }, [settings, onSync]);

    const updateSettings = (newSettings: Partial<AutoFetchSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));

        // If switching modes, clear the daily trigger tracking
        if (newSettings.intervalType && newSettings.intervalType !== settings.intervalType) {
            localStorage.removeItem(DAILY_TRIGGER_KEY);
            console.log('[AutoSync] Mode changed. Reset daily trigger tracking.');
        }
    };

    return {
        settings,
        updateSettings
    };
};
