'use client';

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    // 브라우저 전체 스크롤을 완전히 차단하고 화면을 꽉 채움
    <div className="h-screen w-full bg-[#0a0a0a] text-white overflow-hidden flex flex-col">
      {/* 필요하다면 여기에 프로젝트 전용 헤더를 넣을 수 있습니다 */}
      <main className="flex-1 min-h-0 w-full">
        {children}
      </main>
    </div>
  );
}