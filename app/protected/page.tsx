"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AppProvider } from "@/components/AppProvider";

function ProtectedContent() {
  const t = useTranslations("ProtectedPage");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getClaims();

      if (error || !data?.claims) {
        router.push("/auth/login");
        return;
      }

      // Redirect to dashboard since /protected is deprecated
      router.push("/dashboard");
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return <div className="flex-1 w-full flex items-center justify-center">{t("loading")}</div>;
  }

  return null;
}

export default function ProtectedPage() {
  return (
    <AppProvider>
      <ProtectedContent />
    </AppProvider>
  );
}
