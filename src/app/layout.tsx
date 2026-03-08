import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Automation Opportunity Scorer",
    template: "%s | Automation Opportunity Scorer",
  },
  description:
    "Focused internal tool that ranks operational automation opportunities by business value and implementation fit.",
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
            __html: `(function(){var t=localStorage.getItem("theme");if(!t)t="dark";document.documentElement.setAttribute("data-theme",t)})()`,
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
