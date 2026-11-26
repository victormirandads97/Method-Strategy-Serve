// Creates BOOKS_OWNER_PASSWORD_HASH for the Little Plot Books owner dashboard.
// Usage: npm run books:owner-password   (prompts for the password; nothing is stored)
import { webcrypto } from "node:crypto";
import { createInterface } from "node:readline";

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
rl.question("Password (12+ characters): ", async (pw) => {
  rl.close();
  if (pw.length < 12) {
    console.error("Use at least 12 characters.");
    process.exit(1);
  }
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const key = await webcrypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await webcrypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 }, key, 256);
  const b64 = (b) => Buffer.from(b).toString("base64url");
  console.log(`\nBOOKS_OWNER_PASSWORD_HASH=pbkdf2$100000$${b64(salt)}$${b64(bits)}`);
});
