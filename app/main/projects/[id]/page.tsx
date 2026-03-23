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
    sceneTitle: string | null;
    thumbnail: string | null;
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
  assets: {
    assetId: string;
    type: "CHARACTER" | "BACKGROUND";
    imageUrl: string;
    prompt: string;
  }[];
}

function CopyPromptButton({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className={`text-[9px] font-bold transition-colors px-2.5 py-1 rounded-md border ${
        copied 
          ? "text-green-400 bg-green-500/10 border-green-500/20" 
          : "text-white/20 hover:text-white bg-white/5 border-white/5"
      }`}
    >
      {copied ? "복사 완료 ✓" : "프롬프트 복사"}
    </button>
  );
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
              const thumbnail = scene.thumbnail 
                               || scene.images?.find(img => img.frameType === "FIRST")?.imageUrl 
                               || project.backgroundImageUrl 
                               || "/api/placeholder/400/225";
              const title = scene.sceneTitle || scene.plotTitle;
              return (
                <div 
                  key={`scene-${scene.plotId}-${idx}`} 
                  onClick={() => setSelectedSceneIndex(idx)}
                  className="w-[120px] flex-shrink-0 group cursor-pointer"
                >
                  <div className={`relative aspect-video rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                    selectedSceneIndex === idx ? 'border-primary-300 ring-4 ring-primary-300/10' : 'border-white/5 grayscale-[40%] group-hover:grayscale-0'
                  }`}>
                    <img src={thumbnail} className="w-full h-full object-cover" alt={title} />
                    {scene.video && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                            <span className="text-white text-12">▶</span>
                         </div>
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-md text-[8px] px-1.5 py-0.5 rounded text-white font-bold">
                      SCENE {scene.sceneNumber}
                    </div>
                  </div>
                  <div className="mt-2 px-1">
                    <div className={`text-[11px] font-bold truncate ${selectedSceneIndex === idx ? 'text-primary-200' : 'text-white/70'}`}>
                      {title}
                    </div>
                    <div className="text-[9px] text-white/30 truncate font-medium">
                      {scene.video ? "영상 완료" : "이미지 완료"}
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
                    src={currentScene?.thumbnail || currentScene?.images?.find(i => i.frameType === "FIRST")?.imageUrl || project?.backgroundImageUrl || "/api/placeholder/800/450"} 
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
                    {currentScene?.sceneTitle || currentScene?.plotTitle}
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
            <img src="/images/detail.svg" alt="Detail" className="w-5 h-5" /> 
            프로젝트 에셋
          </div>
           <span className="text-10 font-black text-white/20 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
             {(project.assets?.length || 0) + (currentScene?.images?.length || 0)} ITEMS
           </span>
         </div>
 
         <div className="flex-1 overflow-y-auto p-7 space-y-8 custom-scrollbar">
           {/* Global Project Assets */}
           {project.assets && project.assets.length > 0 && (
             <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <div className="text-12 font-black text-primary-300 uppercase tracking-[0.2em]">Global Assets</div>
                  <div className="h-[1px] flex-1 bg-white/5 ml-4" />
               </div>
               
               {project.assets.map((asset, idx) => (
                 <div key={`global-asset-${asset.assetId}-${idx}`} className="flex gap-5 p-3 rounded-3xl hover:bg-white/[0.04] transition-all duration-300 group border border-transparent hover:border-white/5">
                   <div className="w-[120px] aspect-square rounded-2xl overflow-hidden bg-black flex-shrink-0 shadow-lg group-hover:shadow-primary-300/10">
                     <img src={asset.imageUrl || "/api/placeholder/300/300"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Global Asset" />
                   </div>
                   <div className="flex-1 flex flex-col justify-center py-2 overflow-hidden">
                     <div className="flex justify-between items-center bg-white/5 px-2 py-1 rounded-full w-fit mb-2 border border-white/10">
                         <span className="text-[10px] text-primary-300 font-bold tracking-widest uppercase">{asset.type}</span>
                     </div>
                       <p className="text-[12px] text-white/50 leading-relaxed italic break-words line-clamp-3">
                         "{asset.prompt}"
                     </p>
                   </div>
                   <div className="flex justify-end pt-3">
                      <CopyPromptButton prompt={asset.prompt} />
                   </div>
                 </div>
               ))}
             </div>
           )}

           <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div className="text-12 font-black text-white/30 uppercase tracking-[0.2em]">Scene {currentScene?.sceneNumber} Frames</div>
                <div className="h-[1px] flex-1 bg-white/5 ml-4" />
             </div>
             
             {currentScene?.images.map((img, idx) => (
               <div key={`asset-${img.imageId}-${idx}`} className="flex gap-5 p-3 rounded-3xl hover:bg-white/[0.04] transition-all duration-300 group border border-transparent hover:border-white/5">
                 <div className="w-[120px] aspect-[3/4] rounded-2xl overflow-hidden bg-black flex-shrink-0 shadow-lg group-hover:shadow-primary-100/10">
                   <img src={img.imageUrl || "/api/placeholder/300/400"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Asset" />
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
                      <CopyPromptButton prompt={img.prompt} />
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>
     </div>
   );
 }