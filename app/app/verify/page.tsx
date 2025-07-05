"use client";

import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { getUniversalLink } from "@selfxyz/core";
import { SelfQRcodeWrapper, SelfAppBuilder, type SelfApp } from "@selfxyz/qrcode";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
// @ts-ignore
import abi from "../abi/ProofOfHuman.abi.json";

export default function VerifyPage() {
  const { ready, authenticated, login, user } = usePrivy();
  const router = useRouter();
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [stravaAthlete, setStravaAthlete] = useState<any | null>(null);
  const [showGenderVerify, setShowGenderVerify] = useState(false);

  // Get wallet address from Privy user
  const walletAddress = user?.wallet?.address || "";

  // Auto-prompt Privy login if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      login();
    }
  }, [ready, authenticated, login]);

  // Check gender verification status on load and when wallet changes
  useEffect(() => {
    if (walletAddress) {
      // Assume gender is stored in localStorage as verified_<walletAddress>_gender
      const g = localStorage.getItem(`verified_${walletAddress}_gender`);
      setGender(g);
    } else {
      setGender(null);
    }
  }, [walletAddress]);

  // Check Strava connection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const athlete = localStorage.getItem("stravaAthlete");
      setStravaAthlete(athlete ? JSON.parse(athlete) : null);
    }
  }, [authenticated]);

  // Setup Self app for gender verification
  useEffect(() => {
    if (!authenticated || !walletAddress || gender) return;
    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Pace Club",
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "pace-club",
        endpoint: `${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`,
        logoBase64:
          "https://i.postimg.cc/mrmVf9hm/self.png",
        userId: walletAddress,
        endpointType: "staging_celo",
        userIdType: "hex",
        userDefinedData: "0x00",
        disclosures: {
          gender: true,
          date_of_birth: true,
          nationality: true,
          name: true,
        },
      }).build();
      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
    }
  }, [authenticated, walletAddress, gender]);

  const copyToClipboard = () => {
    if (!universalLink) return;
    navigator.clipboard
      .writeText(universalLink)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const openSelfApp = () => {
    if (!universalLink) return;
    window.open(universalLink, "_blank");
  };

  // Strava connect handler
  const handleConnectStrava = () => {
    window.location.href = "/api/strava/login";
  };

  // If both are complete, redirect to /profile after a short delay
  useEffect(() => {
    if (gender && stravaAthlete) {
      setTimeout(() => router.replace("/profile"), 1200);
    }
  }, [gender, stravaAthlete, router]);

  // Helper function to save verification data to localStorage
  const saveVerificationData = (walletAddress: string, data: Record<string, string>) => {
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        localStorage.setItem(`verified_${walletAddress}_${key}`, value);
      }
    });
  };

  // Fetch verification data from contract
  const fetchVerificationData = async () => {
    if (!walletAddress) return;
    
    try {
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_CELO_RPC_URL || "");
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
        abi,
        provider
      );

      // Make all contract calls in parallel for better performance
      const [gender, dob, nationality, name] = await Promise.all([
        contract.genders(walletAddress),
        contract.datesOfBirth(walletAddress),
        contract.nationalities(walletAddress),
        contract.names(walletAddress)
      ]);

      const verificationData = { gender, date_of_birth: dob, nationality, name };
      console.log('Verification data:', verificationData);

      if (gender) {
        saveVerificationData(walletAddress, verificationData);
        setGender(gender);
      }
    } catch (err) {
      console.error("Failed to fetch verification data from contract", err);
    }
  };

  if (!ready) {
    return <div className="min-h-screen flex items-center justify-center text-lg">Loading...</div>;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#191919] py-12 px-2">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Neon icon */}
        <div className="bg-[#e6ff2f] rounded-xl p-4 mb-6 flex items-center justify-center">
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><rect width="40" height="40" rx="10" fill="#e6ff2f"/><path d="M8 12.5l3 3 5-5" stroke="#191919" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="4" width="16" height="16" rx="8" stroke="#191919" strokeWidth="2"/></svg>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">Verify Your Gender</h1>
        <p className="text-center text-gray-400 mb-8 text-base md:text-lg">Zero Knowledge Verification Keeps Your Data Private.</p>
        {/* Status Card */}
        <div className="w-full bg-[#2b292a] rounded-2xl p-8 flex flex-col gap-6 items-center mb-8">
          <div className="text-white text-lg font-semibold mb-2">Verification Status</div>
          <div className="flex flex-col gap-4 w-full">
            <div
              className={`flex items-center gap-3 rounded-lg transition cursor-${!gender ? 'pointer' : 'default'} ${!gender ? 'hover:bg-[#232323]' : ''} p-2`}
              onClick={() => { if (!gender) setShowGenderVerify(true); }}
              style={{ userSelect: 'none' }}
            >
              <span className="text-2xl text-gray-400">
                {gender ? (
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#22c55e"/><path d="M8 12.5l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" stroke="#aaa" strokeWidth="2"/><path d="M7 7V5a5 5 0 0110 0v2" stroke="#aaa" strokeWidth="2"/></svg>
                )}
              </span>
              <div>
                <div className="text-white font-bold flex items-center gap-2">
                  Gender
                  {!gender && <span className="text-xs bg-[#e6ff2f] text-black rounded px-2 py-0.5 ml-2">Click to verify</span>}
                </div>
                <div className="text-gray-400 text-sm">
                  {gender ? (
                    <span className="text-green-400 font-semibold">{gender}</span>
                  ) : (
                    "Verify gender identity."
                  )}
                </div>
              </div>
            </div>
            <div
              className={`flex items-center gap-3 rounded-lg transition cursor-${gender && !stravaAthlete ? 'pointer' : 'default'} ${gender && !stravaAthlete ? 'hover:bg-[#232323]' : ''} p-2`}
              onClick={() => { if (gender && !stravaAthlete) handleConnectStrava(); }}
              style={{ userSelect: 'none' }}
            >
              <span className="text-2xl text-gray-400">
                {stravaAthlete ? (
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#22c55e"/><path d="M8 12.5l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" stroke="#aaa" strokeWidth="2"/></svg>
                )}
              </span>
              <div>
                <div className="text-white font-bold flex items-center gap-2">
                  Strava
                  {gender && !stravaAthlete && <span className="text-xs bg-orange-500 text-white rounded px-2 py-0.5 ml-2">Click to connect</span>}
                </div>
                <div className="text-gray-400 text-sm">
                  {stravaAthlete ? (
                    <span className="text-green-400 font-semibold">{stravaAthlete.firstname} {stravaAthlete.lastname}</span>
                  ) : (
                    "Connect your Strava account."
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-2xl text-gray-400"><svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" stroke="#aaa" strokeWidth="2"/></svg></span>
            <span className="text-gray-300">{gender && stravaAthlete ? "2/2 Verified" : gender ? "1/2 Verified" : "0/2 Verified"}</span>
          </div>
        </div>
        {/* Modal for Gender Verification */}
        {!gender && showGenderVerify && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="bg-[#232323] rounded-2xl p-8 shadow-xl flex flex-col items-center relative w-full max-w-md mx-auto animate-fade-in">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
                onClick={() => setShowGenderVerify(false)}
                aria-label="Close"
              >
                ×
              </button>
              <div className="mb-4 text-gray-300 text-center text-lg font-semibold">Verify with Self Protocol</div>
              <div className="flex flex-col items-center gap-2 mb-4">
                {selfApp ? (
                  <SelfQRcodeWrapper
                    selfApp={selfApp}
                    // @ts-ignore
                    onSuccess={() => {
                      fetchVerificationData();
                      setShowGenderVerify(false);
                    }}
                    onError={(error) => {
                      console.error("Verification error:", error);
                    }}
                  />
                ) : (
                  <div className="w-[256px] h-[256px] bg-gray-700 animate-pulse flex items-center justify-center rounded-xl">
                    <p className="text-gray-400 text-sm">Loading QR Code...</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={copyToClipboard}
                  disabled={!universalLink}
                  className="bg-gray-800 hover:bg-gray-700 transition-colors text-white p-2 rounded-md text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {linkCopied ? "Copied!" : "Copy Universal Link"}
                </button>
                <button
                  type="button"
                  onClick={openSelfApp}
                  disabled={!universalLink}
                  className="bg-[#e6ff2f] hover:bg-[#d4ff3f] text-black font-bold p-2 rounded-md text-sm disabled:bg-gray-400 disabled:text-gray-700"
                >
                  Open in Self App
                </button>
              </div>
            </div>
            {/* Overlay click closes modal */}
            <div className="fixed inset-0 z-40" onClick={() => setShowGenderVerify(false)} />
          </div>
        )}
        {/* All set message */}
        {gender && stravaAthlete && (
          <div className="w-full flex flex-col items-center mt-8">
            <div className="text-green-400 text-lg font-bold mb-2">You're all set!</div>
            <div className="text-gray-400 text-sm">Redirecting to your profile...</div>
          </div>
        )}
      </div>
    </div>
  );
} 