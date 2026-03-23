import { NextRequest, NextResponse } from 'next/server';

/**
 * [Vercel / Next.js] 수동 API 프록시 핸들러
 * 
 * 브라우저 -> Vercel (/api/*) -> 백엔드 (http://3.39.95.111:8080/*)
 * CORS 및 HTTPS (Mixed Content) 문제를 방지하기 위해 서버사이드에서 요청을 중계합니다.
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

async function handleProxy(request: NextRequest, params: { path: string[] }) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://3.39.95.111:8080";
  const path = params.path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  
  const targetUrl = `${BACKEND_URL}/${path}${searchParams ? '?' + searchParams : ''}`;

  try {
    const body = ['POST', 'PUT', 'PATCH'].includes(request.method) 
      ? await request.text() 
      : undefined;

    // 클라이언트의 Authorization 헤더 등을 그대로 전달
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // Host 헤더는 Vercel 것이므로 복사하지 않거나 대상 서버에 맞게 조정
      if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'content-length') {
        headers.set(key, value);
      }
    });

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      // Vercel Serverless Function 환경에서 타임아웃 방지 (필요 시 수정)
      cache: 'no-store',
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error: any) {
    console.error(`🔴 [Proxy Error] ${targetUrl}:`, error);
    return NextResponse.json(
      { success: false, message: `Proxy Error: ${error.message}` },
      { status: 500 }
    );
  }
}
