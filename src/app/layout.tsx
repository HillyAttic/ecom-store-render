import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
});

export const metadata: Metadata = {
  title: "Fashion Forever - Your Ultimate Fashion Destination",
  description: "Discover the latest fashion trends and styles at Fashion Forever. Quality clothing and accessories at competitive prices with excellent customer service.",
  keywords: "fashion, clothing, accessories, online shopping, style, trends, fashion store",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
