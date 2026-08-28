import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PathFinder ? AI-Powered Personalized Learning Path Recommender",
  description: "Personalized, adaptive learning roadmaps built around your career goals, existing skills, and real-time feedback.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased selection:bg-primary-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
