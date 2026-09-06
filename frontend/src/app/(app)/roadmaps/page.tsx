'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect /roadmaps to /roadmap
export default function RoadmapsIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/roadmap');
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
