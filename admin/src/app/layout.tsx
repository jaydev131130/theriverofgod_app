import type { Metadata } from 'next';
import { Sidebar } from '@/components';
import './globals.css';

export const metadata: Metadata = {
  title: 'Language Pack Admin - The River of God',
  description: 'Manage language packs for The River of God app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-gray-100">
        <Sidebar />
        <main className="ml-64 min-h-screen p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
