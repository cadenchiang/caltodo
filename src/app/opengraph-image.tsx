import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "caltodo — your assignments, synced and organized";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generates the Open Graph image for link previews (iMessage, Twitter, etc.).
 * White background with logo on the left and text on the right.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          width: "100%",
          height: "100%",
          backgroundColor: "#ffffff",
          padding: "80px 100px",
          gap: "60px",
        }}
      >
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://caltodo.me/logo.png"
          width={160}
          height={160}
          alt=""
          style={{ borderRadius: "28px", flexShrink: 0 }}
        />
        {/* Text */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 700, color: "#000000", letterSpacing: "-1px" }}>
            caltodo
          </div>
          <div style={{ fontSize: 28, color: "#666666", lineHeight: 1.4, maxWidth: 650 }}>
            Your assignments, synced and organized. bCourses and Gradescope, one calendar.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
