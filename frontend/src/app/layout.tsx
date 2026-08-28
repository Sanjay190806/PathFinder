import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PathFinder ? AI-Powered Personalized Learning Path Recommender",
  description: "Personalized, adaptive learning roadmaps built around your target career goal, existing skills, and real-time feedback.",
  keywords: ["learning path", "career roadmap", "adaptive learning", "skill gap analysis", "AI coach", "engineering career"]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased selection:bg-primary-500 selection:text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
