import React from 'react';

// Single Product Card Skeleton
export const ProductCardSkeleton = () => {
  return (
    <div className="rounded-2xl border border-slate-200/60 dark:border-dark-800/60 overflow-hidden bg-white dark:bg-dark-900 p-4 flex flex-col gap-3">
      <div className="aspect-square w-full rounded-xl shimmer-bg"></div>
      <div className="h-4 w-1/3 rounded shimmer-bg"></div>
      <div className="h-6 w-3/4 rounded shimmer-bg mt-1"></div>
      <div className="h-4 w-full rounded shimmer-bg"></div>
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 dark:border-dark-800">
        <div className="h-6 w-1/4 rounded shimmer-bg"></div>
        <div className="h-8 w-1/3 rounded-lg shimmer-bg"></div>
      </div>
    </div>
  );
};

// Grid of Product Skeletons
export const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

// Product Detail Detail Page Skeleton
export const ProductDetailSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 animate-pulse">
      {/* Gallery */}
      <div className="flex flex-col gap-4">
        <div className="aspect-square w-full rounded-2xl shimmer-bg"></div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl shimmer-bg"></div>
          ))}
        </div>
      </div>

      {/* Meta Specs */}
      <div className="flex flex-col gap-4">
        <div className="h-4 w-24 rounded shimmer-bg"></div>
        <div className="h-10 w-3/4 rounded shimmer-bg"></div>
        <div className="h-6 w-1/4 rounded shimmer-bg"></div>
        <div className="h-16 w-full rounded shimmer-bg my-2"></div>
        <div className="h-8 w-1/3 rounded shimmer-bg"></div>
        <div className="h-10 w-full rounded-xl shimmer-bg mt-6"></div>
      </div>
    </div>
  );
};

// Admin Dashboard Summary Cards Skeleton
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 rounded-2xl border border-slate-200/60 dark:border-dark-800/60 bg-white dark:bg-dark-900 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 rounded shimmer-bg"></div>
              <div className="h-8 w-8 rounded-lg shimmer-bg"></div>
            </div>
            <div className="h-8 w-16 rounded shimmer-bg"></div>
          </div>
        ))}
      </div>
      <div className="h-64 w-full rounded-2xl shimmer-bg"></div>
    </div>
  );
};

// Table View Skeleton
export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="border border-slate-200/60 dark:border-dark-800/60 rounded-xl overflow-hidden bg-white dark:bg-dark-900 p-4 space-y-3">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 items-center justify-between py-3 border-b border-slate-100 last:border-0 dark:border-dark-800">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-4 flex-1 rounded shimmer-bg last:w-1/2"></div>
          ))}
        </div>
      ))}
    </div>
  );
};
