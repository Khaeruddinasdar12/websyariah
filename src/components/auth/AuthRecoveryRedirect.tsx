"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Redirects Supabase recovery tokens that land on the wrong page
 * (e.g. Site URL pointing to /signin) to /reset-password/confirm.
 */
export default function AuthRecoveryRedirect() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname === "/reset-password/confirm") return;

    const hash = window.location.hash.substring(1);
    const search = window.location.search.substring(1);

    if (hash) {
      const hashParams = new URLSearchParams(hash);
      const type = hashParams.get("type");
      const accessToken = hashParams.get("access_token");

      if (type === "recovery" && accessToken) {
        window.location.replace(`/reset-password/confirm#${hash}`);
        return;
      }
    }

    if (search) {
      const searchParams = new URLSearchParams(search);
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (code) {
        window.location.replace(`/reset-password/confirm?code=${encodeURIComponent(code)}`);
        return;
      }

      if (tokenHash && type === "recovery") {
        window.location.replace(
          `/reset-password/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=recovery`
        );
      }
    }
  }, [pathname]);

  return null;
}
