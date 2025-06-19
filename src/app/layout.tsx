import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToastContainer from "../components/Toast";
import { ThemeProvider } from "../components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sirelia - Real-time Mermaid Visualization",
  description: "Real-time Mermaid diagram visualization with live editing and export capabilities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <div className="h-screen w-screen overflow-hidden">
            {children}
          </div>
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
