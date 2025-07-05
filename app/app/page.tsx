"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

export default function Home() {
  const router = useRouter();
  const { ready, authenticated, login, user } = usePrivy();

  useEffect(() => {
    if (ready && authenticated) {
      const walletAddress = user?.wallet?.address;
      const isVerified = walletAddress && localStorage.getItem(`verified_${walletAddress}`) === 'true';
      const stravaAthlete = localStorage.getItem('stravaAthlete');
      if (isVerified && stravaAthlete) {
        router.push('/profile');
      } else {
        sessionStorage.setItem('onboardingIntent', 'true');
        router.push('/verify');
      }
    }
  }, [ready, authenticated, user, router]);

  return (
    <div className="min-h-screen w-full bg-[#191919] flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-4 py-16">
        {/* Apple-style app name */}
        <div className="text-center mb-8">
          <span className="uppercase tracking-widest text-gray-400 text-sm font-medium" style={{ letterSpacing: '0.15em' }}>
            Pace Club
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white text-center mb-6 leading-tight">FIND YOUR<br/>RUNNING CREW</h1>
        <p className="text-center text-gray-200 mb-10 text-xl md:text-2xl max-w-2xl">Connect With Women Who Match Your Pace And Vibe. Build Consistency, Trust, And Community.</p>
        <button
          onClick={async () => {
            if (authenticated) {
              const walletAddress = user?.wallet?.address;
              const isVerified = walletAddress && localStorage.getItem(`verified_${walletAddress}`) === 'true';
              const stravaAthlete = localStorage.getItem('stravaAthlete');
              if (isVerified && stravaAthlete) {
                router.push('/profile');
              } else {
                sessionStorage.setItem('onboardingIntent', 'true');
                router.push('/verify');
              }
            } else {
              login();
            }
          }}
          className="bg-[#e6ff2f] hover:bg-[#d4ff3f] text-black font-bold py-4 px-12 rounded-lg text-2xl shadow transition mb-14"
        >
          Start Your Journey
        </button>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mt-2 mb-2">WHY JOIN PACE CLUB?</h2>
        <p className="text-center text-gray-200 mb-12 text-lg md:text-xl max-w-2xl">We're Building Community, One That Celebrates Every Step Forward.</p>
        {/* Feature Cards - row on desktop, stack on mobile */}
        <div className="flex flex-col md:flex-row gap-8 w-full">
          <div className="flex-1 bg-[#232323] rounded-2xl p-8 flex flex-col items-center text-center border border-[#444] min-w-[220px]">
            <div className="mb-3 text-4xl"><svg width="36" height="36" fill="none" viewBox="0 0 32 32"><path d="M16 20c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0 1.5c2.76 0 5 2.24 5 5H11c0-2.76 2.24-5 5-5z" fill="#e6ff2f"/></svg></div>
            <div className="font-bold text-white text-xl mb-2">Find your Crew</div>
            <div className="text-gray-200 text-base">Connect with 5-10 runners who match your pace and vibe, not your speed</div>
          </div>
          <div className="flex-1 bg-[#232323] rounded-2xl p-8 flex flex-col items-center text-center border border-[#444] min-w-[220px]">
            <div className="mb-3 text-4xl"><svg width="36" height="36" fill="none" viewBox="0 0 32 32"><path d="M16 4l2.47 5.01L24 10.18l-4 3.89L20.36 20 16 17.27 11.64 20 12 14.07l-4-3.89 5.53-.81z" fill="#e6ff2f"/></svg></div>
            <div className="font-bold text-white text-xl mb-2">Consistency Over Competition</div>
            <div className="text-gray-200 text-base">Build collective streaks and celebrate showing up together</div>
          </div>
          <div className="flex-1 bg-[#232323] rounded-2xl p-8 flex flex-col items-center text-center border border-[#444] min-w-[220px]">
            <div className="mb-3 text-4xl"><svg width="36" height="36" fill="none" viewBox="0 0 32 32"><path d="M16 8a3 3 0 00-3 3v3h6v-3a3 3 0 00-3-3zm-4 6v6a2 2 0 002 2h4a2 2 0 002-2v-6H12z" fill="#e6ff2f"/></svg></div>
            <div className="font-bold text-white text-xl mb-2">Privacy First</div>
            <div className="text-gray-200 text-base">Share what you want, when you want, with full control over your data</div>
          </div>
        </div>
      </div>
    </div>
  );
}
