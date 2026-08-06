import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Segundo cérebro de Alan",
    short_name: "2º Cérebro",
    description: "Suas anotações e referências, conectadas.",
    start_url: "/",
    display: "standalone",
    background_color: "#efe4c6",
    theme_color: "#2b1d12",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
