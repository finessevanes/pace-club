"use client";

import React, { useState } from "react";
import { usePrivy, useSendTransaction } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
// @ts-ignore
import abi from "../abi/VibeProfile.abi.json";
import LoadingRunner from "../components/LoadingRunner";

interface VibeFormData {
  pacePreference: number;
  vibeType: number;
  location: string;
  timeSlot: string;
  bio: string;
}

export default function CreateVibeProfilePage() {
  const { user, ready, logout } = usePrivy();
  const { sendTransaction } = useSendTransaction();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [formData, setFormData] = useState<VibeFormData>({
    pacePreference: 0, // Chill
    vibeType: 0, // Zen
    location: "",
    timeSlot: "",
    bio: ""
  });

  const paceTypes = [
    { 
      id: 0, 
      name: "Chill", 
      icon: "🐢", 
      description: "Easy pace",
      timeRange: "6:00 - 9:00",
      paceKm: "6:00-7:00",
      paceMile: "9:30-11:00"
    },
    { 
      id: 1, 
      name: "Brisk", 
      icon: "🚶", 
      description: "Steady pace",
      timeRange: "13:00 - 16:59",
      paceKm: "5:00-6:00", 
      paceMile: "8:00-9:30"
    },
    { 
      id: 2, 
      name: "Stride", 
      icon: "🏃", 
      description: "Strong pace",
      timeRange: "17:00 - 20:00",
      paceKm: "4:00-5:00",
      paceMile: "6:30-8:00"
    },
    { 
      id: 3, 
      name: "Sprint", 
      icon: "💨", 
      description: "Fast pace",
      timeRange: "20:00 - 23:00",
      paceKm: "3:00-4:00",
      paceMile: "5:00-6:30"
    }
  ];

  const vibeTypes = [
    { id: 0, name: "Zen", icon: "🧘", description: "Mindful running" },
    { id: 1, name: "Energy", icon: "⚡", description: "High energy" },
    { id: 2, name: "Focus", icon: "🎯", description: "Goal oriented" },
    { id: 3, name: "Beast", icon: "🔥", description: "Intense training" }
  ];

  const locations = [
    "San Francisco", "New York", "Los Angeles", "Chicago", "Miami", 
    "Austin", "Seattle", "Denver", "Boston", "Portland"
  ];

  const timeSlots = [
    "Early Morning (5:00-8:00)", "Morning (8:00-12:00)", 
    "Afternoon (12:00-17:00)", "Evening (17:00-20:00)", 
    "Night (20:00-23:00)", "Flexible"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.wallet?.address) {
      alert("Please connect your external wallet (MetaMask, Rainbow, etc.) first");
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log("Starting profile creation...");
      console.log("Using wallet address:", user.wallet.address);
      console.log("Wallet type:", user.wallet.walletClientType);
      console.log("Contract address:", process.env.NEXT_PUBLIC_VIBE_PROFILE_CONTRACT_ADDRESS);
      console.log("Form data:", formData);

      // Create contract interface to encode function call
      const contractInterface = new ethers.Interface(abi);
      const encodedData = contractInterface.encodeFunctionData("createProfile", [
        formData.pacePreference,
        formData.vibeType,
        formData.location,
        formData.timeSlot,
        formData.bio || "Ready to find my running crew!"
      ]);

      console.log("Encoded data:", encodedData);

      // Use Privy's sendTransaction hook - force it to use the current external wallet
      const txResponse = await sendTransaction(
        {
          to: process.env.NEXT_PUBLIC_VIBE_PROFILE_CONTRACT_ADDRESS!,
          data: encodedData,
          value: "0x0" // No ETH value needed for this transaction
        },
      );

      console.log("Transaction submitted:", txResponse.hash);
      alert(`Profile created successfully! Transaction hash: ${txResponse.hash}`);
      
      // Redirect to profile page
      router.push("/profile");
      
    } catch (error: any) {
      console.error("Detailed error:", error);
      
      let errorMessage = "Error creating profile. ";
      if (error.code === 4001) {
        errorMessage += "Transaction rejected by user.";
      } else if (error.code === -32002) {
        errorMessage += "Please check your wallet for pending requests.";
      } else if (error.message?.includes("user rejected")) {
        errorMessage += "Transaction cancelled by user.";
      } else {
        errorMessage += error.message || "Please try again.";
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ready) {
    return <LoadingRunner message="Getting your running gear ready..." />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-[#D6FF00] rounded-xl p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pick Your Vibe</h1>
          <p className="text-gray-600 text-lg">Your Pace And Energy For The Perfect Run.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          {/* Pace Selection */}
          <div>
                         <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold text-gray-900">Pace</h3>
               <span className="text-sm text-gray-500">{Math.round((formData.pacePreference / 3) * 100)}%</span>
             </div>
            <div className="flex justify-between text-sm text-gray-500 mb-4">
              <span>Slow</span>
              <span>Fast</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {paceTypes.map((pace) => (
                <button
                  key={pace.id}
                  type="button"
                  onClick={() => setFormData({...formData, pacePreference: pace.id})}
                  className={`p-4 rounded-xl text-center transition-all ${
                    formData.pacePreference === pace.id 
                      ? 'bg-[#D6FF00] text-black ring-2 ring-[#D6FF00]' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-2xl mb-2">{pace.icon}</div>
                  <div className="font-semibold">{pace.name}</div>
                </button>
              ))}
            </div>
                         <div className="text-center mt-4 text-sm text-gray-600">
               Time: {paceTypes[formData.pacePreference].timeRange} &nbsp;&nbsp; 
               {paceTypes[formData.pacePreference].paceKm}/km &nbsp;&nbsp; 
               {paceTypes[formData.pacePreference].paceMile}/mile
             </div>
          </div>

          {/* Vibe Selection */}
          <div>
                         <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold text-gray-900">Vibe</h3>
               <span className="text-sm text-gray-500">{Math.round((formData.vibeType / 3) * 100)}%</span>
             </div>
            <div className="flex justify-between text-sm text-gray-500 mb-4">
              <span>Chill</span>
              <span>Intense</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {vibeTypes.map((vibe) => (
                <button
                  key={vibe.id}
                  type="button"
                  onClick={() => setFormData({...formData, vibeType: vibe.id})}
                  className={`p-4 rounded-xl text-center transition-all ${
                    formData.vibeType === vibe.id 
                      ? 'bg-[#D6FF00] text-black ring-2 ring-[#D6FF00]' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-2xl mb-2">{vibe.icon}</div>
                  <div className="font-semibold">{vibe.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bio</h3>
                         <div className="flex items-center justify-between mb-2">
               <span className="text-sm text-gray-600">📝 Tell runners about yourself</span>
               <span className="text-sm text-gray-600">Optional 🎯</span>
             </div>
                         <textarea
               value={formData.bio}
               onChange={(e) => setFormData({...formData, bio: e.target.value})}
               placeholder="Looking for a running crew to explore the city with..."
               className="w-full p-3 border border-gray-300 rounded-lg resize-none text-gray-900 placeholder-gray-400"
               rows={3}
             />
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                         <select
               value={formData.location}
               onChange={(e) => setFormData({...formData, location: e.target.value})}
               className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900"
               required
             >
              <option value="">Select your location</option>
              {locations.map((location) => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          {/* Preferred Run Time */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred Run Time</h3>
                         <select
               value={formData.timeSlot}
               onChange={(e) => setFormData({...formData, timeSlot: e.target.value})}
               className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900"
               required
             >
              <option value="">Select your preferred time</option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting || !formData.location || !formData.timeSlot}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                isSubmitting || !formData.location || !formData.timeSlot
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#D6FF00] text-black hover:bg-[#D6FF00]/90 shadow-lg hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Creating Profile on Flow...
                </div>
              ) : (
                'Create Vibe Profile'
              )}
            </button>
          </div>

          {/* Flow Integration Info */}
          <div className="text-center text-sm text-gray-500 pt-4">
            <p>🚀 Your profile will be stored on Flow blockchain</p>
            <p>✨ Earn 25 points for creating your profile</p>
          </div>
          
        </form>
      </div>
    </div>
  );
} 