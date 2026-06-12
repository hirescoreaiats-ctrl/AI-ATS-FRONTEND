import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

const copyDirs = ["assets"];
const copyExtensions = new Set([".html", ".js", ".css", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico"]);
const skipFiles = new Set(["enterprise.html"]);

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const dir of copyDirs) {
  const source = join(root, dir);
  if (existsSync(source)) {
    cpSync(source, join(dist, dir), { recursive: true });
  }
}

for (const entry of readdirSync(root)) {
  const source = join(root, entry);
  if (!statSync(source).isFile()) continue;
  if (skipFiles.has(entry)) continue;
  if (copyExtensions.has(extname(entry).toLowerCase())) {
    copyFileSync(source, join(dist, basename(entry)));
  }
}

writeFileSync(
  join(dist, "_redirects"),
  [
    "/pipeline /index.html 200",
    "/candidates /index.html 200",
    "/talent-search /index.html 200",
    "/inbox /index.html 200",
    "/copilot /index.html 200",
    "/analytics /index.html 200",
    "/jobs /index.html 200",
    "/organization /index.html 200",
    "/support /index.html 200",
    ""
  ].join("\n"),
  "utf8"
);

console.log("Static Netlify bundle created in dist/");
