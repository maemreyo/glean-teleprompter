'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveScriptAction(scriptData: Record<string, unknown>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return { error: "User not authenticated" };
    }

    // Server-side validation can go here

    const { error } = await supabase.from('scripts').insert({
        ...scriptData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/');
    return { success: true };
}

/**
 * Load a script by ID with config data
 * Returns both the script data and config/legacy settings
 */
export async function loadScriptAction(scriptId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return { error: "User not authenticated" };
    }

    const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('id', scriptId)
        .eq('user_id', user.id)
        .single();

    if (error) {
        return { error: error.message };
    }

    if (!data) {
        return { error: "Script not found" };
    }

    return {
        success: true,
        script: {
            id: data.id,
            content: data.content,
            bg_url: data.bg_url,
            music_url: data.music_url,
            title: data.title,
            description: data.description,
            // Config data (new format)
            config: data.config,
            // Legacy settings (for backward compatibility)
            settings: data.settings,
        }
    };
}

// Logic to check Pro status on server if needed
export async function checkProStatus() {
     const supabase = await createClient();
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) return false;

     const { data } = await supabase.from('profiles').select('tier').eq('id', user.id).single();
     return data?.tier === 'pro' || data?.tier === 'enterprise';
}
