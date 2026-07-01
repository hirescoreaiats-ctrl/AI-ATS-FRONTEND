(function(){
"use strict";

const SETTINGS_KEYS = {
onboardingSeen: "hs_help_onboarding_seen",
mode: "hs_help_agent_mode",
actionEnabled: "hs_action_agent_enabled",
confirmationRequired: "hs_action_confirmation_required"
};

const SENSITIVE_INTENTS = new Set([
"upload_resumes",
"shortlist_candidate",
"reject_candidate",
"send_candidate_email",
"schedule_interview",
"send_screening_test",
"deactivate_pilot_user"
]);

const WORKFLOWS = {
create_job: {
id:"create_job", title:"Create Job", category:"Jobs", requiredContext:[], route:"job", tourId:"create_job",
description:"Create a new job, add JD details, and start a screening pipeline.",
steps:["Open Create Job.","Add role, company, location, experience, skills, and JD.","Save the job.","Share apply links or upload resumes."],
allowedModes:["guide"], isSensitiveAction:false
},
edit_job: {
id:"edit_job", title:"Edit Job", category:"Jobs", requiredContext:["job"], route:"editJob", tourId:"create_job",
description:"Update role details, JD, status, or sourcing settings.",
steps:["Open Edit Job.","Choose the job.","Update details.","Save changes."],
allowedModes:["guide"], isSensitiveAction:false
},
share_public_apply_link: {
id:"share_public_apply_link", title:"Share Public Apply Link", category:"Jobs", requiredContext:["job"], route:"applyJob", tourId:"create_job",
description:"Copy public apply links for a job and share them with candidates.",
steps:["Open Apply Pages.","Choose the job.","Copy the public apply link.","Share it on your sourcing channel."],
allowedModes:["guide"], isSensitiveAction:false
},
upload_resumes: {
id:"upload_resumes", title:"Upload Resumes", category:"Resumes", requiredContext:["job"], route:"dashboard", tourId:"upload_resumes",
description:"Upload candidate resumes into a specific job for parsing and scoring.",
steps:["Open the job where you want to upload resumes.","Click Folder or the upload resume entry.","Select resume files.","Upload and wait for parsing/scoring."],
allowedModes:["guide"], isSensitiveAction:true
},
review_ai_ranked_candidates: {
id:"review_ai_ranked_candidates", title:"Review AI Scores", category:"Candidates", requiredContext:["job"], route:"results", tourId:"review_ai_ranked_candidates",
description:"Review AI-ranked candidates, fit bands, and recruiter signals.",
steps:["Open Recruiter.","Choose a job.","Review ranking, score, and score signals.","Open candidate profiles for details."],
allowedModes:["guide"], isSensitiveAction:false
},
view_shortlisted_candidates: {
id:"view_shortlisted_candidates", title:"View Shortlisted Candidates", category:"Candidates", requiredContext:["job"], route:"results", tourId:"review_ai_ranked_candidates",
description:"Open the shortlisted candidates for a selected job.",
steps:["Open Recruiter.","Select the job.","Filter or review candidates in the shortlisted stage.","Open candidate profiles as needed."],
allowedModes:["guide"], isSensitiveAction:false
},
view_candidates_by_stage: {
id:"view_candidates_by_stage", title:"View Candidates by Stage", category:"Candidates", requiredContext:["job"], route:"results", tourId:"review_ai_ranked_candidates",
description:"Open candidates for a selected job by pipeline stage.",
steps:["Open Recruiter.","Select the job.","Choose the candidate stage filter.","Review the candidates in that stage."],
allowedModes:["guide"], isSensitiveAction:false
},
view_candidate_profile: {
id:"view_candidate_profile", title:"View Candidate Profile", category:"Candidates", requiredContext:["candidate"], route:"results", tourId:"review_ai_ranked_candidates",
description:"Open candidate profile details from results.",
steps:["Open candidate results.","Click a candidate or profile button.","Review resume, skills, score, and recruiter notes."],
allowedModes:["guide"], isSensitiveAction:false
},
explain_candidate_score: {
id:"explain_candidate_score", title:"Explain Candidate Score", category:"AI Scoring", requiredContext:["candidate"], route:"results", tourId:"explain_candidate_score",
description:"Understand matched skills, missing skills, score caps, and AI ranking.",
steps:["Open a candidate profile.","Review score, matched skills, missing skills, and concerns.","Use score explanation to validate the ranking."],
allowedModes:["guide"], isSensitiveAction:false
},
shortlist_candidate: {
id:"shortlist_candidate", title:"Shortlist Candidates", category:"Candidates", requiredContext:["candidate"], route:"results", tourId:"shortlist_candidate",
description:"Move promising candidates into shortlist after review.",
steps:["Open Recruiter results.","Review AI-ranked candidates.","Use shortlist action after checking evidence.","Confirm the candidate stage."],
allowedModes:["guide"], isSensitiveAction:true
},
reject_candidate: {
id:"reject_candidate", title:"Reject Candidate", category:"Candidates", requiredContext:["candidate"], route:"results", tourId:"shortlist_candidate",
description:"Reject candidates after recruiter review.",
steps:["Open candidate results.","Review score and evidence.","Use reject action only after validation."],
allowedModes:["guide"], isSensitiveAction:true
},
send_candidate_email: {
id:"send_candidate_email", title:"Send Email", category:"Communication", requiredContext:["job"], route:"communication", tourId:"send_candidate_email",
description:"Email candidates or shortlisted groups from the outreach workflow.",
steps:["Open Outreach.","Select the job or candidate group.","Preview the email.","Send only after checking the message."],
allowedModes:["guide"], isSensitiveAction:true
},
schedule_interview: {
id:"schedule_interview", title:"Schedule Interview", category:"Interview", requiredContext:["candidate"], route:"interviewDashboard", tourId:"schedule_interview",
description:"Guide interview scheduling for a candidate.",
steps:["Open Interview Dashboard.","Choose the candidate.","Pick date, time, round, and interviewer.","Confirm details before scheduling."],
allowedModes:["guide"], isSensitiveAction:true
},
send_screening_test: {
id:"send_screening_test", title:"Screening Test", category:"Assessment", requiredContext:["candidate"], route:"results", tourId:"send_screening_test",
description:"Send a screening assessment after candidate review.",
steps:["Open candidate workflow.","Choose screening test.","Preview candidate and test details.","Send only after confirmation."],
allowedModes:["guide"], isSensitiveAction:true
},
view_test_result: {
id:"view_test_result", title:"View Test Result", category:"Assessment", requiredContext:["candidate"], route:"results", tourId:"send_screening_test",
description:"Review submitted screening test result.",
steps:["Open candidate profile or assessment area.","Find test result.","Review score and answers."],
allowedModes:["guide"], isSensitiveAction:false
},
invite_pilot_user: {
id:"invite_pilot_user", title:"Admin / Pilot Access", category:"Admin", requiredContext:["user"], route:"pilotUsers", tourId:"invite_pilot_user",
description:"Invite pilot users or clients if your account has admin access.",
steps:["Open Pilot Access.","Add user email and role.","Send invite after checking permissions."],
allowedModes:["guide"], isSensitiveAction:true
},
deactivate_pilot_user: {
id:"deactivate_pilot_user", title:"Deactivate Pilot User", category:"Admin", requiredContext:["user"], route:"pilotUsers", tourId:"invite_pilot_user",
description:"Deactivate a pilot user from admin controls.",
steps:["Open Pilot Access.","Find the user.","Review impact.","Deactivate only after confirmation."],
allowedModes:["guide"], isSensitiveAction:true
},
view_plan_usage_limits: {
id:"view_plan_usage_limits", title:"Plan / Usage Limits", category:"Billing", requiredContext:[], route:"support", tourId:"view_plan_usage_limits",
description:"Understand plan limits, usage, billing, and support options.",
steps:["Open Support or account usage area.","Review plan or usage details.","Contact support if limits need changing."],
allowedModes:["guide"], isSensitiveAction:false
}
};

const QUICK_ACTIONS = [
["create_job","Create Job"],["upload_resumes","Upload Resumes"],["review_ai_ranked_candidates","Review AI Scores"],
["shortlist_candidate","Shortlist Candidates"],["send_candidate_email","Send Email"],["schedule_interview","Schedule Interview"],
["send_screening_test","Screening Test"],["invite_pilot_user","Admin / Pilot Access"],["view_plan_usage_limits","Plan / Usage Limits"]
];

const TOURS = {
dashboard_overview: [
["dashboard-summary","Dashboard summary","Track active jobs, total applicants, top score, and average score here."],
["jobs-menu","Jobs section","Use Jobs to manage openings and hiring workflow entry points."],
["create-job-button","Create Job","Start here when you need to add a new JD or opening."],
["job-card","Job management","Open candidate results, top candidates, posts, and folder upload from each job row."],
["ai-score-column","Applications and AI ranking","This area shows job volume and scoring signals across active jobs."],
["help-agent-button","Help Agent","Open this guide anytime when you are unsure what to do next."]
],
create_job: [["create-job-button","Create Job","Click Create Job, fill JD details, and save the opening."],["jobs-menu","Jobs menu","Return to Jobs to review the created role."]],
upload_resumes: [["job-card","Upload resumes","Find the job row and use Folder or upload entry to add resumes."],["ai-score-column","Wait for scoring","After upload, parsing and AI scoring will update candidate results."]],
review_ai_ranked_candidates: [["jobs-menu","Open Recruiter","Use the Recruiter area to review AI-ranked candidates."],["ai-score-column","AI score signals","Scores help rank candidates, but recruiter review still matters."]],
explain_candidate_score: [["ai-score-column","Score explanation","Open candidate profile to inspect matched skills, gaps, caps, strengths, and concerns."]],
shortlist_candidate: [["job-card","Open results","Open job results first, then shortlist after reviewing evidence."]],
send_candidate_email: [["jobs-menu","Outreach","Open Outreach, select candidates, preview email, then send manually."]],
schedule_interview: [["jobs-menu","Interview dashboard","Open Interview Dashboard, pick candidate/date/time, then confirm manually."]],
send_screening_test: [["jobs-menu","Screening test","Open the candidate workflow and send screening tests after review."]],
invite_pilot_user: [["admin-menu","Pilot access","Admins can invite pilot users from this menu when available."]],
view_plan_usage_limits: [["help-agent-button","Need limits help?","Use Help Agent or Support for plan and usage questions."]]
};

const state = {
messages: [],
lastIntent: null,
pendingContextType: null,
lastJobOptions: [],
lastCandidateOptions: [],
selectedJob: null,
selectedCandidate: null,
jobsCache: null,
tour: {active:false, steps:[], index:0}
};

function esc(value){
return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

function clean(value){ return String(value || "").trim(); }

function tokenExists(){ return !!localStorage.getItem("token"); }

function getSetting(key, fallback){
let value = localStorage.getItem(key);
return value == null ? fallback : value;
}

function setSetting(key, value){ localStorage.setItem(key, String(value)); }

function mode(){ return getSetting(SETTINGS_KEYS.mode, "guide"); }

function actionEnabled(){ return getSetting(SETTINGS_KEYS.actionEnabled, "false") === "true"; }

function normalizeText(text){
return clean(text).toLowerCase()
.replace(/[._-]+/g," ")
.replace(/\s+/g," ")
.replace(/\bupl\s*aod\b/g,"upload")
.replace(/\buplod\b/g,"upload")
.replace(/\buplaod\b/g,"upload")
.replace(/\bkrna\b/g,"karna")
.replace(/\bkarni\b/g,"karna")
.replace(/\bwali\b/g,"wali");
}

function includesAny(text, words){ return words.some(word => text.includes(word)); }

function fuzzyContains(text, word){
if(text.includes(word)) return true;
let tokens = text.split(/\s+/);
return tokens.some(token => levenshtein(token, word) <= 1 && Math.min(token.length, word.length) > 3);
}

function levenshtein(a,b){
let dp = Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
for(let i=0;i<=a.length;i++) dp[i][0]=i;
for(let j=0;j<=b.length;j++) dp[0][j]=j;
for(let i=1;i<=a.length;i++){
for(let j=1;j<=b.length;j++){
dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
}
}
return dp[a.length][b.length];
}

function extractJobTitle(raw){
let text = clean(raw);
let patterns = [
/([a-z0-9 .+#-]+?)\s+wali\s+job/i,
/([a-z0-9 .+#-]+?)\s+job\s+me/i,
/for\s+([a-z0-9 .+#-]+?)\s+job/i,
/in\s+([a-z0-9 .+#-]+?)\s+job/i
];
for(let pattern of patterns){
let match = text.match(pattern);
if(match && match[1]) return clean(match[1]).replace(/\b(the|this|that)\b/ig,"").trim();
}
let knownJobs = Array.isArray(window.dashboardJobs) ? window.dashboardJobs : [];
let lowered = text.toLowerCase();
let found = knownJobs.find(job => clean(job.job_title).length > 2 && lowered.includes(clean(job.job_title).toLowerCase()));
return found ? clean(found.job_title) : null;
}

function extractCandidateName(raw){
let text = clean(raw);
let match = text.match(/\b([A-Z][a-z]{2,})\s+(?:ka|ke|ki)?\s*(?:interview|mail|email|test|profile|score|shortlist)/);
if(match) return match[1];
match = text.match(/\b(?:candidate|profile)\s+([A-Za-z]{2,})\b/i);
return match ? match[1] : null;
}

function resolveIntent(raw){
let text = normalizeText(raw);
let intent = null;
let confidence = 0.25;

if(includesAny(text, ["cv", "resume", "profile"]) && (includesAny(text, ["upload", "add", "dalna", "dalo", "add karna"]) || fuzzyContains(text, "upload"))){
intent = "upload_resumes"; confidence = 0.92;
}else if(includesAny(text, ["new job", "create job", "job create", "opening create", "jd add", "jd banana", "role create"])){
intent = "create_job"; confidence = 0.9;
}else if(includesAny(text, ["apply link", "public link", "share link"])){
intent = "share_public_apply_link"; confidence = 0.88;
}else if(includesAny(text, ["score", "ranking", "ranked", "ai score", "top score", "explain"])){
intent = text.includes("explain") ? "explain_candidate_score" : "review_ai_ranked_candidates"; confidence = 0.82;
}else if(includesAny(text, ["mail", "email", "message", "bhejna"])){
intent = "send_candidate_email"; confidence = 0.84;
}else if(includesAny(text, ["shortlist", "select", "top candidate", "top candidates"])){
intent = "shortlist_candidate"; confidence = 0.86;
}else if(includesAny(text, ["reject", "not fit"])){
intent = "reject_candidate"; confidence = 0.82;
}else if(includesAny(text, ["interview", "call", "meeting", "schedule"])){
intent = "schedule_interview"; confidence = 0.86;
}else if(includesAny(text, ["test", "assessment", "screening"])){
intent = "send_screening_test"; confidence = 0.84;
}else if(includesAny(text, ["client access", "pilot", "invite user", "access dena"])){
intent = "invite_pilot_user"; confidence = 0.84;
}else if(includesAny(text, ["plan", "limit", "usage", "billing"])){
intent = "view_plan_usage_limits"; confidence = 0.86;
}

let entities = {
job_title: extractJobTitle(raw),
candidate_name: extractCandidateName(raw),
candidate_group: text.includes("shortlisted") || text.includes("shortlist") ? "shortlisted" : null,
stage: text.includes("shortlisted") || text.includes("shortlist") ? "shortlisted" : null,
date_time: null,
email: (raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [null])[0],
plan: includesAny(text, ["plan", "limit", "usage", "billing"]) ? "usage" : null
};

if((text.includes("shortlisted") || text.includes("shortlist")) && /\b(want|show|view|list|candidate|candidates|candiate)\b/.test(text)){
intent = "view_shortlisted_candidates";
confidence = 0.9;
entities.candidate_group = "shortlisted";
entities.stage = "shortlisted";
entities.candidate_name = null;
}

if(!intent){
return {
intent:null,
entities,
confidence:0.2,
clarification_needed:true,
clarification_question:"What would you like help with?"
};
}

let workflow = WORKFLOWS[intent];
let needsClarification = confidence < 0.55 || !workflow;
return {intent, entities, confidence, clarification_needed:needsClarification, clarification_question:needsClarification ? "Which workflow do you mean?" : ""};
}

function currentHelpRoute(){
return window.location?.pathname || "dashboard";
}

function currentHelpContext(){
return {
job_id: state.selectedJob?.id || null,
candidate_id: state.selectedCandidate?.id || null
};
}

async function parseIntentWithBackend(message){
let base = (window.API_BASE_URL || window.__HIRESCORE_API_BASE__ || "").replace(/\/$/, "");
if(!base) throw new Error("API base unavailable");
let controller = new AbortController();
let timeout = setTimeout(()=>controller.abort(), 4500);
try{
let headers = typeof authHeaders === "function" ? authHeaders() : {"Content-Type":"application/json","Authorization":"Bearer " + localStorage.getItem("token")};
if(!headers["Content-Type"] && !(headers instanceof Headers)) headers["Content-Type"] = "application/json";
let res = await fetch(base + "/api/v1/help/parse-intent", {
method:"POST",
headers,
signal:controller.signal,
body:JSON.stringify({
message,
current_route:currentHelpRoute(),
current_context:currentHelpContext()
})
});
let data = await res.json().catch(()=>null);
if(!res.ok || !data) throw new Error("Intent parser unavailable");
return normalizeIntentResult(data);
}finally{
clearTimeout(timeout);
}
}

function normalizeIntentResult(data){
let fallback = {intent:null, entities:{}, confidence:0.2, clarification_needed:true, clarification_question:"What would you like help with?"};
data = data && typeof data === "object" ? data : fallback;
let entities = data.entities && typeof data.entities === "object" ? data.entities : {};
return {
intent: typeof data.intent === "string" ? data.intent : null,
entities: {
job_title: entities.job_title || null,
candidate_name: entities.candidate_name || null,
candidate_group: entities.candidate_group || null,
stage: entities.stage || null,
date_time: entities.date_time || null,
email: entities.email || null,
plan: entities.plan || null
},
confidence: Number(data.confidence || 0),
clarification_needed: Boolean(data.clarification_needed),
clarification_question: data.clarification_question || null
};
}

function shouldRequireCandidate(intentResult){
let intent = intentResult?.intent;
if(["view_candidate_profile", "explain_candidate_score"].includes(intent)) return true;
if(["schedule_interview", "reject_candidate", "shortlist_candidate"].includes(intent)){
return Boolean(intentResult?.entities?.candidate_name);
}
return false;
}

async function getJobs(){
if(Array.isArray(window.dashboardJobs) && window.dashboardJobs.length){
state.jobsCache = window.dashboardJobs;
return state.jobsCache;
}
if(state.jobsCache) return state.jobsCache;
try{
let headers = typeof authHeaders === "function" ? authHeaders() : {"Authorization":"Bearer " + localStorage.getItem("token")};
let res = await fetch(window.API_BASE_URL + "/jobs", {headers});
let data = await res.json();
state.jobsCache = Array.isArray(data) ? data : [];
return state.jobsCache;
}catch(error){
return [];
}
}

function matchJobs(jobs, title){
let active = (jobs || []).filter(job => job.is_active !== false);
if(!title) return active;
let q = normalizeText(title);
return active.filter(job => {
let hay = normalizeText([job.job_title, job.company_name, job.location, job.work_mode].filter(Boolean).join(" "));
return hay.includes(q) || q.split(" ").some(part => part.length > 2 && hay.includes(part));
});
}

function addMessage(role, html, actions){
state.messages.push({role, html, actions: actions || []});
renderMessages();
}

function removeMessage(message){
let index = state.messages.indexOf(message);
if(index >= 0){
state.messages.splice(index, 1);
renderMessages();
}
}

function actionButton(label, action, data){
return {label, action, data:data || {}};
}

function renderMessages(){
let box = document.getElementById("hsHelpMessages");
if(!box) return;
box.innerHTML = state.messages.map((msg, index) => `
<div class="hs-help-message is-${esc(msg.role)}">
<div class="hs-help-bubble">${msg.html}</div>
${msg.actions && msg.actions.length ? `<div class="hs-help-message-actions">${msg.actions.map((item, actionIndex)=>`
<button type="button" onclick="window.HireScoreHelpAgent.runMessageAction(${index}, ${actionIndex})">${esc(item.label)}</button>
`).join("")}</div>` : ""}
</div>
`).join("");
box.scrollTop = box.scrollHeight;
}

function renderModeInfo(){
let modeInfo = document.getElementById("hsHelpModeInfo");
let select = document.getElementById("hsAgentMode");
if(select) select.value = mode();
if(!modeInfo) return;
if(mode() === "action"){
modeInfo.innerHTML = `
<strong>Action Agent is active</strong>
<p>I can perform supported tasks for you, but I will always ask for confirmation first.</p>
<ul><li>Upload resumes after confirmation</li><li>Shortlist candidates after preview</li><li>Send emails after email preview</li><li>Schedule interviews after confirmation</li><li>Send screening tests after confirmation</li></ul>
<small>I will never perform sensitive actions without your confirmation. Real action execution is scaffolded only in this version.</small>
`;
}else{
modeInfo.innerHTML = `
<strong>Guide Agent is active</strong>
<p>I can guide you step by step, open the right page, and start visual walkthroughs.</p>
<ul><li>Explain how to use HireScore AI</li><li>Open the correct page</li><li>Start visual walkthroughs</li><li>Show step-by-step guidance</li><li>Help find jobs or candidates</li></ul>
<small>Cannot upload resumes, send emails, schedule interviews, shortlist/reject candidates, send tests, or change plan/settings.</small>
`;
}
}

function workflowHtml(workflow, context){
let title = esc(workflow.title);
let body = esc(workflow.description);
let steps = workflow.steps.map(step => `<li>${esc(step)}</li>`).join("");
let contextLine = context && context.job ? `<p><strong>Job:</strong> ${esc(context.job.job_title || "Selected job")} ${context.job.company_name ? "at " + esc(context.job.company_name) : ""}</p>` : "";
return `<strong>${title}</strong><p>${body}</p>${contextLine}<ol>${steps}</ol><p>I will guide only. I will not perform sensitive actions in this version.</p>`;
}

async function handleWorkflow(intentResult, contextOverride){
if(!intentResult || !intentResult.intent || !WORKFLOWS[intentResult.intent]){
showClarification();
return;
}
let workflow = WORKFLOWS[intentResult.intent];
state.lastIntent = intentResult.intent;

if(workflow.requiredContext.includes("job") && !contextOverride?.job){
let jobs = await getJobs();
let matches = matchJobs(jobs, intentResult.entities.job_title);
if(intentResult.entities.job_title && matches.length === 1){
state.selectedJob = matches[0];
return handleWorkflow(intentResult, {job: matches[0]});
}
if(matches.length > 1 || (!intentResult.entities.job_title && matches.length)){
state.pendingContextType = "job";
state.lastJobOptions = matches.slice(0, 8);
addMessage("agent", `<strong>Which job do you want to use?</strong><p>Select a job so I can guide you in the right context.</p>${renderJobCards(state.lastJobOptions)}`);
return;
}
addMessage("agent", `<strong>I could not find that job.</strong><p>You can create a job, view all jobs, or try another search.</p>`, [
actionButton("Create Job","openPage",{page:"job"}),
actionButton("View All Jobs","openPage",{page:"dashboard"})
]);
return;
}

if(shouldRequireCandidate(intentResult) && !contextOverride?.candidate){
state.pendingContextType = "candidate";
let candidateName = intentResult.entities.candidate_name;
let question = candidateName ? `I found the name "${esc(candidateName)}", but I need you to choose the candidate from results.` : "Which candidate should I use?";
addMessage("agent", `<strong>${question}</strong><p>Open the candidate results page, then select the candidate. I can guide you there.</p>`, [
actionButton("Open Candidate Results","openPage",{page:"results"}),
actionButton("Start Visual Guide","tour",{tourId:workflow.tourId})
]);
return;
}

let actions = [
actionButton(workflow.id === "view_shortlisted_candidates" ? "Start Visual Guide" : "Start Visual Guide","tour",{tourId:workflow.tourId}),
actionButton(workflow.id === "view_shortlisted_candidates" ? "Open Shortlisted Candidates" : "Open Page","openPage",{page:workflow.route}),
actionButton("Read Guide","readGuide",{workflowId:workflow.id})
];
if(workflow.id === "view_shortlisted_candidates" && contextOverride?.job){
let jobTitle = contextOverride.job.job_title || "selected";
addMessage("agent", `<strong>I can show shortlisted candidates for the ${esc(jobTitle)} job.</strong><p>I will open the right recruiter view and guide you. I will not change any candidate status.</p>`, actions);
return;
}
if(mode() === "guide" && SENSITIVE_INTENTS.has(workflow.id)){
addMessage("agent", `<strong>I can guide you, but I will not perform this action.</strong>${workflowHtml(workflow, contextOverride)}`, actions);
return;
}
addMessage("agent", workflowHtml(workflow, contextOverride), actions);
}

function renderJobCards(jobs){
return `<div class="hs-help-card-list">${jobs.map((job, index)=>`
<button type="button" class="hs-help-select-card" onclick="window.HireScoreHelpAgent.selectJob(${index})">
<strong>${esc(job.job_title || "Untitled Job")}</strong>
<span>${esc(job.company_name || "Company not specified")}</span>
<small>${esc(job.location || "Location N/A")} ${job.work_mode ? " | " + esc(job.work_mode) : ""} | ${Number(job.total_applicants || 0)} candidates | ${job.is_active === false ? "Inactive" : "Active"}</small>
</button>
`).join("")}</div>`;
}

function showClarification(){
addMessage("agent", `<strong>I want to guide you correctly.</strong><p>Which workflow do you mean?</p>`, [
actionButton("Upload Resumes","workflow",{workflowId:"upload_resumes"}),
actionButton("Create Job","workflow",{workflowId:"create_job"}),
actionButton("Send Email","workflow",{workflowId:"send_candidate_email"}),
actionButton("Schedule Interview","workflow",{workflowId:"schedule_interview"}),
actionButton("View Plan / Usage","workflow",{workflowId:"view_plan_usage_limits"})
]);
}

async function handleUserText(text){
let value = clean(text);
if(!value) return;
addMessage("user", esc(value));

let normalized = normalizeText(value);
if(state.pendingContextType === "job" && state.lastJobOptions.length){
let ordinal = normalized.match(/\b(first|1st|one|second|2nd|two|third|3rd|three)\b/);
if(ordinal){
let map = {first:0,"1st":0,one:0,second:1,"2nd":1,two:1,third:2,"3rd":2,three:2};
let key = ordinal[1];
if(state.lastJobOptions[map[key]]) return selectJob(map[key]);
}
}

let loadingMessage = {role:"agent", html:"<em>Understanding your request...</em>", actions:[]};
state.messages.push(loadingMessage);
renderMessages();
let result;
try{
result = await parseIntentWithBackend(value);
}catch(error){
result = resolveIntent(value);
}finally{
removeMessage(loadingMessage);
}
if(result.clarification_needed) return showClarification();
return handleWorkflow(result);
}

function openPage(page){
if(typeof window.showPage === "function"){
window.showPage(page || "dashboard");
}
}

function readGuide(workflowId){
let workflow = WORKFLOWS[workflowId] || WORKFLOWS.create_job;
addMessage("agent", workflowHtml(workflow, state.selectedJob ? {job:state.selectedJob} : null), [
actionButton("Start Visual Guide","tour",{tourId:workflow.tourId}),
actionButton("Open Page","openPage",{page:workflow.route})
]);
}

function startTour(tourId){
let steps = (TOURS[tourId] || TOURS.dashboard_overview).map(step => ({id:step[0], title:step[1], body:step[2]}));
state.tour = {active:true, steps, index:0};
document.body.classList.add("hs-help-tour-active");
showTourStep();
}

function showTourStep(){
cleanupTourStep();
let tour = state.tour;
if(!tour.active || !tour.steps.length) return endTour();
let step = tour.steps[tour.index];
let target = document.querySelector(`[data-help-id="${step.id}"]`);
let overlay = document.createElement("div");
overlay.className = "hs-tour-overlay";
overlay.id = "hsTourOverlay";
let card = document.createElement("div");
card.className = "hs-tour-card";
card.id = "hsTourCard";
card.innerHTML = `
<span>${tour.index + 1} of ${tour.steps.length}</span>
<strong>${esc(step.title)}</strong>
<p>${esc(step.body)}${target ? "" : " This exact element is not visible on the current page, so I am showing the instruction here."}</p>
<div class="hs-tour-actions">
<button type="button" onclick="window.HireScoreHelpAgent.endTour()">End</button>
${tour.index > 0 ? `<button type="button" onclick="window.HireScoreHelpAgent.prevTour()">Back</button>` : ""}
<button type="button" onclick="window.HireScoreHelpAgent.nextTour()">${tour.index === tour.steps.length - 1 ? "Done" : "Next"}</button>
</div>
`;
document.body.appendChild(overlay);
document.body.appendChild(card);
if(target){
target.classList.add("hs-tour-target");
target.scrollIntoView({behavior:"smooth", block:"center", inline:"center"});
setTimeout(()=>positionTourCard(target, card), 250);
}else{
card.classList.add("is-centered");
}
}

function positionTourCard(target, card){
let rect = target.getBoundingClientRect();
let top = Math.min(window.innerHeight - card.offsetHeight - 16, Math.max(16, rect.bottom + 14));
let left = Math.min(window.innerWidth - card.offsetWidth - 16, Math.max(16, rect.left));
card.style.top = top + "px";
card.style.left = left + "px";
}

function cleanupTourStep(){
document.querySelectorAll(".hs-tour-target").forEach(el => el.classList.remove("hs-tour-target"));
document.getElementById("hsTourOverlay")?.remove();
document.getElementById("hsTourCard")?.remove();
}

function endTour(){
cleanupTourStep();
state.tour = {active:false, steps:[], index:0};
document.body.classList.remove("hs-help-tour-active");
}

function nextTour(){
if(state.tour.index >= state.tour.steps.length - 1) return endTour();
state.tour.index += 1;
showTourStep();
}

function prevTour(){
state.tour.index = Math.max(0, state.tour.index - 1);
showTourStep();
}

function openDrawer(){
ensureShell();
document.getElementById("hsHelpRoot")?.classList.add("is-open");
if(!state.messages.length){
addMessage("agent", `<strong>Hi, I am your HireScore guide.</strong><p>Ask me about jobs, resume upload, AI scores, shortlisting, emails, interviews, tests, pilot access, or plan limits.</p>`);
}
renderModeInfo();
}

function closeDrawer(){
document.getElementById("hsHelpRoot")?.classList.remove("is-open");
}

function showOnboarding(){
ensureShell();
document.getElementById("hsHelpOnboarding")?.classList.remove("hidden");
}

function closeOnboarding(markSeen){
document.getElementById("hsHelpOnboarding")?.classList.add("hidden");
if(markSeen) setSetting(SETTINGS_KEYS.onboardingSeen, "true");
}

function showPermission(){
document.getElementById("hsActionPermission")?.classList.remove("hidden");
}

function closePermission(){
document.getElementById("hsActionPermission")?.classList.add("hidden");
let select = document.getElementById("hsAgentMode");
if(select) select.value = mode();
}

function enableActionAgent(){
setSetting(SETTINGS_KEYS.actionEnabled, "true");
setSetting(SETTINGS_KEYS.mode, "action");
setSetting(SETTINGS_KEYS.confirmationRequired, "true");
document.getElementById("hsActionPermission")?.classList.add("hidden");
renderModeInfo();
addMessage("agent", `<strong>Action Agent is enabled, but real actions are still disabled in this first version.</strong><p>I will continue to guide and preview only unless a safe confirmed action registry is added later.</p>`);
}

function changeMode(value){
if(value === "action" && !actionEnabled()){
showPermission();
return;
}
setSetting(SETTINGS_KEYS.mode, value === "action" ? "action" : "guide");
renderModeInfo();
}

function quickAction(workflowId){
let workflow = WORKFLOWS[workflowId];
if(!workflow) return;
addMessage("user", esc(workflow.title));
handleWorkflow({intent:workflowId, entities:{}, confidence:1, clarification_needed:false});
}

function ensureShell(){
if(document.getElementById("hsHelpRoot")) return;
let root = document.createElement("div");
root.id = "hsHelpRoot";
root.innerHTML = `
<button id="hsHelpButton" class="hs-help-button" type="button" data-help-id="help-agent-button" onclick="window.HireScoreHelpAgent.openDrawer()">
<span>?</span><strong>Help Agent</strong>
</button>
<aside class="hs-help-drawer" aria-label="HireScore Help Agent">
<div class="hs-help-drawer-head">
<div><strong>HireScore Help Agent</strong><span>Your product guide</span></div>
<button type="button" aria-label="Close Help Agent" onclick="window.HireScoreHelpAgent.closeDrawer()">x</button>
</div>
<div class="hs-help-quick">
${QUICK_ACTIONS.map(item => `<button type="button" onclick="window.HireScoreHelpAgent.quickAction('${item[0]}')">${esc(item[1])}</button>`).join("")}
</div>
<div id="hsHelpMessages" class="hs-help-messages"></div>
<div class="hs-help-compose">
<label class="hs-agent-mode"><span>Agent Mode</span><select id="hsAgentMode" onchange="window.HireScoreHelpAgent.changeMode(this.value)"><option value="guide">Guide Agent</option><option value="action">Action Agent - Requires permission</option></select></label>
<div id="hsHelpModeInfo" class="hs-help-mode-info"></div>
<form id="hsHelpForm" class="hs-help-form">
<input id="hsHelpInput" type="text" placeholder="Ask me anything, like 'upload resumes for Data Analyst job'" autocomplete="off">
<button type="submit">Send</button>
</form>
</div>
</aside>
<div id="hsHelpOnboarding" class="hs-help-modal-backdrop hidden">
<section class="hs-help-modal" role="dialog" aria-modal="true">
<strong>Welcome to HireScore AI &#128075;</strong>
<p>I can guide you through the product and help you get started faster.</p>
<span>Choose how you want to continue:</span>
<button type="button" onclick="window.HireScoreHelpAgent.startOnboardingTour()">Start Product Walkthrough</button>
<button type="button" onclick="window.HireScoreHelpAgent.askAgentFromOnboarding()">Ask Help Agent</button>
<button type="button" onclick="window.HireScoreHelpAgent.skipOnboarding()">Skip for now</button>
</section>
</div>
<div id="hsActionPermission" class="hs-help-modal-backdrop hidden">
<section class="hs-help-modal" role="dialog" aria-modal="true">
<strong>Enable Action Agent?</strong>
<p>Action Agent can perform tasks like uploading resumes, shortlisting candidates, sending emails, scheduling interviews, and sending screening tests. It will always ask for confirmation before taking any action.</p>
<button type="button" onclick="window.HireScoreHelpAgent.enableActionAgent()">Enable Action Agent</button>
<button type="button" onclick="window.HireScoreHelpAgent.keepGuideAgent()">Keep Guide Agent</button>
</section>
</div>
`;
document.body.appendChild(root);
document.getElementById("hsHelpForm").addEventListener("submit", event => {
event.preventDefault();
let input = document.getElementById("hsHelpInput");
let text = input.value;
input.value = "";
handleUserText(text);
});
renderModeInfo();
}

function applyRuntimeHelpIds(){
let mappings = [
["button[onclick*=\"showPage('applyJob')\"]","public-apply-link-button"],
["button[onclick*=\"showPage('job')\"]","create-job-button"],
["#dashboardJobTable","job-card"],
["#resultsTable, #shortlistTable","candidates-table"],
["#jobResultPage, #resultsPage","job-details-section"],
["#resumeUpload, input[type='file']","resume-file-dropzone"],
["button[onclick*='shortlist'], .shortlist-btn","shortlist-button"],
["button[onclick*='reject'], .reject-btn","reject-button"],
["button[onclick*='Communication'], #communicationPage button","communication-email-button"],
["button[onclick*='Interview'], #interviewDashboardPage button","schedule-interview-button"],
["button[onclick*='test'], button[onclick*='assessment']","screening-test-button"],
["#pilotUsersPage","pilot-access-tab"],
["#applicationsBySourceCard","plan-usage-card"],
[".ats-recruiter-visibility-panel","matched-skills-section"],
[".ats-recruiter-visibility-panel","missing-skills-section"],
["button[onclick*='candidateProfile'], button[onclick*='openCandidate']","candidate-profile-button"]
];
mappings.forEach(([selector, id]) => {
let element = document.querySelector(selector);
if(element && !element.dataset.helpId) element.dataset.helpId = id;
});
}

function init(){
if(!tokenExists()) return;
if(localStorage.getItem(SETTINGS_KEYS.mode) == null) setSetting(SETTINGS_KEYS.mode, "guide");
if(localStorage.getItem(SETTINGS_KEYS.actionEnabled) == null) setSetting(SETTINGS_KEYS.actionEnabled, "false");
if(localStorage.getItem(SETTINGS_KEYS.confirmationRequired) == null) setSetting(SETTINGS_KEYS.confirmationRequired, "true");
ensureShell();
applyRuntimeHelpIds();
if(getSetting(SETTINGS_KEYS.onboardingSeen, "false") !== "true"){
setTimeout(showOnboarding, 700);
}
}

window.HireScoreHelpAgent = {
openDrawer, closeDrawer, quickAction, changeMode, enableActionAgent,
keepGuideAgent:function(){ setSetting(SETTINGS_KEYS.mode, "guide"); setSetting(SETTINGS_KEYS.actionEnabled, "false"); closePermission(); renderModeInfo(); },
startOnboardingTour:function(){ closeOnboarding(true); openPage("dashboard"); setTimeout(()=>startTour("dashboard_overview"), 450); },
askAgentFromOnboarding:function(){ closeOnboarding(true); openDrawer(); },
skipOnboarding:function(){ closeOnboarding(true); },
runMessageAction:function(messageIndex, actionIndex){
let item = state.messages[messageIndex]?.actions?.[actionIndex];
if(!item) return;
if(item.action === "openPage") openPage(item.data.page);
if(item.action === "tour") startTour(item.data.tourId);
if(item.action === "readGuide") readGuide(item.data.workflowId);
if(item.action === "workflow") handleWorkflow({intent:item.data.workflowId, entities:{}, confidence:1, clarification_needed:false});
},
selectJob:function(index){
let job = state.lastJobOptions[index];
if(!job) return;
state.selectedJob = job;
state.pendingContextType = null;
addMessage("user", esc(job.job_title || "Selected job"));
handleWorkflow({intent:state.lastIntent || "upload_resumes", entities:{}, confidence:1, clarification_needed:false}, {job});
},
nextTour, prevTour, endTour,
resolveIntent,
_state: state,
_workflows: WORKFLOWS
};

document.addEventListener("DOMContentLoaded", init);
window.addEventListener("load", () => setTimeout(applyRuntimeHelpIds, 1000));
})();
