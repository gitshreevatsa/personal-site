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

const NAME = "Shreyas Padmakiran";
const SITE = "https://shreyaspadmakiran.com";
const DESCRIPTION =
  "Shreyas Padmakiran is a software, systems and solutions engineer based in Bangalore, India. He builds production-grade distributed systems, backend infrastructure, and developer tooling.";

export const metadata: Metadata = {
  title: {
    default: "Shreyas Padmakiran — Software & Solutions Engineer",
    template: "%s — Shreyas Padmakiran",
  },
  description: DESCRIPTION,
  metadataBase: new URL(SITE),
  applicationName: NAME,
  authors: [{ name: NAME, url: SITE }],
  creator: NAME,
  publisher: NAME,
  keywords: [
    "Shreyas Padmakiran",
    "Shreyas Padmakiran engineer",
    "software engineer",
    "solutions engineer",
    "systems engineer",
    "backend engineer",
    "Bangalore",
  ],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title: "Shreyas Padmakiran — Software & Solutions Engineer",
    description: DESCRIPTION,
    url: SITE,
    siteName: "shreyaspadmakiran.com",
    type: "profile",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shreyas Padmakiran — Software & Solutions Engineer",
    description: DESCRIPTION,
    creator: "@sakai_thezkguy",
  },
};

// Person structured data — helps Google associate this site with the entity
// "Shreyas Padmakiran" and can surface a knowledge panel for name searches.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: NAME,
  url: SITE,
  image: `${SITE}/opengraph-image`,
  jobTitle: "Software & Solutions Engineer",
  description: DESCRIPTION,
  email: "mailto:shreyaspadmakiran@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bangalore",
    addressCountry: "IN",
  },
  sameAs: [
    "https://github.com/gitshreevatsa",
    "https://linkedin.com/in/shreyas-padmakiran",
    "https://x.com/sakai_thezkguy",
  ],
  knowsAbout: [
    "Distributed Systems",
    "Backend Engineering",
    "TypeScript",
    "Solidity",
    "Solutions Engineering",
    "Developer Relations",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} ${instrumentSerif.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
