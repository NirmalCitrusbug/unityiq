import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import {AuthProvider} from "@/context/AuthContext";
import {ConfigProvider} from "antd";
import {Suspense} from "react";
import {LoadingSpinner} from "@/components/common/LoadingSpinner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UnityIQ",
  description: "UnityIQ Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConfigProvider>
          <AuthProvider>
            <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
          </AuthProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
