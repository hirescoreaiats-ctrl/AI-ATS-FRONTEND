import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const help = readFileSync("help-agent.js", "utf8");
const css = readFileSync("help-agent.css", "utf8");
const app = readFileSync("app.js", "utf8");

assert.match(html, /help-agent\.css\?v=recruiting-agent-20260823-07/, "agent css should be loaded");
assert.match(html, /help-agent\.js\?v=recruiting-agent-20260823-07/, "agent js should be loaded");
assert.doesNotMatch(html, /AI Matching|Pipeline ready/, "legacy AI status block should be removed");
assert.match(html, /app\.js\?v=recruiting-agent-20260823-01/, "app js cache should match the current frontend bundle");
assert.match(html, /data-help-id="dashboard-summary"/, "dashboard summary help target should exist");
assert.match(help, /data-help-id="help-agent-button"|help-agent-button/, "help button target should exist");

assert.match(help, /hs_help_onboarding_seen/, "onboarding persistence key should exist");
assert.match(help, /hs_help_agent_mode/, "mode persistence key should exist");
assert.match(help, /hs_action_agent_enabled/, "action permission key should exist");
assert.match(help, /Start Product Walkthrough/, "onboarding walkthrough option should exist");
assert.match(help, /Ask Recruiting Agent/, "onboarding ask option should exist");
assert.match(help, /Skip for now/, "onboarding skip option should exist");
assert.match(help, /Guide Agent/, "guide mode should exist");
assert.match(help, /Confirmed recruiting actions/, "confirmed action mode should exist");
assert.match(help, /Enable Action Agent\?/, "permission modal should exist");
assert.match(help, /I will not perform sensitive actions|I will never perform sensitive actions/, "action safety copy should exist");
assert.match(help, /\/api\/v1\/help\/parse-intent/, "frontend should call backend intent parser");
assert.match(help, /\/api\/v1\/help\/chat/, "frontend should call the server-side action agent planner");
assert.match(help, /\/api\/v1\/help\/execute/, "frontend should execute signed action plans on the backend");
assert.match(help, /\/parse-jd-file/, "Help Agent should parse uploaded JD files");
assert.match(help, /\/parse-jd-text/, "Help Agent should parse pasted JD text");
assert.match(help, /\/create-job/, "Help Agent should create jobs from completed JD drafts");
assert.match(help, /hsHelpJDFile/, "Help Agent should expose direct JD upload");
assert.match(help, /job_create_missing/, "Help Agent should ask for missing job fields before creating");
assert.match(help, /Open Apply Page/, "Help Agent should offer the apply page after job creation");
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
assert.match(help, /target === "topCandidate"[\s\S]*openJobResultThen\("openTopCandidates"\)/, "top candidate workflow should open the real Top 10 page");
assert.match(help, /wantsTenCandidatePage/, "plain '10 candidates of this job' queries should route to the Top 10 page");
assert.match(help, /Open Top 10 Candidate Page/, "Top 10 workflow should show a clear page action");
assert.match(help, /target === "insight"[\s\S]*openJobResultThen\("openInsights"\)/, "AI analytics workflow should open the real insights page");
assert.match(help, /target === "shortlistExplanation"[\s\S]*openShortlistFeature\("openShortlistExplanation"\)/, "shortlist explanation workflow should open the real explanation page");
assert.match(help, /target === "shortlistAnalytics"[\s\S]*openShortlistFeature\("openShortlistAnalytics"\)/, "shortlist analytics workflow should open the real analytics page");
assert.match(help, /FEATURE_PAGE_INTENTS/, "feature page requests should bypass stale backend intent routing");
assert.match(help, /PRODUCT_FEATURES/, "Help Agent should maintain a central product feature catalog");
assert.match(help, /function\s+handleProductFeatureQuery/, "page reference queries should route through the product feature router");
assert.match(help, /client_shortlist_report/, "client shortlist report should be included in the feature catalog");
assert.match(help, /reply_sync/, "outreach reply sync should be included in the feature catalog");
assert.match(help, /sender_setup/, "sender setup should be included in the feature catalog");
assert.match(help, /bulk_analytics/, "bulk analytics should be included in the feature catalog");
assert.match(help, /function\s+handleGroupCandidateEmailRequest/, "group candidate email requests should use a dedicated outreach router");
assert.match(help, /Mail is <strong>not sent yet<\/strong>/, "group email workflow should never imply mail was sent before composer confirmation");
assert.match(help, /Open Outreach Queue/, "group email workflow should route to the real outreach queue");
assert.match(help, /Email was not sent yet/, "unavailable send_mail plans should show a safe not-sent guard");
assert.match(help, /pendingGroupEmailRequest/, "job selection should preserve pending group email workflows");
assert.match(help, /Use HireScore Sender/, "group email workflow should ask whether to use the HireScore sender");
assert.match(help, /Use Own Domain \/ DNS/, "group email workflow should offer own-domain DNS setup");
assert.match(help, /openOwnDomainSenderModal/, "own-domain sender choice should open DNS setup");
assert.match(help, /Candidate confirmation list/, "group email workflow should preview candidates before send confirmation");
assert.match(help, /Mail cannot be sent from your own email\/domain until DNS is verified/, "own-domain path should explain DNS verification before sending");
assert.match(help, /\\bmil\\b\|\\bmeil\\b/, "Help Agent should normalize common mail typos");
assert.match(help, /analhyst/, "Help Agent should normalize common analyst typos");
assert.match(help, /\(\?:send\|mail\|email\|message\|outreach\)\.\*\?\(\?:of\|for\|to\)/, "send-mail candidate requests should extract the job title before candidate wording");
assert.match(help, /function\s+jobRecordId/, "Help Agent should normalize job id fields from job cards");
assert.match(help, /candidate\|candidates\|resume\|resumes\|profile\|profiles/, "candidate-of-job phrasing should be recognized");
assert.match(help, /\?:send\|mail\|email\|message\|outreach/, "send-mail prefixes should still be recognized after candidate-of phrasing");
assert.match(help, /Array\.isArray\(data\) \? data : \(Array\.isArray\(data\?\.results\)/, "candidate preview should handle direct array and object result responses");
assert.match(app, /window\.currentResultsSnapshot = currentResults/, "candidate preview should have a current results fallback snapshot");
assert.match(help, /function\s+candidateProfileButton/, "Help Agent should render candidate names as profile links");
assert.match(help, /data-profile-candidate-id/, "Help Agent candidate links should use the app profile trigger");
assert.match(app, /window\.registerCandidateProfile = registerCandidateProfile/, "candidate profile registration should be exposed for Help Agent");
assert.match(css, /\.hs-help-candidate-link/, "Help Agent candidate profile links should be styled");
assert.match(help, /async function\s+handleEmailSendConfirmation/, "Help Agent should execute confirmed group email sends");
assert.match(help, /sendBulkMailFromHelpAgent/, "Help Agent should call the real bulk email send helper after confirmation");
assert.match(app, /async function\s+sendBulkMailFromHelpAgent/, "app should expose a real bulk email sender for Help Agent");
assert.match(app, /API \+ "\/send-mail"/, "bulk Help Agent sends should use the real send-mail endpoint");
assert.match(help, /Mail is <strong>not sent yet<\/strong>/, "Help Agent should still distinguish sender selection from email sending");
assert.match(help, /hirescore ai mail/, "Help Agent should understand HireScore AI mail sender wording");
assert.match(help, /workflowId === "send_candidate_email"[\s\S]*respondWithGroupEmailPlan/, "Send Email quick/workflow actions should reuse the protected group email plan");
assert.match(help, /function\s+handleDnsSetupFromChat/, "Help Agent should import DNS setup pasted in chat");
assert.match(help, /parseDnsRecordLine/, "Help Agent should parse DNS record rows from chat");
assert.match(help, /importOwnDomainDnsFromHelpAgent/, "Help Agent should send parsed DNS setup into the sender setup UI");
assert.match(app, /function\s+importOwnDomainDnsFromHelpAgent/, "sender setup should accept DNS records imported by Help Agent");
assert.match(app, /ownDomainDnsTableHtml\(records, status\)/, "imported DNS records should render in the own-domain DNS table");

const pageIds = new Set([...html.matchAll(/id="([A-Za-z0-9]+)Page"/g)].map(match => match[1]));
const workflowBlock = help.slice(help.indexOf("const WORKFLOWS"), help.indexOf("const QUICK_ACTIONS"));
const workflowRoutes = [...workflowBlock.matchAll(/\bid:"([a-z_]+)"[\s\S]*?route:"([A-Za-z0-9]+)"/g)];
assert.equal(workflowRoutes.length, 32, "every registered workflow should expose a route");
for (const [, workflowId, route] of workflowRoutes) {
  assert.ok(pageIds.has(route), `${workflowId} should route to an existing ${route}Page container`);
}

for (const workflow of [
  "search_talent",
  "filter_candidates",
  "view_active_jobs",
  "jobs_needing_attention",
  "applicant_metrics",
  "view_sourcing_status",
  "create_job",
  "edit_job",
  "share_public_apply_link",
  "upload_resumes",
  "candidate_workflow",
  "select_top_candidates",
  "view_top_candidates",
  "view_ai_hiring_insights",
  "view_shortlist_ai_explanation",
  "view_shortlist_analytics",
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
assert.match(help, /lastTalentSearch/, "talent search results should be remembered for follow-up commands");
assert.match(help, /function\s+handleTalentSearchFollowUp/, "talent search follow-ups should be routed without losing context");
assert.match(help, /isTalentPageFollowUp/, "show-on-page follow-ups should be detected");
assert.match(help, /Show On Page/, "talent search cards should expose a page action");
assert.match(help, /Show Workflow/, "talent search cards should expose a workflow action");
assert.match(help, /AGENT_CONTRACT_VERSION/, "frontend should enforce a versioned backend agent contract");
assert.match(help, /authoritative \? entities : mergeEntities/, "current backend contract should be the single intent authority");
assert.match(help, /MUTATING_ACTION_IDS/, "read-only tools should be separated from mutation execution");
assert.match(help, /if\(state\.pendingContextType\)\{[\s\S]*state\.lastJobOptions = \[\]/, "new requests should clear stale pending selections");
assert.match(help, /result\.agent_contract_version === AGENT_CONTRACT_VERSION[\s\S]*Object\.assign/, "authoritative null entities should clear stale context");
assert.match(help, /state\.selectedJob = null;[\s\S]*job_id:null/, "cross-job talent search should clear stale job scope");
assert.match(help, /Which workflow do you mean\?/, "clarification should ask a focused follow-up question");
assert.match(help, /clarificationActions/, "clarification should show workflow choices");
assert.match(help, /data-help-id/, "tour should use data-help-id selectors");
assert.match(help, /top-candidates-page/, "Top 10 page should have Help Agent tour target mapping");
assert.match(help, /ai-insights-page/, "AI analytics page should have Help Agent tour target mapping");
assert.match(help, /shortlist-explanation-page/, "shortlist explanation page should have Help Agent tour target mapping");
assert.match(help, /dashboard_overview/, "dashboard overview tour should exist");
assert.match(help, /showTourStep/, "visual tour runner should exist");

assert.match(css, /\.hs-help-drawer/, "drawer styles should exist");
assert.match(css, /\.hs-help-button/, "floating button styles should exist");
assert.match(css, /#hsHelpRoot\.has-messages \.hs-help-quick/, "context quick actions should remain available after chat starts");
assert.match(css, /height:min\(720px,calc\(100dvh - 90px\)\)/, "top overlay should stay within the dynamic viewport");
assert.match(css, /grid-template-rows:auto auto auto minmax\(0,1fr\) auto auto/, "composer should have a dedicated fixed drawer row");
assert.match(css, /\.hs-help-drawer\{[\s\S]*?overflow:hidden/, "the drawer itself should never scroll the composer away");
assert.match(css, /\.hs-help-messages\{[\s\S]*?overflow-y:auto/, "only the conversation should scroll independently");
assert.match(help, /<\/div>\s*<form id="hsHelpForm" class="hs-help-form">/, "query form should remain outside the scrollable mode panel");
assert.match(css, /\.hs-help-attach/, "JD upload control should be styled inside the composer");
assert.match(css, /\.hs-tour-target/, "tour target highlight styles should exist");
assert.match(css, /@media \(max-width: 720px\)/, "mobile drawer styles should exist");

assert.match(help, /<strong>HireScoreAI Agent<\/strong><span>Live recruiting workspace<\/span>/, "persistent panel should use the fixed product-native agent naming");
assert.match(help, /HireScoreAI Agent/, "sidebar card should keep a fixed HireScoreAI Agent name");
assert.match(help, /hsHelpLauncherPrompt/, "sidebar card should contain a contextual dialogue box");
assert.match(help, /Open AI Agent/, "sidebar card should expose a clear open-agent action");
assert.match(help, /document\.body\.appendChild\(root\)/, "agent panel root should stay at body level above dashboard stacking contexts");
assert.match(help, /sidebarFooter\.insertBefore\(launcher, sidebarFooter\.firstChild\)/, "only the desktop launcher should mount inside the sidebar footer");
assert.match(help, /function\s+contextQuickActions/, "quick actions should depend on screen context");
assert.match(help, /function\s+agentPagePresentation/, "launcher copy should depend on the current page context");
assert.match(help, /Creating a job\?/, "job creation page should have relevant agent guidance");
assert.match(help, /Reviewing candidate outreach\?/, "outreach page should have relevant agent guidance");
assert.match(help, /Planning interviews\?/, "interview page should have relevant agent guidance");
assert.match(help, /function\s+setContext/, "frontend should expose structured context updates");
assert.match(help, /current_screen/, "current screen should reach the backend context");
assert.match(help, /job_preview/, "structured job results should render");
assert.match(help, /View Candidate/, "candidate cards should expose navigation");
assert.match(help, /Shortlist/, "candidate cards should expose shortlist action");
assert.match(help, /Compare/, "candidate cards should expose compare selection");
assert.match(app, /window\.refreshAfterAgentAction/, "completed actions should refresh persisted ATS state");
assert.match(app, /window\.applyAgentCandidateFilter/, "candidate results should update the center workspace");
assert.match(app, /shouldFilter\s*=\s*Array\.isArray/, "empty real filter results should hide every candidate row");
assert.match(css, /\.hs-help-drawer\{[\s\S]*?top:72px;[\s\S]*?right:18px;/, "agent should open as a top-right overlay without resizing ATS content");
assert.match(css, /\.hs-help-button\{[\s\S]*?width:min\(680px,calc\(100vw - 420px\)\)/, "initial agent state should be a wide top prompt bar");
assert.match(css, /\.ats-sidebar-footer \.hs-help-button\{[\s\S]*?width:100%;[\s\S]*?min-height:154px;/, "sidebar agent card should have room for contextual dialogue");
assert.match(css, /\.ats-sidebar-menu\{[\s\S]*?overflow-y:auto/, "sidebar navigation should scroll when the taller agent card needs space");
assert.doesNotMatch(css, /hs-agent-workspace-open/, "agent must not squeeze or shift the existing ATS layout");

console.log("Help Agent smoke checks passed.");
