import { memo } from 'react';

const LoadingContent = memo(() => (
  <div 
    className="min-h-screen bg-gray-50 flex flex-col justify-center items-center"
    suppressHydrationWarning
  >
    <div 
      className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"
      suppressHydrationWarning
    />
    <p 
      className="mt-4 text-gray-600"
      suppressHydrationWarning
    >
      Loading...
    </p>
  </div>
));

LoadingContent.displayName = 'LoadingContent';

export default function Loading() {
  return <LoadingContent />;
} 