import './globals.css';
import AppProvider from '@/components/AppProvider';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import ChatAI from '@/components/ChatAI';

export const metadata = {
  title: 'NutriKos - Menu Hemat & Bergizi untuk Anak Kos',
  description: 'Platform rekomendasi menu bergizi dan hemat berbasis AI untuk mahasiswa perantau.',
  icons: { icon: '/logo.png' },
};
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#3B54B8' };

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppProvider>
          <div className="flex min-h-screen w-full bg-surface">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <Header />
              <main className="w-full flex-1 min-w-0 px-4 py-6 sm:px-6 md:px-8 xl:px-10 pb-28 lg:pb-12">
                {children}
              </main>
            </div>
            <ChatAI />
            <BottomNav />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
