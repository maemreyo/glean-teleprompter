import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';

export const useFileUpload = () => {
    const supabase = createClient();
    const { user, isPro } = useAuthStore();
    const [uploading, setUploading] = useState(false);

    const uploadFile = async (file: File, type: 'image' | 'audio') => {
        if (!user) {
            toast.error("Vui lòng đăng nhập!");
            return null;
        }

        if (type === 'audio' && !isPro) {
            toast.warning("Tính năng PRO!");
            return null;
        }

        setUploading(true);
        const toastId = toast.loading("Đang upload...");

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const bucket = type === 'image' ? 'backgrounds' : 'music';

            const { error } = await supabase.storage.from(bucket).upload(fileName, file);
            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
            
            toast.success("Upload thành công!", { id: toastId });
            return publicUrl;
        } catch (error: unknown) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.error("Upload bộ thất: " + errorMessage, { id: toastId });
            return null;
        } finally {
            setUploading(false);
        }
    };

    return { uploadFile, uploading };
};
