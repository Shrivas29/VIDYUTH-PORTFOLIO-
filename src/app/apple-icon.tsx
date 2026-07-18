import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon — the V12 mark on ink (no transparency, as iOS requires).
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000016",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: 92,
          letterSpacing: -6,
          color: "#79e83e",
          fontFamily: "sans-serif",
        }}
      >
        V12
      </div>
    ),
    size
  );
}
