import { readFileSync } from "node:fs";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const html = readFileSync("index.html", "utf8");
const app = readFileSync("app.js", "utf8");
const css = readFileSync("ui-fix.css", "utf8");
const vercel = readFileSync("vercel.json", "utf8");
const netlify = readFileSync("netlify.toml", "utf8");

assert(!html.includes('<span class="nav-text">Bulk Analyzer</span>'), "Bulk Analyzer nav item should be hidden");
assert(html.includes("navigateToPage('support')"), "Support nav route should be present");
assert(html.includes('<span class="nav-text">Support</span>'), "Support nav label should be present");
assert(html.includes('id="supportPage"'), "Support page container should exist");
assert(html.includes('id="supportForm"'), "Support form should exist");
assert(html.includes("Live chat is coming soon"), "Live chat coming soon note should be shown");
assert(html.includes("ui-fix.css?v=company-website-20260821-08"), "Support CSS should load the current shared UI bundle");
assert(app.includes('support: "Support"'), "Support active nav mapping should exist");
assert(app.includes('"supportPage"'), "Support page should be part of page switching");
assert(app.includes('"/support": "support"'), "Direct /support route should resolve to support page");
assert(app.includes("submitSupportCase"), "Support form submit handler should exist");
assert(app.includes('/api/v1/support/case'), "Support form should post to backend endpoint");
assert(app.includes("ats-support-mode"), "Support page should use dedicated layout mode");
assert(css.includes("body.ats-support-mode .ats-top-banner"), "Support layout should hide the top banner");
assert(css.includes("top:24px !important"), "Support page should start near the top of the workspace");
assert(css.includes("left:calc(18rem + max(24px"), "Support page should center within the sidebar-free workspace");
assert(app.includes("scrollRestoration"), "Page switching should disable browser scroll restoration");
assert(vercel.includes('"source": "/support"'), "Vercel should rewrite /support to index.html");
assert(netlify.includes('from = "/support"'), "Netlify should rewrite /support to index.html");
assert(html.includes('id="createJobStatus"'), "Create Job form should expose submit status");
assert(app.includes("setCreateJobStatus"), "Create Job submit status helper should exist");
assert(app.includes('"Creating Job..."'), "Create Job button should show loading state");
assert(css.includes(".ats-create-job-status"), "Create Job status should be styled");

console.log("Support page regression checks passed.");
