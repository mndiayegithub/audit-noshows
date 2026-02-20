import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      {/* Header */}
      <header className="bg-brand-dark border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center shrink-0" aria-label="PerfIAmatic - Accueil">
              <Image
                src="/logo.png"
                alt="PerfIAmatic"
                width={246}
                height={55}
                className="h-[2.73rem] w-auto object-contain"
                priority
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gold mb-6">
            Analysez vos no-shows en 30 secondes.
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Obtenez un audit flash de vos rendez-vous manqués. Identifiez vos
            créneaux à risque et estimez votre potentiel de récupération.
          </p>
          <Link
            href="/audit"
            className="inline-block bg-gold text-brand-dark px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gold-light transition-colors shadow-card"
          >
            Commencer l&apos;audit gratuit
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-y border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-surface rounded-xl p-6 border border-white/10 shadow-card">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-gold mb-2">
                Rapide
              </h3>
              <p className="text-slate-300">
                Résultats en 30 secondes. Uploadez votre CSV et recevez votre
                analyse instantanément.
              </p>
            </div>
            <div className="bg-surface rounded-xl p-6 border border-white/10 shadow-card">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-gold mb-2">
                Précis
              </h3>
              <p className="text-slate-300">
                Analyse alimentée par l&apos;IA. Détectez vos créneaux à risque
                et obtenez des recommandations personnalisées.
              </p>
            </div>
            <div className="bg-surface rounded-xl p-6 border border-white/10 shadow-card">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-lg font-semibold text-gold mb-2">
                Rentable
              </h3>
              <p className="text-slate-300">
                ROI moyen de 20×. Récupérez des milliers d&apos;euros de CA
                perdu chaque année.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-surface rounded-xl p-8 border border-white/10 shadow-card">
            <p className="text-lg text-slate-300 italic mb-4">
              &quot;Après l&apos;audit PerfIAmatic, nous avons réduit notre taux
              de no-shows de 7,2% à 4,9%. Soit 37 000 € récupérés par an.&quot;
            </p>
            <p className="font-semibold text-gold">
              Cabinet dentaire Lyon
            </p>
          </div>
          <Link
            href="/audit"
            className="inline-block mt-8 text-gold font-semibold hover:text-gold-light transition-colors"
          >
            Tester gratuitement →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-darker border-t border-white/10 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">© 2025 PerfIAmatic</p>
          <a
            href="mailto:contact@perfiamatic.com"
            className="text-slate-400 text-sm hover:text-gold transition-colors"
          >
            contact@perfiamatic.com
          </a>
        </div>
      </footer>
    </div>
  );
}
