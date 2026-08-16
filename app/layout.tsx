import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";
import Nav from "./components/Nav";
import FeedbackModal from "./components/FeedbackModal";
import PageBackground from "./components/PageBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Project LOOP - AI Customer Feedback Intelligence Platform",
  description: "Transform multi-channel customer feedback into real-time actionable insights, sentiment metrics, and automated executive reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col bg-[#0b0f19] text-gray-100`}>
        <PageBackground />
        <Providers>
          <Nav />
          <main className="flex-1 flex flex-col relative z-10">{children}</main>
          <FeedbackModal />
        </Providers>
      </body>
    </html>
  );
}