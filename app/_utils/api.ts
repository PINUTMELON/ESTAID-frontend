/**
 * 백엔드 API 클라이언트
 *
 * 모든 API 호출은 이 파일의 함수를 통해 한다.
 * - 기본 URL: next.config.ts의 rewrites 설정을 통해 백엔드로 프록시된다.
 * - 응답 형식: ApiResponse<T> { success, message, data }
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/** 표준 API 응답 타입 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const getStoredToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

/** 공통 fetch 래퍼 */
async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> || {}),
  };

  // FormData가 아닐 때만 기본적으로 JSON 지정
  if (!(options?.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Content-Type이 빈 문자열로 오면 명시적으로 삭제 (multipart 자동 처리 유도)
  if (headers["Content-Type"] === "") {
    delete headers["Content-Type"];
  }

  // 디버깅을 위한 요청 데이터 로그 (브라우저 콘솔용)
  if (options?.body instanceof FormData) {
    const data: Record<string, any> = {};
    options.body.forEach((value, key) => {
      data[key] = value instanceof File ? `${value.name} (${value.size} bytes)` : value;
    });
    console.log(`📡 [API Request] ${path}`, data);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "서버 오류" }));
    throw new Error(`[${res.status}] ${path}: ${error.message ?? "요청 실패"}`);
  }

  return res.json();
}

// ────────────────────────────────────────────────────────────
// 인증 API
// ────────────────────────────────────────────────────────────

export const authApi = {
  /** 로그인 */
  login: (body: { username: string; password?: string }) =>
    request<{
      userId: string;
      username: string;
      accessToken: string;
      tokenType: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** 로그아웃 */
  logout: () =>
    request<null>("/auth/logout", {
      method: "POST",
    }),
};

// ────────────────────────────────────────────────────────────
// 캐릭터 API
// ────────────────────────────────────────────────────────────

export const characterApi = {
  /** 캐릭터 생성 */
  create: (
    projectId: string,
    body: {
      projectId: string; // 바디에도 포함
      name: string;
      description?: string;
      referenceImageUrl?: string;
      artStyle?: string;
    }
  ) =>
    request<{
      characterId: string;
      projectId: string;
      name: string;
      description: string;
      referenceImageUrl: string;
      artStyle: string;
      createdAt: string;
      updatedAt: string;
    }>(`/projects/${projectId}/characters`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** 캐릭터 조회 */
  get: (characterId: string) => request(`/characters/${characterId}`),
};

// ────────────────────────────────────────────────────────────
// 프로젝트 API
// ────────────────────────────────────────────────────────────

export const projectApi = {
  /** 내 프로젝트 목록 조회 */
  getAll: () =>
    request<
      {
        projectId: string;
        title: string;
        backgroundImageUrl: string | null;
        thumbnailImageUrl?: string | null;
        averageRating: number;
        ratingCount: number;
        createdAt: string;
        updatedAt: string;
      }[]
    >("/projects"),

  /** 프로젝트 생성 */
  create: (body: { title: string; backgroundImageUrl: string }) =>
    request<{
      projectId: string;
      title: string;
      backgroundImageUrl: string;
      createdAt: string;
      updatedAt: string;
    }>("/projects", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** 단일 프로젝트 조회 (필요 시) */
  get: (projectId: string) =>
    request<{
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
    }>(`/projects/${projectId}`),

  /** 프로젝트 삭제 */
  delete: (projectId: string) =>
    request<null>(`/projects/${projectId}`, {
      method: "DELETE",
    }),

  /** 프로젝트 평점 반영 */
  rate: (projectId: string, rating: number) =>
    request<{
      projectId: string;
      averageRating: number;
      ratingCount: number;
      ratingSum: number;
    }>(`/api/projects/${projectId}/rating`, {
      method: "POST",
      body: JSON.stringify({ rating }),
    }),
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

  /** AI 스토리보드 자동 생성 */
  generate: (body: {
    projectId: string;
    storyDescription: string;
    sceneCount: number;
    ratio?: string;
  }) =>
    request<{
      plotId: string;
      title: string;
      scenes: {
        sceneNumber: number;
        title: string;
        composition: string;
        background: string;
        backgroundDetail: string;
        lighting: string;
        majorStory: string;
        firstFramePrompt: string;
        firstFrameImageUrl: string | null;
        lastFramePrompt: string;
        lastFrameImageUrl: string | null;
      }[];
    }>("/api/projects/plots/generate", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** 씬 프레임 이미지 재생성 */
  regenerateFrame: (body: {
    projectId: string;
    sceneNumber: number;
    firstOrLast: "FIRST" | "LAST";
    prompt: string;
  }) =>
    request<{ imageUrl: string }>("/api/projects/plots/frames/regenerate", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** 전체 씬 배치 저장 */
  updateScenes: (
    projectId: string,
    body: {
      scenes: {
        sceneNumber: number;
        title: string;
        composition: string;
        background: string;
        backgroundDetail?: string;
        lighting: string;
        majorStory: string;
        firstFramePrompt: string;
        firstFrameImageUrl?: string;
        lastFramePrompt: string;
        lastFrameImageUrl?: string;
      }[];
    }
  ) =>
    request<null>(`/api/projects/${projectId}/plots/scenes`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
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
  /** 랜덤 타인 영상 조회 (평가용) */
  getRandom: () =>
    request<{
      videoId: string;
      videoUrl: string;
      projectId?: string;
    }>("/video/random"),

  /** 영상 생성 (방식 A: projectId 기반) */
  generate: (body: {
    projectId: string;
    sceneNumber: number;
    prompt: string;
  }) =>
    request<{
      videoId: string;
      plotId: string;
      sceneNumber: number;
      videoType: "SCENE";
      videoPrompt: string;
      firstImageId: string;
      lastImageId: string;
      videoUrl: string | null;
      thumbnail: string;
      duration: number | null;
      status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
      createdAt: string;
    }>("/api/videos/generate", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** 영상 병합 */
  merge: (body: { videoIds: string[]; outputTitle: string }) =>
    request("/videos/merge", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** 영상 조회 및 상태 확인 */
  getOne: (videoId: string) =>
    request<{
      videoId: string;
      plotId: string;
      sceneNumber: number;
      videoType: "SCENE";
      videoPrompt: string;
      firstImageId: string;
      lastImageId: string;
      videoUrl: string | null;
      thumbnail: string;
      duration: number | null;
      status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
      createdAt: string;
    }>(`/api/videos/${videoId}`),

  /** 플롯 내 씬 영상 전체 조회 */
  getByPlot: (plotId: string) => request(`/videos/plot/${plotId}`),

  /** 영상 생성 페이지 초기 정보 조회 */
  getVideoInfo: (projectId: string) =>
    request<{
      projectId: string;
      scenes: {
        sceneNumber: number;
        title: string;
        firstFrameUrl: string;
        lastFrameUrl: string;
        combinedPrompt: string;
      }[];
    }>(`/projects/${projectId}/video-info`),
};

// ────────────────────────────────────────────────────────────
// 갤러리 API
// ────────────────────────────────────────────────────────────

export const galleryApi = {
  /** 갤러리 목록 조회 */
  get: () =>
    request<
      {
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
      }[]
    >("/gallery"),
};

// ────────────────────────────────────────────────────────────
// 자산(Assets) API
// ────────────────────────────────────────────────────────────

export const assetApi = {
  /** 자산 통합 생성 (캐릭터 또는 배경) */
  create: (
    projectId: string,
    assetType: "characters" | "backgrounds",
    formData: FormData
  ) =>
    request<{
      id: string;
      name: string;
      referenceImageUrl: string;
      imageUrl: string;
      status: string;
    }>(`/api/projects/${projectId}/${assetType}`, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "", // multipart 자동 처리 유도
      },
    }),

  /** 자산 개별 삭제 */
  delete: (
    projectId: string,
    assetType: "characters" | "backgrounds",
    assetId: string
  ) =>
    request<null>(`/api/projects/${projectId}/${assetType}/${assetId}`, {
      method: "DELETE",
    }),
};

// ────────────────────────────────────────────────────────────
// 랭킹 API
// ────────────────────────────────────────────────────────────

export const rankingApi = {
  /** 랭킹 목록 조회 */
  get: () =>
    request<
      {
        rank: number;
        projectId: string;
        title: string;
        ownerUsername: string;
        backgroundImageUrl: string | null;
        thumbnailImageUrl: string | null;
        averageRating: number;
        ratingCount: number;
        createdAt: string;
      }[]
    >("/projects/ranking"),
};
