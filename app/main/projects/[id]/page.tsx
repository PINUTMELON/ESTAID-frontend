"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { projectApi } from "../../../_utils/api";

interface ProjectDetail {
  projectId: string;
  title: string;
  backgroundImageUrl: string;
  createdAt: string;
  updatedAt: string;
  scenes: {
    plotId: string;
    plotTitle: string;
    sceneNumber: number;
    images: {
      imageId: string;
      sceneNumber: number;
      frameType: "FIRST" | "LAST";
      prompt: string;
      imageUrl: string;
      status: string;
    }[];
    video?: {
      videoId: string;
      plotId: string;
      sceneNumber: number;
      videoUrl: string;
      status: string;
      createdAt: string;
    };
  }[];
}

export default function ProjectDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);

  useEffect(() => {
    const fetchProjectDetail = async () => {
      try {
        const res = await projectApi.get(id);
        if (res.success) {
          setProject(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch project detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-white/40">프로젝트를 찾을 수 없습니다.</p>
        <Link href="/main/projects" className="text-primary-100 hover:underline">목록으로 돌아가기</Link>
      </div>
    );
  }

  const currentScene = project.scenes[selectedSceneIndex];

  return (
    <div className="flex gap-8 h-[calc(100vh-120px)] animate-in fade-in duration-500">
      {/* Left Content */}
      <div className="flex-1 flex flex-col gap-8 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary-100 text-xs font-bold uppercase tracking-widest">
            <span>✨</span> Project Workspace
          </div>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-44 font-black mb-2 text-white">{project.title}</h1>
              <p className="text-white/40 text-13 font-medium">
                생성일: {new Date(project.createdAt).toLocaleDateString()} · 
                최종 수정: {new Date(project.updatedAt).toLocaleDateString()} · 
                {project.scenes.length}개 씬
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-14 font-bold transition-all active:scale-95 text-white/70">
                공유하기
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-primary-300 hover:bg-primary-100 rounded-2xl text-14 font-bold transition-all active:scale-95 shadow-lg shadow-primary-300/20">
                영상 추출하기
              </button>
            </div>
          </div>
        </div>

        {/* Timeline Sessions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white/80 font-bold text-14">
            <span className="text-primary-300">🎬</span> 타임라인 씬
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {project.scenes.map((scene, idx) => {
              const thumbnail = scene.images.find(img => img.frameType === "FIRST")?.imageUrl || project.backgroundImageUrl;
              return (
                <div 
                  key={scene.plotId} 
                  onClick={() => setSelectedSceneIndex(idx)}
                  className="min-w-[220px] group cursor-pointer"
                >
                  <div className={`relative aspect-video rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                    selectedSceneIndex === idx ? 'border-primary-300 ring-4 ring-primary-300/10' : 'border-white/5 grayscale-[40%] group-hover:grayscale-0'
                  }`}>
                    <img src={thumbnail} className="w-full h-full object-cover" alt={scene.plotTitle} />
                    {scene.video && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                            <span className="text-white text-12">▶</span>
                         </div>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-[10px] px-2 py-1 rounded-lg text-white font-bold">
                      SCENE {scene.sceneNumber}
                    </div>
                  </div>
                  <div className="mt-3 px-1">
                    <div className={`text-13 font-bold truncate ${selectedSceneIndex === idx ? 'text-primary-200' : 'text-white/70'}`}>
                      {scene.plotTitle}
                    </div>
                    <div className="text-11 text-white/30 truncate font-medium">
                      {scene.video ? "영상 생성 완료" : "이미지 생성됨"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Player */}
        <div className="relative flex-1 min-h-[450px] bg-dark-400 rounded-[40px] overflow-hidden border border-white/5 flex flex-col shadow-2xl">
          <div className="flex-1 flex items-center justify-center relative bg-black/40 group">
            {currentScene?.video ? (
              <video 
                src={currentScene.video.videoUrl} 
                controls 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-6">
                 <img 
                    src={currentScene?.images.find(i => i.frameType === "FIRST")?.imageUrl || project.backgroundImageUrl} 
                    className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xl pointer-events-none"
                    alt="Background Blur"
                 />
                 <div className="w-24 h-24 bg-primary-300 rounded-full flex items-center justify-center shadow-3xl shadow-primary-300/40 cursor-pointer hover:scale-110 transition-transform relative z-10">
                    <svg className="w-10 h-10 text-white fill-current translate-x-1" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                 </div>
                 <p className="text-white/40 text-14 font-medium relative z-10">영상을 생성하려면 기획을 완료해주세요.</p>
              </div>
            )}
          </div>
          
          <div className="bg-dark-300/80 backdrop-blur-2xl p-8 border-t border-white/5">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-11 font-bold text-primary-200 bg-primary-100/10 px-3 py-1 rounded-full uppercase tracking-widest">
                    Scene {currentScene?.sceneNumber} Selected
                  </span>
                  <h4 className="text-white/60 font-medium text-14 truncate max-w-[400px]">
                    {currentScene?.plotTitle}
                  </h4>
                </div>
                <div className="flex gap-4">
                   <button className="p-2 text-white/40 hover:text-white transition-colors">⛶</button>
                   <button className="p-2 text-white/40 hover:text-white transition-colors">⚙</button>
                </div>
             </div>
             <div className="h-1.5 w-full bg-white/5 rounded-full relative overflow-hidden">
                <div className="absolute inset-0 bg-primary-300/20 w-[45%]" />
                <div className="absolute top-0 bottom-0 left-[45%] w-1 bg-primary-300 shadow-[0_0_10px_rgba(88,101,242,0.8)]" />
             </div>
          </div>
        </div>
      </div>

      {/* Right Assets Panel */}
      <div className="w-[420px] bg-dark-300 rounded-[40px] border border-white/5 flex flex-col overflow-hidden shadow-2xl">
        <div className="p-7 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3 font-bold text-16">
            <span className="text-primary-300 text-20">🔳</span> 프로젝트 에셋
          </div>
          <span className="text-10 font-black text-white/20 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
            {currentScene?.images.length || 0} ITEMS
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-7 space-y-8 custom-scrollbar">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <div className="text-12 font-black text-white/30 uppercase tracking-[0.2em]">Scene {currentScene?.sceneNumber} Assets</div>
               <div className="h-[1px] flex-1 bg-white/5 ml-4" />
            </div>
            
            {currentScene?.images.map((img) => (
              <div key={img.imageId} className="flex gap-5 p-3 rounded-3xl hover:bg-white/[0.04] transition-all duration-300 group border border-transparent hover:border-white/5">
                <div className="w-[120px] aspect-[3/4] rounded-2xl overflow-hidden bg-black flex-shrink-0 shadow-lg group-hover:shadow-primary-100/10">
                  <img src={img.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Asset" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-2 overflow-hidden">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-primary-200 font-bold tracking-widest uppercase">{img.frameType} FRAME</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 mt-3">
                      <p className="text-[12px] text-white/50 leading-relaxed italic break-words line-clamp-4">
                        "{img.prompt}"
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end pt-3">
                     <button className="text-11 font-bold text-white/20 hover:text-white transition-colors bg-white/5 px-4 py-1.5 rounded-lg border border-white/5">
                        프롬프트 복사
                     </button>
                  </div>
                </div>
              </div>
            ))}

            {currentScene?.video && (
               <div className="mt-10 p-5 rounded-[28px] bg-primary-100/5 border border-primary-100/10">
                  <div className="text-12 font-black text-primary-200 uppercase tracking-widest mb-4">Scene Final Video</div>
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black relative group cursor-pointer border border-white/10 shadow-xl">
                     <img src={currentScene.images[0]?.imageUrl} className="w-full h-full object-cover opacity-50" alt="Video Placeholder" />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-primary-300 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                          ▶
                        </div>
                     </div>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}