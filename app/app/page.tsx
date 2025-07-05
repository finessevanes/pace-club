"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { getUniversalLink } from "@selfxyz/core";
import { SelfQRcodeWrapper, SelfAppBuilder, type SelfApp } from "@selfxyz/qrcode";
import { ethers } from "ethers";

interface VerificationData {
  status: string;
  result: boolean;
  credentialSubject: any;
  verificationOptions: any;
  timestamp: string;
  onchainVerification?: {
    isVerified?: boolean;
    lastUser?: string;
    contractAddress?: string;
    error?: string;
    details?: string;
  };
}

export default function Home() {
  const router = useRouter();
  const { ready, authenticated, login, logout, user } = usePrivy();
  const [linkCopied, setLinkCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Get wallet address from Privy user
  const walletAddress = user?.wallet?.address || "";

  // Check verification status on load and when wallet changes
  useEffect(() => {
    if (walletAddress) {
      setIsVerified(localStorage.getItem(`verified_${walletAddress}`) === "true");
    } else {
      setIsVerified(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (!authenticated || !walletAddress || isVerified) return;
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
          name: true,
          nationality: true,
          date_of_birth: true,
          gender: true,
        },
      }).build();
      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
    }
  }, [authenticated, walletAddress, isVerified]);

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const copyToClipboard = () => {
    if (!universalLink) return;
    navigator.clipboard
      .writeText(universalLink)
      .then(() => {
        setLinkCopied(true);
        displayToast("Universal link copied to clipboard!");
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        displayToast("Failed to copy link");
      });
  };

  const openSelfApp = () => {
    if (!universalLink) return;
    window.open(universalLink, "_blank");
    displayToast("Opening Self App...");
  };

  const handleSuccessfulVerification = async () => {
    displayToast("Verification successful! Processing...");
    setIsVerifying(true);
    // Save verification flag for this wallet
    if (walletAddress) {
      localStorage.setItem(`verified_${walletAddress}`, "true");
      setIsVerified(true);
    }
    setTimeout(() => {
      router.push("/verified");
    }, 1500);
  };

  const handleClearVerification = () => {
    if (walletAddress) {
      localStorage.removeItem(`verified_${walletAddress}`);
      setIsVerified(false);
      displayToast("Verification cleared for this wallet.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="mb-6 md:mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Pace Club</h1>
        <p className="text-sm sm:text-base text-gray-600 px-2">
          {authenticated ? (isVerified ? "You are verified!" : "Scan QR code with Self Protocol App to verify your identity") : "Log in to get started"}
        </p>
      </div>
      {!ready ? (
        <div>Loading...</div>
      ) : !authenticated ? (
        <button
          onClick={login}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-md text-lg font-semibold"
        >
          Log in with Privy
        </button>
      ) : isVerified ? (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => router.push("/verified")}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-md text-lg font-semibold"
          >
            Go to Verified Info
          </button>
          <button
            onClick={handleClearVerification}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md"
          >
            Clear Verification (Testing)
          </button>
          <button
            onClick={logout}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md mt-2"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
          {isVerifying && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-xl">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Processing verification...</p>
              </div>
            </div>
          )}
          <div className="flex justify-center mb-4 sm:mb-6">
            {selfApp ? (
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={handleSuccessfulVerification}
                onError={(error) => {
                  console.error("Verification error:", error);
                  displayToast("Error: Failed to verify identity");
                }}
              />
            ) : (
              <div className="w-[256px] h-[256px] bg-gray-200 animate-pulse flex items-center justify-center">
                <p className="text-gray-500 text-sm">Loading QR Code...</p>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 mb-4 sm:mb-6">
            <button
              type="button"
              onClick={copyToClipboard}
              disabled={!universalLink}
              className="flex-1 bg-gray-800 hover:bg-gray-700 transition-colors text-white p-2 rounded-md text-sm sm:text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {linkCopied ? "Copied!" : "Copy Universal Link"}
            </button>
            <button
              type="button"
              onClick={openSelfApp}
              disabled={!universalLink}
              className="flex-1 bg-blue-600 hover:bg-blue-500 transition-colors text-white p-2 rounded-md text-sm sm:text-base mt-2 sm:mt-0 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              Open Self App
            </button>
          </div>
          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-md mt-2"
          >
            Logout
          </button>
        </div>
      )}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white py-2 px-4 rounded shadow-lg animate-fade-in text-sm">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
