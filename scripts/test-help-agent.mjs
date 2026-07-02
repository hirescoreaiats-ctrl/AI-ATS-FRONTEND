import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const help = readFileSync("help-agent.js", "utf8");
const css = readFileSync("help-agent.css", "utf8");

assert.match(html, /help-agent\.css\?v=guide-agent-20260702-02/, "help css should be loaded");
assert.match(html, /help-agent\.js\?v=guide-agent-20260702-02/, "help js should be loaded");
assert.match(html, /data-help-id="dashboard-summary"/, "dashboard summary help target should exist");
assert.match(help, /data-help-id="help-agent-button"|help-agent-button/, "help button target should exist");

assert.match(help, /hs_help_onboarding_seen/, "onboarding persistence key should exist");
assert.match(help, /hs_help_agent_mode/, "mode persistence key should exist");
assert.match(help, /hs_action_agent_enabled/, "action permission key should exist");
assert.match(help, /Start Product Walkthrough/, "onboarding walkthrough option should exist");
assert.match(help, /Ask Help Agent/, "onboarding ask option should exist");
assert.match(help, /Skip for now/, "onboarding skip option should exist");
assert.match(help, /Guide Agent/, "guide mode should exist");
assert.match(help, /Action Agent - Requires permission/, "locked action mode should exist");
assert.match(help, /Enable Action Agent\?/, "permission modal should exist");
assert.match(help, /I will not perform sensitive actions|I will never perform sensitive actions/, "action safety copy should exist");
assert.match(help, /\/api\/v1\/help\/parse-intent/, "frontend should call backend intent parser");
assert.match(help, /Understanding your request\.\.\./, "loading state should be shown while parsing intent");
assert.match(help, /function\s+shouldRequireCandidate/, "candidate requirement helper should exist");
assert.match(help, /view_shortlisted_candidates/, "shortlisted candidate list intent should exist");
assert.match(help, /Open Shortlisted Candidates/, "shortlisted candidates action should exist");

for (const workflow of [
  "create_job",
  "edit_job",
  "share_public_apply_link",
  "upload_resumes",
  "candidate_workflow",
  "select_top_candidates",
  "review_ai_ranked_candidates",
  "view_candidate_profile",
  "explain_candidate_score",
  "view_shortlisted_candidates",
  "view_candidates_by_stage",
  "shortlist_candidate",
  "reject_candidate",
  "move_candidates_to_communication",
  "move_candidates_to_interview",
  "send_candidate_email",
  "schedule_interview",
  "send_screening_test",
  "view_test_result",
  "invite_pilot_user",
  "deactivate_pilot_user",
  "view_plan_usage_limits"
]) {
  assert.match(help, new RegExp(`${workflow}:`), `${workflow} workflow should be registered`);
}

assert.match(help, /upl\s\*aod|upl\\s\*aod|upl\.aod|uplod/, "upload typo handling should exist");
assert.match(help, /cv.*resume.*profile|profile.*resume/, "resume synonym handling should exist");
assert.match(help, /candiate/, "candidate typo handling should exist");
assert.match(help, /candidateSelection \? "top_candidates"/, "top candidate group extraction should exist");
assert.match(help, /extractLimit/, "top candidate limit extraction should exist");
assert.match(help, /show top 5 Backend Developer candidates/, "clarification should be contextual instead of hardcoded buttons");
assert.match(help, /data-help-id/, "tour should use data-help-id selectors");
assert.match(help, /dashboard_overview/, "dashboard overview tour should exist");
assert.match(help, /showTourStep/, "visual tour runner should exist");

assert.match(css, /\.hs-help-drawer/, "drawer styles should exist");
assert.match(css, /\.hs-help-button/, "floating button styles should exist");
assert.match(css, /#hsHelpRoot\.has-messages \.hs-help-quick/, "quick chips should hide after chat starts");
assert.match(css, /height:100dvh/, "drawer should use dynamic viewport height");
assert.match(css, /\.hs-tour-target/, "tour target highlight styles should exist");
assert.match(css, /@media \(max-width: 720px\)/, "mobile drawer styles should exist");

console.log("Help Agent smoke checks passed.");
