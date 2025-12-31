import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  // TODO: Replace with your actual protected page content
  return (
    <div className="flex-1 w-full flex flex-col gap-12 items-center justify-center">
      <h1 className="text-4xl font-bold">Welcome, {data.claims.email}</h1>
      <p className="text-muted-foreground">
        This is a protected page. Add your content here.
      </p>
    </div>
  );
}
