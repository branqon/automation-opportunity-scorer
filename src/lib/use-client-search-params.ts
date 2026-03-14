"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Drop-in replacement for `useSearchParams()` that avoids
 * BAILOUT_TO_CLIENT_SIDE_RENDERING during static export.
 *
 * On the server / first SSR paint the search string is always empty,
 * so the exported HTML renders with default params.  After hydration
 * the hook reads `window.location.search` and syncs state, and it
 * keeps listening for popstate (back / forward navigation).
 *
 * The returned `replace` helper mirrors `router.replace` but also
 * updates the local search-string state so consumers see the new
 * params immediately without needing the Next.js `useSearchParams`
 * hook.
 */
export function useClientSearchParams(initialSearch = "") {
  const router = useRouter();
  const pathname = usePathname();
  const [searchString, setSearchString] = useState(initialSearch);

  useEffect(() => {
    // Sync with the real URL once we're in the browser.
    setSearchString(window.location.search.replace(/^\?/, ""));

    function onPopState() {
      setSearchString(window.location.search.replace(/^\?/, ""));
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const searchParams = useMemo(
    () => new URLSearchParams(searchString),
    [searchString],
  );

  const replace = useCallback(
    (query: string, options?: { scroll?: boolean }) => {
      router.replace(query ? `${pathname}?${query}` : pathname, options);
      setSearchString(query);
    },
    [router, pathname],
  );

  return { searchParams, searchString, replace };
}
