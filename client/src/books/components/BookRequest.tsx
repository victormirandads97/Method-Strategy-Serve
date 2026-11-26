import { useState, type FormEvent } from "react";
import { STORIES } from "@shared/books/catalog";
import { api } from "../lib/api";

export function BookRequest({ params }: { params: URLSearchParams }) {
  const storyId = params.get("story");
  const [story, setStory] = useState(STORIES.some((item) => item.id === storyId) ? storyId! : params.get("route") === "custom" ? "custom" : "");
  const [format, setFormat] = useState(params.get("format") === "softcover" ? "softcover" : params.get("format") === "hardback" ? "hardback" : "");
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setState("busy");
    setError("");
    try {
      await api("/api/books/contact", {
        method: "POST",
        json: {
          name: data.get("name"),
          email: data.get("email"),
          website: data.get("website"),
          body: data.get("idea"),
          book: { format, story },
        },
      });
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your request could not be sent. Try again.");
      setState("idle");
    }
  }

  return (
    <main className="wrap builder narrow" id="main">
      <a href="/books/#samples" className="btn-link">← Back to the sample books</a>
      <h1 className="h2" style={{ marginTop: 12 }}>Request a personalised book</h1>
      <p className="lede">Tell us which book you’d like. Victor will confirm the price, delivery estimate and payment details by email.</p>
      {state === "sent" ? (
        <p className="note note-ok" role="status">Your request is in. Look out for an email with the details. No payment has been taken.</p>
      ) : (
        <form className="card" style={{ marginTop: 22 }} onSubmit={submit}>
          <div className="row2">
            <div className="field"><label htmlFor="req-name">Your name</label><input className="input" id="req-name" name="name" autoComplete="name" maxLength={60} required /></div>
            <div className="field"><label htmlFor="req-email">Your email</label><input className="input" id="req-email" name="email" type="email" autoComplete="email" maxLength={200} required /></div>
            <div className="field"><label htmlFor="req-format">Choose a cover</label><select className="select" id="req-format" value={format} onChange={(event) => setFormat(event.target.value)} required>
              <option value="">Select a format</option><option value="softcover">Softcover</option><option value="hardback">Hardcover</option>
            </select></div>
            <div className="field"><label htmlFor="req-story">Choose a story</label><select className="select" id="req-story" value={story} onChange={(event) => setStory(event.target.value)} required>
              <option value="">Select a story</option><option value="custom">I have my own story idea</option>
              {STORIES.map((item) => <option key={item.id} value={item.id}>{item.sampleTitle}</option>)}
            </select></div>
          </div>
          <div className="field"><label htmlFor="req-idea">Anything we should know? <span className="opt">(optional)</span></label><textarea className="textarea" id="req-idea" name="idea" maxLength={800} placeholder="For example, a birthday gift or an adventure with a family pet." /></div>
          <div className="sr-only" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <p className="hint">Please leave out children’s names, photos and addresses for now.</p>
          {error && <p className="err" role="alert">{error}</p>}
          <button className="btn btn-primary" disabled={state === "busy"} style={{ marginTop: 16 }}>{state === "busy" ? "Sending…" : "Send book request"}</button>
        </form>
      )}
    </main>
  );
}
