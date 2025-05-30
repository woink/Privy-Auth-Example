import "./globals.scss";
import Navigation from "@/components/Navigation";
import Toast from "@/components/Toast";
import { WalletProvider } from "@/contexts/WalletContext";
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
          <QueryProvider>
            <WalletProvider>
              <Navigation />
              <main className="flex items-center justify-center flex-wrap max-w-7xl mx-auto pt-24 p-4">
                {children}
              </main>
              <Toast />
            </WalletProvider>
          </QueryProvider>
        </PrivyProviderWrapper>
      </body>
    </html>
  );
}
