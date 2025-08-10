'use client';

import { SessionProvider } from 'next-auth/react';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientRootLayoutContent from "../components/ClientRootLayoutContent";
import { LanguageProvider } from '../context/LanguageContext';
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
<SessionProvider>
  <LanguageProvider>
    <ClientRootLayoutContent>
      {children}
    </ClientRootLayoutContent>
  </LanguageProvider>
</SessionProvider>
      </body>
    </html>
  );
}