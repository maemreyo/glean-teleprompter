import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/stores/useAuthStore';

export const useSupabaseAuth = () => {
    const supabase = createClient();
    const { setUser, setIsPro, setLoading } = useAuthStore();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setUser(user);
                    // Check Tier
                    const { data } = await supabase.from('profiles').select('tier').eq('id', user.id).single();
                    setIsPro(data?.tier === 'pro' || data?.tier === 'enterprise');
                } else {
                    setUser(null);
                    setIsPro(false);
                }
            } catch (error) {
                console.error("Auth Check Error:", error);
            } finally {
                setLoading(false);
            }
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                 const { data } = await supabase.from('profiles').select('tier').eq('id', session.user.id).single();
                 setIsPro(data?.tier === 'pro' || data?.tier === 'enterprise');
            } else {
                setIsPro(false);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase, setUser, setIsPro, setLoading]);

    const loginWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({ 
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });
    };

    const logout = async () => {
        await supabase.auth.signOut();
        // State updates via onAuthStateChange
    };

    return { loginWithGoogle, logout };
};
