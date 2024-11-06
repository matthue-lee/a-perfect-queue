// app/api/callback/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Authorization code is missing' }, { status: 400 });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.error('Missing environment variables: Client ID, Client Secret, or Redirect URI');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token } = response.data;

    // Redirect user to home page with the access token
    return NextResponse.redirect(new URL(`/?access_token=${access_token}`, req.url));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error getting Spotify access token:', error.response ? error.response.data : error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return NextResponse.json({ error: 'Failed to obtain access token' }, { status: 500 });
  }
}
