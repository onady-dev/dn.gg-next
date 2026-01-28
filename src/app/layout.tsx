"use client";

import React, { useEffect, useState } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import StyledComponentsRegistry from "./registry";
import Header from "./components/Header";
import GlobalStyles from "./styles/GlobalStyles";
import CreateGroupModal from "./components/CreateGroupModal";
import InstallPrompt from "./components/InstallPrompt";

const inter = Inter({ subsets: ["latin"] });

export const metadatas: Metadata = {
  title: "DN.GG",
  description: "도네이션 게임 기록 서비스",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DN.GG"
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  return (
    <html lang="ko">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <GlobalStyles />
          <Header />
          <main>{children}</main>
          <CreateGroupModal 
            isOpen={isCreateGroupModalOpen} 
            onClose={() => setIsCreateGroupModalOpen(false)} 
          />
          <InstallPrompt />
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
