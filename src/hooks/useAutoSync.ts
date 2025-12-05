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

    const lastRunRef = useRef<number>(Date.now());

    // Persist settings whenever they change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    // Scheduler Logic
    useEffect(() => {
        if (!settings.enabled) return;

        const checkSchedule = () => {
            const now = new Date();
            const nowMs = now.getTime();
            const lastRun = lastRunRef.current;

            if (settings.intervalType === 'interval') {
                const intervalMs = settings.intervalHours * 60 * 60 * 1000;
                if (nowMs - lastRun >= intervalMs) {
                    console.log(`[AutoSync] Interval of ${settings.intervalHours}h reached. Syncing...`);
                    onSync();
                    lastRunRef.current = nowMs;
                }
            } else if (settings.intervalType === 'daily') {
                const [targetHour, targetMinute] = settings.dailyTime.split(':').map(Number);
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();

                // Check if we are within the target minute (to avoid multiple triggers)
                // And ensure we haven't already run today (simple check: last run was > 1 hour ago? 
                // Actually, better: check if last run day is different from today)

                const lastRunDate = new Date(lastRun);
                const isSameDay = lastRunDate.getDate() === now.getDate() &&
                    lastRunDate.getMonth() === now.getMonth() &&
                    lastRunDate.getFullYear() === now.getFullYear();

                if (!isSameDay && currentHour === targetHour && currentMinute === targetMinute) {
                    console.log(`[AutoSync] Daily time ${settings.dailyTime} reached. Syncing...`);
                    onSync();
                    lastRunRef.current = nowMs;
                }
            }
        };

        // Check every minute
        const timer = setInterval(checkSchedule, 60 * 1000);
        return () => clearInterval(timer);
    }, [settings, onSync]);

    const updateSettings = (newSettings: Partial<AutoFetchSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return {
        settings,
        updateSettings
    };
};
