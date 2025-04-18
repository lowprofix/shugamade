import { ImageResponse } from "next/og";

// Configuration de la taille
export const size = {
  width: 180,
  height: 180,
};

// Type de contenu
export const contentType = "image/png";

// Génération de l'icône
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: "linear-gradient(to bottom right, #ffb2dd, #e2b3f7)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 700,
          borderRadius: "22%",
        }}
      >
        S
      </div>
    ),
    { ...size }
  );
}
