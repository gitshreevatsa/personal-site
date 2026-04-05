import type { Metadata } from "next";
import { JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["300", "400", "500"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Shreyas Padmakiran",
  description: "Software engineer specialised in systems engineering.",
  metadataBase: new URL("https://shreyaspadmakiran.com"),
  openGraph: {
    title: "Shreyas Padmakiran",
    description: "Software engineer specialised in systems engineering.",
    url: "https://shreyaspadmakiran.com",
    siteName: "shreyaspadmakiran.com",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Shreyas Padmakiran",
    description: "Software engineer specialised in systems engineering.",
    creator: "@sakai_thezkguy",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} ${instrumentSerif.variable}`}>
        {children}
      </body>
    </html>
  );
}
