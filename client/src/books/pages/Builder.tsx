import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import {
  AGE_RANGES, LIMITS, PHOTO_TYPES, PRINT_FORMAT_IDS, ROLES, SALE_SCOPE, STORIES, STYLES, TONES, emptyBrief, euro, extraCount, storyTitle, validateBrief,
  type Brief, type Character, type Errors, type FormatId, type Role, type StoryId, type StyleId,
} from "@shared/books/catalog";
import { Cover, GalleryArt, SceneArt } from "../components/Art";
import { Price, SampleReader } from "../components/Book";
import { Header } from "../components/Chrome";
import { api, ApiError, clientQuote, useShop, useTitle, type ShopInfo } from "../lib/api";

const formatLabel = (id?: FormatId) => id === "hardback" ? "Hardcover" : id === "softcover" ? "Softcover" : "No format chosen";

const STEPS = ["Story", "Characters", "Photos and details", "Art", "Cover and review"];

function Err({ id, msg }: { id: string; msg?: string }) {
  return msg ? <p className="err" id={id} role="alert">{msg}</p> : null;
}

function Text({ id, label, value, onChange, max, err, hint, optional, multiline, placeholder, type = "text", autoComplete = "off" }: {
  id: string; label: ReactNode; value?: string; onChange: (v: string) => void; max: number; err?: string; hint?: ReactNode;
  optional?: boolean; multiline?: boolean; placeholder?: string; type?: string; autoComplete?: string;
}) {
  const desc = [hint ? `${id}-h` : "", err ? `${id}-e` : ""].filter(Boolean).join(" ") || undefined;
  const props = { id, value: value ?? "", maxLength: max, placeholder, "aria-invalid": !!err, "aria-describedby": desc, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value) };
  return (
    <div className="field">
      <label htmlFor={id}>{label} {optional ? <span className="opt">(optional)</span> : null}</label>
      {multiline ? <textarea className="textarea" {...props} /> : <input className="input" type={type} autoComplete={autoComplete} {...props} />}
      {hint ? <p className="hint" id={`${id}-h`}>{hint}</p> : null}
      <Err id={`${id}-e`} msg={err} />
    </div>
  );
}

function Radio<T extends string>({ label, value, options, onChange, render, className = "pills", item = "pill", errId }: {
  label: string; value?: T; options: readonly T[]; onChange: (v: T) => void; render: (v: T) => ReactNode; className?: string; item?: string; errId?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const idx = Math.max(0, options.indexOf(value as T));
  return (
    <div role="radiogroup" aria-label={label} className={className} aria-describedby={errId}>
      {options.map((o, i) => (
        <button key={o} ref={(el) => { refs.current[i] = el; }} type="button" role="radio" aria-checked={value === o} tabIndex={i === idx ? 0 : -1} className={item}
          onClick={() => onChange(o)}
          onKeyDown={(e) => {
            const n = options.length;
            const j = e.key === "ArrowRight" || e.key === "ArrowDown" ? (i + 1) % n : e.key === "ArrowLeft" || e.key === "ArrowUp" ? (i - 1 + n) % n : -1;
            if (j >= 0) { e.preventDefault(); onChange(options[j]); refs.current[j]?.focus(); }
          }}>
          {render(o)}
        </button>
      ))}
    </div>
  );
}

const newId = () => `c-${Math.random().toString(36).slice(2, 10)}`;
const roleLabel = (r: Role) => ROLES.find((x) => x.id === r)!.label;

function Uploader({ ch, onChange, onError, err }: { ch: Character; onChange: (p: Character["photo"]) => void; onError: (m: string | undefined) => void; err?: string }) {
  const [pct, setPct] = useState<number | null>(null);
  const [v, setV] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const pick = (file?: File) => {
    if (!file) return;
    onError(undefined);
    if (/heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name)) { onError("HEIC photos can't be processed yet. On iPhone, share the photo as JPEG (or set Camera > Formats > Most Compatible)."); return; }
    if (!(PHOTO_TYPES as readonly string[]).includes(file.type)) { onError("Please use a JPG, PNG or WebP photo."); return; }
    if (file.size > LIMITS.photoBytes) { onError("That photo is over 12 MB. Could you try a smaller one?"); return; }
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/books/draft/photo?character=${encodeURIComponent(ch.id)}`);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => e.lengthComputable && setPct(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      setPct(null);
      const body = JSON.parse(xhr.responseText || "{}");
      if (xhr.status >= 200 && xhr.status < 300) { onChange(body.photo); setV(Date.now()); }
      else onError(body.error || "Upload failed. Please try again.");
    };
    xhr.onerror = () => { setPct(null); onError("Upload failed. Check your connection and try again."); };
    setPct(0);
    xhr.send(file);
  };
  const remove = async () => {
    await api(`/api/books/draft/photo?character=${encodeURIComponent(ch.id)}`, { method: "DELETE" }).catch(() => undefined);
    onChange(null);
  };
  const id = `ph-${ch.id}`;
  return (
    <div>
      <div className="uploader">
        {ch.photo ? <img className="thumb" src={`/api/books/draft/photo?character=${encodeURIComponent(ch.id)}&v=${v || ch.photo.id}`} alt={`Reference photo for ${ch.name || "this character"}`} /> : <div className="thumb" aria-hidden="true">No photo</div>}
        <div>
          <input ref={input} id={id} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} aria-describedby={`${id}-h ${id}-e`} />
          <div className="toolbar">
            <label htmlFor={id} className="btn btn-line btn-sm" style={{ cursor: "pointer" }}>{ch.photo ? "Replace photo" : "Add a photo"}</label>
            {ch.photo ? <button type="button" className="btn-link" onClick={remove}>Remove</button> : null}
          </div>
          {pct !== null ? <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Uploading"><div style={{ width: `${pct}%` }} /></div> : null}
          <p className="hint" id={`${id}-h`}>{ch.photo ? `Added (${Math.round(ch.photo.size / 1024)} KB). Location data removed.` : "JPG, PNG or WebP, up to 12 MB. Optional."}</p>
        </div>
      </div>
      <Err id={`${id}-e`} msg={err} />
    </div>
  );
}

export default function Builder() {
  useTitle("Create their book · Little Plot Books");
  const info = useShop();
  const params = new URLSearchParams(location.search);
  const [step, setStepRaw] = useState(() => Math.min(5, Math.max(0, Number(params.get("step")) || 0)));
  const [b, setB] = useState<Brief>(emptyBrief());
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [photoErr, setPhotoErr] = useState<Record<string, string | undefined>>({});
  const [notice, setNotice] = useState<{ kind: "info" | "err" | "ok"; text: ReactNode } | null>(params.get("cancelled") ? { kind: "info", text: "Payment was cancelled. Nothing was charged, and everything you entered is still here." } : null);
  const [reading, setReading] = useState<StoryId | null>(null);
  const [paying, setPaying] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [flash, setFlash] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    api<{ brief: Brief | null; order: { status: string; url: string } | null }>("/api/books/draft")
      .then((r) => {
        let next = r.brief ?? emptyBrief();
        const route = params.get("route");
        const story = params.get("story") as StoryId | null;
        const format = params.get("format");
        if (format === "softcover" || format === "hardback") next = { ...next, format };
        if (route === "preset" || route === "custom") { next = { ...next, route }; if (!params.get("step")) setStepRaw(1); }
        if (story && STORIES.some((s) => s.id === story)) next = { ...next, route: "preset", story };
        setB(next);
        if (r.order && !["awaiting_payment", "payment_failed", "cancelled"].includes(r.order.status)) setNotice({ kind: "ok", text: <>This book has already been ordered. <a href={r.order.url}>View your order</a>.</> });
      })
      .catch(() => setNotice({ kind: "err", text: "We couldn't load your saved answers. You can still carry on." }))
      .finally(() => setLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStep = useCallback((n: number) => {
    setStepRaw(n);
    const u = new URL(location.href);
    u.searchParams.set("step", String(n));
    ["cancelled", "route", "story", "format"].forEach((k) => u.searchParams.delete(k));
    history.replaceState(null, "", u.toString());
  }, []);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    heading.current?.focus();
    window.scrollTo({ top: 0 });
  }, [step]);

  const save = useCallback((brief: Brief, forStep?: number) => api<{ brief: Brief; errors: Errors }>("/api/books/draft", { method: "PUT", json: { brief, step: forStep } }), []);
  const update = (fn: (x: Brief) => Brief, clear: string[] = []) => {
    setB((prev) => {
      const next = fn(prev);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => save(next).catch(() => undefined), 500);
      return next;
    });
    if (clear.length) setErrors((e) => { const n = { ...e }; for (const k of clear) delete n[k]; return n; });
  };
  const setChar = (i: number, patch: Partial<Character>) => update((x) => ({ ...x, characters: x.characters.map((c, j) => (j === i ? { ...c, ...patch } : c)) }), Object.keys(patch).map((k) => `characters.${i}.${k}`));
  const addChar = (role: Role) => { update((x) => ({ ...x, characters: [...x.characters, { id: newId(), role }] })); setFlash((n) => n + 1); };
  const removeChar = (i: number) => { update((x) => ({ ...x, characters: x.characters.filter((_, j) => j !== i) })); setFlash((n) => n + 1); };

  const enabled: FormatId[] = info?.formats.length ? info.formats.map((f) => f.id) : [...PRINT_FORMAT_IDS];
  const q = info ? clientQuote(info, b.format, extraCount(b)) : null;

  const next = async () => {
    const nextBrief = step === 4 && !b.format ? { ...b, format: enabled[0] } : b;
    const errs = validateBrief(nextBrief, step, enabled);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const k = Object.keys(errs)[0];
      setTimeout(() => (document.getElementById(k.replace(/\./g, "-")) ?? document.getElementById(`${k.replace(/\./g, "-")}-e`))?.focus(), 0);
      return;
    }
    clearTimeout(timer.current);
    try {
      const r = await save(nextBrief, step);
      if (Object.keys(r.errors).length) { setErrors(r.errors); return; }
      if (nextBrief !== b) setB(nextBrief);
      setStep(step + 1);
    } catch (e) { setNotice({ kind: "err", text: e instanceof Error ? e.message : "We couldn't save that. Please try again." }); }
  };

  const pay = async (method: string) => {
    const errs = method === "cart"
      ? Object.assign({}, ...[1, 2, 3, 4].map((n) => validateBrief(b, n, enabled)))
      : validateBrief(b, undefined, enabled);
    if (Object.keys(errs).length) { setErrors(errs); setNotice({ kind: "err", text: "A few details are missing. Use the Edit links to fix them." }); return; }
    setPaying(method);
    setNotice(null);
    try {
      clearTimeout(timer.current);
      await save(b);
      if (method === "cart") {
        await api("/api/books/cart", { method: "POST", json: { action: "add" } });
        location.assign("/books/cart");
        return;
      }
      const r = await api<{ url: string }>("/api/books/checkout", { method: "POST", json: { method } });
      location.assign(r.url);
    } catch (e) {
      setPaying(null);
      if (e instanceof ApiError && e.body.errors) { setErrors(e.body.errors as Errors); setNotice({ kind: "err", text: "A few details are missing. Use the Edit links to fix them." }); }
      else if (e instanceof ApiError && e.body.orderUrl) setNotice({ kind: "info", text: <>{e.message} <a href={String(e.body.orderUrl)}>View the order</a>.</> });
      else setNotice({ kind: "err", text: `${e instanceof Error ? e.message : "Checkout didn't start."} Your details are saved, so you can try again.` });
    }
  };

  const reset = async () => {
    await api("/api/books/draft", { method: "DELETE" }).catch(() => undefined);
    setB(emptyBrief()); setErrors({}); setConfirmReset(false); setStep(0);
    setNotice({ kind: "ok", text: "All cleared, photos included." });
  };

  const lead = b.characters[0];
  const title = b.route === "preset" && b.story ? storyTitle(b.story, lead?.name || "Your child") : b.route === "custom" ? `${lead?.name || "Your child"}’s own story` : "Your book";
  const summary = (
    <div className="side-card">
      <strong>{title}</strong>
      <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 14.5, color: "var(--ink-2)" }}>
        <li>{b.route === "custom" ? "Dream up a story" : b.route === "preset" ? "Pick a story" : "Route not chosen"}</li>
        <li>{b.characters.filter((c) => c.name).map((c) => c.name).join(", ") || "No characters yet"}</li>
        {b.style ? <li>{STYLES.find((s) => s.id === b.style)?.name}</li> : null}
        {b.format && q ? <li>{q.format.label}</li> : null}
      </ul>
      {q ? (
        <div className="lines" key={flash} aria-live="polite">
          <div><span>Book{b.format ? "" : " (from)"}</span><Price cents={q.bookCents} was={q.wasCents} /></div>
          {q.extras ? <div className="flash"><span>{q.extras} extra character{q.extras > 1 ? "s" : ""}</span><span>{euro(q.extrasCents)}</span></div> : null}
          {q.shippingCents ? <div><span>Shipping</span><span>{euro(q.shippingCents)}</span></div> : null}
          <div className="total"><span>Total</span><span>{euro(q.totalCents)}</span></div>
          {q.wasCents ? <p className="sale-note">{SALE_SCOPE}</p> : null}
        </div>
      ) : null}
    </div>
  );

  if (!loaded) return (<><Header info={info} minimal /><main className="wrap builder"><p aria-live="polite">Loading your book…</p></main></>);

  return (
    <>
      <a className="skip" href="#main">Skip to the form</a>
      <Header info={info} minimal />
      <main id="main" className="wrap builder">
        {step > 0 ? (
          <nav aria-label="Progress">
            <ol className="steps-bar">
              {STEPS.map((t, i) => <li key={t} className={i + 1 < step ? "done" : i + 1 === step ? "now" : ""} aria-current={i + 1 === step ? "step" : undefined}><span>{t}</span><span className="sr-only">{`Step ${i + 1} of 5${i + 1 < step ? ", done" : ""}`}</span></li>)}
            </ol>
          </nav>
        ) : null}
        {notice ? <div className={`note note-${notice.kind}`} role="status">{notice.text}</div> : null}
        <div className="b-grid">
          <div key={step} className="panel">
            {step === 0 ? (
              <>
                <h1 ref={heading} tabIndex={-1}>How would you like to start?</h1>
                <p className="intro">Both options make a printed book starring your child. You’ll check a private proof before we print, and the approved PDF is included.</p>
                <div className="choice-grid two book-route-picker">
                  <button type="button" className="choice book-route" onClick={() => { update((x) => ({ ...x, route: "preset" })); setStep(1); }}>
                    <SceneArt story="sock-dragon" beat={0} priority />
                    <strong>Pick a story</strong>
                    <span className="sub">Choose one of five illustrated adventures and make it theirs.</span>
                  </button>
                  <button type="button" className="choice book-route" onClick={() => { update((x) => ({ ...x, route: "custom" })); setStep(1); }}>
                    <SceneArt story="moonlight-delivery" beat={3} priority />
                    <strong>Dream up a story</strong>
                    <span className="sub">Tell us your idea in a few lines. We’ll write the plot.</span>
                  </button>
                </div>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <h1 ref={heading} tabIndex={-1}>{b.route === "custom" ? "Tell us the idea" : "Choose the story"}</h1>
                <div className="toolbar" style={{ marginTop: 8 }}>
                  <span className="muted small">{b.route === "custom" ? "Dream up a story" : "Pick a story"}</span>
                  <button type="button" className="btn-link" onClick={() => { update((x) => ({ ...x, route: x.route === "custom" ? "preset" : "custom" })); }}>Switch to {b.route === "custom" ? "Pick a story" : "Dream up a story"}</button>
                </div>
                <Err id="route-e" msg={errors.route} />
                {b.route !== "custom" ? (
                  <fieldset className="field">
                    <legend className="sr-only">Story</legend>
                    <Radio<StoryId> label="Story" value={b.story} options={STORIES.map((s) => s.id)} className="choice-grid" item="choice" errId={errors.story ? "story-e" : undefined}
                      onChange={(v) => update((x) => ({ ...x, story: v }), ["story"])}
                      render={(id) => {
                        const s = STORIES.find((x) => x.id === id)!;
                        return (
                          <span className="story-choice">
                            <Cover story={id} name={lead?.name || "Your child"} label="" />
                            <span style={{ display: "grid", gap: 4 }}>
                              <span className="tag">Selected</span>
                              <strong style={{ fontSize: 19 }}>{storyTitle(id, lead?.name || s.sampleTitle.split(" ")[0])}</strong>
                              <span className="sub">{s.hook}</span>
                              <span className="small muted">{s.ages}</span>
                            </span>
                          </span>
                        );
                      }} />
                    <Err id="story-e" msg={errors.story} />
                    {b.story ? <p className="note note-plain">Selected: <strong>{storyTitle(b.story, lead?.name || "your child")}</strong>. {STORIES.find((s) => s.id === b.story)!.blurb} <button type="button" className="btn-link" onClick={() => setReading(b.story!)}>Look inside the sample</button></p> : null}
                  </fieldset>
                ) : (
                  <>
                    <p className="intro">No need to write a plot. A few words for each is plenty, and only the first one is required.</p>
                    <Text id="custom-happen" label="What would you like to happen?" multiline max={LIMITS.long} value={b.custom?.happen} err={errors["custom.happen"]}
                      onChange={(v) => update((x) => ({ ...x, custom: { ...x.custom, happen: v } }), ["custom.happen"])} placeholder="e.g. She and the cat build a rocket from cardboard boxes and fly to Granny’s for tea." />
                    <Text id="custom-where" label="Where does it take place?" optional max={LIMITS.medium} value={b.custom?.where} err={errors["custom.where"]} onChange={(v) => update((x) => ({ ...x, custom: { ...x.custom, where: v } }))} placeholder="e.g. Our back garden in Cork, then outer space" />
                    <fieldset className="field">
                      <legend>What kind of story? <span className="opt">(optional)</span></legend>
                      <Radio label="Tone" value={b.custom?.tone} options={TONES} onChange={(v) => update((x) => ({ ...x, custom: { ...x.custom, tone: v } }))} render={(v) => v} />
                    </fieldset>
                    <Text id="custom-include" label="Anything you’d love to see in it?" optional multiline max={LIMITS.long} value={b.custom?.include} err={errors["custom.include"]} onChange={(v) => update((x) => ({ ...x, custom: { ...x.custom, include: v } }))} placeholder="e.g. Her red wellies, the swing in the garden, a picnic with jam sandwiches" />
                    <Text id="custom-thatsMe" label={<>What would make them say, “That’s me!”?</>} optional multiline max={LIMITS.medium} value={b.custom?.thatsMe} err={errors["custom.thatsMe"]} onChange={(v) => update((x) => ({ ...x, custom: { ...x.custom, thatsMe: v } }))} placeholder="e.g. She always counts to three before she jumps" />
                    {b.custom?.happen ? <p className="note note-plain"><strong>Your idea:</strong> {b.custom.happen}{b.custom.where ? ` Set in ${b.custom.where}.` : ""}{b.custom.tone ? ` ${b.custom.tone}.` : ""}</p> : null}
                  </>
                )}
              </>
            ) : null}

            {step === 2 ? (
              <>
                <h1 ref={heading} tabIndex={-1}>Who’s in the story?</h1>
                <p className="intro">Start with the star. Then add family, friends, pets or made-up characters for {info ? euro(info.extraCharacterCents) : "€5"} each.</p>
                <Err id="characters-e" msg={errors.characters} />
                {b.characters.map((c, i) => (
                  <section className="char" key={c.id} aria-labelledby={`ch-${c.id}`}>
                    <div className="char-head">
                      <h3 id={`ch-${c.id}`}>{i === 0 ? "The star of the story" : `${roleLabel(c.role)} ${i}`}{i > 0 && info ? <span className="opt small"> · +{euro(info.extraCharacterCents)}</span> : null}</h3>
                      {i > 0 ? <button type="button" className="btn-link" onClick={() => removeChar(i)}>Remove</button> : null}
                    </div>
                    {i === 0 ? (
                      <fieldset className="field" style={{ marginTop: 10 }}>
                        <legend className="small">The star is</legend>
                        <Radio label="The star is" value={c.role} options={["child", "adult", "pet"] as Role[]} onChange={(v) => setChar(i, { role: v })} render={(v) => roleLabel(v)} />
                      </fieldset>
                    ) : null}
                    <div className="row2">
                      <Text id={`characters-${i}-name`} label={c.role === "pet" ? "Pet’s name" : i === 0 ? "First name or nickname" : "Name"} max={LIMITS.name} value={c.name} err={errors[`characters.${i}.name`]} onChange={(v) => setChar(i, { name: v })} hint={i === 0 ? "Exactly as it should appear on the cover." : undefined} />
                      {c.role === "pet" ? (
                        <Text id={`characters-${i}-species`} label="What kind of animal?" max={LIMITS.short} value={c.species} err={errors[`characters.${i}.species`]} onChange={(v) => setChar(i, { species: v })} placeholder="e.g. Jack Russell, tabby cat, rabbit" />
                      ) : (
                        <div className="field">
                          <label htmlFor={`age-${c.id}`}>Age range <span className="opt">(optional)</span></label>
                          <select id={`age-${c.id}`} className="select" value={c.ageRange ?? ""} onChange={(e) => setChar(i, { ageRange: e.target.value || undefined })}>
                            <option value="">Choose…</option>
                            {AGE_RANGES.map((a) => <option key={a}>{a}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                    {c.role === "pet" ? (
                      <div className="row2">
                        <Text id={`characters-${i}-markings`} label="Colours and markings" optional max={LIMITS.medium} value={c.markings} onChange={(v) => setChar(i, { markings: v })} placeholder="e.g. Brown with a white patch over one eye" />
                        <Text id={`characters-${i}-personality`} label="Personality" optional max={LIMITS.medium} value={c.personality} onChange={(v) => setChar(i, { personality: v })} placeholder="e.g. Steals socks, scared of the hoover" />
                      </div>
                    ) : (
                      <Text id={`characters-${i}-description`} label={i === 0 ? "Tell us about them" : "Who are they to the star?"} optional multiline max={LIMITS.medium} value={c.description} err={errors[`characters.${i}.description`]} onChange={(v) => setChar(i, { description: v })}
                        placeholder={i === 0 ? "e.g. Loves dinosaurs, never stops asking why, brilliant at hide and seek" : "e.g. Her big brother, who always wins at Snap"} />
                    )}
                  </section>
                ))}
                {b.characters.length < LIMITS.characters ? (
                  <div className="add-row" aria-label="Add a character">
                    <span className="small muted">Add:</span>
                    {ROLES.map((r) => <button key={r.id} type="button" className="btn btn-line btn-sm" onClick={() => addChar(r.id)}>+ {r.label}</button>)}
                  </div>
                ) : <p className="hint">That’s the most characters we can fit into one book.</p>}
              </>
            ) : null}

            {step === 3 ? (
              <>
                <h1 ref={heading} tabIndex={-1}>Photos and personal touches</h1>
                <p className="intro">{info?.photoUploads ? "Add a photo or describe details like curls, glasses or your pet’s markings." : "Describe details like curls, glasses or your pet’s markings. We’ll let you know how to share any reference photos privately."} Everything on this page is optional.</p>
                {b.characters.map((c, i) => (
                  <section className="char" key={c.id} aria-labelledby={`pt-${c.id}`}>
                    <h3 id={`pt-${c.id}`} style={{ fontSize: 19 }}>{c.name || (i === 0 ? "The star" : roleLabel(c.role))}</h3>
                    {info?.photoUploads && <Uploader ch={c} err={photoErr[c.id]} onError={(m) => setPhotoErr((x) => ({ ...x, [c.id]: m }))}
                      onChange={(p) => { setB((x) => ({ ...x, characters: x.characters.map((y) => (y.id === c.id ? { ...y, photo: p } : y)) })); }} />}
                    <Text id={`look-${c.id}`} label="Or describe their look" optional multiline max={LIMITS.medium} err={errors[`characters.${i}.description`]}
                      value={c.appearance} onChange={(v) => setChar(i, { appearance: v })}
                      placeholder={c.role === "pet" ? "e.g. Ginger with white socks and a very fluffy tail" : "e.g. Curly brown hair, round red glasses, always in her yellow raincoat"} />
                  </section>
                ))}
                {b.characters.some((c) => c.photo) ? (
                  <div className="field">
                    <label className="check">
                      <input type="checkbox" id="photoConsent" checked={!!b.photoConsent} onChange={(e) => update((x) => ({ ...x, photoConsent: e.target.checked }), ["photoConsent"])} aria-describedby="photoConsent-e" />
                      <span>I’m the parent or guardian of any child pictured, or I have their parent or guardian’s permission to share these photos for this book. Any adults pictured have agreed too.</span>
                    </label>
                    <Err id="photoConsent-e" msg={errors.photoConsent} />
                  </div>
                ) : null}
                {info?.photoUploads && <div className="note note-plain small">
                  <strong>How we use photos.</strong> Only to draw the characters in your book. We remove location data when you upload. Only you (until you order) and the shop owner (after you order) can see them.{" "}
                  {info?.photoProcessors.length ? `We share them with ${info.photoProcessors.join(", ")} to make the illustrations.` : "We don’t share them with anyone else, and they’re never used for marketing."}{" "}
                  We delete them {info?.photoRetentionDays ?? 30} days after your book is delivered, or if you don’t order, when your saved answers expire.
                </div>}
                <h2 style={{ fontSize: 24, marginTop: 30 }}>Personal touches</h2>
                <Text id="touches-phrases" label="Favourite phrases" optional multiline max={LIMITS.medium} value={b.touches.phrases} err={errors["touches.phrases"]} onChange={(v) => update((x) => ({ ...x, touches: { ...x.touches, phrases: v } }))} hint="We’ll use them word for word." placeholder="e.g. “One more page!” and “That’s not fair, it’s my turn!”" />
                <Text id="touches-interests" label="Things they love" optional max={LIMITS.medium} value={b.touches.interests} onChange={(v) => update((x) => ({ ...x, touches: { ...x.touches, interests: v } }))} placeholder="e.g. Diggers, jam sandwiches, the blue whale at the museum" />
                <Text id="touches-places" label="Places that mean something" optional max={LIMITS.medium} value={b.touches.places} onChange={(v) => update((x) => ({ ...x, touches: { ...x.touches, places: v } }))} placeholder="e.g. Granny’s caravan in Wexford" />
                <Text id="touches-mustInclude" label="Must-include moments" optional multiline max={LIMITS.long} value={b.touches.mustInclude} err={errors["touches.mustInclude"]} onChange={(v) => update((x) => ({ ...x, touches: { ...x.touches, mustInclude: v } }))} placeholder="e.g. Their new baby sister arriving at the end" />
                <Text id="touches-leaveOut" label="Anything to leave out" optional max={LIMITS.medium} value={b.touches.leaveOut} onChange={(v) => update((x) => ({ ...x, touches: { ...x.touches, leaveOut: v } }))} placeholder="e.g. No spiders, please" />
                <Text id="touches-dedication" label="Dedication" optional multiline max={LIMITS.dedication} value={b.touches.dedication} err={errors["touches.dedication"]} onChange={(v) => update((x) => ({ ...x, touches: { ...x.touches, dedication: v } }))} hint="Printed on the first page. Leave it blank and we’ll write a short one." placeholder={`For ${lead?.name || "Mila"}, who always asks for one more page.\nLove, Mum and Dad`} />
              </>
            ) : null}

            {step === 4 ? (
              <>
                <h1 ref={heading} tabIndex={-1}>Choose the illustration style</h1>
                <fieldset className="field">
                  <legend>Illustration style</legend>
                  <p className="hint" style={{ marginTop: -2, marginBottom: 10 }}>The same scene in each style, so you can compare the artwork.</p>
                  <Radio<StyleId> label="Illustration style" value={b.style} options={STYLES.map((s) => s.id)} className="styles" item="style-tile" errId={errors.style ? "style-e" : undefined}
                    onChange={(v) => update((x) => ({ ...x, style: v }), ["style"])}
                    render={(id) => { const s = STYLES.find((x) => x.id === id)!; return <><span className="art"><GalleryArt style={id} /></span><strong>{s.name}</strong><span>{s.line}</span></>; }} />
                  <Err id="style-e" msg={errors.style} />
                </fieldset>
              </>
            ) : null}

            {step === 5 && info ? (
              <ReviewStep b={b} info={info} q={q} enabled={enabled} errors={errors} edit={setStep} update={update} pay={pay} paying={paying} heading={heading} title={title} />
            ) : null}

            <div className="b-nav">
              {step > 0 ? <button type="button" className="btn btn-line" onClick={() => setStep(step === 1 ? 0 : step - 1)}>Back</button> : <Link href="/" className="btn-link">Back to the shop</Link>}
              {step > 0 && step < 5 ? <button type="button" className="btn btn-primary" onClick={next}>{step === 4 ? "Choose your cover" : "Continue"}</button> : null}
            </div>
            <div style={{ marginTop: 24 }}>
              {confirmReset ? (
                <div className="note note-info" role="alertdialog" aria-label="Start again?">
                  <p>Clear every answer and delete the photos? This can’t be undone.</p>
                  <div className="toolbar" style={{ marginTop: 10 }}>
                    <button type="button" className="btn btn-primary btn-sm" onClick={reset}>Yes, start again</button>
                    <button type="button" className="btn btn-line btn-sm" onClick={() => setConfirmReset(false)}>Keep my answers</button>
                  </div>
                </div>
              ) : <button type="button" className="btn-link" onClick={() => setConfirmReset(true)} style={{ color: "var(--ink-3)" }}>Start again</button>}
            </div>
          </div>
          <aside className="side" aria-label="Your book so far">
            {b.route === "preset" && b.story ? <Cover story={b.story} name={lead?.name || "Your child"} label="Cover preview with sample art" /> : null}
            {summary}
          </aside>
        </div>
      </main>
      {step > 0 && q ? (
        <div className="sum-bar" aria-live="polite">
          <span><span className="small muted">Total</span> <strong key={flash} className="flash">{euro(q.totalCents)}</strong>{q.extras ? <span className="small muted"> · incl. {q.extras} extra</span> : null}</span>
          {step < 5 ? <button type="button" className="btn btn-primary btn-sm" onClick={next}>Continue</button> : null}
        </div>
      ) : null}
      {reading ? <SampleReader story={reading} onClose={() => setReading(null)} /> : null}
    </>
  );
}

function ReviewStep({ b, info, q, enabled, errors, edit, update, pay, paying, heading, title }: {
  b: Brief; info: ShopInfo; q: ReturnType<typeof clientQuote>; enabled: FormatId[]; errors: Errors; edit: (n: number) => void; update: (fn: (x: Brief) => Brief, clear?: string[]) => void;
  pay: (m: string) => void; paying: string | null; heading: React.RefObject<HTMLHeadingElement | null>; title: string;
}) {
  const f = info.formats.find((x) => x.id === b.format);
  const softcover = info.formats.find((x) => x.id === "softcover");
  const useSingleCheckout = !!info.methods.length;
  const canAddToCart = !b.characters.some((character) => character.photo);
  const row = (label: string, value: ReactNode, step: number, err?: string) => (
    <div className="review-row">
      <div><dt>{label}</dt><dd>{value}</dd>{err ? <p className="err">{err}</p> : null}</div>
      <button type="button" className="btn-link" onClick={() => edit(step)} aria-label={`Edit ${label}`}>Edit</button>
    </div>
  );
  const anyErr = (prefix: string) => Object.entries(errors).find(([k]) => k.startsWith(prefix))?.[1];
  return (
    <>
      <h1 ref={heading} tabIndex={-1}>Choose your cover and review</h1>
      <p className="intro">After you order, we’ll email you a private proof to check. We’ll print once you approve it, and the approved PDF is included.</p>
      <fieldset className="field">
        <legend>Book cover</legend>
        <Radio<FormatId> label="Book cover" value={b.format} options={enabled} className="choice-grid two" item="choice"
          errId={errors.format ? "format-e" : undefined} onChange={(format) => update((x) => ({ ...x, format }), ["format"])}
          render={(format) => {
            const option = info.formats.find((x) => x.id === format);
            const upgrade = format === "hardback" && option && softcover ? option.priceCents - softcover.priceCents : 0;
            return <>
              <strong>{formatLabel(format)}{upgrade > 0 ? ` · +${euro(upgrade)}` : ""}</strong>
              {option ? <Price cents={option.priceCents} was={option.wasCents} label={option.saleLabel} /> : null}
            </>;
          }} />
        <Err id="format-e" msg={errors.format} />
      </fieldset>
      <dl className="review-list">
        {row("Story", b.route === "custom" ? <>Dream up a story{"\n"}{b.custom?.happen}</> : title, 1, errors.route || errors.story || anyErr("custom"))}
        {row("Characters", <>
          {b.characters.map((c, i) => `${i === 0 ? "★ " : ""}${c.name || "(no name)"} · ${roleLabel(c.role)}${c.species ? `, ${c.species}` : ""}${c.ageRange && c.ageRange !== "Grown-up" ? `, ${c.ageRange}` : ""}`).join("\n")}
          {b.characters.some((c) => c.photo) ? <span className="mini-thumbs">{b.characters.filter((c) => c.photo).map((c) => <img key={c.id} src={`/api/books/draft/photo?character=${encodeURIComponent(c.id)}&v=${c.photo!.id}`} alt={`Photo of ${c.name || "character"}`} />)}</span> : null}
        </>, 2, anyErr("characters"))}
        {row("Personal touches", [b.touches.phrases && `Phrases: ${b.touches.phrases}`, b.touches.interests && `Loves: ${b.touches.interests}`, b.touches.places && `Places: ${b.touches.places}`, b.touches.mustInclude && `Must include: ${b.touches.mustInclude}`, b.touches.leaveOut && `Leave out: ${b.touches.leaveOut}`, `Dedication: ${b.touches.dedication || "we’ll write a short one"}`].filter(Boolean).join("\n"), 3, anyErr("touches") || errors.photoConsent)}
        {row("Illustration style", STYLES.find((s) => s.id === b.style)?.name ?? "No style chosen", 4, errors.style)}
      </dl>
      {q && f ? (
        <div className="side-card" style={{ marginTop: 18 }}>
          <strong>Price</strong>
          <div className="lines">
            <div><span>Personalised book · {f.label}</span><Price cents={q.bookCents} was={q.wasCents} label={q.saleLabel} /></div>
            {q.extras ? <div><span>{q.extras} extra character{q.extras > 1 ? "s" : ""} × {euro(info.extraCharacterCents)}</span><span>{euro(q.extrasCents)}</span></div> : null}
            <div><span>Shipping</span><span>{euro(q.shippingCents)}</span></div>
            <div className="total"><span>Total</span><span>{euro(q.totalCents)}</span></div>
          </div>
          {q.wasCents ? <p className="sale-note">{SALE_SCOPE}</p> : null}
          {info.taxNote ? <p className="sale-note">{info.taxNote}</p> : null}
          <p className="small" style={{ marginTop: 10 }}><strong>When:</strong> {f.turnaround ?? "We’ll email you a delivery estimate after you order."}{f.shipping ? ` ${f.shipping}` : ""}</p>
        </div>
      ) : null}
      {useSingleCheckout && <>
      <Text id="contact-email" type="email" autoComplete="email" label="Your email" max={LIMITS.email} value={b.contact.email} err={errors["contact.email"]} onChange={(v) => update((x) => ({ ...x, contact: { ...x.contact, email: v } }), ["contact.email"])} hint="For your receipt, any questions about the book, and delivery." />
      <Text id="contact-name" label="Your first name" optional autoComplete="given-name" max={LIMITS.name} value={b.contact.name} onChange={(v) => update((x) => ({ ...x, contact: { ...x.contact, name: v } }))} />
      <label className="check field">
        <input type="checkbox" checked={!!b.marketing} onChange={(e) => update((x) => ({ ...x, marketing: e.target.checked }))} />
        <span>Send me the occasional email about new stories. <span className="opt">(Optional. Separate from your order and your photos.)</span></span>
      </label>
      </>}
      <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
        {useSingleCheckout ? info.methods.map((m, i) => (
          <div key={m.id}>
            <button type="button" className={`btn ${i === 0 ? "btn-primary" : "btn-line"} btn-block`} disabled={!!paying} onClick={() => pay(m.id)}>{paying === m.id ? "Opening secure checkout…" : `${m.label}${q ? ` · ${euro(q.totalCents)}` : ""}`}</button>
            <p className="hint" style={{ textAlign: "center" }}>{m.note}</p>
          </div>
        )) : null}
        {canAddToCart && <button type="button" className={`btn ${useSingleCheckout ? "btn-line" : "btn-primary"} btn-block`} disabled={!!paying} onClick={() => pay("cart")}>
          {paying === "cart" ? "Adding…" : "Add to cart"}
        </button>}
      </div>
    </>
  );
}
