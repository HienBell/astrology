"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DateTime } from "luxon";
import { Loader2, Sparkles } from "lucide-react";

import { PlaceSearch } from "@/components/form/place-search";
import { Reveal } from "@/components/motion/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createProfileId,
  localProfileRepository,
} from "@/lib/profile/local-storage";
import type { Place, Profile } from "@/lib/profile/types";
import type { Dictionary, Locale } from "@/lib/i18n";

/** Used when the visitor does not know their birth time. */
const NOON = "12:00";

interface Errors {
  date?: string;
  time?: string;
  place?: string;
}

export function BirthForm({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [place, setPlace] = useState<Place | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): Errors {
    const next: Errors = {};

    if (!date) next.date = dict.form.required;
    else if (!DateTime.fromISO(date).isValid) next.date = dict.form.invalidDate;

    if (!timeUnknown) {
      if (!time) next.time = dict.form.required;
      else if (!/^\d{2}:\d{2}$/.test(time)) next.time = dict.form.invalidTime;
    }

    if (!place) next.place = dict.form.placeRequired;

    return next;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0 || !place) return;

    setSubmitting(true);

    const profile: Profile = {
      id: createProfileId(),
      name: name.trim(),
      date,
      time: timeUnknown ? NOON : time,
      timeUnknown,
      place,
      createdAt: new Date().toISOString(),
    };

    await localProfileRepository.save(profile);
    await localProfileRepository.setActiveId(profile.id);

    router.push(`/${locale}/reading`);
  }

  // Offset for the chosen place on the chosen date — this is what actually
  // determines the ascendant, so it is worth showing before submitting.
  const offsetLabel =
    place && date
      ? DateTime.fromISO(`${date}T${timeUnknown ? NOON : time || NOON}`, {
          zone: place.timezone,
        }).toFormat("ZZ")
      : null;

  return (
    <Reveal inView className="glass-strong mx-auto w-full max-w-xl rounded-3xl p-7 sm:p-9">
      <div className="mb-7 text-center">
        <h2 className="font-heading text-3xl font-semibold text-foreground">
          {dict.form.title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{dict.form.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Field label={dict.form.name} hint={dict.form.nameHint}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={dict.form.namePlaceholder}
            className="h-11"
            maxLength={60}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={dict.form.date} error={errors.date}>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min="1900-01-01"
              max={DateTime.now().toISODate() ?? undefined}
              className="h-11"
              required
            />
          </Field>

          <Field
            label={dict.form.time}
            error={errors.time}
            hint={timeUnknown ? dict.form.unknownTimeNote : dict.form.timeHint}
          >
            <Input
              type="time"
              value={timeUnknown ? NOON : time}
              onChange={(e) => setTime(e.target.value)}
              disabled={timeUnknown}
              className="h-11 disabled:opacity-50"
            />
          </Field>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={timeUnknown}
            onChange={(e) => setTimeUnknown(e.target.checked)}
            className="size-4 accent-[var(--gold)]"
          />
          {dict.form.unknownTime}
        </label>

        <Field
          label={dict.form.place}
          error={errors.place}
          hint={dict.form.placeHint}
        >
          <PlaceSearch dict={dict} value={place} onSelect={setPlace} />
        </Field>

        {place && (
          <div className="rounded-xl border border-border/70 bg-secondary/25 px-4 py-3">
            <p className="label-eyebrow">{dict.form.timezone}</p>
            <p className="mt-1 font-mono text-sm text-foreground">
              UTC{offsetLabel ?? "—"}
              <span className="ml-2 text-xs text-muted-foreground">
                {place.timezone}
              </span>
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {dict.form.timezoneHint}
            </p>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="glow-gold h-12 w-full rounded-full text-base font-medium"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {dict.form.submitting}
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              {dict.form.submit}
            </>
          )}
        </Button>
      </form>
    </Reveal>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="label-eyebrow">{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
