/**
 * 공통 타입 정의
 * - 백엔드 DTO와 일치하도록 유지한다.
 */

// ────────────────────────────────────────────────────────────
// 캐릭터
// ────────────────────────────────────────────────────────────

export interface Character {
  characterId: string;
  name: string;
  description: string | null;
  referenceImageUrl: string | null;
  artStyle: string | null;
  createdAt: string;
}

// ────────────────────────────────────────────────────────────
// 플롯 / 씬
// ────────────────────────────────────────────────────────────

export interface Scene {
  sceneNumber: number;
  title: string;
  characters: string;
  composition: string;
  background: string;
  lighting: string;
  atmosphere: string;
  mainStory: string;
  cameraMovement: string;
  firstFramePrompt: string;
  lastFramePrompt: string;
  videoPrompt: string;
}

export interface Plot {
  plotId: string;
  title: string;
  idea: string;
  artStyle: string | null;
  scenes: Scene[];
  createdAt: string;
}

// ────────────────────────────────────────────────────────────
// 이미지
// ────────────────────────────────────────────────────────────

export type FrameType = "FIRST" | "LAST";
export type GenerationStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface GeneratedImage {
  imageId: string;
  plotId: string;
  sceneNumber: number;
  frameType: FrameType;
  prompt: string;
  imageUrl: string | null;
  status: GenerationStatus;
  createdAt: string;
}

// ────────────────────────────────────────────────────────────
// 영상
// ────────────────────────────────────────────────────────────

export type VideoType = "SCENE" | "MERGED";

export interface Video {
  videoId: string;
  plotId: string | null;
  sceneNumber: number | null;
  videoUrl: string | null;
  duration: number | null;
  videoType: VideoType;
  status: GenerationStatus;
  createdAt: string;
}
