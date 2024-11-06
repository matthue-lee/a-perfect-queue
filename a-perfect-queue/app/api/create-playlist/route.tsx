// app/api/create-playlist/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// In-memory store to track playlist creation requests (for development purposes only)
const playlistCreationCache = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const { accessToken, numberOfSongs, playlistName } = await req.json();

    if (!accessToken || !numberOfSongs || !playlistName) {
      console.error('Missing required data: access token, number of songs, or playlist name');
      return NextResponse.json(
        { error: 'Missing required data: access token, number of songs, or playlist name' },
        { status: 400 }
      );
    }

    console.log('Creating playlist with:', { accessToken, numberOfSongs, playlistName });

    // Step 1: Get the current user's Spotify ID
    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userId = userResponse.data.id;
    console.log('User ID:', userId);

    // Create a unique key for the playlist creation request
    const requestKey = `${userId}-${playlistName}`;

    // Check if the request has already been processed
    if (playlistCreationCache.has(requestKey)) {
      console.error('Playlist creation request already processed');
      return NextResponse.json(
        { error: 'Playlist has already been created' },
        { status: 400 }
      );
    }

    // Add the request to the cache to prevent duplicate processing
    playlistCreationCache.add(requestKey);

    // Step 2: Get recently played tracks
    const recentTracksResponse = await axios.get(
      `https://api.spotify.com/v1/me/player/recently-played?limit=${numberOfSongs}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const trackUris = recentTracksResponse.data.items.map((item: any) => item.track.uri);
    console.log('Track URIs:', trackUris);

    if (trackUris.length === 0) {
      console.error('No recent tracks found');
      return NextResponse.json(
        { error: 'No recent tracks found' },
        { status: 400 }
      );
    }

    // Step 3: Create a new playlist
    const playlistResponse = await axios.post(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        name: playlistName,
        public: false, // You can adjust this based on whether you want the playlist to be public or private
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const playlistId = playlistResponse.data.id;
    console.log('Playlist ID:', playlistId);

    // Step 4: Add tracks to the new playlist
    await axios.post(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        uris: trackUris,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Playlist created successfully');
    return NextResponse.json({ message: 'Playlist created successfully!' }, { status: 200 });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error creating playlist:', error.response ? error.response.data : error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
  }
}
