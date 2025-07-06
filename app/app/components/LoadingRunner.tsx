"use client";

import React from "react";

interface LoadingRunnerProps {
  message?: string;
}

export default function LoadingRunner({ message = "Loading..." }: LoadingRunnerProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center space-y-6">
        
        {/* Animated Runner */}
        <div className="relative">
          {/* Track/Ground */}
          <div className="w-32 h-1 bg-gray-300 rounded-full mb-4"></div>
          
          {/* Running Person */}
          <div className="flex items-center justify-center">
            <div className="animate-bounce">
              <svg 
                className="w-16 h-16 text-[#D6FF00]" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                {/* Simple running person icon */}
                <path d="M13.5 5.5c1.09 0 2-.91 2-2s-.91-2-2-2-2 .91-2 2 .91 2 2 2zM9.89 19.38l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L9 8.5v4.5h2v-3.1l1.89 8.28z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Animated Dots */}
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-[#D6FF00] rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-[#D6FF00] rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-[#D6FF00] rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Pace Club</h2>
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#D6FF00] rounded-full animate-pulse"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes running {
          0%, 100% { transform: translateX(-10px) rotate(-5deg); }
          50% { transform: translateX(10px) rotate(5deg); }
        }
        
        .animate-running {
          animation: running 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 