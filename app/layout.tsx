import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "PerfIAmatic — Audit No-Shows IA pour Cabinets Dentaires",
  description:
    "Découvrez exactement ce que vous perdez chaque mois. Analysez vos données Doctolib en 60 secondes, gratuit et sans inscription.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased min-h-screen bg-ink text-white">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
