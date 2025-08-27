import React from 'react';

interface LoadingSkeletonProps {
  type?: 'event' | 'weather' | 'current-event' | 'compact';
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ type = 'event', count = 1, className = '' }: LoadingSkeletonProps) {
  const renderEventSkeleton = () => (
    <div className={`bg-gray-100 bg-opacity-60 rounded-xl p-4 border border-gray-300 shadow-lg animate-pulse ${className}`}>
      <div className="flex items-start space-x-4">
        {/* Time placeholder */}
        <div className="text-center min-w-0 flex-shrink-0">
          <div className="skeleton h-6 w-12 rounded"></div>
        </div>
        
        {/* Content placeholder */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="skeleton h-5 w-48 rounded"></div>
            <div className="skeleton h-4 w-16 rounded-full"></div>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <div className="skeleton h-4 w-32 rounded mr-4"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentEventSkeleton = () => (
    <div className={`bg-gray-100 bg-opacity-60 rounded-xl p-6 border border-gray-300 shadow-lg animate-pulse ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="skeleton h-6 w-40 rounded"></div>
        <div className="skeleton h-8 w-16 rounded"></div>
      </div>
      
      <div className="border-l-4 border-gray-300 pl-4 flex-1 relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="skeleton h-7 w-64 rounded"></div>
          <div className="skeleton h-4 w-20 rounded-full"></div>
        </div>
        <div className="flex items-center space-x-4 text-gray-500">
          <div className="flex items-center">
            <div className="skeleton h-4 w-24 rounded mr-2"></div>
          </div>
          <div className="flex items-center">
            <div className="skeleton h-4 w-32 rounded mr-2"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWeatherSkeleton = () => (
    <div className={`bg-gray-100 bg-opacity-60 rounded-xl p-6 border border-gray-300 shadow-lg animate-pulse ${className}`}>
      <div className="skeleton h-6 w-32 rounded mb-4"></div>
      
      {/* Current weather */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="skeleton h-12 w-12 rounded"></div>
          <div>
            <div className="skeleton h-6 w-16 rounded mb-1"></div>
            <div className="skeleton h-4 w-24 rounded"></div>
          </div>
        </div>
        <div className="skeleton h-10 w-20 rounded"></div>
      </div>
      
      {/* Forecast */}
      <div className="grid grid-cols-6 gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="text-center">
            <div className="skeleton h-4 w-8 rounded mb-1 mx-auto"></div>
            <div className="skeleton h-8 w-8 rounded mb-1 mx-auto"></div>
            <div className="skeleton h-3 w-6 rounded mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCompactSkeleton = () => (
    <div className={`skeleton-pulse rounded h-16 mb-4 ${className}`}></div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'current-event':
        return renderCurrentEventSkeleton();
      case 'weather':
        return renderWeatherSkeleton();
      case 'compact':
        return renderCompactSkeleton();
      default:
        return renderEventSkeleton();
    }
  };

  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div key={index} className="animate-category-fade">
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
}