import { supabase } from '../lib/supabaseClient';
import { Child, Email, SchoolEvent, ActionItem } from '../../types';

export const supabaseService = {
    // Children
    async getChildren() {
        const { data, error } = await supabase
            .from('children')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as Child[];
    },

    async createChild(child: Omit<Child, 'id' | 'user_id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('children')
            .insert(child)
            .select()
            .single();

        if (error) throw error;
        return data as Child;
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
