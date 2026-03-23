'use client';

import { useState, useCallback } from 'react';
import { angles } from '@/app/_constants/scene';

export interface ProjectCharacter {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
  style?: string;
}

export interface ProjectBackground {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
  style?: string;
}

export interface Scene {
  id: string;
  characterIds: string[]; // 다중 선택
  backgroundId: string;   // 단일 선택
  composition: typeof angles[0];
  lighting: string;
  story: string;
  firstFrame: string;
  lastFrame: string;
  firstFrameImageUrl?: string;
  lastFrameImageUrl?: string;
  title: string;      // 씬 제목 추가
  imageUrl?: string;
}

export function useNewProject() {
  const [step, setStep] = useState(1);
  
  // Step 1: Characters Collection
  const [characters, setCharacters] = useState<ProjectCharacter[]>([]);
  
  // Step 2: Backgrounds Collection
  const [backgrounds, setBackgrounds] = useState<ProjectBackground[]>([]);
  
  // Step 3 & 4: Scenes Collection
  const [scenes, setScenes] = useState<Scene[]>([]);

  // --- Actions ---
  
  const addCharacter = useCallback((char: ProjectCharacter) => {
    setCharacters(prev => [...prev, char]);
    return char;
  }, []);

  const removeCharacter = useCallback((id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
  }, []);

  const addBackground = useCallback((bg: ProjectBackground) => {
    setBackgrounds(prev => [...prev, bg]);
    return bg;
  }, []);

  const removeBackground = useCallback((id: string) => {
    setBackgrounds(prev => prev.filter(b => b.id !== id));
  }, []);

  const updateScene = useCallback((idx: number, updates: Partial<Scene>) => {
    setScenes(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...updates };
      return next;
    });
  }, []);

  return {
    step,
    setStep,
    characters,
    backgrounds,
    scenes,
    setScenes,
    addCharacter,
    removeCharacter,
    addBackground,
    removeBackground,
    updateScene
  };
}
