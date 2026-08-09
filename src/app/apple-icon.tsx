import { ImageResponse } from "next/og";

// iOS home-screen icon (Apple recommends 180×180)
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#141414",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: 140,
            color: "#FAF7F2",
            fontStyle: "italic",
            fontWeight: 500,
            lineHeight: 1,
            marginTop: -8,
          }}
        >
          L
        </div>
        <div
          style={{
            width: 110,
            height: 6,
            background: "#C8102E",
            borderRadius: 3,
            marginTop: -6,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
