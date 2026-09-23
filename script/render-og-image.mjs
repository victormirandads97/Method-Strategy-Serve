// Renders script/og-image.html to client/public/og-image.png (1200x630) with
// headless Chrome. Set CHROME to the browser binary if it is not in the usual
// macOS place.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = pathToFileURL(path.join(root, "script", "og-image.html")).href;
const out = path.join(root, "client", "public", "og-image.png");
const chrome =
  process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

execFileSync(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--force-device-scale-factor=1",
  "--window-size=1200,630",
  // Leaves time for the Google Fonts to arrive before the capture.
  "--virtual-time-budget=5000",
  `--screenshot=${out}`,
  src,
], { stdio: "inherit" });

console.log(`wrote ${path.relative(root, out)}`);
