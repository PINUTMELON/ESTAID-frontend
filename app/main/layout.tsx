'use client';

import { signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authApi } from '../_utils/api';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const getNavLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
      isActive 
        ? 'bg-[#5962bd]/30 text-[#939CF5]' 
        : 'text-white/60 hover:text-white'
    }`;
  };

  const handleLogout = async () => {
    try {
      // 1. 서버 로그아웃 호출 (선택 사항이지만 명세에 있으므로 추가)
      await authApi.logout().catch(() => {});
    } finally {
      // 2. 토큰 삭제
      localStorage.removeItem("accessToken");
      // 3. Next Auth 세션 만료 및 리다이렉트
      signOut({ callbackUrl: "/" });
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <header className={`${pathname === '/main/gallery' ? 'fixed' : 'sticky'} top-0 z-50 w-full backdrop-blur-md border-b px-8 py-3 flex items-center justify-between transition-all duration-500 ${
        pathname === '/main/gallery' 
          ? 'bg-black/10 border-white/10' 
          : 'bg-[#1a1a1e]/80 border-white/5'
      }`}>
        <Link href="/main/projects">
          <Image src="/images/logo.png" width={100} height={0} alt="플로티 로고" className=" cursor-pointer" />
        </Link>
        <div className="flex items-center gap-12">
          <nav className="flex items-center gap-6">
            <Link href="/main/projects" className={getNavLinkClass('/main/projects')}>
              Projects
            </Link>
            <Link href="/main/gallery" className={getNavLinkClass('/main/gallery')}>
              Gallery
            </Link>
            <Link href="/main/ranking" className={getNavLinkClass('/main/ranking')}>
              Ranking
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-5 text-white/60">
          <button className="hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button className="hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button 
            onClick={handleLogout} 
            className="w-8 h-8 rounded-full overflow-hidden border border-white/20 cursor-pointer active:scale-95 transition-transform"
          >
            <img src="/images/main-profile.png" alt="Profile" className="w-full h-full object-cover" />
          </button>
        </div>
      </header>
      <main className={pathname === '/main/gallery' ? 'w-full' : 'max-w-[1600px] mx-auto p-12'}>{children}</main>
    </div>
  );
}