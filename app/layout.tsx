import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import { getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { inter, plusJakartaSans, jetBrainsMono } from "@/lib/fonts";

import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("App.metadata");
  
  return {
    metadataBase: new URL(defaultUrl),
    title: t("title"),
    description: t("description"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${plusJakartaSans.variable} ${jetBrainsMono.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthInitializer />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
