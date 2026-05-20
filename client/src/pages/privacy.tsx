import { Link } from "wouter";

const C = {
  bg: "#0C0C0C",
  surface: "#141414",
  border: "rgba(255,255,255,0.08)",
  text: "#F2F2F2",
  muted: "#888888",
  accent: "#3DD6F5",
};

const MONO = { fontFamily: "'Space Mono', monospace" };
const BEBAS = { fontFamily: "'Bebas Neue', sans-serif" };
const INTER = { fontFamily: "'Inter', sans-serif" };

export default function Privacy() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, ...INTER }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        a { color: ${C.accent}; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      {/* Nav */}
      <nav style={{
        borderBottom: `1px solid ${C.border}`,
        padding: "1.25rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Link href="/">
          <img
            src="https://res.cloudinary.com/dsriscylr/image/upload/v1779128984/method-primary_hl2rrb.svg"
            alt="The Method Co."
            style={{ height: 28 }}
          />
        </Link>
        <Link href="/" style={{ ...MONO, fontSize: "0.75rem", color: C.muted, letterSpacing: "0.05em" }}>
          ← Back
        </Link>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "4rem 2rem 6rem" }}>
        <p style={{ ...MONO, fontSize: "0.7rem", color: C.accent, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>
          Legal
        </p>
        <h1 style={{ ...BEBAS, fontSize: "clamp(2.5rem, 6vw, 4rem)", letterSpacing: "0.02em", marginBottom: "0.5rem" }}>
          Privacy Policy
        </h1>
        <p style={{ ...MONO, fontSize: "0.75rem", color: C.muted, marginBottom: "3rem" }}>
          Last updated: May 2025
        </p>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "3rem", display: "flex", flexDirection: "column", gap: "2.5rem" }}>

          <section>
            <h2 style={{ ...BEBAS, fontSize: "1.5rem", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              1. Who We Are
            </h2>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem" }}>
              The Method Co. ("we", "our", or "us") operates the website at themethodco.co. We provide positioning
              and clarity systems for service businesses. This policy explains what data we collect, why we collect
              it, and how we use it.
            </p>
          </section>

          <section>
            <h2 style={{ ...BEBAS, fontSize: "1.5rem", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              2. Information We Collect
            </h2>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem", marginBottom: "1rem" }}>
              We collect information you provide directly when you:
            </p>
            <ul style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <li>Fill out a contact or intake form</li>
              <li>Book a call or discovery session</li>
              <li>Sign up for our newsletter or updates</li>
              <li>Engage with The Method Chat (our AI assistant product)</li>
            </ul>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem", marginTop: "1rem" }}>
              This includes your name, email address, business name, and any information you share in free-text fields.
              We also collect standard web analytics data (page views, referrers, device type) through privacy-respecting
              analytics tools.
            </p>
          </section>

          <section>
            <h2 style={{ ...BEBAS, fontSize: "1.5rem", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              3. How We Use Your Information
            </h2>
            <ul style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <li>To respond to your inquiry and deliver services you've requested</li>
              <li>To send occasional updates, case studies, or offers (you can opt out anytime)</li>
              <li>To improve our website and understand which content resonates</li>
              <li>To operate and improve The Method Chat product for clients who use it</li>
            </ul>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem", marginTop: "1rem" }}>
              We do not sell, rent, or trade your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 style={{ ...BEBAS, fontSize: "1.5rem", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              4. Cookies and Tracking
            </h2>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem" }}>
              This website may use minimal cookies necessary for basic functionality (e.g., form state). We do not
              use invasive advertising trackers or third-party behavioral profiling cookies. Analytics, if used,
              are configured to anonymize IP addresses and respect Do Not Track signals.
            </p>
          </section>

          <section>
            <h2 style={{ ...BEBAS, fontSize: "1.5rem", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              5. Data Storage and Security
            </h2>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem" }}>
              Your data is stored on secure, industry-standard infrastructure. We take reasonable technical and
              organizational measures to protect your information. No method of transmission over the internet
              is 100% secure, but we work to protect your data to the best of our ability.
            </p>
          </section>

          <section>
            <h2 style={{ ...BEBAS, fontSize: "1.5rem", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              6. Your Rights
            </h2>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem" }}>
              You have the right to access, correct, or request deletion of any personal data we hold about you.
              To exercise these rights, email us at{" "}
              <a href="mailto:hello@themethodco.co">hello@themethodco.co</a>. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 style={{ ...BEBAS, fontSize: "1.5rem", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              7. Third-Party Services
            </h2>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem" }}>
              We may use trusted third-party services to operate our business (e.g., email providers, scheduling
              tools, payment processors for clients). These providers have their own privacy policies and are
              contractually required to handle your data appropriately.
            </p>
          </section>

          <section>
            <h2 style={{ ...BEBAS, fontSize: "1.5rem", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              8. Changes to This Policy
            </h2>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem" }}>
              We may update this policy as our services evolve. When we make significant changes, we'll update
              the "Last updated" date at the top. Continued use of our site after changes constitutes acceptance
              of the updated policy.
            </p>
          </section>

          <section>
            <h2 style={{ ...BEBAS, fontSize: "1.5rem", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              9. Contact
            </h2>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem" }}>
              Questions about this policy? Reach us at{" "}
              <a href="mailto:hello@themethodco.co">hello@themethodco.co</a>.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${C.border}`,
        padding: "2rem",
        textAlign: "center",
      }}>
        <p style={{ ...MONO, fontSize: "0.7rem", color: C.muted }}>
          © {new Date().getFullYear()} The Method Co. —{" "}
          <Link href="/privacy">Privacy</Link>
          {" · "}
          <Link href="/terms">Terms</Link>
        </p>
      </footer>
    </div>
  );
}
