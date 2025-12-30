"use client";

import { NextIntlClientProvider } from 'next-intl';
import { useState, useEffect } from 'react';
import enMessages from '@/messages/en.json';
import viMessages from '@/messages/vi.json';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState('vi'); // Default to VI
  const [messages, setMessages] = useState(viMessages);

  useEffect(() => {
    setMessages(locale === 'en' ? enMessages : viMessages);
  }, [locale]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Ho_Chi_Minh">
       {/* Inject Locale Switcher capability via Context if needed, or just let users switch via store later ?? 
           Actually, for now, let's expose a way to switch locale.
           Or better: Keep it simple.
       */}
       <div className="relative">
          {children}
          {/* Simple Locale Switcher Overlay for testing/usage */}
          <div className="fixed top-4 right-20 z-50 opacity-50 hover:opacity-100 transition-opacity">
             <button onClick={() => setLocale(l => l === 'vi' ? 'en' : 'vi')} className="text-[10px] bg-black/50 text-white px-2 py-1 rounded border border-white/10 uppercase">
                {locale}
             </button>
          </div>
       </div>
    </NextIntlClientProvider>
  );
}
