"use client";

import Link from "next/link";
import { DateTime } from "luxon";
import { AlertTriangle, ChevronLeft, ChevronRight, Moon, Sparkles } from "lucide-react";

import { DashaTimeline } from "@/components/astro/dasha-timeline";
import { NorthIndianChart } from "@/components/astro/north-indian-chart";
import { PlanetTable } from "@/components/astro/planet-table";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { DomainCard } from "@/components/reading/domain-card";
import { OverallDial } from "@/components/reading/overall-dial";
import { Button } from "@/components/ui/button";
import { NAKSHATRAS, RASHIS } from "@/lib/astro/constants";
import { DOMAINS } from "@/lib/astro/types";
import { formatDegree } from "@/lib/i18n/present";
import { shiftLocalDate, todayIn } from "@/lib/geo/timezone";
import { useInterpretation } from "@/lib/reading/use-interpretation";
import { useReading } from "@/lib/reading/use-reading";
import type { Dictionary, Locale } from "@/lib/i18n";

export function ReadingView({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const { profile, reading, date, setDate, loading, error } = useReading();
  const { interpretation, status } = useInterpretation(reading, dict, locale);

  if (loading) {
    return <CentredNote>{dict.common.loading}</CentredNote>;
  }

  if (!profile) {
    return (
      <CentredNote>
        <p className="mb-5 text-muted-foreground">{dict.profile.empty}</p>
        <Button
          className="rounded-full"
          render={<Link href={`/${locale}`}>{dict.nav.newChart}</Link>}
        />
      </CentredNote>
    );
  }

  if (error || !reading || !date) {
    return (
      <CentredNote>
        <AlertTriangle className="mx-auto mb-4 size-7 text-[var(--band-below)]" />
        <p className="text-muted-foreground">{error ?? dict.common.error}</p>
      </CentredNote>
    );
  }

  const { timezone } = profile.place;
  const isToday = date === todayIn(timezone);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-10">
      {/* --- Header: who and when ------------------------------------ */}
      <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="label-eyebrow text-gold/90">{dict.reading.todayTitle}</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold">
            {profile.name || dict.chart.title}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {DateTime.fromISO(profile.date)
              .setLocale(locale)
              .toFormat("dd LLLL yyyy")}
            {!profile.timeUnknown && ` · ${profile.time}`}
            <span className="mx-2 opacity-40">·</span>
            <span className="line-clamp-1 inline max-w-xs align-bottom">
              {profile.place.label.split(",")[0]}
            </span>
          </p>
        </div>

        <DateNav
          dict={dict}
          locale={locale}
          date={date}
          timezone={timezone}
          isToday={isToday}
          onChange={setDate}
        />
      </Reveal>

      {/* --- Overall ------------------------------------------------- */}
      <Reveal delay={0.05}>
        <OverallDial
          value={reading.overall}
          dict={dict}
          interpretation={
            status === "unavailable"
              ? dict.reading.interpretationFallback
              : interpretation?.overall
          }
        />
      </Reveal>

      {/* --- The five domains ---------------------------------------- */}
      <Stagger className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3" delay={0.1}>
        {DOMAINS.map((domain, i) => (
          <StaggerItem key={domain} className="h-full">
            <DomainCard
              dict={dict}
              index={i}
              score={reading.domains[domain]}
              interpretation={
                status === "unavailable"
                  ? dict.reading.interpretationFallback
                  : interpretation?.domains[domain]
              }
            />
          </StaggerItem>
        ))}

        {/* Panchanga rounds out the grid to six cells on large screens. */}
        <StaggerItem className="h-full">
          <PanchangaCard dict={dict} reading={reading} />
        </StaggerItem>
      </Stagger>

      {/* --- Chart + dasha ------------------------------------------- */}
      <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Reveal inView>
          <Panel title={dict.chart.title} subtitle={dict.chart.subtitle}>
            <NorthIndianChart
              chart={reading.chart}
              dict={dict}
              transits={reading.transits}
            />
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <Fact
                label={dict.chart.lagna}
                value={`${dict.rashis[reading.chart.ascendant.rashi]} ${formatDegree(reading.chart.ascendant.degreeInRashi)}`}
              />
              <Fact
                label={dict.chart.lagnaLord}
                value={dict.grahas[RASHIS[reading.chart.ascendant.rashi].lord]}
              />
              <Fact
                label={dict.chart.moonSign}
                value={dict.rashis[reading.chart.moonRashi]}
              />
              <Fact
                label={dict.chart.ayanamsa}
                value={formatDegree(reading.chart.ayanamsa)}
              />
            </dl>
          </Panel>
        </Reveal>

        <Reveal inView delay={0.08}>
          <Panel title={dict.dasha.title} subtitle={dict.dasha.subtitle}>
            <DashaTimeline
              chart={reading.chart}
              active={reading.activeDasha}
              at={new Date()}
              dict={dict}
              locale={locale}
            />
          </Panel>
        </Reveal>
      </div>

      <Reveal inView className="mt-6">
        <Panel title={dict.chart.tableGraha}>
          <PlanetTable chart={reading.chart} dict={dict} />
        </Panel>
      </Reveal>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function DateNav({
  dict,
  locale,
  date,
  timezone,
  isToday,
  onChange,
}: {
  dict: Dictionary;
  locale: Locale;
  date: string;
  timezone: string;
  isToday: boolean;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="size-9 rounded-full"
        onClick={() => onChange(shiftLocalDate(date, -1, timezone))}
        aria-label={dict.reading.prevDay}
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="min-w-[9.5rem] text-center">
        <p className="text-sm font-medium">
          {DateTime.fromISO(date).setLocale(locale).toFormat("dd LLL yyyy")}
        </p>
        {!isToday && (
          <button
            type="button"
            onClick={() => onChange(todayIn(timezone))}
            className="text-[0.7rem] text-gold underline underline-offset-4"
          >
            {dict.reading.today}
          </button>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="size-9 rounded-full"
        onClick={() => onChange(shiftLocalDate(date, 1, timezone))}
        aria-label={dict.reading.nextDay}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

function PanchangaCard({
  dict,
  reading,
}: {
  dict: Dictionary;
  reading: NonNullable<ReturnType<typeof useReading>["reading"]>;
}) {
  const rows = [
    {
      label: dict.panchanga.tithi,
      value: `${reading.tithi.index} · ${
        reading.tithi.paksha === "shukla"
          ? dict.panchanga.shukla
          : dict.panchanga.krishna
      }`,
    },
    {
      label: dict.panchanga.moonNakshatra,
      value: `${NAKSHATRAS[reading.moonNakshatra.index]} · ${dict.chart.tablePada} ${reading.moonNakshatra.pada}`,
    },
    {
      label: dict.panchanga.moonSign,
      value: dict.rashis[reading.moonRashi],
    },
  ];

  return (
    <article className="glass flex h-full flex-col rounded-2xl p-6">
      <header className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-gold/12">
          <Moon className="size-[18px] text-gold" />
        </span>
        <h3 className="font-heading text-xl font-semibold">
          {dict.panchanga.title}
        </h3>
      </header>

      <dl className="mt-5 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-3">
            <dt className="text-xs text-muted-foreground">{row.label}</dt>
            <dd className="text-right text-sm">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto pt-5">
        <p className="label-eyebrow mb-2">{dict.sadeSati.title}</p>
        {reading.sadeSati.active && reading.sadeSati.phase ? (
          <>
            <p className="flex items-center gap-1.5 text-sm text-[var(--band-below)]">
              <Sparkles className="size-3.5" />
              {dict.sadeSati[reading.sadeSati.phase]}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {dict.sadeSati.explain}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{dict.sadeSati.inactive}</p>
        )}
      </div>
    </article>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass h-full rounded-2xl p-6">
      <h2 className="font-heading text-2xl font-semibold">{title}</h2>
      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label-eyebrow">{label}</dt>
      <dd className="mt-0.5 text-foreground/90">{value}</dd>
    </div>
  );
}

function CentredNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-5 py-32 text-center">{children}</div>
  );
}
