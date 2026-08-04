import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Don Bosco Skill Mission Center, Bengaluru",
  description: "Hostel Management System — Refectory Seating & Holy Mass Reading Roster",
  icons: {
    icon: "/images/don_bosco_skill_mission_center_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-inter antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
