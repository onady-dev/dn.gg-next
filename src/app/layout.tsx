import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DN.GG",
  description: "도네이션 게임 기록 서비스",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="bg-white">
      <body className={`${inter.className} bg-white min-h-screen`}>
        <Header />
        <main className="bg-white">{children}</main>
      </body>
    </html>
  );
}
