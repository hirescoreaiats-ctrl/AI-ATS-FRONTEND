import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const help = readFileSync("help-agent.js", "utf8");
const css = readFileSync("help-agent.css", "utf8");

assert.match(html, /help-agent\.css\?v=guide-agent-20260714-14/, "help css should be loaded");
assert.match(html, /help-agent\.js\?v=guide-agent-20260714-14/, "help js should be loaded");
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
assert.match(help, /\/api\/v1\/help\/chat/, "frontend should call the server-side action agent planner");
assert.match(help, /\/api\/v1\/help\/execute/, "frontend should execute signed action plans on the backend");
assert.match(help, /candidate_preview/, "action plans should render an exact candidate preview");
assert.match(help, /Understanding your request\.\.\./, "loading state should be shown while parsing intent");
assert.match(help, /response_type:\s*"conversation"/, "local conversational fallback should exist");
assert.match(help, /result\.response_type === "conversation"/, "conversation replies should bypass workflow routing");
assert.match(help, /assistant_reply/, "AI natural-language replies should be rendered");
assert.match(help, /guidance:\s*data\.assistant_reply\s*\|\|/, "AI reply should be preferred in workflow plans");
assert.match(help, /localConversation/, "local conversational understanding should override a stale workflow response");
assert.match(help, /To check job results, open Recruiter/, "job-result how-to questions should receive a direct answer");
assert.match(help, /function\s+conversationHistory/, "recent conversation memory should be collected");
assert.match(help, /conversation_history:conversationHistory\(\)/, "conversation memory should be sent to the backend AI");
assert.match(help, /isCandidateGroup/, "candidate cardinality should distinguish groups from individual profiles");
assert.match(help, /AI explanation for/, "group score explanations should render candidate-wise evidence");
assert.match(help, /candidate\.recruiter_explanation\s*\|\|\s*candidate\.ranking_reason/, "candidate explanations should use stored AI evidence");
assert.match(help, /selectedJobLabel/, "duplicate job-title selections should echo identifying context");
assert.match(help, /if\(state\.lastUserText\)\{[\s\S]*parseIntentWithBackend\(state\.lastUserText\)/, "job selection should rebuild every plan with the resolved job id");
assert.match(help, /item\.score >= 50/, "weak job-title matches should not open unrelated jobs");
assert.match(help, /if\(intentResult\) state\.lastParsedPlan = intentResult/, "clarifications should preserve the parsed conversation state");
assert.match(help, /preservedEntities/, "clarification choices should preserve job and candidate entities");
assert.match(help, /function\s+shouldRequireCandidate/, "candidate requirement helper should exist");
assert.match(help, /view_shortlisted_candidates/, "shortlisted candidate list intent should exist");
assert.match(help, /Open Shortlisted Candidates/, "shortlisted candidates action should exist");
assert.match(help, /function\s+selectedJobIdentity/, "job-scoped navigation context should exist");
assert.match(help, /target === "results"[\s\S]*window\.openJobResult\(job\.id, job\.title\)/, "candidate workflows should open the selected job result page");
assert.match(help, /window\.currentJobId/, "agent should recover job context from an already-open job workspace");
assert.match(help, /target === "communication"[\s\S]*window\.openCommunicationPage\(job\.id, job\.title\)/, "communication workflows should open the selected job queue");
assert.match(help, /target === "editJob"[\s\S]*window\.openEditJob\(job\.id\)/, "edit workflow should open the selected job form");

const pageIds = new Set([...html.matchAll(/id="([A-Za-z0-9]+)Page"/g)].map(match => match[1]));
const workflowRoutes = [...help.matchAll(/\bid:"([a-z_]+)"[\s\S]*?route:"([A-Za-z0-9]+)"/g)];
assert.equal(workflowRoutes.length, 23, "every registered workflow should expose a route");
for (const [, workflowId, route] of workflowRoutes) {
  assert.ok(pageIds.has(route), `${workflowId} should route to an existing ${route}Page container`);
}

for (const workflow of [
  "search_talent",
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
assert.match(help, /short\\s\*\(\?:list\|ist\|lst\|lis\)|short\\s\*/, "shortlist typo handling should exist");
assert.match(help, /mergeEntities/, "backend entities should not overwrite local NLP extraction with blank values");
assert.match(help, /wantsShortlistAction/, "shortlist action should be distinguished from shortlisted list view");
assert.match(help, /candidateSelection \? "top_candidates"/, "top candidate group extraction should exist");
assert.match(help, /extractLimit/, "top candidate limit extraction should exist");
assert.match(help, /discoveryQuery/, "role and skill candidate discovery should be supported across jobs");
assert.match(help, /function\s+handleTalentSearch/, "talent search should use a dedicated read-only result flow");
assert.match(help, /workflow\.id === "search_talent"[\s\S]*handleTalentSearch/, "talent search should bypass generic workflow actions");
assert.match(help, /\/api\/v1\/talent\/search\?q=/, "talent search should fetch actual cross-job candidate matches");
assert.match(help, /AGENT_CONTRACT_VERSION/, "frontend should enforce a versioned backend agent contract");
assert.match(help, /authoritative \? entities : mergeEntities/, "current backend contract should be the single intent authority");
assert.match(help, /MUTATING_ACTION_IDS/, "read-only tools should be separated from mutation execution");
assert.match(help, /if\(state\.pendingContextType\)\{[\s\S]*state\.lastJobOptions = \[\]/, "new requests should clear stale pending selections");
assert.match(help, /result\.agent_contract_version === AGENT_CONTRACT_VERSION[\s\S]*Object\.assign/, "authoritative null entities should clear stale context");
assert.match(help, /state\.selectedJob = null;[\s\S]*job_id:null/, "cross-job talent search should clear stale job scope");
assert.match(help, /Which workflow do you mean\?/, "clarification should ask a focused follow-up question");
assert.match(help, /clarificationActions/, "clarification should show workflow choices");
assert.match(help, /data-help-id/, "tour should use data-help-id selectors");
assert.match(help, /dashboard_overview/, "dashboard overview tour should exist");
assert.match(help, /showTourStep/, "visual tour runner should exist");

assert.match(css, /\.hs-help-drawer/, "drawer styles should exist");
assert.match(css, /\.hs-help-button/, "floating button styles should exist");
assert.match(css, /#hsHelpRoot\.has-messages \.hs-help-quick/, "quick chips should hide after chat starts");
assert.match(css, /height:100dvh/, "drawer should use dynamic viewport height");
assert.match(css, /grid-template-rows:auto auto minmax\(0,1fr\) auto auto/, "composer should have a dedicated fixed drawer row");
assert.match(css, /\.hs-help-drawer\{[\s\S]*?overflow:hidden/, "the drawer itself should never scroll the composer away");
assert.match(css, /\.hs-help-messages\{[\s\S]*?overflow-y:auto/, "only the conversation should scroll independently");
assert.match(help, /<\/div>\s*<form id="hsHelpForm" class="hs-help-form">/, "query form should remain outside the scrollable mode panel");
assert.match(css, /\.hs-tour-target/, "tour target highlight styles should exist");
assert.match(css, /@media \(max-width: 720px\)/, "mobile drawer styles should exist");

console.log("Help Agent smoke checks passed.");
