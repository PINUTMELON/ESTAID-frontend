"use client";

import { useState, useEffect } from "react";
import { galleryApi, videoApi, projectApi } from "../../_utils/api";
import Image from "next/image";
import { Star } from "lucide-react";

interface GalleryItem {
  projectId: string;
  projectTitle: string;
  ownerUsername: string;
  plotId: string;
  plotTitle: string;
  sceneNumber: number;
  thumbnailImageUrl: string;
  videoId: string;
  videoUrl: string;
  createdAt: string;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [dynamicUrl, setDynamicUrl] = useState<string | null>(null);
  const [ratingHover, setRatingHover] = useState(0);
  const [isRating, setIsRating] = useState(false);
  const [ratingRes, setRatingRes] = useState<{ averageRating: number; ratingCount: number } | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await galleryApi.get();
        if (res.success) {
          setItems(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch gallery:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const handleSelectItem = async (item: GalleryItem) => {
    setSelectedItem(item);
    setVideoLoading(true);
    setDynamicUrl(null);
    setRatingRes(null);
    try {
      const res = await videoApi.getOne(item.videoId);
      if (res.success) {
        setDynamicUrl(res.data.videoUrl);
      }
    } catch (error) {
      console.error("Failed to fetch video details:", error);
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
      alert("평점 반영 중 오류가 발생했습니다.");
    } finally {
      setIsRating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-400">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getGridSpan = (index: number) => {
    const spans = [
      "col-span-2 row-span-2 md:col-span-2 md:row-span-2", // Large
      "col-span-1 row-span-1 md:col-span-1 md:row-span-1", // Small
      "col-span-1 row-span-1 md:col-span-1 md:row-span-1", // Small
      "col-span-1 row-span-2 md:col-span-1 md:row-span-2", // Tall
      "col-span-2 row-span-1 md:col-span-2 md:row-span-1", // Wide
      "col-span-1 row-span-1 md:col-span-1 md:row-span-1", // Small
      "col-span-1 row-span-1 md:col-span-1 md:row-span-1", // Small
      "col-span-2 row-span-2 md:col-span-2 md:row-span-2", // Large
      "col-span-1 row-span-1 md:col-span-1 md:row-span-1", // Small
    ];
    return spans[index % spans.length];
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 auto-rows-[250px] gap-0 grid-flow-dense">
        {items.map((item, index) => (
          <div
            key={item.videoId}
            className={`${getGridSpan(index)} group relative overflow-hidden bg-dark-300 cursor-pointer`}
            onClick={() => handleSelectItem(item)}
          >
            {/* Thumbnail */}
            <img
              src={item.thumbnailImageUrl}
              alt={item.projectTitle}
              className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:brightness-75"
            />
            
            {/* Minimal Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
              <h3 className="text-16 font-black text-white truncate mb-1">
                {item.projectTitle}
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-12 text-white/50 font-bold uppercase tracking-wider">@{item.ownerUsername}</p>
                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Hover Accent */}
            <div className="absolute inset-0 border-0 group-hover:border-4 border-primary-100/30 transition-all duration-300 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Video Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={() => setSelectedItem(null)}
          />
          
          <div className="relative z-10 w-full max-w-4xl bg-dark-300/80 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh]">
            {/* Left: Video Player */}
            <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
              {videoLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-2 border-primary-200 border-t-transparent rounded-full animate-spin" />
                  <span className="text-12 text-white/40 tracking-widest uppercase">Streaming...</span>
                </div>
              ) : dynamicUrl ? (
                <video
                  src={dynamicUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-white/20 text-14">재생할 수 있는 영상이 없습니다.</div>
              )}
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 left-6 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors z-20"
              >
                ✕
              </button>
            </div>

            {/* Right: Info Panels */}
            <div className="w-full md:w-[360px] p-8 flex flex-col justify-between border-l border-white/5 bg-dark-200/50 overflow-y-auto custom-scrollbar">
              <div>
                <span className="text-primary-200 text-xs font-bold tracking-widest uppercase mb-4 block">
                  Gallery Feature
                </span>
                <h2 className="text-28 font-bold text-white leading-tight mb-2">
                  {selectedItem.projectTitle}
                </h2>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-12 font-bold">
                    {selectedItem.ownerUsername.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white/70 font-medium">@{selectedItem.ownerUsername}</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-12 text-white/30 font-bold uppercase mb-2">Plot Title</h4>
                    <p className="text-white/80 leading-relaxed italic">"{selectedItem.plotTitle}"</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <span className="block text-10 text-white/30 uppercase mb-1">Created At</span>
                      <span className="text-13 text-white/80">
                        {new Date(selectedItem.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <span className="block text-10 text-white/30 uppercase mb-1">Scene No</span>
                      <span className="text-13 text-white/80">{selectedItem.sceneNumber}</span>
                    </div>
                  </div>

                  {/* Rating Section */}
                  <div className="pt-6 border-t border-white/5 space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-12 text-white/30 font-bold uppercase tracking-widest">Rate this Project</h4>
                    </div>
                    <div className="flex flex-col items-center gap-6 bg-white/[0.02] p-6 rounded-3xl border border-white/5">
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
                                 (ratingHover || 0) >= star 
                                 ? "text-primary-100 fill-primary-100" 
                                 : "text-white/10"
                               }`} 
                             />
                           </button>
                         ))}
                      </div>
                      
                      {ratingRes && (
                        <div className="flex flex-col items-center gap-1 animate-in fade-in slide-in-from-top-2 duration-500">
                           <div className="flex items-center gap-2">
                             <Star className="w-4 h-4 text-primary-100 fill-primary-100" />
                             <span className="text-28 font-black text-white">{ratingRes.averageRating.toFixed(1)}</span>
                           </div>
                           <span className="text-11 text-white/20 font-bold uppercase tracking-widest">
                             평균 평점 ({ratingRes.ratingCount}명 참여)
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