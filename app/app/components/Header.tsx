"use client";

import React, { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, logout } = usePrivy();
  const router = useRouter();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  const handlePrivyLogout = async () => {
    await logout();
    setShowLogoutMenu(false);
    router.push("/");
  };

  const handleCompleteLogout = async () => {
    // Clear all local storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Logout from Privy
    await logout();
    setShowLogoutMenu(false);
    
    // Force hard navigation to avoid multiple route changes
    window.location.href = "/";
  };

  // Don't show header if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="bg-[#D6FF00] rounded-lg p-2 mr-3">
              <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Pace Club</h1>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            
            {/* User Wallet Address */}
            <div className="hidden sm:block">
              <span className="text-sm text-gray-500">
                {user.wallet?.address 
                  ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
                  : "No wallet connected"
                }
              </span>
            </div>

            {/* Logout Menu */}
            <div className="relative">
              <button
                onClick={() => setShowLogoutMenu(!showLogoutMenu)}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Logout</span>
              </button>

              {/* Dropdown Menu */}
              {showLogoutMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-2">
                    <button
                      onClick={handlePrivyLogout}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="font-medium mb-1">Logout (Privy Only)</div>
                      <div className="text-xs text-gray-500">
                        Keep Strava data and local settings
                      </div>
                    </button>
                    
                    <button
                      onClick={handleCompleteLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <div className="font-medium mb-1">Complete Logout</div>
                      <div className="text-xs text-red-500">
                        Clear all data (Strava, settings, etc.)
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showLogoutMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowLogoutMenu(false)}
        />
      )}
    </header>
  );
} 