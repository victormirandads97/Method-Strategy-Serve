import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { build } from "vite";

async function stage() {
  const root = resolve(import.meta.dirname, "..");
  const client = resolve(root, "client");
  const staging = resolve(root, "dist", "little-plot-deploy");
  const assets = resolve(staging, "public");
  const databaseId = process.env.BOOKS_PRODUCTION_DB_ID;
  const bucket = process.env.BOOKS_PRODUCTION_BUCKET;

  if (!databaseId || !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(databaseId)) {
    throw new Error("Set BOOKS_PRODUCTION_DB_ID to the standalone shop’s D1 database ID.");
  }

  await rm(staging, { recursive: true, force: true });
  await build({
    configFile: false,
    root: client,
    publicDir: false,
    plugins: [react()],
    css: { postcss: { plugins: [] } },
    resolve: { alias: { "@shared": resolve(root, "shared") } },
    build: { outDir: assets, rollupOptions: { input: resolve(client, "books/index.html") } },
  });

  for (const name of ["books-art", "books-brand", "books-favicon.svg"]) {
    await cp(resolve(client, "public", name), resolve(assets, name), { recursive: true });
  }
  const redirects = await readFile(resolve(client, "public/_redirects"), "utf8");
  await writeFile(resolve(assets, "_redirects"), `/ /books/ 302\n${redirects}`);
  await writeFile(resolve(assets, "_routes.json"), JSON.stringify({
    version: 1, include: ["/api/books/*"], exclude: [],
  }));
  await writeFile(resolve(assets, "404.html"), '<!doctype html><html lang="en"><meta charset="utf-8"><title>Page not found</title><h1>Page not found</h1><a href="/books/">Back to Little Plot Books</a></html>');

  for (const directory of ["functions/api/books", "functions/_lib/books", "functions/_generated/fonts", "shared/books"]) {
    const dest = resolve(staging, directory);
    await mkdir(resolve(dest, ".."), { recursive: true });
    await cp(resolve(root, directory), dest, { recursive: true });
  }

  await writeFile(resolve(staging, "wrangler.json"), JSON.stringify({
    name: "little-plot-books",
    pages_build_output_dir: "./public",
    compatibility_date: "2026-11-22",
    d1_databases: [{ binding: "BOOKS_DB", database_name: "little-plot-books", database_id: databaseId }],
    ...(bucket ? { r2_buckets: [{ binding: "BOOKS_BUCKET", bucket_name: bucket }] } : {}),
  }, null, 2));
}

stage().catch((error) => { console.error(error); process.exitCode = 1; });
