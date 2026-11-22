import { forwardRef, useRef, useState, type FormEvent } from "react";
import { asset, LINKS, OFFER, PREVIEW, STORIES, WAITLIST_ENDPOINT } from "./config";
import { getAttribution, trackLead } from "./tracking";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done"; email: string } | { kind: "error"; message: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const SignupForm = forwardRef<HTMLInputElement, { story: string; onStoryChange: (id: string) => void }>(function SignupForm(
  { story, onStoryChange },
  emailRef,
) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const doneRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);

  function validate(v: string) {
    const msg = !v ? "Please add your email address." : EMAIL.test(v) ? "" : "That email address doesn’t look right. Please check it.";
    setEmailError(msg);
    return !msg;
  }

  async function submit(e?: FormEvent) {
    e?.preventDefault();
    if (status.kind === "sending") return;
    const value = email.trim();
    if (!validate(value)) {
      (emailRef as React.RefObject<HTMLInputElement>)?.current?.focus();
      return;
    }
    setStatus({ kind: "sending" });
    if (PREVIEW) {
      // Preview only: nothing is sent. Type "fail@example.ie" to see the error state.
      await new Promise((r) => setTimeout(r, 900));
      if (value.toLowerCase().startsWith("fail@")) {
        setStatus({ kind: "error", message: "Sorry, we couldn’t add you to the list just now, so nothing was saved." });
        requestAnimationFrame(() => errorRef.current?.focus());
      } else {
        setStatus({ kind: "done", email: value });
        requestAnimationFrame(() => doneRef.current?.focus());
      }
      return;
    }
    try {
      const res = await fetch(WAITLIST_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: value,
          story,
          page: location.origin + location.pathname, // no query string: ad click ids stay out unless consented
          attribution: getAttribution(),
          company_fax: honeypot.current?.value || "",
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body && body.ok) {
        setStatus({ kind: "done", email: value });
        trackLead();
        requestAnimationFrame(() => doneRef.current?.focus());
        return;
      }
      if (res.status === 422 && body?.errors?.email) {
        setEmailError(body.errors.email);
        setStatus({ kind: "idle" });
        (emailRef as React.RefObject<HTMLInputElement>)?.current?.focus();
        return;
      }
      setStatus({ kind: "error", message: "Sorry, we couldn’t add you to the list just now, so nothing was saved." });
    } catch {
      setStatus({ kind: "error", message: "We couldn’t reach the server, so you’re not on the list yet. Check your connection and try again." });
    }
    requestAnimationFrame(() => errorRef.current?.focus());
  }

  if (status.kind === "done") {
    return (
      <div className="lp-form lp-form-done" ref={doneRef} tabIndex={-1} role="status">
        <img className="lp-done-star" src={asset("clay-star.svg")} width="88" height="88" alt="" />
        <h3>You’re on the list.</h3>
        <p>
          We’ll email <strong>{status.email}</strong> when the first books are ready to order.
          {story ? <> We’ve noted <strong>{STORIES.find((s) => s.id === story)?.title}</strong> as your favourite.</> : null}
        </p>
        <p className="lp-small">Nothing to pay, and nothing is ordered until you choose to.</p>
      </div>
    );
  }

  const mailto = `mailto:${LINKS.contactEmail}?subject=${encodeURIComponent("Little Plot Books: add me to the launch list")}&body=${encodeURIComponent(
    `Please add ${email.trim() || "my email"} to the Little Plot Books launch list.${story ? `\nFavourite story: ${STORIES.find((s) => s.id === story)?.title}` : ""}`,
  )}`;

  return (
    <form className="lp-form" onSubmit={submit} noValidate aria-busy={status.kind === "sending"}>
      <div className="lp-field">
        <label htmlFor="lp-email">Your email</label>
        <input
          ref={emailRef}
          id="lp-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) validate(e.target.value.trim());
          }}
          onBlur={() => email && validate(email.trim())}
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? "lp-email-err lp-email-hint" : "lp-email-hint"}
          placeholder="you@example.ie"
        />
        <p id="lp-email-hint" className="lp-hint">Your email only. No child details needed.</p>
        {emailError && <p id="lp-email-err" className="lp-err">{emailError}</p>}
      </div>

      <div className="lp-field">
        <label htmlFor="lp-story">Favourite story <span className="lp-optional">(optional)</span></label>
        <select id="lp-story" name="story" value={story} onChange={(e) => onStoryChange(e.target.value)}>
          <option value="">Not sure yet</option>
          {STORIES.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
      </div>

      {/* Honeypot for bots. Hidden from people and screen readers. */}
      <div className="lp-hp" aria-hidden="true">
        <label htmlFor="lp-company-fax">Company fax</label>
        <input ref={honeypot} id="lp-company-fax" name="company_fax" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" className="lp-btn lp-btn-primary lp-btn-block" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? (
          <><span className="lp-spinner" aria-hidden="true" /> Joining the list…</>
        ) : (
          OFFER.listCta
        )}
      </button>
      <p className="lp-small">
        Free. No payment. We only use your email for Little Plot Books. <a href={LINKS.privacy}>Privacy</a>
      </p>

      {status.kind === "error" && (
        <div className="lp-form-error" role="alert" tabIndex={-1} ref={errorRef}>
          <p>{status.message}</p>
          <div className="lp-retry-row">
            <button type="button" className="lp-btn lp-btn-primary" onClick={() => submit()}>Try again</button>
            <a href={mailto}>Or email us to join</a>
          </div>
        </div>
      )}
    </form>
  );
});
