/**
 * 백엔드 API 클라이언트
 *
 * 모든 API 호출은 이 파일의 함수를 통해 한다.
 * - 기본 URL: next.config.ts의 rewrites 설정을 통해 백엔드로 프록시된다.
 * - 응답 형식: ApiResponse<T> { success, message, data }
 */

const BASE_URL = "/api";

/** 표준 API 응답 타입 */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** 공통 fetch 래퍼 */
async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "서버 오류" }));
    throw new Error(error.message ?? "요청 실패");
  }

  return res.json();
}

// ────────────────────────────────────────────────────────────
// 캐릭터 API
// ────────────────────────────────────────────────────────────

export const characterApi = {
  /** 캐릭터 등록 */
  create: (body: {
    name: string;
    description?: string;
    referenceImageUrl?: string;
    artStyle?: string;
  }) =>
    request("/characters", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** 캐릭터 조회 */
  get: (characterId: string) => request(`/characters/${characterId}`),
};

// ────────────────────────────────────────────────────────────
// 플롯 API
// ────────────────────────────────────────────────────────────

export const plotApi = {
  /** 플롯 생성 */
  create: (body: {
    idea: string;
    sceneCount?: number;
    artStyle?: string;
    characterId?: string;
  }) =>
    request("/plots", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** 플롯 조회 */
  get: (plotId: string) => request(`/plots/${plotId}`),
};

// ────────────────────────────────────────────────────────────
// 이미지 API
// ────────────────────────────────────────────────────────────

export const imageApi = {
  /** 이미지 생성 요청 */
  generate: (body: {
    plotId: string;
    sceneNumber: number;
    frameType: "FIRST" | "LAST";
    prompt: string;
    characterReferenceImageUrl?: string;
  }) =>
    request("/images/generate", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** 이미지 조회 */
  get: (imageId: string) => request(`/images/${imageId}`),

  /** 플롯 내 전체 이미지 조회 */
  getByPlot: (plotId: string) => request(`/images/plot/${plotId}`),
};

// ────────────────────────────────────────────────────────────
// 영상 API
// ────────────────────────────────────────────────────────────

export const videoApi = {
  /** 씬 단위 영상 생성 */
  generate: (body: {
    plotId: string;
    sceneNumber: number;
    firstImageId: string;
    lastImageId: string;
    videoPrompt: string;
    duration?: number;
  }) =>
    request("/videos/generate", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** 영상 병합 */
  merge: (body: { videoIds: string[]; outputTitle: string }) =>
    request("/videos/merge", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** 영상 조회 */
  get: (videoId: string) => request(`/videos/${videoId}`),

  /** 플롯 내 씬 영상 전체 조회 */
  getByPlot: (plotId: string) => request(`/videos/plot/${plotId}`),
};
