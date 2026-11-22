'use client';
import { usePathname } from 'next/navigation';
import Header from './Header';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import ChatAI from './ChatAI';
import SesiSync from './SesiSync';
import SinkronData from './SinkronData';

// Halaman akun (login, daftar, dst.) tampil tanpa sidebar, header, dan chatbot.
export const RUTE_AKUN = ['/login', '/register', '/lupa-sandi', '/reset-sandi'];

export default function Shell({ children }) {
  const path = usePathname();
  if (RUTE_AKUN.includes(path)) return <>{children}</>;
  return (
    <div className="flex min-h-screen w-full bg-surface">
      <SesiSync />
      <SinkronData />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="w-full flex-1 min-w-0 px-4 py-6 sm:px-6 md:px-8 xl:px-10 pb-28 lg:pb-12">{children}</main>
      </div>
      <ChatAI />
      <BottomNav />
    </div>
  );
}
