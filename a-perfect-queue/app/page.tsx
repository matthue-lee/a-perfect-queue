"use client";
import { button as buttonStyles } from "@nextui-org/theme";
import { Input } from "@nextui-org/input";
import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

import { title, subtitle } from "@/components/primitives";
import SuccessMessageCard from "@/components/successMessageCard";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [numberOfSongs, setNumberOfSongs] = useState<number>(30); // Default value
  const [playlistName, setPlaylistName] = useState<string>("");
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // New loading state

  // Ref to prevent multiple playlist creation
  const isPlaylistCreationTriggered = useRef(false);

  // Retrieve stored values from localStorage on component mount
  useEffect(() => {
    if (typeof window === "undefined") return; // Ensure this only runs on the client side

    const storedNumberOfSongs = localStorage.getItem("numberOfSongs");
    const storedPlaylistName = localStorage.getItem("playlistName");

    if (storedNumberOfSongs) {
      setNumberOfSongs(Number(storedNumberOfSongs));
    }
    if (storedPlaylistName) {
      setPlaylistName(storedPlaylistName);
    }
  }, []);

  // Get access token from URL query parameters and create playlist
  useEffect(() => {
    if (typeof window === "undefined") return; // Ensure this only runs on the client side

    const token = searchParams.get("access_token");

    // Check if playlist has already been created by this token
    const playlistCreationLock = localStorage.getItem("playlistCreationLock");

    if (token && playlistCreationLock !== token && !isPlaylistCreationTriggered.current) {
      // Set lock to prevent duplicate creation
      localStorage.setItem("playlistCreationLock", token);
      setAccessToken(token);
      isPlaylistCreationTriggered.current = true;

      // Function to add delay and create playlist
      const createPlaylistWithDelay = async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1-second delay
        await handleCreatePlaylist(token);
        
        // Remove the token from the URL for cleaner appearance
        window.history.replaceState({}, document.title, "/");
      };

      // Call the function with the delay
      createPlaylistWithDelay();
    }
  }, [searchParams]);

  const handleAuthorize = () => {
    // Call the server-side API route that handles Spotify authentication
    // Store input values in localStorage before redirecting for authorization
    localStorage.setItem("numberOfSongs", numberOfSongs.toString());
    localStorage.setItem("playlistName", playlistName);
    window.location.href = "/api/spotify-auth";
    };

  const handleCreatePlaylist = async (token: string) => {
    if (!token) {
      alert("Access token not found. Please authenticate with Spotify.");
      return;
    }

    // Retrieve playlistName and numberOfSongs from localStorage if they are not available in the state
    const name = playlistName || localStorage.getItem("playlistName");
    const number = Number(localStorage.getItem("numberOfSongs"));

    if (!name) {
      alert("Please enter a playlist name.");
      return;
    }

    if (!number || isNaN(number)) {
      alert("Please enter a valid number of songs.");
      return;
    }

    // Log the payload to verify the data being sent
    console.log("Creating playlist with:", {
      accessToken: token,
      numberOfSongs: number,
      playlistName: name,
    });

    try {
      setIsLoading(true);

      // Make a request to your server-side API route to create the playlist
      const response = await axios.post("/api/create-playlist", {
        accessToken: token,
        numberOfSongs: number,
        playlistName: name,
      });

      if (response.status === 200) {
        setMessage({ text: "Playlist created successfully!", type: "success" });
      } else {
        setMessage({
          text: "Failed to create playlist. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setMessage({
          text: "Failed to create playlist. Please try again.",
          type: "error",
        });
      } else {
        setMessage({
          text: "Failed to create playlist. Please try again.",
          type: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissMessage = () => {
    setMessage(null);
  };

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}>
          Were the last few songs you queued
          <span className={title({ color: "green" })}> perfect&nbsp;</span>
          for a playlist?
        </span>
        <div className={subtitle({ class: "mt-4" })}>
          Just enter how many songs back to look, what you want to call your
          playlist, and we&#39;ll do the rest
        </div>
        <div className="flex w-full md:flex-nowrap gap-4">
          <Input
            placeholder="Number of songs"
            type="number"
            value={numberOfSongs.toString()}
            onChange={(e) => setNumberOfSongs(Number(e.target.value))}
          />
          <Input
            placeholder="Playlist name"
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          className={buttonStyles({
            color: "success",
            radius: "full",
            variant: "shadow",
          })}
          onClick={handleAuthorize}
        >
          Create
        </button>
      </div>
      {/* Display the success or error message */}
      {message && (
        <SuccessMessageCard
          message={message.text}
          type={message.type}
          onDismiss={handleDismissMessage}
        />
      )}
    </section>
  );
}
