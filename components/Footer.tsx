import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 bg-white py-8 mt-10 md:pl-[240px]">
      <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
        <div>© {year} PerfIAmatic · Audit d'analyse de performance pour cabinets médicales</div>
        <nav className="flex items-center gap-5">
          <Link
            href="/politique-confidentialite"
            className="hover:text-slate-900 transition"
          >
            Politique de confidentialité
          </Link>
          <Link
            href="/mentions-legales"
            className="hover:text-slate-900 transition"
          >
            Mentions légales
          </Link>
        </nav>
      </div>
    </footer>
  );
}
