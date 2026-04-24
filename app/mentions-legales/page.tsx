export const metadata = {
  title: "Mentions légales — PerfIAmatic Audit",
};

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-slate-800">
      <h1 className="font-serif text-3xl font-bold mb-2 text-slate-900">Mentions légales</h1>
      <p className="text-sm text-gray-500 mb-10">Dernière mise à jour : 24 avril 2026</p>

      <section className="space-y-3 mb-8">
        <h2 className="font-serif text-xl font-semibold text-slate-900">Éditeur du site</h2>
        <p>
          PerfIAmatic · Mouhamed Ndiaye<br />
          Contact : <a href="mailto:mndiayepro97@gmail.com" className="underline">mndiayepro97@gmail.com</a>
        </p>
        <p className="text-sm text-gray-500">SIREN / statut juridique : [à compléter]</p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="font-serif text-xl font-semibold text-slate-900">Hébergeur de l&apos;application</h2>
        <p>
          Vercel Inc.<br />
          340 S Lemon Ave #4133, Walnut, CA 91789, USA<br />
          Région de déploiement edge : Europe (fra1).
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="font-serif text-xl font-semibold text-slate-900">Hébergeur backend (n8n)</h2>
        <p>
          Hostinger International Ltd.<br />
          61 Lordou Vironos Street, 6023 Larnaca, Cyprus.<br />
          Datacenter : Union européenne.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="font-serif text-xl font-semibold text-slate-900">Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble du contenu de ce site (textes, visuels, logos, code) est protégé
          par le droit d&apos;auteur. Toute reproduction, représentation ou diffusion, totale
          ou partielle, sans autorisation écrite préalable, est interdite.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="font-serif text-xl font-semibold text-slate-900">Médiateur de la consommation</h2>
        <p className="text-sm text-gray-500">[à compléter si applicable]</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-slate-900">Contact</h2>
        <p>
          Pour toute question :&nbsp;
          <a href="mailto:mndiayepro97@gmail.com" className="underline">mndiayepro97@gmail.com</a>
        </p>
      </section>
    </main>
  );
}
