import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { AppProvider } from "@/components/AppProvider";

export default function Page() {
  return (
    <AppProvider>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <ForgotPasswordForm />
        </div>
      </div>
    </AppProvider>
  );
}
