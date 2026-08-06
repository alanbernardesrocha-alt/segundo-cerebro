import type { Metadata, Viewport } from "next";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider } from "@/components/SidebarContext";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Segundo cérebro de Alan",
  description: "Suas anotações e referências, conectadas.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "2º Cérebro",
  },
};

export const viewport: Viewport = {
  themeColor: "#2b1d12",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=National+Park:wght@400;700;800&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Special+Elite&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <SidebarProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <div className="flex min-w-0 flex-1">
              <Sidebar />
              <main className="min-w-0 flex-1">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
