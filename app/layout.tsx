import type { Metadata } from "next";
import "@fontsource/oswald/500.css";
import "@fontsource/oswald/600.css";
import "@fontsource/oswald/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { getTheme, buildThemeCssVars } from "@/lib/theme";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BVLOS Safety Academy | Knowledge. Standards. Safety.",
  description:
    "Specialized training, consulting, and tools for safe BVLOS operations. Courses, certifications, technical reports, and AeroSafety Case.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getTheme();
  const cssVars = buildThemeCssVars(theme);
  const cssVarsString = Object.entries(cssVars)
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ");

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `:root { ${cssVarsString} }` }} />
      </head>
      <body className="font-body bg-paper text-ink antialiased">
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
