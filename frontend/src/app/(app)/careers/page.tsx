'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect /careers to /career-explorer
export default function CareersIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/career-explorer');
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
