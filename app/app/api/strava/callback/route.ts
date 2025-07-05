import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const redirectUri = 'http://localhost:3000/api/strava/callback';

  const tokenRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    const error = await tokenRes.text();
    return NextResponse.json({ error }, { status: 500 });
  }

  const data = await tokenRes.json();
  // Redirect to /strava-redirect with tokens and athlete info as query params
  const params = new URLSearchParams({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: String(data.expires_at),
    athlete: encodeURIComponent(JSON.stringify(data.athlete)),
  });
  return NextResponse.redirect(`http://localhost:3000/strava-redirect?${params.toString()}`);
} 