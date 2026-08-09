"use client";
import dynamic from "next/dynamic";

// Wrapper: dynamic({ ssr: false }) is no longer allowed in Server Components
// as of Next 15+. This client component re-exports MapView with SSR disabled.
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-ivory-warm animate-pulse" />,
});

export default MapView;
