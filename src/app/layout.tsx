import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const ramus = localFont({
  src: [
    { path: "../../public/fonts/Principal/RamusLight-p7vor.ttf", weight: "300", style: "normal" },
    { path: "../../public/fonts/Principal/RamusRegular-VGw8w.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Principal/RamusMedium-ALX07.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/Principal/RamusSemiBold-JRlnx.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/Principal/RamusBold-ZVPq8.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-ramus",
});

const sourceSans = localFont({
  src: [
    { path: "../../public/fonts/Segundaria/source-sans-pro.light.ttf", weight: "300", style: "normal" },
    { path: "../../public/fonts/Segundaria/source-sans-pro.regular.ttf", weight: "400", style: "normal" },
  ],
  variable: "--font-source-sans",
});

export const metadata: Metadata = {
  title: "la·Pausa Café",
  description: "POS Móvil y Gestión",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${ramus.variable} ${sourceSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F4EEE2] font-sans">
        <Toaster position="top-right" />
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
