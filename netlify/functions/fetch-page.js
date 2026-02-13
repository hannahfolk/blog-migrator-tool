export default async function handler(req) {
  const url = new URL(req.url, 'http://localhost').searchParams.get('url')

  if (!url) {
    return new Response(JSON.stringify({ error: 'Missing ?url= parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Validate URL scheme
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return new Response(JSON.stringify({ error: 'Only http/https URLs are allowed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BlogMigrator/1.0)',
        'Accept': 'text/html,application/xhtml+xml,*/*',
      },
      redirect: 'follow',
    })

    clearTimeout(timeout)

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Upstream returned ${res.status}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const html = await res.text()

    return new Response(
      JSON.stringify({ html, finalUrl: res.url }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (err) {
    const message = err.name === 'AbortError' ? 'Request timed out (15s)' : err.message
    return new Response(
      JSON.stringify({ error: message }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export const config = {
  path: '/.netlify/functions/fetch-page',
}
