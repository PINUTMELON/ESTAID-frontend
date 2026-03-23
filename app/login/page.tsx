"use client";

import { useState } from "react";
import Link from 'next/link';
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { authApi } from "../_utils/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. 직접 API 호출하여 토큰 획득 및 localStorage 저장 (api.ts 유틸용)
      const res = await authApi.login({ username, password });
      
      if (res.success && res.data.accessToken) {
        localStorage.setItem("accessToken", res.data.accessToken);

        // 2. Next-Auth 세션 생성
        const result = await signIn("credentials", {
          username,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("인증 세션 생성에 실패했습니다.");
        } else {
          router.push("/main/projects");
        }
      } else {
        setError(res.message || "로그인에 실패했습니다.");
      }
    } catch (err: any) {
      setError(err.message || "로그인 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="absolute top-0 left-0 z-50 w-full flex items-center justify-start px-8 py-4 border-b border-white/10">
        <div className="absolute inset-0 z-0 bg-dark-200/10 backdrop-blur-md" />
        <div className="relative z-10 flex items-center">
          <Link href="/">
            <img 
              src="/images/logo.png" 
              alt="Ploty Logo" 
              className="h-7 w-auto object-contain cursor-pointer" 
            />
          </Link>
        </div>
      </header>

      <main className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {/* Background Decorations */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-100/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-300/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-20 w-full max-w-[500px] bg-dark-200/50 backdrop-blur-2xl border border-white-300 rounded-[32px] p-12 flex flex-col items-center shadow-2xl">
          <div className="mb-8 flex flex-col items-center">
            <img src="/images/logo.png" alt="Ploty Logo" className="h-8 mb-6" />
            <h2 className="text-white text-28 font-bold text-center leading-tight">
              쉽고 간편하게 <br />
              AI 영상 제작해보세요
            </h2>
            <p className="text-white/40 text-13 mt-2 text-center font-light">
              로그인하고 바로 시작해보세요
            </p>
          </div>

          <form onSubmit={handleLogin} className="w-full space-y-8">
            <div className="space-y-2">
              <label className="text-white/60 text-14 font-medium ml-1">아이디</label>
              <div className="relative border-b border-white/30 focus-within:border-primary-100 transition-colors">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input 
                  type="text"
                  required
                  placeholder="아이디를 입력하세요"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-none text-white py-3 pl-8 placeholder:text-white/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/60 text-14 font-medium ml-1">비밀번호</label>
              <div className="relative border-b border-white/30 focus-within:border-primary-100 transition-colors">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input 
                  type="password"
                  required
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-none text-white py-3 pl-8 focus:outline-none placeholder:text-white/20"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-12 text-center -mt-4 animate-pulse">
                {error}
              </p>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary-300 text-white text-18 font-bold rounded-2xl hover:bg-primary-100 transition-all active:scale-[0.98] mt-4 shadow-lg shadow-primary-300/20 disabled:opacity-50"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-3 text-sm">
            <Link href="/forgot-password" className="text-white/40 hover:text-white/60 transition-colors">
              비밀번호를 잊으셨나요?
            </Link>
            <div className="text-white/40">
              계정이 없으신가요? 
              <Link href="/signup" className="ml-2 text-white font-medium hover:underline">
                회원가입
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}