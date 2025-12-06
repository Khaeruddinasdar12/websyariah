"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RegisterAdmin() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/signin");
  }, [router]);

  return null;
}

export const dynamic = 'force-dynamic';

