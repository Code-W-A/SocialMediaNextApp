import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');
    if (!targetUrl) {
      return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
    }

    // Fetch the remote image server-side to bypass browser CORS restrictions
    const res = await fetch(targetUrl, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream fetch failed' }, { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await res.arrayBuffer();
    const response = new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      }
    });
    return response;
  } catch (error) {
    console.error('[proxy-image] Error:', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}



