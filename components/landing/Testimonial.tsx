// components/landing/Testimonial.tsx
// RSC — pure DOM. Avatar is a pastille, not a real photo (no signed consent yet).

export default function Testimonial() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <figure className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-8 md:flex-row md:items-center md:gap-8">
        <div
          aria-hidden
          className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-primaryDark font-serif text-xl text-white"
        >
          LM
        </div>
        <div>
          <blockquote className="italic text-slate-700 md:text-lg">
            “On savait que les no-shows nous coûtaient. On ne savait pas combien.
            L&apos;audit nous a chiffré 15 k€ de perte annuelle — on a pu enfin
            prioriser les bons leviers.”
          </blockquote>
          <figcaption className="mt-4 text-sm text-slate-500">
            <span className="font-medium text-slate-900">Dr. Laurent M.</span> — Cabinet d&apos;omnipratique, Lyon
          </figcaption>
        </div>
      </figure>
    </section>
  );
}
