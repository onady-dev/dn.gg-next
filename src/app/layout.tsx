"use client";

import React, { useEffect, useState } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import StyledComponentsRegistry from "./registry";
import Header from "./components/Header";
import GlobalStyles from "./styles/GlobalStyles";
import CreateGroupModal from "./components/CreateGroupModal";

const inter = Inter({ subsets: ["latin"] });

export const metadatas: Metadata = {
  title: "DN.GG",
  description: "도네이션 게임 기록 서비스",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  return (
    <html lang="ko">
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <GlobalStyles />
          <Header onCreateGroupClick={() => setIsCreateGroupModalOpen(true)} />
          <main>{children}</main>
          <CreateGroupModal 
            isOpen={isCreateGroupModalOpen} 
            onClose={() => setIsCreateGroupModalOpen(false)} 
          />
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
