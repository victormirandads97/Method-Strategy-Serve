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

export default function Terms() {
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
          Terms of Service
        </h1>
        <p style={{ ...MONO, fontSize: "0.75rem", color: C.muted, marginBottom: "3rem" }}>
          Last updated: May 2025
        </p>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "3rem", display: "flex", flexDirection: "column", gap: "2.5rem" }}>

          <section>
            <h2 style={{ ...BEBAS, fontSize: "1.5rem", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              1. Acceptance of Terms
            </h2>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem" }}>
              By accessing or using themethodco.co ("the Site") or engaging The Method Co. for services, you agree
              to be bound by these Terms of Service. If you do not agree, please do not use our Site or services.
            </p>
          </section>

          <section>
            <h2 style={{ ...BEBAS, fontSize: "1.5rem", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              2. Services
            </h2>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem" }}>
              The Method Co. provides positioning strategy, brand clarity, copywriting, funnel design, and
              related marketing consulting services. Specific deliverables, timelines, and terms for individual
              engagements are governed by separate client agreements or statements of work signed by both parties.
            </p>
          </section>

          <section>
            <h2 style={{ ...BEBAS, fontSize: "1.5rem", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              3. Intellectual Property
            </h2>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem" }}>
              All content on this Site — including copy, design, graphics, and methodology frameworks — is owned
              by The Method Co. and protected by applicable intellectual property laws. You may not reproduce,
              distribute, or create derivative works without explicit written permission.
            </p>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem", marginTop: "1rem" }}>
              Upon full payment, clients receive a license to use deliverables created specifically for their
              engagement. The Method Co. retains the right to display work as portfolio examples unless otherwise
              agreed in writing.
            </p>
          </section>

          <section>
            <h2 style={{ ...BEBAS, fontSize: "1.5rem", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              4. Payment and Refunds
            </h2>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem" }}>
              Payment terms are specified in each client agreement. Generally, projects require a deposit before
              work begins, with the balance due upon completion or at agreed milestones. Refunds are not issued
              for work already completed. Any disputes must be raised within 14 days of delivery.
            </p>
          </section>

          <section>
            <h2 style={{ ...BEBAS, fontSize: "1.5rem", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              5. Confidentiality
            </h2>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem" }}>
              Both parties agree to keep confidential any proprietary information shared during an engagement.
              The Method Co. will not disclose client business information to third parties without consent,
              except as required by law.
            </p>
          </section>

          <section>
            <h2 style={{ ...BEBAS, fontSize: "1.5rem", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              6. Limitation of Liability
            </h2>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem" }}>
              The Method Co. is not liable for indirect, incidental, or consequential damages arising from use
              of our services or reliance on our strategic recommendations. Our total liability for any claim
              is limited to the fees paid for the specific engagement giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 style={{ ...BEBAS, fontSize: "1.5rem", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              7. The Method Chat
            </h2>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem" }}>
              The Method Chat is an AI-powered assistant product offered separately to business clients. Use of
              The Method Chat is subject to additional terms provided at sign-up. AI-generated outputs are
              provided as-is and should be reviewed by qualified professionals before acting on them.
            </p>
          </section>

          <section>
            <h2 style={{ ...BEBAS, fontSize: "1.5rem", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              8. Site Use
            </h2>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem" }}>
              You agree not to use this Site for any unlawful purpose, to attempt to gain unauthorized access
              to any part of the Site, or to engage in any conduct that disrupts other users' access to the Site.
              We reserve the right to restrict access at our discretion.
            </p>
          </section>

          <section>
            <h2 style={{ ...BEBAS, fontSize: "1.5rem", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              9. Governing Law
            </h2>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem" }}>
              These terms are governed by the laws of the applicable jurisdiction where The Method Co. operates.
              Any disputes will be resolved through good-faith negotiation first. If unresolved, disputes shall
              be subject to binding arbitration.
            </p>
          </section>

          <section>
            <h2 style={{ ...BEBAS, fontSize: "1.5rem", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              10. Changes to Terms
            </h2>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem" }}>
              We may update these terms as our services evolve. The "Last updated" date reflects the most recent
              revision. Continued use of the Site after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 style={{ ...BEBAS, fontSize: "1.5rem", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              11. Contact
            </h2>
            <p style={{ color: C.muted, lineHeight: 1.8, fontSize: "0.95rem" }}>
              Questions about these terms? Reach us at{" "}
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
