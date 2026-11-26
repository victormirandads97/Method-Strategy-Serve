import type { PrintProof } from "../../../shared/books/catalog";
import { HttpError, bucket, orderUrl, ready, type BooksEnv } from "./core";
import { sendMail } from "./email";
import type { OrderRow } from "./shop";

export interface StoredProof extends PrintProof {
  file_key: string;
}

export async function getProof(env: BooksEnv, orderId: string) {
  return (await ready(env)).prepare("SELECT version, state, message, file_key FROM lpb_book_proofs WHERE order_id = ?")
    .bind(orderId).first<StoredProof>();
}

export function proofDetails(proof: StoredProof | null): PrintProof | null {
  return proof ? { version: proof.version, state: proof.state, message: proof.message } : null;
}

export async function sendProofLink(env: BooksEnv, order: OrderRow, request: Request) {
  return sendMail(env, {
    to: order.email,
    orderId: order.id,
    kind: "print_proof",
    subject: `Your book is ready to check (${order.id})`,
    lines: ["Read the illustrated PDF, then approve it for print or tell us what to change.", "We’ll wait for your approval before printing."],
    button: { label: "Review your book", url: await orderUrl(env, order.id, request) },
  });
}

export async function proofFile(env: BooksEnv, orderId: string, fileKey: string, download: boolean) {
  const file = await bucket(env).get(fileKey);
  if (!file) throw new HttpError(404, "We couldn't find the PDF. Please contact us.");
  return new Response(await file.arrayBuffer(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="little-plot-books-${orderId}.pdf"`,
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex",
    },
  });
}
