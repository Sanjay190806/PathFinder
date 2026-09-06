import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeColorProvider } from "@/components/providers/theme-color-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "PathFinder | AI Career & Learning Workspace",
  description: "Discover careers, build skills, and achieve your goals with your personal AI Coach.",
  keywords: ["learning path", "career roadmap", "adaptive learning", "skill gap", "AI coach", "student"]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var c=localStorage.getItem("theme-color");if(c&&c!=="default"){document.documentElement.setAttribute("data-theme-color",c);document.documentElement.classList.add("theme-"+c);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-background text-foreground antialiased min-h-screen transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeColorProvider>
            {children}
          </ThemeColorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
