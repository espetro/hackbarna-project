import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { AppProvider } from "@/lib/context/AppContext";
import { LingoProvider, loadDictionary } from "lingo.dev/react/rsc";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TetrisTravel - Local Experiences for Business Travelers",
  description: "Discover authentic local experiences that fit your schedule",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dictionary = await loadDictionary("en");

  return (
    <html lang="en">
      <body className={inter.className}>
        <LingoProvider dictionary={dictionary}>
          <AuthProvider>
            <AppProvider>{children}</AppProvider>
          </AuthProvider>
        </LingoProvider>
      </body>
    </html>
  );
}
