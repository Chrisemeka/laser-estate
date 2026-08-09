import { ImageResponse } from "next/og";

// Fallback PNG favicon for browsers that don't render SVG favicons well.
// Next serves this alongside icon.svg — browsers pick the format they prefer.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#141414",
          borderRadius: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 26,
            color: "#FAF7F2",
            fontStyle: "italic",
            fontWeight: 500,
            lineHeight: 1,
            marginTop: -1,
          }}
        >
          L
        </div>
        <div style={{ width: 18, height: 2, background: "#C8102E", marginTop: -2 }} />
      </div>
    ),
    { ...size },
  );
}
