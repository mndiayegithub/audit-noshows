import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "PerfIAmatic - Audit No-Shows pour Cabinets Dentaires",
  description:
    "Analysez vos no-shows en 30 secondes. Outil d'audit IA pour cabinets dentaires.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased min-h-screen bg-brand-dark">
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
