import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppShell } from '@/components/app-shell';
import { ClientInit } from '@/components/client-init';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nexa Periyodik Kontrol — ÇSGB CRM',
  description:
    'Kaldırma-İletme Makinaları ve Basınçlı Kapar için ÇSGB mevzuatına uygun periyodik kontrol CRM ve raporlama otomasyonu.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <AppShell>
          <ClientInit>{children}</ClientInit>
        </AppShell>
      </body>
    </html>
  );
}
