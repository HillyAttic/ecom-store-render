"use client";

import { useEffect, useState } from 'react';

export default function HydrationFix({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set isClient to true when component mounts on the client
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Server-side and initial render
    return (
      <div suppressHydrationWarning>{children}</div>
    );
  }

  // Client-side render after hydration
  return (
    <div suppressHydrationWarning>{children}</div>
  );
} 