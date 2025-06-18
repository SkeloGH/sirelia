import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sirelia - AI-Powered Mermaid Code Visualization",
  description: "Generate and edit Mermaid diagrams with AI assistance and repository context",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="h-screen w-screen overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
