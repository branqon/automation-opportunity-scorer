import type { Metadata } from "next";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { ApiKeyProvider } from "@/components/providers/api-key-provider";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Automation Opportunity Scorer",
    template: "%s | Automation Opportunity Scorer",
  },
  description:
    "AI-powered internal tool that ranks operational automation opportunities by business value and implementation fit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
  (function() {
    var theme = localStorage.getItem('theme');
    if (!theme) theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  })();
` }} />
      </head>
      <body
        className={`${ibmPlexSans.variable} ${spaceGrotesk.variable} bg-background font-sans text-foreground antialiased`}
      >
        <ApiKeyProvider>{children}</ApiKeyProvider>
      </body>
    </html>
  );
}
