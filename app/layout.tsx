import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Agentation } from "agentation";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GetLostRevenue — Audit No-Shows pour Cabinets Dentaires",
  description:
    "Combien les no-shows coûtent-ils vraiment à votre cabinet ? Audit chiffré en 60 secondes à partir de votre export Doctolib.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="antialiased min-h-screen bg-gray-50 text-slate-900 font-sans flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
        <Toaster
          position="top-center"
          toastOptions={{ duration: 4000 }}
        />
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
