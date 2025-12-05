import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    // Password management
    updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
    resetPasswordForEmail: (email: string) => Promise<{ error: AuthError | null }>;
    deleteAccount: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const updatePassword = async (newPassword: string): Promise<{ error: AuthError | null }> => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });
        return { error };
    };

    const resetPasswordForEmail = async (email: string): Promise<{ error: AuthError | null }> => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${import.meta.env.VITE_APP_URL || window.location.origin}/#/reset-password`,
        });
        return { error };
    };

    const deleteAccount = async (): Promise<{ error: Error | null }> => {
        try {
            // Note: Supabase doesn't have a direct client-side delete user method
            // This requires a server-side function or edge function
            // For now, we'll sign out and show a message that admin needs to delete
            // In production, you'd call an edge function here

            // First, delete all user data
            const userId = user?.id;
            if (!userId) {
                return { error: new Error('No user logged in') };
            }

            // Delete all user data in order (respecting foreign keys)
            const tables = ['actions', 'events', 'emails', 'children'];
            for (const table of tables) {
                const { error } = await supabase.from(table).delete().eq('user_id', userId);
                if (error) {
                    console.error(`Error deleting from ${table}:`, error);
                }
            }

            // Sign out the user
            await supabase.auth.signOut();

            return { error: null };
        } catch (err) {
            return { error: err as Error };
        }
    };

    return (
        <AuthContext.Provider value={{
            session,
            user,
            loading,
            signOut,
            updatePassword,
            resetPasswordForEmail,
            deleteAccount
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
