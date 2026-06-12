import { readFileSync } from "node:fs";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const html = readFileSync("index.html", "utf8");
const app = readFileSync("app.js", "utf8");

assert(!html.includes('<span class="nav-text">Bulk Analyzer</span>'), "Bulk Analyzer nav item should be hidden");
assert(html.includes("navigateToPage('support')"), "Support nav route should be present");
assert(html.includes('<span class="nav-text">Support</span>'), "Support nav label should be present");
assert(html.includes('id="supportPage"'), "Support page container should exist");
assert(html.includes('id="supportForm"'), "Support form should exist");
assert(html.includes("Live chat is coming soon"), "Live chat coming soon note should be shown");
assert(app.includes('support: "Support"'), "Support active nav mapping should exist");
assert(app.includes('"supportPage"'), "Support page should be part of page switching");
assert(app.includes('"/support": "support"'), "Direct /support route should resolve to support page");
assert(app.includes("submitSupportCase"), "Support form submit handler should exist");
assert(app.includes('/api/v1/support/case'), "Support form should post to backend endpoint");

console.log("Support page regression checks passed.");
