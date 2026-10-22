import type { Metadata, Viewport } from "next";
import { Literata, Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";

// Story voice: anything a person wrote.
const literata = Literata({
  variable: "--font-story",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

// App voice: anything the app says.
const atkinson = Atkinson_Hyperlegible({
  variable: "--font-app",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "silver lining",
  description:
    "Write it down. Let it go. A place to tell the story of your day without an audience.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${literata.variable} ${atkinson.variable}`}>
      <body>{children}</body>
    </html>
  );
}
