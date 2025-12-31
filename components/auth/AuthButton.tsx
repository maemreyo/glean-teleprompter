"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { LogoutButton } from "./LogoutButton";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/useAuthStore";

export function AuthButton() {
  const t = useTranslations("Auth");
  const user = useAuthStore((state) => state.user);

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">{t("login")}</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">{t("signUp")}</Link>
      </Button>
    </div>
  );
}
