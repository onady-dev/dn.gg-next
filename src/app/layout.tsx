import type { Metadata } from "next";
import { Inter } from "next/font/google";
import StyledComponentsRegistry from "./registry";
import Header from "./components/Header";
import GlobalStyles from "./styles/GlobalStyles";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DN.GG",
  description: "도네이션 게임 기록 서비스",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <GlobalStyles />
          <Header />
          <main>{children}</main>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
