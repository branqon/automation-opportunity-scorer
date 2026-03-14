import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const siteTitle = "Automation Opportunity Scorer";
const siteDescription =
  "Focused internal tool that ranks operational automation opportunities by business value and implementation fit.";
const siteUrl = "https://branqon.github.io/automation-opportunity-scorer/";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteTitle,
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: siteTitle,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "social-preview.png",
        width: 1200,
        height: 630,
        alt: "Automation Opportunity Scorer dashboard preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["social-preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var theme="light";var hasStored=false;try{var stored=localStorage.getItem("theme");if(stored==="dark"||stored==="light"){theme=stored;hasStored=true}}catch(_){}if(!hasStored){try{if(window.matchMedia("(prefers-color-scheme: dark)").matches)theme="dark"}catch(_){}}if(theme==="dark"){document.documentElement.setAttribute("data-theme","dark")}else{document.documentElement.removeAttribute("data-theme")}})()`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} bg-background font-sans text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
