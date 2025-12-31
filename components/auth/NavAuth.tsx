"use client";

import { NextIntlClientProvider } from 'next-intl';
import { useState, useEffect } from 'react';
import enMessages from '@/messages/en.json';
import viMessages from '@/messages/vi.json';
import { AuthButton } from './AuthButton';

export function NavAuth() {
  const [locale, setLocale] = useState('vi'); // Default to VI
  const [messages, setMessages] = useState(viMessages);

  useEffect(() => {
    setMessages(locale === 'en' ? enMessages : viMessages);
  }, [locale]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Ho_Chi_Minh">
      <AuthButton />
    </NextIntlClientProvider>
  );
}
