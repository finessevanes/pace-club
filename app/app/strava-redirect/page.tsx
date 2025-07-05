"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function StravaRedirectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");
  const access_token = searchParams.get("access_token");
  const refresh_token = searchParams.get("refresh_token");
  const expires_at = searchParams.get("expires_at");
  const athleteParam = searchParams.get("athlete");
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    // New flow: tokens and athlete in query params
    if (access_token && refresh_token && expires_at && athleteParam) {
      try {
        localStorage.setItem("stravaAccessToken", access_token);
        localStorage.setItem("stravaRefreshToken", refresh_token);
        localStorage.setItem("stravaExpiresAt", expires_at);
        const athlete = JSON.parse(decodeURIComponent(athleteParam));
        localStorage.setItem("stravaAthlete", JSON.stringify(athlete));
        setStatus("Redirecting to your profile...");
        setTimeout(() => router.push("/verified"), 1000);
      } catch (e) {
        setStatus("Error parsing Strava athlete data.");
      }
      return;
    }
    // Old flow: code only
    if (code) {
      const fetchStrava = async () => {
        try {
          const res = await fetch(`/api/strava/callback?code=${code}`);
          const data = await res.json();
          if (res.ok && data.athlete) {
            localStorage.setItem("stravaAthlete", JSON.stringify(data.athlete));
            setStatus("Redirecting to your profile...");
            setTimeout(() => router.push("/verified"), 1000);
          } else {
            setStatus(`Error: ${data.error || "Unknown error"}`);
          }
        } catch (err) {
          setStatus("Network error contacting Strava callback endpoint.");
        }
      };
      fetchStrava();
      return;
    }
    setStatus("No Strava data found in URL.");
  }, [code, access_token, refresh_token, expires_at, athleteParam, router]);

  return (
    <div style={{ padding: 32, textAlign: "center" }}>
      <h2>Strava Connection</h2>
      <p>{status}</p>
    </div>
  );
} 