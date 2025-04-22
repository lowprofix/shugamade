import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Shugamade - Spécialiste des traitement capillaire naturel";
export const size = {
  width: 1200,
  height: 630,
};

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 70,
          background: "linear-gradient(to bottom right, #bfe0fb, #9deaff)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <div
          style={{
            fontSize: 90,
            fontWeight: "bold",
            marginBottom: 30,
          }}
        >
          Shugamade
        </div>
        <div
          style={{
            fontSize: 36,
            marginBottom: 40,
          }}
        >
          Spécialiste des traitement capillaire naturel
        </div>
      </div>
    ),
    { ...size }
  );
}
