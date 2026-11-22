import './globals.css';
import AppProvider from '@/components/AppProvider';
import Shell from '@/components/Shell';

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
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
