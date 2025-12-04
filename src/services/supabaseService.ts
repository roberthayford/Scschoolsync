import { supabase } from '../lib/supabaseClient';
import { Child, Email, SchoolEvent, ActionItem } from '../../types';

// Database types (snake_case as stored in Supabase)
interface SupabaseChild {
    id: string;
    user_id: string;
    name: string;
    school_name: string | null;
    color: string | null;
    avatar_url: string | null;
    email_rules: string[] | null;
    created_at: string;
}

// Helper functions to map between database and frontend types
const mapChildFromDb = (dbChild: SupabaseChild): Child => ({
    id: dbChild.id,
    name: dbChild.name,
    schoolName: dbChild.school_name || '',
    color: dbChild.color || 'blue',
    avatarUrl: dbChild.avatar_url || '',
    emailRules: dbChild.email_rules || []
});

const mapChildToDb = (child: Partial<Omit<Child, 'id'>>) => ({
    name: child.name,
    school_name: child.schoolName,
    color: child.color,
    avatar_url: child.avatarUrl,
    email_rules: child.emailRules
});

export const supabaseService = {
    // Children
    async getChildren(): Promise<Child[]> {
        const { data, error } = await supabase
            .from('children')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return (data as SupabaseChild[]).map(mapChildFromDb);
    },

    async createChild(child: Omit<Child, 'id'>): Promise<Child> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const dbData = {
            ...mapChildToDb(child),
            user_id: user.id
        };
        const { data, error } = await supabase
            .from('children')
            .insert(dbData)
            .select()
            .single();

        if (error) throw error;
        return mapChildFromDb(data as SupabaseChild);
    },

    async updateChild(id: string, updates: Partial<Omit<Child, 'id'>>): Promise<Child> {
        const dbData = mapChildToDb(updates);
        // Remove undefined values 
        const cleanDbData = Object.fromEntries(
            Object.entries(dbData).filter(([_, v]) => v !== undefined)
        );

        const { data, error } = await supabase
            .from('children')
            .update(cleanDbData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapChildFromDb(data as SupabaseChild);
    },

    async deleteChild(id: string): Promise<void> {
        const { error } = await supabase
            .from('children')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Events
    async getEvents() {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: true });

        if (error) throw error;
        return data as SchoolEvent[];
    },

    // Actions
    async getActions() {
        const { data, error } = await supabase
            .from('actions')
            .select('*')
            .order('deadline', { ascending: true });

        if (error) throw error;
        return data as ActionItem[];
    },

    async toggleAction(id: string, isCompleted: boolean) {
        const { error } = await supabase
            .from('actions')
            .update({ is_completed: isCompleted })
            .eq('id', id);

        if (error) throw error;
    },

    // Emails
    async getEmails() {
        const { data, error } = await supabase
            .from('emails')
            .select('*')
            .order('received_at', { ascending: false });

        if (error) throw error;
        return data as Email[];
    },

    // Seed Data
    async seedData(children: any[], events: any[], actions: any[], emails: any[]) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const idMap: Record<string, string> = {};

        // 1. Insert Children
        for (const child of children) {
            const { id, ...rest } = child;
            const { data, error } = await supabase
                .from('children')
                .insert({ ...rest, user_id: user.id })
                .select()
                .single();

            if (error) {
                console.error('Error seeding child:', error);
                continue;
            }
            idMap[id] = data.id;
        }

        // 2. Insert Emails
        for (const email of emails) {
            const { id, childId, receivedAt, isProcessed, extractedEvents, extractedActions, ...rest } = email;

            const emailData = {
                ...rest,
                user_id: user.id,
                received_at: receivedAt,
                is_processed: isProcessed,
                child_id: childId ? idMap[childId] : null,
            };

            const { data, error } = await supabase
                .from('emails')
                .insert(emailData)
                .select()
                .single();

            if (error) {
                console.error('Error seeding email:', error);
                continue;
            }
            idMap[id] = data.id;
        }

        // 3. Insert Events
        for (const event of events) {
            const { id, childId, ...rest } = event;
            if (!idMap[childId]) continue;

            const eventData = {
                ...rest,
                user_id: user.id,
                child_id: idMap[childId],
            };

            const { error } = await supabase.from('events').insert(eventData);
            if (error) console.error('Error seeding event:', error);
        }

        // 4. Insert Actions
        for (const action of actions) {
            const { id, childId, relatedEmailId, isCompleted, ...rest } = action;
            if (!idMap[childId]) continue;

            const actionData = {
                ...rest,
                user_id: user.id,
                child_id: idMap[childId],
                related_email_id: relatedEmailId ? idMap[relatedEmailId] : null,
                is_completed: isCompleted,
            };

            const { error } = await supabase.from('actions').insert(actionData);
            if (error) console.error('Error seeding action:', error);
        }
    }
};
