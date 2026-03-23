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
        backgroundImageUrl: string;
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
    }>(`/projects/${projectId}`),

  /** 프로젝트 삭제 */
  delete: (projectId: string) =>
    request<null>(`/projects/${projectId}`, {
      method: "DELETE",
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

  /** 단일 영상 정보 조회 (명세 맞춤) */
  getOne: (videoId: string) =>
    request<{
      videoId: string;
      videoUrl: string;
    }>(`/video/${videoId}`),

  /** 플롯 내 씬 영상 전체 조회 */
  getByPlot: (plotId: string) => request(`/videos/plot/${plotId}`),
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
};
