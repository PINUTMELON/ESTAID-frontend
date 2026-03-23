'use client';

import Image from 'next/image';

interface StepCardProps {
  stepNumber: number;
  title: string;
  isActive: boolean;
  isCompleted?: boolean;
  image?: string;
  onClick?: () => void;
}

export default function StepCard({
  stepNumber,
  title,
  isActive,
  isCompleted,
  image,
  onClick
}: StepCardProps) {
  return (
    <div
      className={`transition-all duration-300 flex flex-col gap-3 p-[18px] rounded-[14px] border ${
        isActive
          ? 'opacity-100 scale-105 bg-primary-100/10 border-primary-300/50 shadow-lg shadow-primary-300/5'
          : 'opacity-40 border-white/5'
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
            isActive || isCompleted
              ? 'bg-primary-100 text-black shadow-[0_0_15px_rgba(124,124,255,0.4)]'
              : 'bg-white/10 text-white/40'
          }`}
        >
          {stepNumber}
        </div>
        <span className={`font-bold text-sm whitespace-nowrap ${isActive ? 'text-primary-50' : 'text-white/70'}`}>
          {title}
        </span>
      </div>

      {image && (
        <div className="w-full rounded-lg overflow-hidden border border-white/10 aspect-square shrink-0">
          <img src={image} className="w-full h-full object-cover" alt={title} />
        </div>
      )}
    </div>
  );
}
