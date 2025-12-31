"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AppProvider } from "@/components/AppProvider";

function ProtectedContent() {
  const t = useTranslations("Protected");
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

      setEmail(data.claims.email || "");
      setLoading(false);
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return <div className="flex-1 w-full flex items-center justify-center">Loading...</div>;
  }

  // TODO: Replace with your actual protected page content
  return (
    <div className="flex-1 w-full flex flex-col gap-12 items-center justify-center">
      <h1 className="text-4xl font-bold">{t("welcome")}, {email}</h1>
      <p className="text-muted-foreground">
        {t("description")}
      </p>
    </div>
  );
}

export default function ProtectedPage() {
  return (
    <AppProvider>
      <ProtectedContent />
    </AppProvider>
  );
}
