import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      <header 
        className="sticky top-0 z-50 w-full flex items-center justify-start border-b border-white/10
                   px-67.5 py-4 backdrop-blur-md bg-black/10"
      >
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
      
      <main>
        <section className="relative w-full min-h-screen overflow-hidden flex items-center -mt-[64px]">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src="/videos/landing-video.mp4" type="video/mp4" />
          </video>
          
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          
          <div 
            className="relative z-20 grid grid-cols-2 gap-16 items-center w-full max-w-[1920px] mx-auto pt-[64px]"
            style={{ paddingLeft: '270px', paddingRight: '270px' }}
          >
            <div className="text-white space-y-6">
              <span className="inline-block text-[#a0a0ff] text-sm font-medium tracking-wide">
                BEGINNER-FRIENDLY AI STUDIO
              </span>
              
              <h1 className="text-5xl font-extrabold leading-[1.3]">
                영상 기획 몰라도, <br />
                <span className="text-primary-100">클릭 몇 번이면 완성</span>
              </h1>
              
              <p className="text-lg text-white/80 max-w-xl leading-relaxed">
                스토리-씬-샷을 플롯으로 쪼개서, AI가 알아듣게 도와주는 입문자용 AI 영상 스튜디오. 
                이제 누구나 프로처럼 기획할 수 있습니다.
              </p>
              
              <Link href="/login">
                <button className="flex items-center gap-3 px-8 py-4 bg-primary-100 mt-6
                                  text-white text-lg font-bold rounded-xl shadow-lg shadow-primary-100/30
                                  hover:bg-primary-100/90 transition-all active:scale-95">
                  <span>영상 만들기 (10분)</span>
                  <span className="text-2xl">→</span>
                </button>
              </Link>
            </div>

            <div className="relative aspect-video rounded-3xl overflow-hidden border border-primary-100/40 shadow-2xl group bg-black">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/videos/landing-video.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
            </div>
          </div>
        </section>

        <section className="flex justify-center">
          <img src="/images/landing-features.png" alt="Features" className="w-max" />
        </section>

        <section className="py-24.25 px-88 flex justify-center">
          <Link href="/login" className="cursor-pointer hover:opacity-90 transition-opacity">
            <img 
              src="/images/landing-start.png" 
              alt="Start" 
              className="w-max object-contain" 
            />
          </Link>
        </section>
      </main>
    </div>
  );
}