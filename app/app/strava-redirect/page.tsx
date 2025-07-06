"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LoadingRunner from "../components/LoadingRunner";

export default function StravaRedirectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Loading...");

  const handleTokenFlow = (
    access_token: string,
    refresh_token: string,
    expires_at: string,
    athleteParam: string
  ) => {
    try {
      localStorage.setItem("stravaAccessToken", access_token);
      localStorage.setItem("stravaRefreshToken", refresh_token);
      localStorage.setItem("stravaExpiresAt", expires_at);
      
      const athlete = JSON.parse(decodeURIComponent(athleteParam));
      localStorage.setItem("stravaAthlete", JSON.stringify(athlete));
      
      setStatus("Redirecting to your profile...");
      setTimeout(() => router.push("/profile"), 1000);
    } catch (error) {
      setStatus("Error parsing Strava athlete data.");
    }
  };

  const handleCodeFlow = async (code: string) => {
    try {
      const res = await fetch(`/api/strava/callback?code=${code}`);
      const data = await res.json();
      
      if (res.ok && data.athlete) {
        localStorage.setItem("stravaAthlete", JSON.stringify(data.athlete));
        setStatus("Redirecting to your profile...");
        setTimeout(() => router.push("/profile"), 1000);
      } else {
        setStatus(`Error: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      setStatus("Network error contacting Strava callback endpoint.");
    }
  };

  useEffect(() => {
    const code = searchParams.get("code");
    const access_token = searchParams.get("access_token");
    const refresh_token = searchParams.get("refresh_token");
    const expires_at = searchParams.get("expires_at");
    const athleteParam = searchParams.get("athlete");

    // Token flow (new): Direct token and athlete data in URL params
    if (access_token && refresh_token && expires_at && athleteParam) {
      handleTokenFlow(access_token, refresh_token, expires_at, athleteParam);
      return;
    }

    // Code flow (legacy): Authorization code that needs to be exchanged
    if (code) {
      handleCodeFlow(code);
      return;
    }

    // No valid authorization data found
    setStatus("No Strava data found in URL.");
  }, [searchParams, router]);

  return <LoadingRunner message={status} />;
} 