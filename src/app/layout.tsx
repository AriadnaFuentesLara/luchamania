import type { Metadata } from "next";
import { Inter, Oswald } from 'next/font/google';
import './globals.css';
import type { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });

// SEO: título y descripción por defecto. Cada página pone su propio título,
// y el "template" le agrega " | Luchamanía Costa Rica" al final.
export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Luchamanía Costa Rica | Lucha olímpica y MMA en San José",
    template: "%s | Luchamanía Costa Rica",
  },
  description:
    "Escuela de lucha olímpica, artes marciales mixtas y deportes de contacto en Sabana, San José. Clases para niños, jóvenes y adultos desde 1990.",
  openGraph: {
    siteName: "Luchamanía Costa Rica",
    locale: "es_CR",
    type: "website",
  },
};

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