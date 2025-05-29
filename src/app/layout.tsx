import "./globals.scss";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import PrivyProviderWrapper from "./privy-provider";
import QueryProvider from "./query-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ECDSA Node - Privy Enabled",
  description:
    "A simple wallet application using Next.js and Privy for authentication",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-200`}>
        <PrivyProviderWrapper>
          <QueryProvider>{children}</QueryProvider>
        </PrivyProviderWrapper>
      </body>
    </html>
  );
}
