// app/api/spotify-auth/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'Missing environment variables: Client ID or Redirect URI' },
      { status: 500 }
    );
  }

  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=user-read-recently-played%20playlist-modify-public%20playlist-modify-private&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&show_dialog=true`;

  return NextResponse.redirect(authUrl);
}
