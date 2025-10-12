import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { AppProvider } from "@/lib/context/AppContext";
import { LingoProvider, loadDictionary } from "lingo.dev/react/rsc";
import { LocaleSwitcher } from "lingo.dev/react/client";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TetrisTravel - Local Experiences for Business Travelers",
  description: "Discover authentic local experiences that fit your schedule",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LingoProvider loadDictionary={(_) => loadDictionary(_)}>
      <html lang="en">
        <body className={inter.className}>
          <LocaleSwitcher locales={["es", "en"]} />
          <AuthProvider>
            <AppProvider>{children}</AppProvider>
          </AuthProvider>
        </body>
      </html>
    </LingoProvider>
  );
}
