/**
 * SkeletonLoader.tsx — Shimmer skeleton loading states
 */
'use client';
import React from 'react';

interface SkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const Skeleton = React.memo(function Skeleton({ className = '', rounded = 'md' }: SkeletonProps) {
  const roundedClass = {
    sm: 'rounded', md: 'rounded-xl', lg: 'rounded-2xl', full: 'rounded-full'
  }[rounded];
  return (
    <div className={`bg-white/5 animate-shimmer overflow-hidden relative ${roundedClass} ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer-wave bg-gradient-to-r from-transparent via-white/8 to-transparent" />
    </div>
  );
});

export const AgentCardSkeleton = React.memo(function AgentCardSkeleton() {
  return (
    <div className="bg-obsidian-card/50 border border-white/8 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-16" rounded="full" />
      </div>
      <Skeleton className="h-2 w-full" rounded="full" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-20" rounded="sm" />
        <Skeleton className="h-4 w-16" rounded="sm" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
});

export const KPICardSkeleton = React.memo(function KPICardSkeleton() {
  return (
    <div className="bg-obsidian-card/50 border border-white/8 rounded-2xl p-4 flex flex-col gap-3">
      <Skeleton className="h-10 w-10" rounded="lg" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-32" rounded="sm" />
    </div>
  );
});
