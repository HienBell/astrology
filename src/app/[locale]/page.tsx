import { notFound } from "next/navigation";

import { BirthForm } from "@/components/form/birth-form";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { ZodiacRing } from "@/components/visual/zodiac-ring";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);

  const stats = [
    { value: dict.hero.stat1, label: dict.hero.stat1Label },
    { value: dict.hero.stat2, label: dict.hero.stat2Label },
    { value: dict.hero.stat3, label: dict.hero.stat3Label },
  ];

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <Reveal>
              <p className="label-eyebrow text-gold/90">{dict.hero.eyebrow}</p>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="mt-4 font-heading text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
                {dict.hero.title}
                <br />
                <span className="text-gradient-gold italic">
                  {dict.hero.titleAccent}
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-6 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
                {dict.hero.subtitle}
              </p>
            </Reveal>

            <Stagger className="mt-10 flex gap-8" delay={0.3}>
              {stats.map((stat) => (
                <StaggerItem key={stat.label}>
                  <p className="font-heading text-2xl font-semibold text-gold-soft">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {stat.label}
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <Reveal delay={0.2}>
            <ZodiacRing dict={dict} />
          </Reveal>
        </div>
      </section>

      <div className="mx-auto h-px max-w-2xl rule-gold" />

      <section id="form" className="mx-auto max-w-6xl px-5 py-20">
        <BirthForm dict={dict} locale={locale} />
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-8">
        <Reveal inView>
          <h2 className="text-center font-heading text-3xl font-semibold">
            {dict.about.title}
          </h2>
        </Reveal>

        <Stagger className="mt-10 grid gap-5 md:grid-cols-3" inView>
          {[
            { title: dict.about.siderealTitle, body: dict.about.siderealBody },
            { title: dict.about.housesTitle, body: dict.about.housesBody },
            { title: dict.about.limitsTitle, body: dict.about.limitsBody },
          ].map((item) => (
            <StaggerItem key={item.title}>
              <article className="glass h-full rounded-2xl p-6">
                <h3 className="font-heading text-xl font-semibold text-gold-soft">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
