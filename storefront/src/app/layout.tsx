import type { Metadata } from "next";
import "@fontsource-variable/montserrat";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/karla";
import "@fontsource-variable/noto-sans-arabic";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "EDDFA | Sèche-serviettes en aluminium", template: "%s | EDDFA" },
  description: "EDDFA, fabricant tunisien de sèche-serviettes en aluminium. EDEN à eau chaude et ECLAT électrique, à Sfax.",
  robots: { index: false, follow: false },
  icons: { icon: "/eddfa/logo.ico" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
