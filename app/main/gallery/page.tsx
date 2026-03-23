"use client";

import { useState, useEffect } from "react";
import { galleryApi, videoApi } from "../../_utils/api";
import Image from "next/image";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {items.map((item) => (
          <div
            key={item.videoId}
            className="group relative bg-dark-200 rounded-3xl overflow-hidden border border-white/5 hover:border-primary-100/50 transition-all duration-500 cursor-pointer shadow-2xl hover:shadow-primary-100/10 active:scale-[0.98]"
            onClick={() => handleSelectItem(item)}
          >
            {/* Thumbnail */}
            <div className="aspect-[9/16] relative overflow-hidden bg-dark-400">
              <img
                src={item.thumbnailImageUrl}
                alt={item.projectTitle}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              
              {/* Play Button Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                  <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Info Overlay (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 p-5 space-y-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-16 font-bold text-white truncate shadow-sm">
                {item.projectTitle}
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-12 text-white/50">@{item.ownerUsername}</p>
                <span className="text-10 text-white/30 uppercase tracking-wider">
                  Scene {item.sceneNumber}
                </span>
              </div>
            </div>
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
            <div className="w-full md:w-[360px] p-8 flex flex-col justify-between border-l border-white/5 bg-dark-200/50">
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
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all active:scale-95"
                >
                  Close Player
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}