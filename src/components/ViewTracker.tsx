"use client";
import { useEffect } from "react";

export function ViewTracker({ propertyId }: { propertyId: string }) {
  useEffect(() => {
    fetch("/api/views", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ property_id: propertyId }),
    }).catch(() => {});
  }, [propertyId]);
  return null;
}
