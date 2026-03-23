"use client";

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    Play,
    Video,
    ChevronRight,
    Loader2,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { videoApi } from '@/app/_utils/api';

interface SceneInfo {
    sceneNumber: number;
    title: string;
    firstFrameUrl: string;
    lastFrameUrl: string;
    combinedPrompt: string;
    videoUrl?: string | null;
}

interface ProjectVideoInfo {
    projectId: string;
    scenes: SceneInfo[];
}

function GenerateContent() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get('projectId');
    
    const [info, setInfo] = useState<ProjectVideoInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [isGenerating, setIsGenerating] = useState<Record<number, boolean>>({});
    const [progress, setProgress] = useState<Record<number, number>>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInfo = async () => {
            if (!projectId) {
                setLoading(false);
                return;
            }
            try {
                const res = await videoApi.getVideoInfo(projectId);
                if (res.success) {
                    setInfo(res.data);
                } else {
                    setError(res.message || "Failed to load project data.");
                }
            } catch (err) {
                console.error("Failed to fetch video info:", err);
                setError("Server connection error.");
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, [projectId]);

    const handleGenerateVideo = async (sceneNumber: number) => {
        if (!projectId || !info) return;
        const currentScene = info.scenes.find(s => s.sceneNumber === sceneNumber);
        if (!currentScene) return;

        setIsGenerating(prev => ({ ...prev, [sceneNumber]: true }));
        setProgress(prev => ({ ...prev, [sceneNumber]: 0 }));
        
        const interval = setInterval(() => {
            setProgress(prev => {
                const cur = prev[sceneNumber] || 0;
                if (cur >= 95) return prev;
                return { ...prev, [sceneNumber]: cur + Math.floor(Math.random() * 3) + 1 };
            });
        }, 800);

        try {
            const response = await videoApi.generate({
                projectId,
                sceneNumber,
                prompt: currentScene.combinedPrompt
            });

            if (response.success && response.data.videoId) {
                const videoId = response.data.videoId;
                const pollInterval = setInterval(async () => {
                    try {
                        const statusRes = await videoApi.getOne(videoId);
                        if (statusRes.success) {
                            const { status, videoUrl } = statusRes.data;
                            if (status === "COMPLETED") {
                                clearInterval(pollInterval);
                                clearInterval(interval);
                                setProgress(prev => ({ ...prev, [sceneNumber]: 100 }));
                                setInfo(prev => {
                                    if (!prev) return prev;
                                    return {
                                        ...prev,
                                        scenes: prev.scenes.map(s => 
                                            s.sceneNumber === sceneNumber ? { ...s, videoUrl } : s
                                        )
                                    };
                                });
                                setIsGenerating(prev => ({ ...prev, [sceneNumber]: false }));
                            } else if (status === "FAILED") {
                                clearInterval(pollInterval);
                                clearInterval(interval);
                                alert(`[DEBUG] 영상 생성 상태 FAILED:\n${JSON.stringify(statusRes, null, 2)}`);
                                setIsGenerating(prev => ({ ...prev, [sceneNumber]: false }));
                            }
                        } else {
                            // API success: false 인 경우 (메시지가 있다면 출력)
                            clearInterval(pollInterval);
                            clearInterval(interval);
                            alert(`상태 조회 실패: ${statusRes.message || "서버 통신 오류"}`);
                            setIsGenerating(prev => ({ ...prev, [sceneNumber]: false }));
                        }
                    } catch (err: any) { 
                        console.error("Polling error:", err);
                        // 에러 로그만 남기고 폴링은 계속 시도할 수 있음 (일시적 단절 대비)
                    }
                }, 3000);
            } else {
                alert(`요청 실패: ${response.message || "서버 응답이 올바르지 않습니다."}`);
                clearInterval(interval);
                setIsGenerating(prev => ({ ...prev, [sceneNumber]: false }));
            }
        } catch (err: any) {
            console.error("Generate error:", err);
            alert(`시스템 오류: ${err.message || "서버와 통신할 수 없습니다."}`);
            clearInterval(interval);
            setIsGenerating(prev => ({ ...prev, [sceneNumber]: false }));
        }
    };

    const handlePromptChange = (val: string) => {
        if (!info) return;
        setInfo(prev => {
            if (!prev) return prev;
            const newScenes = [...prev.scenes];
            newScenes[selectedIdx] = { ...newScenes[selectedIdx], combinedPrompt: val };
            return { ...prev, scenes: newScenes };
        });
    };

    if (loading) return (
        <div className="h-screen w-full bg-[#0B0B0C] flex flex-col items-center justify-center gap-4 text-white/40">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-[10px] font-black tracking-widest uppercase">Initializing Canvas...</span>
        </div>
    );

    if (error || !info) return (
        <div className="h-screen w-full bg-[#0B0B0C] flex flex-col items-center justify-center gap-4 text-white/20">
            <AlertCircle className="w-12 h-12" />
            <p className="text-xs uppercase font-black tracking-widest">{error || "Project Not Found"}</p>
        </div>
    );

    const currentScene = info.scenes[selectedIdx];
    const isGeneratingCurrent = isGenerating[currentScene.sceneNumber];
    const currentProgress = progress[currentScene.sceneNumber] || 0;

    return (
        <div className="flex h-screen bg-[#080808] text-white font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-[260px] border-r border-white/5 flex flex-col p-6 space-y-8 bg-[#0B0B0C]">
                <div className="flex items-center justify-center w-full py-2">
                    <Link href="/main/projects">
                        <Image src="/images/logo.png" width={90} height={22} alt="Logo" className="h-auto" />
                    </Link>
                </div>

                <nav className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-1">
                    <div className="space-y-4">
                        {info.scenes.map((scene, idx) => {
                            const isActive = selectedIdx === idx;
                            return (
                                <div key={scene.sceneNumber} onClick={() => setSelectedIdx(idx)} className="group cursor-pointer">
                                    <div className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all shadow-lg ${isActive ? 'border-primary-100' : 'border-white/5 opacity-40 hover:opacity-100'}`}>
                                        <Image src={scene.firstFrameUrl} alt={scene.title} fill className="object-cover" />
                                        {isGenerating[scene.sceneNumber] && <div className="absolute inset-0 bg-black/70 flex items-center justify-center"><RefreshCw className="w-4 h-4 text-primary-100 animate-spin" /></div>}
                                    </div>
                                    <p className={`mt-2 text-[10px] font-bold uppercase tracking-tighter transition-colors ${isActive ? 'text-primary-100' : 'text-white/20'}`}>
                                        SCENE {scene.sceneNumber}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col p-10 gap-8 overflow-hidden">
                <header className="flex flex-col gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-[1px] bg-primary-100" />
                        <span className="text-[9px] font-black text-primary-100 uppercase tracking-[0.4em]">Video Engine</span>
                    </div>
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase whitespace-nowrap">
                        {currentScene.title} <span className="text-white/10 ml-2 not-italic">({currentScene.sceneNumber})</span>
                    </h2>
                </header>

                <div className="flex-1 flex flex-col gap-8 overflow-hidden">
                    {/* Row 1: Video Player + Keyframes */}
                    <div className="flex-[5] flex gap-8 min-h-0">
                        <div className="flex-[3] relative bg-[#111] rounded-[32px] overflow-hidden border border-white/5 shadow-2xl group">
                            {isGeneratingCurrent ? (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl">
                                    <div className="relative mb-6">
                                        <RefreshCw className="w-10 h-10 text-primary-100 animate-spin" />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-[0.2em] mb-4">Generating...</p>
                                    <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary-100 transition-all duration-1000" style={{ width: `${currentProgress}%` }} />
                                    </div>
                                </div>
                            ) : currentScene.videoUrl ? (
                                <video src={currentScene.videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Image src={currentScene.firstFrameUrl} alt="Preview" fill className="object-cover opacity-60" />
                                    <div onClick={() => handleGenerateVideo(currentScene.sceneNumber)} className="z-10 w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-xl">
                                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 flex flex-col gap-4">
                            <div className="flex-1 rounded-[24px] overflow-hidden border border-white/5 relative group/img">
                                <Image src={currentScene.firstFrameUrl} alt="Start" fill className="object-cover opacity-80" />
                                <div className="absolute bottom-2 left-3 text-[8px] font-black uppercase text-white/40 tracking-widest bg-black/60 px-2 py-1 rounded-md backdrop-blur-md">Start Frame</div>
                            </div>
                            <div className="flex-1 rounded-[24px] overflow-hidden border border-white/5 relative group/img">
                                <Image src={currentScene.lastFrameUrl} alt="Last" fill className="object-cover opacity-80" />
                                <div className="absolute bottom-2 left-3 text-[8px] font-black uppercase text-white/40 tracking-widest bg-black/60 px-2 py-1 rounded-md backdrop-blur-md">Last Frame</div>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Prompt + Button */}
                    <div className="flex-[2] bg-[#0D0D0F] border border-white/5 rounded-[32px] p-8 flex items-center gap-8 shadow-2xl">
                        <div className="flex-1 h-full flex flex-col gap-3">
                            <label className="text-[10px] font-black tracking-[0.4em] text-white/20 uppercase">Prompt Narrative</label>
                            <textarea
                                value={currentScene.combinedPrompt}
                                onChange={(e) => handlePromptChange(e.target.value)}
                                className="flex-1 bg-black/40 rounded-2xl p-6 border border-white/5 text-sm italic text-white/50 outline-none resize-none custom-scrollbar"
                                placeholder="Describe the motion path..."
                            />
                        </div>
                        <button 
                            onClick={() => handleGenerateVideo(currentScene.sceneNumber)}
                            disabled={isGeneratingCurrent}
                            className="w-[200px] h-[100px] rounded-3xl bg-primary-100 hover:bg-primary-200 disabled:opacity-50 text-white flex flex-col items-center justify-center gap-2 font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-primary-100/20"
                        >
                            <Video className="w-6 h-6" />
                            <span className="text-[12px]">{isGeneratingCurrent ? "Waiting..." : "생성하기"}</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function GeneratePage() {
    return (
        <Suspense fallback={<div className="h-screen bg-[#0B0B0C]" />}>
            <GenerateContent />
        </Suspense>
    );
}