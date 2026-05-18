import type { Metadata } from "next";
import "./globals.css";
import { DemoDataBanner } from "@/components/DemoDataBanner";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Tavus Pulse",
  description: "The morning dashboard a Tavus Founders Associate opens at 7am.",
};

const fontLinks = (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link
      href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400;1,9..144,500&family=Geist+Mono:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </>
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>{fontLinks}</head>
      <body className="min-h-screen bg-paper text-ink">
        <DemoDataBanner />
        <Nav />
        <main className="mx-auto max-w-[1400px] px-10 pb-32 pt-10">{children}</main>
      </body>
    </html>
  );
}
