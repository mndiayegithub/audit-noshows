export const metadata = {
  title: "Politique de confidentialité · PerfIAmatic Audit",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-slate-800">
      <h1 className="font-serif text-3xl font-bold mb-2 text-slate-900">
        Politique de confidentialité
      </h1>
      <p className="text-sm text-gray-500 mb-10">Dernière mise à jour : 8 août 2026</p>

      <section className="space-y-3 mb-8">
        <h2 className="font-serif text-xl font-semibold text-slate-900">Finalité du traitement</h2>
        <p>
          PerfIAmatic Audit fournit un audit automatisé des rendez-vous manqués (no-shows)
          aux cabinets dentaires, à partir d&apos;un export CSV anonymisé de rendez-vous.
          Aucune donnée patient identifiante n&apos;est collectée, traitée ou transmise.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="font-serif text-xl font-semibold text-slate-900">Données collectées</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Export CSV de rendez-vous : date, statut, heure. Aucun nom de patient.</li>
          <li>Nom du cabinet (renseigné par l&apos;utilisateur).</li>
          <li>Chiffre d&apos;affaires moyen par RDV (estimation utilisateur).</li>
          <li>Adresse email (optionnelle, si l&apos;utilisateur souhaite recevoir le rapport).</li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="font-serif text-xl font-semibold text-slate-900">Base légale</h2>
        <p>
          Consentement explicite de l&apos;utilisateur (le dépôt du fichier est volontaire) et
          intérêt légitime du responsable de traitement à fournir le service d&apos;audit.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="font-serif text-xl font-semibold text-slate-900">Durée de conservation</h2>
        <p>
          Le CSV n&apos;est pas conservé : il traverse nos serveurs le temps de l&apos;analyse
          puis est purgé en mémoire à la fin de la requête HTTP. L&apos;email et le nom du
          cabinet sont conservés 12 mois si un rapport a été envoyé, et supprimés sur
          simple demande.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="font-serif text-xl font-semibold text-slate-900">Destinataires</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>n8n (backend d&apos;orchestration, hébergé sur Hostinger, Union européenne).</li>
          <li>Google Places API (uniquement si l&apos;utilisateur lance l&apos;analyse de réputation optionnelle ; seul le nom du cabinet est transmis).</li>
          <li>Calendly (uniquement si l&apos;utilisateur prend rendez-vous).</li>
          <li>Service SMTP d&apos;envoi email (uniquement si l&apos;option d&apos;envoi par email est activée).</li>
          <li>Vercel (hébergement du site et mesure des pages consultées).</li>
          <li>Supabase (base de données de la mesure d&apos;audience, région Irlande, Union européenne).</li>
        </ul>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="font-serif text-xl font-semibold text-slate-900">Mesure d&apos;audience</h2>
        <p>
          Nous regardons comment ce site est utilisé, uniquement pour l&apos;améliorer : pages
          consultées, provenance, étapes du parcours réellement franchies (dépôt d&apos;un
          fichier, lancement d&apos;un audit, téléchargement du rapport, clic vers la prise de
          rendez-vous), erreurs rencontrées et temps de traitement d&apos;un audit.
        </p>
        <p>
          Cette mesure ne collecte ni adresse IP, ni nom, ni adresse email, ni nom de cabinet,
          et rien du fichier que vous déposez. Les statistiques obtenues sont agrégées et ne
          permettent pas de vous identifier.
        </p>
        <p>
          Pour distinguer deux visites, un identifiant aléatoire est gardé dans la mémoire de
          votre onglet (<em>sessionStorage</em>). Ce n&apos;est pas un cookie, et il disparaît
          dès que vous fermez l&apos;onglet. Il n&apos;est rapproché ni de votre identité ni du
          contenu de votre fichier, et il ne sert ni à vous suivre d&apos;un site à l&apos;autre,
          ni à de la publicité.
        </p>
        <p>
          Cette mesure relève de la dispense de consentement prévue par la CNIL pour
          l&apos;audience strictement nécessaire au fonctionnement et à l&apos;amélioration du
          service. C&apos;est pourquoi aucun bandeau de consentement ne vous est présenté. Les
          données sont gardées 12 mois, puis supprimées. Vous pouvez vous y opposer en écrivant
          à&nbsp;
          <a href="mailto:mndiayepro97@gmail.com" className="underline">mndiayepro97@gmail.com</a>.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="font-serif text-xl font-semibold text-slate-900">Vos droits</h2>
        <p>
          Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
          d&apos;effacement, de portabilité et d&apos;opposition sur les données vous concernant.
          Pour exercer ces droits, écrivez à&nbsp;
          <a href="mailto:mndiayepro97@gmail.com" className="underline">mndiayepro97@gmail.com</a>.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="font-serif text-xl font-semibold text-slate-900">
          Art. 9 RGPD · Données de santé
        </h2>
        <p>
          Les métadonnées de rendez-vous (date, statut, heure) transmises par l&apos;utilisateur
          ne constituent pas des données de santé identifiantes dès lors qu&apos;aucun nom
          patient, numéro de sécurité sociale ou identifiant unique n&apos;est inclus dans
          l&apos;export. L&apos;utilisateur s&apos;engage à anonymiser son export CSV avant upload.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="font-serif text-xl font-semibold text-slate-900">
          Délégué à la protection des données (DPO)
        </h2>
        <p>
          PerfIAmatic · Mansour Ndiaye · <a href="mailto:mndiayepro97@gmail.com" className="underline">mndiayepro97@gmail.com</a>
        </p>
      </section>
    </main>
  );
}
