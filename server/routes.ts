import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import Stripe from "stripe";

// Stripe is initialised lazily so the server starts even if the env var is missing in dev
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY env var is not set");
  return new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
}

const BASE_URL = process.env.BASE_URL || "https://themethodco.co";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ── /last-human-job ────────────────────────────────────────────────
  // Serve the ebook landing page at the clean path (no .html extension)
  app.get("/last-human-job", (_req, res) => {
    const filePath = path.resolve(__dirname, "public", "landing-last-human-job.html");
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("Page not found");
    }
    res.sendFile(filePath);
  });

  // ── /thank-you-last-human-job ──────────────────────────────────────
  app.get("/thank-you-last-human-job", (_req, res) => {
    const filePath = path.resolve(__dirname, "public", "thank-you-last-human-job.html");
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("Page not found");
    }
    res.sendFile(filePath);
  });

  // ── POST /api/create-checkout-session ─────────────────────────────
  // Also handles GET so static HTML buttons can use plain <a href>
  async function createCheckoutSession(req: any, res: any) {
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return res.status(500).json({ error: "STRIPE_PRICE_ID env var is not set" });
    }
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "payment",
        success_url: `${BASE_URL}/thank-you-last-human-job?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}/last-human-job`,
        billing_address_collection: "auto",
        customer_creation: "always",
      });
      if (req.method === "GET") {
        res.redirect(303, session.url!);
      } else {
        res.json({ url: session.url });
      }
    } catch (err: any) {
      console.error("Stripe checkout error:", err.message);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  }

  app.get("/api/create-checkout-session", createCheckoutSession);
  app.post("/api/create-checkout-session", createCheckoutSession);

  // ── GET /api/ebook-download ────────────────────────────────────────
  // Verify Stripe session is paid, then stream the PDF.
  // The PDF must be placed at: private/The_Last_Human_Job_-_ebook.pdf
  // (project root, outside client/ and dist/public/, never served statically)
  app.get("/api/ebook-download", async (req, res) => {
    const sessionId = req.query.session_id as string | undefined;
    if (!sessionId) {
      return res.status(400).json({ error: "Missing session_id" });
    }

    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== "paid") {
        return res.status(403).json({ error: "Payment not completed" });
      }

      const pdfPath = path.resolve(process.cwd(), "private", "The_Last_Human_Job_-_ebook.pdf");
      if (!fs.existsSync(pdfPath)) {
        console.error("PDF not found at", pdfPath);
        return res.status(404).json({ error: "File not available — contact support@themethodco.co" });
      }

      res.setHeader("Content-Disposition", 'attachment; filename="The_Last_Human_Job.pdf"');
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Cache-Control", "no-store");
      res.sendFile(pdfPath);
    } catch (err: any) {
      console.error("Download verification error:", err.message);
      res.status(500).json({ error: "Verification failed — contact support@themethodco.co" });
    }
  });

  return httpServer;
}
