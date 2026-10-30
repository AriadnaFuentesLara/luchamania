import { Inter, Oswald } from 'next/font/google';
import './globals.css';
import type { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${oswald.variable}`}>
    <body className="bg-fondo font-sans text-tinta antialiased">{children}</body>
    </html>
  );
}
