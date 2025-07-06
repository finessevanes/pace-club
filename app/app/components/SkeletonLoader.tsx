"use client";

import React from "react";

// Basic skeleton building blocks with pulse animation
export const SkeletonBox: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-600/20 rounded-lg ${className}`} />
);

export const SkeletonCircle: React.FC<{ size?: string }> = ({ size = "w-8 h-8" }) => (
  <div className={`animate-pulse bg-gray-600/20 rounded-full ${size}`} />
);

export const SkeletonText: React.FC<{ width?: string; height?: string }> = ({ 
  width = "w-full", 
  height = "h-4" 
}) => (
  <div className={`animate-pulse bg-gray-600/20 rounded ${width} ${height}`} />
);

// Profile-specific skeleton components
export const ProfileHeroSkeleton = () => (
  <div className="bg-[#2A2A2A] rounded-3xl shadow-xl overflow-hidden">
    <div className="px-8 pt-12 pb-8">
      <div className="flex flex-col items-center text-center">
        {/* Profile image skeleton */}
        <SkeletonCircle size="w-32 h-32 mb-6" />
        
        {/* Name skeleton */}
        <SkeletonText width="w-48" height="h-8" />
        <div className="mb-6" />
        
        {/* Username skeleton */}
        <SkeletonText width="w-32" height="h-5" />
        <div className="mb-6" />
        
        {/* Badges skeleton */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          <SkeletonBox className="w-24 h-8 rounded-full" />
          <SkeletonBox className="w-32 h-8 rounded-full" />
          <SkeletonBox className="w-28 h-8 rounded-full" />
        </div>
        
        {/* Bio skeleton */}
        <SkeletonText width="w-96 max-w-full" height="h-5" />
        <div className="mb-2" />
        <SkeletonText width="w-80 max-w-full" height="h-5" />
      </div>
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="bg-[#2A2A2A] rounded-2xl shadow-lg border border-[#333333] p-6">
    <SkeletonText width="w-16" height="h-8" />
    <div className="mb-2" />
    <SkeletonText width="w-20" height="h-4" />
  </div>
);

export const RecentRunsSkeleton = () => (
  <div className="bg-[#2A2A2A] rounded-2xl shadow-lg border border-[#333333]">
    <div className="p-6 border-b border-[#333333]">
      <div className="flex items-center justify-between">
        <SkeletonText width="w-32" height="h-6" />
        <SkeletonText width="w-16" height="h-4" />
      </div>
    </div>
    
    <div className="p-6">
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-[#333333] last:border-0">
            <div className="flex items-center gap-4">
              <SkeletonCircle size="w-8 h-8" />
              <div>
                <SkeletonText width="w-20" height="h-5" />
                <div className="mb-1" />
                <SkeletonText width="w-32" height="h-4" />
              </div>
            </div>
            <SkeletonText width="w-12" height="h-4" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const AchievementsSkeleton = () => (
  <div className="bg-[#2A2A2A] rounded-2xl shadow-lg border border-[#333333]">
    <div className="p-6 border-b border-[#333333]">
      <SkeletonText width="w-32" height="h-6" />
    </div>
    
    <div className="p-6">
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <SkeletonBox className="w-16 h-16 rounded-2xl mx-auto mb-3" />
            <SkeletonText width="w-16" height="h-4" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const RunningCrewSkeleton = () => (
  <div className="bg-[#2A2A2A] rounded-2xl shadow-lg border border-[#333333]">
    <div className="p-6 border-b border-[#333333]">
      <div className="flex items-center justify-between">
        <SkeletonText width="w-32" height="h-6" />
        <SkeletonText width="w-20" height="h-4" />
      </div>
    </div>
    
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex -space-x-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonCircle key={i} size="w-12 h-12" />
          ))}
        </div>
        <div>
          <SkeletonText width="w-32" height="h-5" />
          <div className="mb-1" />
          <SkeletonText width="w-40" height="h-4" />
        </div>
      </div>
      
      <SkeletonBox className="w-full h-12 rounded-xl" />
    </div>
  </div>
);

export const ProgressSkeleton = () => (
  <div className="bg-[#2A2A2A] rounded-2xl shadow-lg border border-[#333333]">
    <div className="p-6 border-b border-[#333333]">
      <SkeletonText width="w-24" height="h-6" />
    </div>
    
    <div className="p-6">
      <div className="text-center mb-6">
        <SkeletonText width="w-12" height="h-10" />
        <div className="mb-2" />
        <SkeletonText width="w-32" height="h-4" />
        
        <div className="mt-4">
          <SkeletonBox className="w-full h-2 rounded-full" />
        </div>
      </div>
      
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <SkeletonCircle size="w-8 h-8" />
            <div className="flex-1">
              <SkeletonText width="w-48" height="h-4" />
            </div>
            <SkeletonText width="w-8" height="h-4" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Complete profile skeleton layout
export const ProfilePageSkeleton = () => (
  <div className="min-h-screen bg-[#1A1A1A] py-6 px-4">
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Hero Section Skeleton */}
      <ProfileHeroSkeleton />

      {/* Create Vibe Profile Button Skeleton */}
      <div className="bg-[#2A2A2A] rounded-2xl shadow-lg border border-[#333333] p-6">
        <div className="text-center">
          <SkeletonText width="w-48" height="h-6" />
          <div className="mb-4" />
          <SkeletonText width="w-96 max-w-full" height="h-4" />
          <div className="mb-6" />
          <SkeletonBox className="w-48 h-12 rounded-xl mx-auto" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity Skeleton */}
        <RecentRunsSkeleton />
        
        {/* Achievements Skeleton */}
        <AchievementsSkeleton />
      </div>

      {/* Running Crew Skeleton */}
      <RunningCrewSkeleton />

      {/* Progress Skeleton */}
      <ProgressSkeleton />
    </div>
  </div>
); 