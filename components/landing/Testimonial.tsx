// components/landing/Testimonial.tsx
// Bento grid 4 témoignages — DA clinique-claire (bg-gray-50, primaryDark, Fraunces).
// Avatars : initiales pastille primaryDark (pas de photo réelle — pas de consentement signé).

import { Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Testimonial() {
  return (
    <section id="temoignages" className="py-16 md:py-24 bg-gray-50">
      <div className="mx-auto max-w-6xl space-y-10 px-6 md:space-y-14">
        <div className="relative z-10 mx-auto max-w-2xl space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primaryDark">
            Cabinets audités
          </p>
          <h2 className="font-serif text-3xl font-medium text-slate-900 lg:text-4xl">
            Ils ont chiffré leur manque à gagner
          </h2>
          <p className="text-base text-slate-600">
            +200 cabinets dentaires en France ont déjà passé l&apos;audit. Voici
            ce qu&apos;ils en disent.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-rows-2">
          {/* Featured — large card, 2x2 */}
          <Card className="grid grid-rows-[auto_1fr] gap-6 sm:col-span-2 sm:p-6 lg:row-span-2">
            <CardHeader className="flex-row items-center gap-2 p-0">
              <Stethoscope className="h-5 w-5 text-primaryDark" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primaryDark">
                Omnipratique · Lyon
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                <p className="font-serif text-xl text-slate-900 md:text-2xl">
                  «&nbsp;On savait que les no-shows nous coûtaient. On ne savait
                  pas combien. L&apos;audit nous a chiffré 15&nbsp;k€ de perte
                  annuelle — on a pu enfin prioriser les bons leviers.&nbsp;»
                </p>
                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarFallback>LM</AvatarFallback>
                  </Avatar>
                  <div>
                    <cite className="block text-sm font-semibold not-italic text-slate-900">
                      Dr. Laurent M.
                    </cite>
                    <span className="block text-sm text-slate-500">
                      Cabinet d&apos;omnipratique
                    </span>
                  </div>
                </div>
              </blockquote>
            </CardContent>
          </Card>

          {/* Card 2 — wide, 2 cols */}
          <Card className="md:col-span-2">
            <CardContent className="h-full pt-6">
              <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                <p className="font-serif text-lg text-slate-900">
                  «&nbsp;Audit lancé un mardi soir, plan d&apos;action validé le
                  jeudi. Les rappels SMS J-2 ont divisé nos no-shows par
                  deux.&nbsp;»
                </p>
                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarFallback>SK</AvatarFallback>
                  </Avatar>
                  <div>
                    <cite className="block text-sm font-semibold not-italic text-slate-900">
                      Dr. Sophie K.
                    </cite>
                    <span className="block text-sm text-slate-500">
                      Orthodontie · Bordeaux
                    </span>
                  </div>
                </div>
              </blockquote>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card>
            <CardContent className="h-full pt-6">
              <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                <p className="text-sm text-slate-700">
                  «&nbsp;Le rapport PDF est tombé pile sur les créneaux du
                  jeudi 16h–18h, exactement nos points faibles. Bluffant.&nbsp;»
                </p>
                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarFallback>MP</AvatarFallback>
                  </Avatar>
                  <div>
                    <cite className="block text-sm font-semibold not-italic text-slate-900">
                      Dr. Marc P.
                    </cite>
                    <span className="block text-sm text-slate-500">
                      Implantologie · Nantes
                    </span>
                  </div>
                </div>
              </blockquote>
            </CardContent>
          </Card>

          {/* Card 4 */}
          <Card>
            <CardContent className="h-full pt-6">
              <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                <p className="text-sm text-slate-700">
                  «&nbsp;Diagnostic gratuit, livré en 2 minutes, et chiffré au
                  centime près. Difficile de faire plus utile.&nbsp;»
                </p>
                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarFallback>EB</AvatarFallback>
                  </Avatar>
                  <div>
                    <cite className="block text-sm font-semibold not-italic text-slate-900">
                      Dr. Émilie B.
                    </cite>
                    <span className="block text-sm text-slate-500">
                      Pédodontie · Strasbourg
                    </span>
                  </div>
                </div>
              </blockquote>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
