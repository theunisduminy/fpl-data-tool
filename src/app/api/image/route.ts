export async function GET(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const targetUrlParam = requestUrl.searchParams.get('url');

  if (!targetUrlParam) {
    return new Response('Missing url parameter', { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(targetUrlParam);
  } catch {
    return new Response('Invalid url parameter', { status: 400 });
  }

  // Restrict proxying to the known image host only to prevent SSRF
  const allowedHosts = new Set<string>(['resources.premierleague.com']);
  if (!allowedHosts.has(targetUrl.hostname)) {
    return new Response('Host not allowed', { status: 403 });
  }

  try {
    const upstreamResponse = await fetch(targetUrl.toString(), {
      // Let intermediate caches store it too
      headers: {
        // Some CDNs send Vary headers, we preserve what we get back
      },
      cache: 'force-cache',
      // If you want to ensure freshness occasionally, you could use next.revalidate
      // next: { revalidate: 60 * 60 * 24 },
    });

    if (!upstreamResponse.ok) {
      return new Response('Failed to fetch image', {
        status: upstreamResponse.status,
      });
    }

    const contentType =
      upstreamResponse.headers.get('content-type') || 'image/png';
    const etag = upstreamResponse.headers.get('etag') || undefined;
    const contentLength =
      upstreamResponse.headers.get('content-length') || undefined;

    const buffer = await upstreamResponse.arrayBuffer();

    const headers: HeadersInit = {
      'Content-Type': contentType,
      'Cache-Control': 'public, immutable, max-age=31536000, s-maxage=31536000',
    };
    if (etag) headers['ETag'] = etag;
    if (contentLength) headers['Content-Length'] = contentLength;

    return new Response(buffer, { status: 200, headers });
  } catch {
    return new Response('Error fetching image', { status: 500 });
  }
}
