import { notFound } from "next/navigation";

import { BirthForm } from "@/components/form/birth-form";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import {
  CelestialScene,
  type CelestialVariant,
} from "@/components/visual/celestial-scene";
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
      <section className="mx-auto min-h-[calc(100svh-4rem)] max-w-7xl px-5 pb-20 pt-12 sm:pt-20 lg:flex lg:items-center">
        <div className="grid w-full items-center gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
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

          <CelestialScene variant="solar" priority />
        </div>
      </section>

      <div className="mx-auto h-px max-w-2xl rule-gold" />

      <section
        id="form"
        className="mx-auto max-w-7xl px-5 py-20 sm:py-28"
      >
        <div className="grid items-center gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <CelestialScene variant="saturn" />
          <BirthForm dict={dict} locale={locale} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-8 pt-12">
        <Reveal inView>
          <h2 className="text-center font-heading text-3xl font-semibold">
            {dict.about.title}
          </h2>
        </Reveal>

        <div className="mt-6 space-y-12 sm:space-y-20">
          {(
            [
              {
                title: dict.about.siderealTitle,
                body: dict.about.siderealBody,
                visual: "neptune",
              },
              {
                title: dict.about.housesTitle,
                body: dict.about.housesBody,
                visual: "moon",
              },
              {
                title: dict.about.limitsTitle,
                body: dict.about.limitsBody,
                visual: "jupiter",
              },
            ] satisfies Array<{
              title: string;
              body: string;
              visual: CelestialVariant;
            }>
          ).map((item, index) => (
            <div
              key={item.title}
              className="grid min-h-[520px] items-center gap-4 md:grid-cols-2 md:gap-12"
            >
              <CelestialScene
                variant={item.visual}
                className={index % 2 ? "md:order-2" : undefined}
              />
              <Reveal inView className={index % 2 ? "md:order-1" : undefined}>
                <article className="glass-strong rounded-3xl p-7 sm:p-9">
                  <p className="label-eyebrow text-gold/75">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 font-heading text-3xl font-semibold text-gold-soft">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    {item.body}
                  </p>
                </article>
              </Reveal>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
