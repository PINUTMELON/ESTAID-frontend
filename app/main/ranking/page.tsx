"use client";

import { useState, useEffect } from "react";
import { rankingApi, videoApi, projectApi } from "../../_utils/api";
import { Star, User, Play, Loader2, AlertCircle, X } from "lucide-react";

interface RankingItem {
  rank: number;
  projectId: string;
  title: string;
  ownerUsername: string;
  backgroundImageUrl: string | null;
  thumbnailImageUrl: string | null;
  averageRating: number;
  ratingCount: number;
  createdAt: string;
}

export default function RankingPage() {
  const [items, setItems] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<RankingItem | null>(null);
  
  // Video-specific states for modal
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [plotTitle, setPlotTitle] = useState<string | null>(null);

  // Rating states
  const [ratingHover, setRatingHover] = useState(0);
  const [isRating, setIsRating] = useState(false);
  const [ratingRes, setRatingRes] = useState<{ averageRating: number; ratingCount: number } | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const res = await rankingApi.get();
        if (res.success) {
          setItems(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch ranking:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, []);

  const handleSelectItem = async (item: RankingItem) => {
    setSelectedItem(item);
    setVideoLoading(true);
    setVideoUrl(null);
    setPlotTitle(null);
    setRatingRes(null);
    
    try {
      const res = await projectApi.get(item.projectId);
      if (res.success) {
        const firstScene = res.data.scenes.find(s => s.video);
        if (firstScene?.video) {
          setVideoUrl(firstScene.video.videoUrl);
          setPlotTitle(firstScene.plotTitle);
        }
      }
    } catch (error) {
      console.error("Failed to fetch project details:", error);
    } finally {
      setVideoLoading(false);
    }
  };

  const handleRate = async (rating: number) => {
    if (!selectedItem || isRating) return;
    setIsRating(true);
    try {
      const res = await projectApi.rate(selectedItem.projectId, rating);
      if (res.success) {
        setRatingRes({
          averageRating: res.data.averageRating,
          ratingCount: res.data.ratingCount
        });
        alert("평점이 반영되었습니다.");
      }
    } catch (error) {
      console.error("Failed to rate project:", error);
    } finally {
      setIsRating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 border-indigo-500 animate-spin text-indigo-500" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Syncing Cinematic Data...</span>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        실시간 랭킹 정보를 불러올 수 없습니다.
      </div>
    );
  }

  const top1 = items[0];
  const top2 = items[1];
  const top3 = items[2];
  const rest = items.slice(3);

  return (
    <div className="min-h-screen text-white p-8 font-sans max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-40 font-black tracking-tighter mb-2 uppercase italic text-white flex items-center justify-center gap-3">
          <div className="w-12 h-1 bg-indigo-500 rounded-full" />
          TOP RANKING
          <div className="w-12 h-1 bg-indigo-500 rounded-full" />
        </h1>
        <p className="text-indigo-400/60 text-12 font-bold tracking-[0.3em] uppercase">The Most Captivating Cinematic Creations</p>
      </div>

      {/* Hero Section (Pedestal Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16 items-end">
        {/* No. 2 */}
        {top2 && (
          <div 
            className="order-2 md:order-1 relative bg-[#1a1a20] rounded-[32px] overflow-hidden group border border-white/5 cursor-pointer h-[280px] hover:border-indigo-500/30 transition-all shadow-2xl" 
            onClick={() => handleSelectItem(top2)}
          >
            <div className="absolute top-4 left-4 z-10 bg-slate-400 w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shadow-lg border border-white/10 italic">2</div>
            <img src={top2.thumbnailImageUrl || top2.backgroundImageUrl || "/api/placeholder/400/225"} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 flex flex-col justify-end">
              <h3 className="text-18 font-bold mb-1 truncate italic tracking-tight">{top2.title}</h3>
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-indigo-400">
                <span>@{top2.ownerUsername}</span>
                <div className="flex items-center gap-1">
                  <Star size={12} fill="currentColor" /> {top2.averageRating.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No. 1 - Featured */}
        {top1 && (
          <div 
            className="order-1 md:order-2 relative bg-[#1a1a20] rounded-[40px] overflow-hidden group border-2 border-indigo-500/20 cursor-pointer h-[360px] shadow-[0_0_50px_rgba(79,70,229,0.15)] transition-all z-10 scale-105" 
            onClick={() => handleSelectItem(top1)}
          >
            <div className="absolute top-6 left-6 z-10 bg-indigo-500 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-2xl border border-white/20 italic">1</div>
            <img src={top1.thumbnailImageUrl || top1.backgroundImageUrl || "/api/placeholder/800/450"} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-black/20 to-transparent p-8 flex flex-col justify-end">
              <div className="mb-2">
                <span className="bg-indigo-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">Editor's Choice</span>
              </div>
              <h2 className="text-28 font-black mb-1 italic tracking-tighter uppercase leading-tight">{top1.title}</h2>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-white/60 lowercase italic">by @{top1.ownerUsername}</span>
                <div className="flex items-center gap-2 text-indigo-400 font-black text-18">
                  <Star size={20} fill="currentColor" /> {top1.averageRating.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No. 3 */}
        {top3 && (
          <div 
            className="order-3 relative bg-[#1a1a20] rounded-[32px] overflow-hidden group border border-white/5 cursor-pointer h-[240px] hover:border-indigo-500/30 transition-all shadow-2xl" 
            onClick={() => handleSelectItem(top3)}
          >
            <div className="absolute top-4 left-4 z-10 bg-[#cd7f32] w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shadow-lg border border-white/10 italic">3</div>
            <img src={top3.thumbnailImageUrl || top3.backgroundImageUrl || "/api/placeholder/400/225"} className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 flex flex-col justify-end">
              <h3 className="text-16 font-bold mb-1 truncate italic tracking-tight">{top3.title}</h3>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                <span>@{top3.ownerUsername}</span>
                <div className="flex items-center gap-1">
                  <Star size={10} fill="currentColor" /> {top3.averageRating.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* List Section */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-[1px] bg-white/10" />
          <h2 className="text-14 font-black uppercase tracking-[0.4em] text-white/40">Cinematic Contenders</h2>
          <div className="flex-grow h-[1px] bg-white/10" />
        </div>

        <div className="flex flex-col gap-3">
          {rest.map((item) => (
            <div key={item.projectId} onClick={() => handleSelectItem(item)} className="bg-[#1a1a20]/40 p-3 rounded-2xl flex items-center group hover:bg-[#1a1a20] transition-all cursor-pointer border border-white/5 shadow-xl hover:translate-x-1 duration-300">
              <div className="text-24 font-black text-white/5 w-14 text-center italic transition-colors group-hover:text-indigo-500/40 leading-none">
                {item.rank}
              </div>
              <div className="relative w-28 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                <img src={item.thumbnailImageUrl || item.backgroundImageUrl || "/api/placeholder/200/120"} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="ml-5 flex-grow">
                <h4 className="text-16 font-bold italic tracking-tight mb-0.5 group-hover:text-indigo-400 transition-colors uppercase">{item.title}</h4>
                <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">@{item.ownerUsername}</p>
              </div>
              <div className="flex items-center gap-8 pr-4">
                <div className="flex items-center gap-1.5 text-indigo-400">
                  <Star size={14} fill="currentColor" />
                  <span className="text-white text-14 font-black">{item.averageRating.toFixed(1)}</span>
                </div>
                <div className="bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  <span className="text-white/30 text-[9px] uppercase font-black tracking-widest">{item.ratingCount} Users</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={() => setSelectedItem(null)}
          />
          <div className="relative z-10 w-full max-w-4xl bg-[#1a1a20]/90 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh]">
            <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
              {videoLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                  <span className="text-12 text-white/40 tracking-widest uppercase font-bold">Initializing Engine</span>
                </div>
              ) : videoUrl ? (
                <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-4 text-center p-12">
                   <AlertCircle className="w-16 h-16 text-white/5" />
                   <p className="text-16 font-bold text-white/40">재생 가능한 영상이 없습니다.</p>
                </div>
              )}
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 left-6 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-indigo-600 transition-all z-20"
              >
                <X size={20} />
              </button>
            </div>

            <div className="w-full md:w-[360px] p-10 flex flex-col justify-between bg-[#1a1a20]/50 border-l border-white/5 overflow-y-auto custom-scrollbar">
              <div className="space-y-8">
                <div>
                  <span className="text-indigo-400 text-[10px] font-black tracking-[0.4em] uppercase mb-4 block">Spotlight Features</span>
                  <h2 className="text-28 font-black text-white italic tracking-tighter uppercase leading-tight">
                    {selectedItem.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-12 font-bold uppercase">{selectedItem.ownerUsername.charAt(0)}</div>
                    <span className="text-gray-400 font-bold">@{selectedItem.ownerUsername}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {plotTitle && (
                    <div>
                      <h4 className="text-[10px] text-white/20 font-bold uppercase tracking-[0.3em] mb-2">Narrative Arc</h4>
                      <p className="text-white/80 leading-relaxed italic text-sm">"{plotTitle}"</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <span className="block text-[9px] text-white/20 uppercase font-black tracking-widest mb-1">Created At</span>
                      <span className="text-13 text-white/80 font-medium">{new Date(selectedItem.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <span className="block text-[9px] text-white/20 uppercase font-black tracking-widest mb-1">Scene No</span>
                      <span className="text-13 text-white/80 font-bold">#{selectedItem.rank}</span>
                    </div>
                  </div>

                  {/* Rating Section */}
                  <div className="pt-6 border-t border-white/5 space-y-6">
                    <h4 className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">Rate this Project</h4>
                    <div className="flex flex-col items-center gap-6 bg-white/[0.02] p-8 rounded-[32px] border border-white/5">
                      <div className="flex items-center gap-3">
                         {[1, 2, 3, 4, 5].map((star) => (
                           <button
                             key={star}
                             disabled={isRating}
                             onMouseEnter={() => setRatingHover(star)}
                             onMouseLeave={() => setRatingHover(0)}
                             onClick={() => handleRate(star)}
                             className="transition-transform active:scale-90 disabled:opacity-50"
                           >
                             <Star 
                               className={`w-8 h-8 transition-colors ${
                                 (ratingHover || 0) >= star ? "text-indigo-500 fill-indigo-500" : "text-white/10"
                               }`} 
                             />
                           </button>
                         ))}
                      </div>
                      
                      {(ratingRes || selectedItem) && (
                        <div className="flex flex-col items-center gap-1 animate-in fade-in slide-in-from-top-2 duration-500">
                           <div className="flex items-center gap-2">
                             <Star className="w-5 h-5 text-indigo-500 fill-indigo-500" />
                             <span className="text-28 font-black text-white">{(ratingRes?.averageRating || selectedItem.averageRating).toFixed(1)}</span>
                           </div>
                           <span className="text-[10px] text-white/20 font-bold uppercase tracking-[0.4em]">
                             Average Score ({(ratingRes?.ratingCount || selectedItem.ratingCount)} Users)
                           </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
