import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Amazra — Tech Products at Best Price in Bangladesh",
    template: "%s | Amazra",
  },
  description:
    "Shop laptops, desktops, phones, components & accessories at the best price. Free delivery, easy returns, bKash/Nagad accepted.",
  keywords: ["laptop", "computer", "mobile", "accessories", "bangladesh", "online shop"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_BD",
    siteName: "Amazra",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
