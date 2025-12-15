import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | RBAC System",
    default: "RBAC System - Next-Gen Identity & Access Management",
  },
  description:
    "A production-grade Role-Based Access Control (RBAC) system built with Next.js 15, MongoDB, and Tailwind CSS. Features secure authentication, granular permissions, and a modern UI.",
  keywords: [
    "RBAC",
    "Next.js",
    "MongoDB",
    "Authentication",
    "Authorization",
    "Security",
    "React",
    "Tailwind CSS",
  ],
  authors: [{ name: "RBAC Team" }],
  creator: "RBAC Team",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rbac-system-demo.vercel.app",
    title: "RBAC System - Enterprise Security",
    description: "Secure, scalable, and modern identity management.",
    siteName: "RBAC System",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
