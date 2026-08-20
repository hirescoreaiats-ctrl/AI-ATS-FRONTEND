import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync("app.js", "utf8");
const html = readFileSync("index.html", "utf8");
const css = readFileSync("ui-fix.css", "utf8");

assert.match(app, /function\s+renderRescoreBanner/, "rescore banner renderer should exist");
assert.match(app, /\/jobs\/"\s*\+\s*encodeURIComponent\(jobId\)\s*\+\s*"\/rescore/, "rescore endpoint should be called from UI");
assert.match(app, /Score outdated - JD changed/, "stale score copy should be visible");
assert.match(app, /function\s+renderRecruiterEvidencePanel/, "candidate profile visibility panel should exist");
assert.match(app, /missing_critical_skills/, "missing critical skills should be rendered");
assert.match(app, /score_caps_applied/, "score caps should be rendered");
assert.match(app, /parser_confidence/, "parser confidence should be rendered");
assert.match(app, /async function\s+refreshCandidateRankingFromServer/, "candidate mutations should share a server refetch path");
assert.match(app, /await loadResults\(jobId, \{silent:true\}\)/, "candidate mutations should refresh job results");
assert.match(app, /candidate-workspace\/"\s*\+\s*encodeURIComponent\(candidateId\), \{headers:authHeaders\(\)\}/, "candidate workspace should send tenant auth headers");
assert.match(app, /request_candidate_sourcing:requestCandidateSourcing/, "job creation should persist the sourcing opt-in");
assert.match(app, /company_website:companyWebsite \|\| null/, "job creation should send the optional company website");
assert.match(html, /id="companyWebsite"/, "create-job form should include a company website field");
assert.match(html, /Company Website <span class="ats-field-optional">Optional<\/span>/, "company website should be visibly optional");
assert.match(app, /data\.requirement_url/, "sourcing jobs should use the backend requirement URL");
assert.doesNotMatch(app, /\/sourcing\/request\//, "sourcing should not redirect to an undeployed relative route");

assert.match(html, /jobResultRescoreBanner/, "result page should include rescore banner container");

assert.match(css, /\.ats-rescore-banner/, "rescore banner styles should exist");
assert.match(css, /\.ats-result-insight-badges/, "result insight badge styles should exist");
assert.match(css, /\.ats-recruiter-visibility-panel/, "recruiter visibility panel styles should exist");

console.log("Recruiter visibility smoke checks passed.");
