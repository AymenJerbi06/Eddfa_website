import type { Metadata } from "next";
import "@fontsource-variable/montserrat";
// Karla stays for one button only: the first section's « Contactez-nous », which is kept exactly as it is.
import "@fontsource-variable/karla";
import "@fontsource-variable/noto-sans-arabic";
import "./globals.css";
import "./layers.css";
import "./signature.css";

export const metadata: Metadata = {
  title: { default: "EDDFA | Sèche-serviettes en aluminium", template: "%s | EDDFA" },
  description: "EDDFA, fabricant tunisien en aluminium à Sfax : sèche-serviettes EDEN et ECLAT, sèche-linge EOLE, manches à balai ECLIPSE et supports de tuyau ELAN.",
  robots: { index: false, follow: false },
  icons: { icon: "/eddfa/logo.ico" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
