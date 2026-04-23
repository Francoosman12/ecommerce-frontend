import React from "react";

// Skeleton de una product card — mismas dimensiones que ProductCard
export const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-cin-100 flex flex-col h-full animate-pulse">
    <div className="h-52 bg-cin-100" />
    <div className="p-4 flex-1 flex flex-col gap-3">
      <div className="h-3 bg-cin-100 rounded-full w-1/3" />
      <div className="h-4 bg-cin-100 rounded-full w-3/4" />
      <div className="h-4 bg-cin-100 rounded-full w-1/2" />
      <div className="mt-auto h-6 bg-cin-100 rounded-full w-1/3" />
    </div>
    <div className="px-4 pb-4 flex gap-2">
      <div className="flex-1 h-10 bg-cin-100 rounded-xl" />
      <div className="flex-1 h-10 bg-cin-200 rounded-xl" />
    </div>
  </div>
);

// Grid de skeletons
export const SkeletonGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;
