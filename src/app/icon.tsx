import { ImageResponse } from "next/og";

// Configuration de la taille
export const size = {
  width: 192,
  height: 192,
};

// Type de contenu
export const contentType = "image/png";

// Génération de l'icône
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 144,
          background: "linear-gradient(to bottom right, #bfe0fb, #9deaff)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 700,
          borderRadius: "12%",
        }}
      >
        S
      </div>
    ),
    { ...size }
  );
}
