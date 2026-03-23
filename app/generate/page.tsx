"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Play,
    Volume2,
    Maximize2,
    ArrowDown,
    Video,
    Layers
} from 'lucide-react';

export default function GeneratePage() {
    const [progress, setProgress] = useState(65);

    return (
        <div className="flex h-screen bg-[#121218] text-gray-300 font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-800 flex flex-col p-6 space-y-10">
                <div className="flex items-center justify-center w-full py-2">
                    <Link href="/main/projects">
                        <Image src="/images/logo.png" width={125} height={30} alt="로고" className="h-auto" />
                    </Link>
                </div>

                <nav className="flex-1 space-y-4 overflow-y-auto">
                    {/* Active Scene */}
                    <div className="space-y-2">
                        <div className="relative rounded-xl overflow-hidden border-2 border-[#6366F1] aspect-video">
                            <img src="/api/placeholder/200/120" alt="Scene 1" className="object-cover w-full h-full opacity-60" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <img src="https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=100" alt="Goldfish" className="w-12 h-12 object-contain" />
                            </div>
                        </div>
                        <p className="text-xs text-[#6366F1] font-semibold">Scene 1: The Awakening</p>
                    </div>

                    {/* Empty Scenes */}
                    {[2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2 group cursor-pointer">
                            <div className="rounded-xl border border-dashed border-gray-700 aspect-video flex items-center justify-center bg-gray-900/50 group-hover:bg-gray-800 transition-colors">
                                <p className="text-[10px] text-gray-500 text-center px-4">생성된 영상이 이곳에 나타나요</p>
                            </div>
                            <p className="text-xs text-gray-500">Scene {i}: Into The Mist</p>
                        </div>
                    ))}
                </nav>

                <button className="w-full py-3 bg-[#7C7FFF] text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20">
                    병합하기
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col bg-[#0B0B0C] overflow-hidden">
                <header className="p-6 pb-2 shrink-0">
                    <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Scene 1: The Awakening</h2>
                </header>

                <div className="flex-1 flex flex-col p-6 pt-2 gap-4 overflow-hidden">
                    <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
                        {/* Video Preview Canvas */}
                        <div className="col-span-8 h-full">
                            <div className="relative bg-[#1A1A24] rounded-2xl aspect-video border border-white/5 flex flex-col items-center justify-center overflow-hidden h-full shadow-2xl">
                                {/* Fake Background Video Content */}
                                <img
                                    src="https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800"
                                    className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm"
                                    alt="bg"
                                />

                                {/* Progress Overlay */}
                                <div className="relative z-10 flex flex-col items-center text-center p-4">
                                    <div className="bg-white/10 p-3 rounded-full mb-3">
                                        <span className="text-white text-xl">✨</span>
                                    </div>
                                    <h3 className="text-white font-black mb-1 text-base italic tracking-tight">영상 생성하는 중..</h3>
                                    <p className="text-[11px] text-white/30 mb-5 font-bold uppercase tracking-widest text-center leading-tight">AI가 당신의 영상을 멋지게 만들어주고 있어요</p>

                                    <div className="w-56 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-white shadow-[0_0_10px_#fff] transition-all duration-500 ease-out"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <p className="mt-2 text-[10px] text-white/20 font-mono tracking-widest">{progress}% COMPLETE</p>
                                </div>

                                {/* Video Controls / Progress Bar */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-4">
                                    <Play className="w-3.5 h-3.5 text-white fill-white" />
                                    <div className="flex-1 h-0.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className="w-1/3 h-full bg-primary-100 shadow-[0_0_8px_rgba(255,255,255,0.4)]"></div>
                                    </div>
                                    <span className="text-[9px] text-white/40 font-mono">00:04 / 00:12</span>
                                    <Volume2 className="w-3.5 h-3.5 text-white/40" />
                                    <Maximize2 className="w-3.5 h-3.5 text-white/40" />
                                </div>
                            </div>
                        </div>

                        {/* Keyframes Panel */}
                        <div className="col-span-4 bg-[#14141d] rounded-2xl p-4 border border-white/5 flex flex-col justify-between h-full shadow-xl">
                            <div className="space-y-2">
                                <label className="text-[9px] uppercase font-black text-white/30 tracking-[0.2em]">Start Frame</label>
                                <div className="rounded-xl overflow-hidden border border-white/5 aspect-video shadow-inner">
                                    <img src="https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400" alt="Start Frame" className="w-full h-full object-cover" />
                                </div>
                            </div>

                            <div className="flex flex-col items-center py-0.5 opacity-50">
                                <div className="bg-primary-100/10 p-1.5 rounded-full mb-1">
                                    <ArrowDown className="text-primary-100 w-3.5 h-3.5" />
                                </div>
                                <span className="text-[8px] text-primary-100 font-black uppercase tracking-widest leading-none">Motion Path</span>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] uppercase font-black text-white/30 tracking-[0.2em]">End Frame</label>
                                <div className="rounded-xl overflow-hidden border border-white/5 aspect-video shadow-inner">
                                    <img src="https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400" alt="End Frame" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Prompt Editor - Full Width */}
                    <div className="shrink-0 bg-[#16161a] rounded-2xl p-5 border border-white/5 space-y-3 shadow-2xl">
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-white/80 uppercase tracking-widest flex items-center gap-2 italic">
                                   <Layers className="w-3.5 h-3.5 text-primary-100" /> PROMPT EDITOR
                                </p>
                                <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">AI generated prompt is editable in English</p>
                            </div>
                            <button className="flex items-center gap-2 bg-primary-100 hover:bg-primary-200 text-white px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary-300/10 active:scale-95">
                                <Video className="w-3.5 h-3.5" />
                                GENERATE VIDEO
                            </button>
                        </div>
                        <div className="bg-[#0B0B0C] rounded-xl p-5 border border-white/5">
                            <p className="text-[12px] leading-relaxed text-white/40 font-medium italic">
                                A Slow Cinematic Dolly-In Through The Dark Corridors, Light Begins To Flicker And Beam Through The Cracks Of The Stone Walls. Dust Particles Dance In The Volumetric Lighting As The Camera Focuses On The Ancient Artifact At The End Of The Hall.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}