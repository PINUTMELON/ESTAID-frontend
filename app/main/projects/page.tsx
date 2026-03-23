"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { projectApi } from "../../_utils/api";

interface Project {
  projectId: string;
  title: string;
  backgroundImageUrl: string | null;
  thumbnailImageUrl?: string | null;
  averageRating?: number;
  ratingCount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Deletion States
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Creation States
  const [isNamingProject, setIsNamingProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPressed = useRef(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectApi.getAll();
      if (res.success) {
        console.log("[DEBUG] Raw /projects API response:", res.data);
        setProjects(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (isCreating || !newProjectTitle.trim()) return;
    setIsCreating(true);
    try {
      const res = await projectApi.create({
        title: newProjectTitle.trim(),
        backgroundImageUrl: "/images/landing-bg.png"
      });
      if (res.success && res.data.projectId) {
        setIsNamingProject(false);
        router.push(`/new?projectId=${res.data.projectId}`);
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("프로젝트 생성에 실패했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!projectToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await projectApi.delete(projectToDelete.projectId);
      if (res.success) {
        setProjects(prev => prev.filter(p => p.projectId !== projectToDelete.projectId));
        setProjectToDelete(null);
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("프로젝트 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Long Press Logic
  const handlePointerDown = (project: Project) => {
    isLongPressed.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPressed.current = true;
      setProjectToDelete(project);
    }, 600); // 꾹 누르는 시간: 600ms
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleCardClick = (projectId: string) => {
    if (!isLongPressed.current) {
      router.push(`/main/projects/${projectId}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "오늘 생성됨";
    if (days === 1) return "어제 생성됨";
    return `${days}일 전 생성됨`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <p className="text-primary-100 text-xs font-medium uppercase tracking-widest">Management Workspace</p>
        <div className="flex items-center justify-between">
          <h1 className="text-32 font-black flex items-center gap-3">
            <div className="p-2.5 bg-white/5 rounded-2xl border border-white/10 text-primary-200">
              <Image src="/images/projects-history.svg" alt="히스토리" width={20} height={20} unoptimized />
            </div>
            PROJECT HISTORY
          </h1>
          <div className="flex items-center gap-2 text-white/40 text-sm cursor-pointer hover:text-white transition-all group">
            전체 보기 
            <Image src="/images/projects-down.svg" alt="전체 보기" width={14} height={14} unoptimized className="group-hover:translate-y-0.5 transition-transform opacity-40 group-hover:opacity-100" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {/* Create Button */}
        <button 
          onClick={() => {
             setNewProjectTitle("");
             setIsNamingProject(true);
          }}
          disabled={isCreating}
          className="aspect-[3/4] w-full rounded-[32px] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-5 bg-white/5 hover:bg-white/[0.08] hover:border-primary-100/40 transition-all group shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-[72px] h-[72px] rounded-full bg-primary-300 flex items-center justify-center shadow-2xl shadow-primary-300/30 group-hover:scale-110 transition-transform duration-500 z-10">
            <Image src="/images/projects-plus.svg" alt="플러스" width={32} height={32} unoptimized />
          </div>
          <span className="text-16 font-bold text-white/80 group-hover:text-white z-10">새 프로젝트 만들기</span>
        </button>

        {/* Loading */}
        {loading && Array(4).fill(0).map((_, i) => <div key={i} className="aspect-[3/4] rounded-[32px] bg-white/5 animate-pulse border border-white/5" />)}

        {/* Project Items */}
        {!loading && projects.map((project) => (
          <div 
            key={project.projectId}
            onPointerDown={() => handlePointerDown(project)}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onClick={() => handleCardClick(project.projectId)}
            className="aspect-[3/4] group relative bg-dark-200 rounded-[32px] overflow-hidden border border-white-300 hover:border-primary-100/40 transition-all duration-500 cursor-pointer shadow-xl flex flex-col active:scale-[0.98]"
          >
            <div className="flex-1 w-full overflow-hidden bg-dark-400 relative">
              <img src={project.thumbnailImageUrl || project.backgroundImageUrl || "/images/landing-bg.png"} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-6 space-y-1.5 bg-gradient-to-b from-transparent to-black/20 shrink-0">
              <h3 className="text-16 font-bold text-white/95 truncate group-hover:text-primary-100 transition-colors uppercase">{project.title}</h3>
              <div className="flex items-center justify-between">
                 <p className="text-12 text-white/20 font-medium">{formatDate(project.createdAt)}</p>
                 {project.ratingCount !== undefined && project.ratingCount > 0 && (
                   <div className="flex items-center gap-1.5 text-primary-200">
                     <Star className="w-3.5 h-3.5 fill-primary-200" />
                     <span className="text-12 font-bold">{project.averageRating?.toFixed(1)}</span>
                   </div>
                 )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Naming Modal */}
      {isNamingProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !isCreating && setIsNamingProject(false)} />
           <div className="relative z-10 w-full max-w-md bg-[#0B0B0B] border border-white/10 rounded-[40px] p-10 flex flex-col items-center shadow-[0_0_100px_rgba(0,0,0,1)]">
              <div className="w-16 h-16 rounded-2xl bg-primary-100/10 flex items-center justify-center text-primary-100 mb-8 border border-primary-100/20">
                <Image src="/images/projects-plus.svg" alt="플러스" width={30} height={30} className="opacity-80" />
              </div>
              <h2 className="text-28 font-black text-white mb-2 italic tracking-tighter">NEW PROJECT</h2>
              <p className="text-white/40 text-14 mb-10 font-bold uppercase tracking-widest">프로젝트의 이름을 입력해주세요</p>
              
              <div className="w-full space-y-8">
                 <div className="space-y-3">
                    <input 
                      autoFocus
                      type="text" 
                      value={newProjectTitle} 
                      onChange={(e) => setNewProjectTitle(e.target.value)} 
                      placeholder="프로젝트 이름..." 
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                      className="w-full h-16 bg-[#1a1a1e] border border-white/10 rounded-2xl p-4 px-6 text-lg font-bold focus:outline-none focus:border-primary-100/50 transition-all text-white placeholder:text-white/10" 
                    />
                 </div>
                 
                 <div className="flex flex-col w-full gap-3 pt-4">
                    <button 
                      onClick={handleCreateProject}
                      disabled={isCreating || !newProjectTitle.trim()}
                      className="w-full py-5 bg-primary-100 hover:bg-primary-200 text-white font-black rounded-2xl transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-16 flex items-center justify-center gap-3 shadow-2xl shadow-primary-300/20"
                    >
                      {isCreating ? (
                         <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                         "프로젝트 만들기"
                      )}
                    </button>
                    <button 
                      onClick={() => setIsNamingProject(false)}
                      disabled={isCreating}
                      className="w-full py-3 text-white/30 hover:text-white transition-colors text-13 font-bold uppercase tracking-widest"
                    >
                      취소
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !isDeleting && setProjectToDelete(null)} />
           <div className="relative z-10 w-full max-w-sm bg-dark-300 border border-white/10 rounded-[32px] p-10 flex flex-col items-center text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-24 font-bold text-white mb-2">프로젝트 삭제</h2>
            <p className="text-white/40 text-14 mb-10 leading-relaxed">
              "{projectToDelete.title}"<br />
              정말로 이 프로젝트를 삭제하시겠습니까? <br />
              삭제 후에는 복구할 수 없습니다.
            </p>
            <div className="flex flex-col w-full gap-3">
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? "삭제 중..." : "프로젝트 삭제"}
              </button>
              <button 
                onClick={() => setProjectToDelete(null)}
                className="w-full py-4 text-white/40 hover:text-white transition-colors text-14 font-medium"
              >
                취소하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}