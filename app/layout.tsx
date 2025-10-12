import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { AppProvider } from "@/lib/context/AppContext";
import { LingoProvider } from "lingo.dev/react/rsc";

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
    <html lang="en">
      <body className={inter.className}>
        <LingoProvider>
          <AuthProvider>
            <AppProvider>{children}</AppProvider>
          </AuthProvider>
        </LingoProvider>
      </body>
    </html>
  );
}
