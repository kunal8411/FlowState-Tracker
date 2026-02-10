"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to handle Next.js hydration.
 * Returns true only after the client has hydrated,
 * preventing SSR/CSR mismatch errors.
 */
export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
