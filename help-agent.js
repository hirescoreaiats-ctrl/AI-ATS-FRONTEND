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
"candidate_workflow",
"select_top_candidates",
"shortlist_candidate",
"reject_candidate",
"move_candidates_to_communication",
"move_candidates_to_interview",
"send_candidate_email",
"schedule_interview",
"send_screening_test",
"deactivate_pilot_user"
]);

const WORKFLOWS = {
candidate_workflow: {
id:"candidate_workflow", title:"Candidate Workflow", category:"Action Agent", requiredContext:["job"], route:"results", tourId:"review_ai_ranked_candidates",
description:"Guide or execute a multi-step candidate workflow such as selecting top candidates and moving them to Communication.",
steps:["Open the job's candidate results.","Review top AI-ranked candidates.","Confirm selected candidates.","Action Agent can shortlist and move them only after permission."],
allowedModes:["guide","action"], isSensitiveAction:true
},
select_top_candidates: {
id:"select_top_candidates", title:"Select Top Candidates", category:"Candidates", requiredContext:["job"], route:"results", tourId:"review_ai_ranked_candidates",
description:"Find the highest-ranked candidates for a selected job.",
steps:["Open candidate results.","Sort by AI score/rank.","Review evidence for the top candidates.","Select the candidates you want to move forward."],
allowedModes:["guide","action"], isSensitiveAction:false
},
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
id:"share_public_apply_link", title:"Apply Pages", category:"Jobs", requiredContext:[], route:"applyJob", tourId:"share_public_apply_link",
description:"Open public apply pages, copy job application links, and share them with candidates.",
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
move_candidates_to_communication: {
id:"move_candidates_to_communication", title:"Move to Communication", category:"Communication", requiredContext:["job"], route:"communication", tourId:"send_candidate_email",
description:"Move recruiter-approved shortlisted candidates into Communication.",
steps:["Open candidate results.","Shortlist approved candidates.","Open Communication.","Move shortlisted candidates into outreach after confirmation."],
allowedModes:["guide","action"], isSensitiveAction:true
},
move_candidates_to_interview: {
id:"move_candidates_to_interview", title:"Move to Interview", category:"Interview", requiredContext:["job"], route:"interviewDashboard", tourId:"schedule_interview",
description:"Move communication-ready candidates into interview scheduling.",
steps:["Open Communication.","Confirm candidate interest/test status.","Move candidates into Interview Scheduling.","Add interview slot details."],
allowedModes:["guide","action"], isSensitiveAction:true
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
["share_public_apply_link","Apply Pages"],["candidate_workflow","Shortlist Candidates"],["send_candidate_email","Send Email"],["schedule_interview","Schedule Interview"],
["send_screening_test","Screening Test"],["invite_pilot_user","Admin / Pilot Access"],["view_plan_usage_limits","Plan / Usage Limits"]
];

const INTENT_ALIASES = {
review_ai_scores: "review_ai_ranked_candidates",
shortlist_candidates: "candidate_workflow",
send_email: "send_candidate_email",
screening_test: "send_screening_test",
admin_pilot_access: "invite_pilot_user",
plan_usage_limits: "view_plan_usage_limits",
open_create_job: "create_job",
open_upload_resumes: "upload_resumes",
open_ai_scores: "review_ai_ranked_candidates",
open_shortlist: "candidate_workflow",
open_communication: "send_candidate_email",
open_interviews: "schedule_interview",
open_screening_test: "send_screening_test",
open_admin_access: "invite_pilot_user",
open_plan_usage: "view_plan_usage_limits"
};

const TOURS = {
dashboard_overview: [
["dashboard-summary","Dashboard summary","Track active jobs, total applicants, top score, and average score here."],
["jobs-menu","Jobs section","Use Jobs to manage openings and hiring workflow entry points."],
["create-job-button","Create Job","Start here when you need to add a new JD or opening."],
["job-card","Job management","Open candidate results, top candidates, posts, and folder upload from each job row."],
["ai-score-column","Applications and AI ranking","This area shows job volume and scoring signals across active jobs."],
["help-agent-button","Help Agent","Open this guide anytime when you are unsure what to do next."]
],
create_job: [["create-job-button","Create Job","Click Create Job, fill role details, add skills/JD, and save the opening."],["job-form","Job details form","Complete the required fields before saving."],["jobs-menu","Jobs menu","Return to Jobs to review the created role."]],
share_public_apply_link: [["public-apply-link-button","Apply Pages","Open Apply Pages from the Jobs dashboard."],["apply-page-list","Job apply links","Choose the job and copy the public application link."],["jobs-menu","Jobs menu","Return to Jobs when you need to manage openings."]],
upload_resumes: [["job-card","Choose the job","Find the job row where resumes should be uploaded."],["job-upload-button","Upload resumes","Use the Folder/Upload action on that job row to add resumes."],["ai-score-column","Wait for scoring","After upload, parsing and AI scoring will update candidate results."]],
review_ai_ranked_candidates: [["recruiter-menu","Open Recruiter","Use the Recruiter workspace to review AI-ranked candidates."],["recruiter-job-list","Choose a job","Open candidate results for the role you want to inspect."],["candidate-results-table","AI-ranked results","Review score, matched skills, missing skills, and evidence before acting."]],
explain_candidate_score: [["candidate-results-table","Score explanation","Open a candidate profile to inspect matched skills, gaps, caps, strengths, and concerns."]],
shortlist_candidate: [["candidate-results-table","Review candidates","Open job results first and validate evidence."],["shortlist-button","Shortlist action","Use shortlist only after checking the profile and score explanation."]],
send_candidate_email: [["outreach-menu","Open Outreach","Go to Outreach for role-specific communication queues."],["communication-job-list","Choose outreach job","Open the job queue and preview candidates."],["communication-email-button","Preview email","Check the message before sending."]],
schedule_interview: [["interview-menu","Open Interview Dashboard","Use Interview Dashboard for scheduling."],["schedule-interview-button","New schedule","Choose candidate, round, date, time, and interviewer."],["interview-table","Interview pipeline","Track scheduled and pending interview rounds here."]],
send_screening_test: [["candidate-results-table","Open candidate workflow","Choose the candidate first."],["screening-test-button","Screening test","Preview the assessment before sending."]],
invite_pilot_user: [["admin-menu","Pilot access","Admins can invite pilot users from this menu when available."],["pilot-create-form","Create pilot invite","Enter email and create controlled access."]],
view_plan_usage_limits: [["support-menu","Support","Open Support for plan, usage, and limit questions."],["support-form","Support case","Submit a case if plan or usage needs review."]]
};

const state = {
messages: [],
lastIntent: null,
pendingContextType: null,
lastJobOptions: [],
lastCandidateOptions: [],
selectedJob: null,
selectedCandidate: null,
lastParsedPlan: null,
lastUserText: "",
conversationContext: {},
jobsCache: null,
clarificationAttempts: 0,
lastClarificationText: "",
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
.replace(/[^a-z0-9+#]+/g," ")
.replace(/\s+/g," ")
.replace(/\bshort\s*(?:list|ist|lst|lis)\b/g,"shortlist")
.replace(/\bshortlisted\b/g,"shortlisted")
.replace(/\bupl\s*aod\b/g,"upload")
.replace(/\buplod\b/g,"upload")
.replace(/\buplaod\b/g,"upload")
.replace(/\bcandiate\b/g,"candidate")
.replace(/\bcandiadte\b/g,"candidate")
.replace(/\bcommincation\b|\bcommuncation\b|\bcomunication\b/g,"communication")
.replace(/\bsehdule\b|\bshedule\b/g,"schedule")
.replace(/\bkrna\b/g,"karna")
.replace(/\bkarni\b/g,"karna")
.replace(/\bwali\b/g,"wali")
.trim();
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
let text = normalizeText(raw);
let patterns = [
/(?:top\s*)?(?:candidate|candidates|resume|resumes|profile|profiles)\s+(?:of|for|in)\s+(.+?)(?:\s+(?:job|role|opening)\b|$)/i,
/(?:shortlist|select|review|show|find|list|get|give)\s+(?:me\s+)?(?:top\s*)?(?:candidate|candidates|resume|resumes|profile|profiles)?\s*(?:of|for|in)\s+(.+?)(?:\s+(?:job|role|opening)\b|$)/i,
/(.+?)(?:\s+job)?\s+(?:ke|ka|ki|kai|kay)\s+(?:top\s*)?(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)?\s*(?:candidate|candidates|resume|resumes|profile|profiles)/i,
/(.+?)\s+wali\s+job/i,
/(.+?)\s+job\s+me/i,
/(?:of|for|in)\s+(.+?)\s+(?:job|role|opening)\b/i
];
for(let pattern of patterns){
let match = text.match(pattern);
let value = match && (match[2] || match[1]);
if(value) return normalizeJobTitle(value);
}
let knownJobs = Array.isArray(window.dashboardJobs) ? window.dashboardJobs : [];
let lowered = normalizeText(text);
let found = knownJobs.find(job => clean(job.job_title).length > 2 && lowered.includes(normalizeText(job.job_title)));
return found ? clean(found.job_title) : null;
}

function normalizeJobTitle(value){
return normalizeText(value)
.replace(/\b(the|this|that|want|need|please|you|to|give|get|show|find|list|top|candidate|candidates|resume|resumes|profile|profiles|of|for|in|job|role|opening|shortlist|select|review|ke|ka|ki|kai|kay)\b/g," ")
.replace(/\s+/g," ")
.trim();
}

function extractLimit(raw){
let text = normalizeText(raw);
let words = {one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10};
let match = text.match(/\btop\s+(\d{1,3})\b/) || text.match(/\b(\d{1,3})\s+top\s+(?:candidate|candidates|resume|resumes|profile|profiles)\b/) || text.match(/\b(\d{1,3})\s+(?:candidate|candidates|resume|resumes|profile|profiles)\b/);
if(match) return Math.max(1, Math.min(Number(match[1]), 100));
match = text.match(new RegExp("\\b(?:" + Object.keys(words).join("|") + ")\\s+(?:top\\s+)?(?:candidate|candidates|resume|resumes|profile|profiles)\\b"));
if(match) return words[match[0].split(/\s+/)[0]];
if(/\btop\s+(?:candidate|resume|profile)\b/.test(text)) return 1;
return null;
}

function extractCandidateName(raw){
let text = clean(raw);
if(/\b(?:top\s*)?(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)?\s*(?:candidate|candidates)\s+(?:of|for)\b/i.test(text)) return null;
let match = text.match(/\b([A-Z][a-z]{2,})\s+(?:ka|ke|ki)?\s*(?:interview|mail|email|test|profile|score|shortlist)/);
if(match) return match[1];
match = text.match(/\b(?:candidate|profile)\s+([A-Za-z]{2,})\b/i);
if(!match) return null;
return ["shortlist","select","reject","show","find","list","upload"].includes(match[1].toLowerCase()) ? null : match[1];
}

function resolveIntent(raw){
let text = normalizeText(raw);
if(/^(?:hi|hello|hey|hii+|heyy+|namaste|namaskar|good (?:morning|afternoon|evening))(?: (?:there|bhai|bro|sir|team))?$/.test(text)){
return {
response_type:"conversation",
assistant_reply:"Hello! How can I help with your hiring workflow today? You can ask me to find candidates, upload resumes, shortlist profiles, send outreach, or schedule interviews.",
intent:null,
entities:{},
confidence:1,
clarification_needed:false
};
}
if(/\b(?:how (?:do|can|to)|where (?:do|can)|steps? (?:to|for))\b/.test(text) && /\b(?:job )?(?:result|results|candidate|candidates|score|scores|ranking|rankings)\b/.test(text)){
return {
response_type:"conversation",
assistant_reply:"To check job results, open Recruiter, choose the job, and click View Results. You will see all candidates ranked with AI scores and evidence. Open any candidate to review the full profile, matched skills, gaps, and recommendation.",
intent:null,
entities:{},
confidence:0.96,
clarification_needed:false
};
}
let intent = null;
let confidence = 0.25;
let allCandidates = /\b(?:all|every|saare|sare|sabhi|sabi)\s+(?:candidate|candidates|resume|resumes|profile|profiles)\b/.test(text);
let candidateSelection = /\b(?:top\s+)?\d{1,3}\s+(?:top\s+)?(?:candidate|candidates|resume|resumes|profile|profiles)\b/.test(text) || includesAny(text, ["top candidate", "top candidates", "best candidate", "best candidates", "candidate of", "candidates of"]);
let wantsShortlistAction = includesAny(text, ["shortlist candidate", "shortlist candidates", "shortlist resume", "shortlist resumes", "select candidate", "select candidates"]) || /\b(?:candidate|candidates|resume|resumes)\s+shortlist\b/.test(text);
let wantsViewShortlisted = text.includes("shortlisted") || includesAny(text, ["view shortlist", "show shortlist", "list shortlist", "shortlist list", "shortlisted candidate", "shortlisted candidates"]);

if(allCandidates){
intent = "view_candidates_by_stage"; confidence = 0.94;
}else if((candidateSelection || wantsShortlistAction) && includesAny(text, ["communication", "outreach"])){
intent = "candidate_workflow"; confidence = 0.9;
}else if(wantsShortlistAction){
intent = "candidate_workflow"; confidence = 0.9;
}else if(candidateSelection){
intent = "select_top_candidates"; confidence = 0.88;
}else if(includesAny(text, ["cv", "resume", "profile"]) && (includesAny(text, ["upload", "add", "dalna", "dalo", "add karna"]) || fuzzyContains(text, "upload"))){
intent = "upload_resumes"; confidence = 0.92;
}else if(includesAny(text, ["new job", "create job", "job create", "opening create", "jd add", "jd banana", "role create"])){
intent = "create_job"; confidence = 0.9;
}else if(includesAny(text, ["apply link", "apply page", "apply pages", "application page", "application link", "public link", "share link"])){
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
 candidate_group: allCandidates ? "all" : (candidateSelection ? "top_candidates" : (wantsViewShortlisted ? "shortlisted" : null)),
 stage: wantsViewShortlisted ? "shortlisted" : null,
target_stage: text.includes("communication") ? "communication" : (text.includes("interview") ? "interview_scheduling" : null),
date_time: null,
meeting_url: null,
email: (raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [null])[0],
plan: includesAny(text, ["plan", "limit", "usage", "billing"]) ? "usage" : null,
limit: extractLimit(raw),
job_id: null,
candidate_ids: null
};

if(wantsViewShortlisted && /\b(want|show|view|list|candidate|candidates|candiate)\b/.test(text)){
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
let contextCandidateIds = state.conversationContext?.job_id && state.selectedJob?.id && state.conversationContext.job_id !== state.selectedJob.id
? []
: (state.conversationContext?.candidate_ids || []);
return Object.assign({}, state.conversationContext || {}, {
job_id: state.selectedJob?.id || null,
job_title: state.selectedJob?.job_title || null,
candidate_id: state.selectedCandidate?.id || null,
candidate_ids: state.selectedCandidate?.id ? [state.selectedCandidate.id] : contextCandidateIds,
previous_intent: state.lastParsedPlan?.intent || null
});
}

function conversationHistory(){
return state.messages.slice(0, -1).slice(-12).map(message => {
let holder = document.createElement("div");
holder.innerHTML = message.html || "";
return {role:message.role === "user" ? "user" : "assistant", content:(holder.textContent || "").trim().slice(0, 1000)};
}).filter(message => message.content);
}

async function parseIntentWithBackend(message){
let base = (window.API_BASE_URL || window.__HIRESCORE_API_BASE__ || "").replace(/\/$/, "");
if(!base) throw new Error("API base unavailable");
let localResult = resolveIntent(message);
let endpoints = ["/api/v1/help/chat", "/api/v1/help/parse-intent", "/parse-intent", "/api/v1/parse-intent"];
let lastError = null;
for(let endpoint of endpoints){
let controller = new AbortController();
let timeout = setTimeout(()=>controller.abort(), 15000);
try{
let headers = typeof authHeaders === "function" ? authHeaders() : {"Content-Type":"application/json","Authorization":"Bearer " + localStorage.getItem("token")};
if(!headers["Content-Type"] && !(headers instanceof Headers)) headers["Content-Type"] = "application/json";
let res = await fetch(base + endpoint, {
method:"POST",
headers,
signal:controller.signal,
body:JSON.stringify({
message,
current_route:currentHelpRoute(),
current_context:currentHelpContext(),
conversation_history:conversationHistory()
})
});
let data = await res.json().catch(()=>null);
if(!res.ok || !data) throw new Error("Intent parser unavailable");
return normalizeIntentResult(data, localResult);
}catch(error){
lastError = error;
}finally{
clearTimeout(timeout);
}
}
throw lastError || new Error("Intent parser unavailable");
}

function workflowIdFromBackend(data){
let raw = data?.workflow || data?.intent || data?.action || null;
if(typeof raw !== "string") return null;
return INTENT_ALIASES[raw] || raw;
}

function normalizeIntentResult(data, localResult){
let fallback = {intent:null, entities:{}, confidence:0.2, clarification_needed:true, clarification_question:"What would you like help with?"};
data = data && typeof data === "object" ? data : fallback;
let backendIntent = workflowIdFromBackend(data);
let localIntent = localResult?.intent || null;
let intent = WORKFLOWS[backendIntent] ? backendIntent : localIntent;
if(localIntent === "select_top_candidates" && ["review_ai_ranked_candidates", "candidate_workflow"].includes(intent)){
intent = localIntent;
}
if(localIntent === "candidate_workflow" && intent === "send_candidate_email"){
intent = localIntent;
}
let entities = data.entities && typeof data.entities === "object" ? data.entities : {};
let localEntities = localResult?.entities || {};
let mergedEntities = mergeEntities(localEntities, entities);
let actionPlan = data.action_agent_plan && typeof data.action_agent_plan === "object" ? data.action_agent_plan : null;
let actions = Array.isArray(data.actions) ? data.actions : [];
if(!actionPlan) actionPlan = buildLocalActionPlan(intent, mergedEntities, data);
if(!actions.length && Array.isArray(actionPlan?.actions)) actions = actionPlan.actions;
let localConversation = localResult?.response_type === "conversation";
let clarificationNeeded = Boolean(data.clarification_needed || data.requires_clarification);
if((data.intent === "unknown" || data.intent === "clarify_workflow") && !intent) clarificationNeeded = true;
if(intent && localResult?.confidence >= 0.55 && (data.intent === "unknown" || data.intent === "clarify_workflow" || !WORKFLOWS[backendIntent])){
clarificationNeeded = false;
}
return {
response_type: localConversation
? "conversation"
: (["conversation","workflow","clarification"].includes(data.response_type)
? data.response_type
: (intent ? "workflow" : "clarification")),
assistant_reply: localConversation
? (data.response_type === "conversation" ? (data.assistant_reply || data.reply || localResult?.assistant_reply) : localResult?.assistant_reply)
: (data.assistant_reply || data.reply || localResult?.assistant_reply || null),
intent,
entities: {
job_id: mergedEntities.job_id || null,
job_title: mergedEntities.job_title || null,
candidate_name: mergedEntities.candidate_name || null,
candidate_ids: Array.isArray(mergedEntities.candidate_ids) ? mergedEntities.candidate_ids : null,
candidate_group: mergedEntities.candidate_group || null,
stage: mergedEntities.stage || null,
target_stage: mergedEntities.target_stage || null,
date_time: mergedEntities.date_time || null,
meeting_url: mergedEntities.meeting_url || null,
email: mergedEntities.email || null,
plan: mergedEntities.plan || null,
limit: mergedEntities.limit || null
},
tasks: Array.isArray(data.tasks) ? data.tasks : [],
actions,
visual_tour: data.visual_tour && typeof data.visual_tour === "object" ? data.visual_tour : null,
action_agent_plan: actionPlan,
missing_fields: Array.isArray(data.missing_fields) ? data.missing_fields : [],
ready_for_action_agent: Boolean(data.ready_for_action_agent || actions.length),
requires_confirmation: Boolean(data.requires_confirmation),
candidate_preview: Array.isArray(data.candidate_preview) ? data.candidate_preview : [],
job_options: Array.isArray(data.job_options) ? data.job_options : [],
confirmation: data.confirmation && typeof data.confirmation === "object" ? data.confirmation : null,
guidance: data.assistant_reply || data.guidance || data.message || null,
confidence: Number(data.confidence || 0),
clarification_needed: clarificationNeeded || !intent,
clarification_question: data.clarification_question || null
};
}

function mergeEntities(localEntities, backendEntities){
let merged = Object.assign({}, localEntities || {});
Object.keys(backendEntities || {}).forEach(key => {
let value = backendEntities[key];
let hasValue = Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined && String(value).trim() !== "";
if(hasValue) merged[key] = value;
});
return merged;
}

function buildLocalActionPlan(intent, entities, data){
if(!intent || !WORKFLOWS[intent]) return null;
let actions = [];
let missing = [];
if(["select_top_candidates", "candidate_workflow"].includes(intent)){
actions.push({action_id:"find_top_candidates", label:"Find top candidates"});
if(intent === "candidate_workflow"){
actions.push({action_id:"shortlist_candidates", label:"Shortlist top candidates"});
if(entities?.target_stage === "communication") actions.push({action_id:"move_to_communication", label:"Move shortlisted candidates to Communication"});
}
}
if(intent === "move_candidates_to_communication"){
actions.push({action_id:"move_to_communication", label:"Move shortlisted candidates to Communication"});
}
if(["candidate_workflow", "select_top_candidates", "move_candidates_to_communication"].includes(intent) && !entities?.job_id && !entities?.job_title && !state.selectedJob?.id){
missing.push("job");
}
return actions.length ? {
summary: data?.message || WORKFLOWS[intent].description,
actions,
missing_fields: missing
} : null;
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
let qTokens = q.split(" ").filter(part => part.length > 2 && !["job","role","opening"].includes(part));
let ranked = active.map(job => {
let hay = normalizeText([job.job_title, job.company_name, job.location, job.work_mode].filter(Boolean).join(" "));
let titleText = normalizeText(job.job_title || "");
let tokenHits = qTokens.filter(part => hay.includes(part)).length;
let score = 0;
if(titleText === q) score += 100;
if(titleText.includes(q)) score += 80;
if(hay.includes(q)) score += 60;
score += tokenHits * 12;
if(qTokens.length && tokenHits === qTokens.length) score += 30;
if(titleText && qTokens.length && qTokens.every(part => titleText.includes(part))) score += 40;
return {job, score};
}).filter(item => item.score > 0)
.sort((a,b) => b.score - a.score);
if(ranked.length > 1 && ranked[0].score >= 70 && ranked[0].score >= ranked[1].score + 25){
return [ranked[0].job];
}
return ranked.map(item => item.job);
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
document.getElementById("hsHelpRoot")?.classList.toggle("has-messages", state.messages.length > 0);
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
<ul><li>Find top candidates</li><li>Shortlist selected candidates after preview</li><li>Move shortlisted candidates to Communication</li><li>Prepare interview scheduling when slot details are available</li></ul>
<small>I will never perform sensitive actions without your confirmation.</small>
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
return `<strong>${title}</strong><p>${body}</p>${contextLine}<ol>${steps}</ol><p>Guide Agent shows the visual tour. Action Agent can execute supported actions only after you enable it and confirm.</p>`;
}

function plannerHtml(intentResult, workflow, context){
let title = workflow?.title || "Hiring Workflow";
let guidance = intentResult.guidance || workflow?.description || "I can guide this workflow visually.";
let taskHtml = Array.isArray(intentResult.tasks) && intentResult.tasks.length
? `<ol>${intentResult.tasks.map(task => `<li>${esc(task.description || task.intent)}</li>`).join("")}</ol>`
: "";
let missing = Array.isArray(intentResult.missing_fields) && intentResult.missing_fields.length
? `<p><strong>Need before action:</strong> ${esc(intentResult.missing_fields.join(", "))}</p>`
: "";
let contextLine = context && context.job ? `<p><strong>Job:</strong> ${esc(context.job.job_title || "Selected job")}</p>` : "";
let previewRows = Array.isArray(intentResult.candidate_preview) ? intentResult.candidate_preview.slice(0, 10) : [];
let preview = previewRows.length ? `<div class="hs-help-agent-preview"><strong>Candidate preview (${intentResult.candidate_preview.length})</strong><ol>${previewRows.map(candidate => `<li><span>${esc(candidate.full_name || "Candidate")}</span><small>Score ${esc(candidate.rank_score ?? candidate.final_score ?? "N/A")} | ${esc(candidate.status || candidate.stage || "Review")}</small></li>`).join("")}</ol></div>` : "";
let confirmation = intentResult.confirmation?.summary ? `<p><strong>Confirmation:</strong> ${esc(intentResult.confirmation.summary)}</p>` : "";
return `<strong>${esc(title)}</strong><p>${esc(guidance)}</p>${contextLine}${taskHtml}${preview}${confirmation}${missing}<p>Helping Agent will show the visual tour. Action Agent will act only after permission and confirmation.</p>`;
}

async function handleWorkflow(intentResult, contextOverride){
if(!intentResult || !intentResult.intent || !WORKFLOWS[intentResult.intent]){
showClarification();
return;
}
let workflow = WORKFLOWS[intentResult.intent];
state.lastIntent = intentResult.intent;
state.lastParsedPlan = intentResult;

if(workflow.requiredContext.includes("job") && !contextOverride?.job){
if(intentResult.entities?.job_id){
let resolvedJob = {
id:intentResult.entities.job_id,
job_title:intentResult.entities.job_title || "Selected job"
};
state.selectedJob = resolvedJob;
return handleWorkflow(intentResult, {job:resolvedJob});
}
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
actionButton("Start Visual Tour", intentResult.visual_tour ? "planTour" : "tour", {tourId:workflow.tourId, page:workflow.route}),
actionButton(workflow.id === "view_shortlisted_candidates" ? "Open Shortlisted Candidates" : "Open Page","openPage",{page:workflow.route}),
actionButton("Read Guide","readGuide",{workflowId:workflow.id})
];
if(intentResult.action_agent_plan && intentResult.actions?.length && (intentResult.requires_confirmation || !intentResult.candidate_preview?.length)){
actions.push(actionButton(mode() === "action" && actionEnabled() ? "Run Action Agent" : "Enable Action Agent","actionAgent",{}));
}
if(workflow.id === "view_shortlisted_candidates" && contextOverride?.job){
let jobTitle = contextOverride.job.job_title || "selected";
addMessage("agent", `<strong>I can show shortlisted candidates for the ${esc(jobTitle)} job.</strong><p>I will open the right recruiter view and guide you. I will not change any candidate status.</p>`, actions);
return;
}
if(mode() === "guide" && SENSITIVE_INTENTS.has(workflow.id)){
addMessage("agent", plannerHtml(intentResult, workflow, contextOverride), actions);
return;
}
addMessage("agent", plannerHtml(intentResult, workflow, contextOverride), actions);
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

function clarificationActions(raw){
let text = normalizeText(raw || "");
let actions = [];
if(includesAny(text, ["apply", "application", "public", "link"])){
actions.push(actionButton("Open Apply Pages","workflow",{workflowId:"share_public_apply_link"}));
}
if(includesAny(text, ["job", "role", "jd", "opening"])){
actions.push(actionButton("Create Job","workflow",{workflowId:"create_job"}));
actions.push(actionButton("View Jobs","openPage",{page:"dashboard"}));
}
if(includesAny(text, ["resume", "cv", "upload"])){
actions.push(actionButton("Upload Resumes","workflow",{workflowId:"upload_resumes"}));
}
if(includesAny(text, ["candidate", "score", "rank", "shortlist", "top"])){
actions.push(actionButton("Review AI Scores","workflow",{workflowId:"review_ai_ranked_candidates"}));
actions.push(actionButton("Shortlist Candidates","workflow",{workflowId:"candidate_workflow"}));
}
if(includesAny(text, ["mail", "email", "message", "outreach", "communication"])){
actions.push(actionButton("Send Email","workflow",{workflowId:"send_candidate_email"}));
}
if(includesAny(text, ["interview", "schedule", "meeting", "call"])){
actions.push(actionButton("Schedule Interview","workflow",{workflowId:"schedule_interview"}));
}
if(includesAny(text, ["test", "assessment", "screening"])){
actions.push(actionButton("Screening Test","workflow",{workflowId:"send_screening_test"}));
}
if(includesAny(text, ["plan", "limit", "usage", "support", "help"])){
actions.push(actionButton("Plan / Usage","workflow",{workflowId:"view_plan_usage_limits"}));
}
if(!actions.length){
actions = [
actionButton("Create Job","workflow",{workflowId:"create_job"}),
actionButton("Apply Pages","workflow",{workflowId:"share_public_apply_link"}),
actionButton("Upload Resumes","workflow",{workflowId:"upload_resumes"}),
actionButton("Review AI Scores","workflow",{workflowId:"review_ai_ranked_candidates"}),
actionButton("Shortlist Candidates","workflow",{workflowId:"candidate_workflow"})
];
}
let seen = new Set();
return actions.filter(action => {
let key = action.label + action.action + JSON.stringify(action.data || {});
if(seen.has(key)) return false;
seen.add(key);
return true;
}).slice(0, 6);
}

function showClarification(intentResult, raw){
if(Array.isArray(intentResult?.job_options) && intentResult.job_options.length){
state.pendingContextType = "job";
state.lastJobOptions = intentResult.job_options;
state.lastParsedPlan = intentResult;
addMessage("agent", `<strong>${esc(intentResult.clarification_question || "Which exact job should I use?")}</strong><p>Select one job and I will rebuild the action preview in that context.</p>${renderJobCards(state.lastJobOptions)}`);
return;
}
let normalized = normalizeText(raw || "");
state.clarificationAttempts = state.lastClarificationText === normalized ? state.clarificationAttempts + 1 : 1;
state.lastClarificationText = normalized;
let actions = clarificationActions(raw);
let title = state.clarificationAttempts > 1 ? "I am still not fully sure." : "Which workflow do you mean?";
let body = state.clarificationAttempts > 1
? "Choose one option below, or write it like: create job, apply page, upload resumes for Backend Developer, review AI scores, send email, or schedule interview."
: "I can ask follow-up questions when the request is unclear. Pick the closest workflow below, or add the job/candidate name.";
let question = intentResult?.clarification_question ? `<p>${esc(intentResult.clarification_question)}</p>` : "";
addMessage("agent", `<strong>${title}</strong>${question}<p>${esc(body)}</p>`, actions);
}

async function handleUserText(text){
let value = clean(text);
if(!value) return;
state.lastUserText = value;
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
if(result?.entities){
state.conversationContext = mergeEntities(state.conversationContext, result.entities);
}
if(result.response_type === "conversation"){
state.pendingContextType = null;
state.lastJobOptions = [];
addMessage("agent", `<p>${esc(result.assistant_reply || "How can I help with your hiring workflow?")}</p>`);
return;
}
if(result.response_type === "clarification" && result.assistant_reply){
state.pendingContextType = null;
addMessage("agent", `<p>${esc(result.assistant_reply)}</p>`, clarificationActions(value));
return;
}
if(result.clarification_needed) return showClarification(result, value);
state.clarificationAttempts = 0;
state.lastClarificationText = "";
return handleWorkflow(result);
}

function selectedJobIdentity(){
let job = state.selectedJob || {};
let id = job.id || job.job_id || state.conversationContext?.job_id || state.lastParsedPlan?.entities?.job_id || window.currentJobId || null;
let title = job.job_title || state.conversationContext?.job_title || state.lastParsedPlan?.entities?.job_title || window.currentJobTitle || "Selected job";
return id ? {id, title} : null;
}

function openPage(page){
let target = page || "dashboard";
let job = selectedJobIdentity();
// Generic workspace pages and job-scoped detail pages are different views.
// Always preserve resolved context instead of silently dropping the user on
// a landing page where they must choose the same job again.
if(target === "results"){
if(job && typeof window.openJobResult === "function"){
window.openJobResult(job.id, job.title);
return true;
}
}
if(target === "communication"){
if(job && typeof window.openCommunicationPage === "function"){
window.openCommunicationPage(job.id, job.title);
return true;
}
}
if(target === "editJob"){
if(job && typeof window.openEditJob === "function"){
window.openEditJob(job.id);
return true;
}
}
if(typeof window.showPage === "function"){
window.showPage(target);
return true;
}
return false;
}

function readGuide(workflowId){
let workflow = WORKFLOWS[workflowId] || WORKFLOWS.create_job;
addMessage("agent", workflowHtml(workflow, state.selectedJob ? {job:state.selectedJob} : null), [
actionButton("Start Visual Guide","tour",{tourId:workflow.tourId, page:workflow.route}),
actionButton("Open Page","openPage",{page:workflow.route})
]);
}

function startTour(tourId, page){
if(page){
openPage(page);
return setTimeout(()=>startTour(tourId), 500);
}
let steps = (TOURS[tourId] || TOURS.dashboard_overview).map(step => ({id:step[0], title:step[1], body:step[2]}));
state.tour = {active:true, steps, index:0};
document.body.classList.add("hs-help-tour-active");
showTourStep();
}

function startPlanTour(){
let visualTour = state.lastParsedPlan?.visual_tour;
if(!visualTour || !Array.isArray(visualTour.steps) || !visualTour.steps.length){
let workflow = WORKFLOWS[state.lastIntent] || WORKFLOWS.create_job;
return startTour(workflow.tourId);
}
if(visualTour.primary_route) openPage(visualTour.primary_route);
let steps = visualTour.steps.map(step => ({
id: step.target || step.id || "help-agent-button",
title: step.title || "Next Step",
body: step.body || "Follow this step in the dashboard."
}));
setTimeout(() => {
state.tour = {active:true, steps, index:0};
document.body.classList.add("hs-help-tour-active");
showTourStep();
}, visualTour.primary_route ? 450 : 0);
}

function apiBase(){
return (window.API_BASE_URL || window.__HIRESCORE_API_BASE__ || "").replace(/\/$/, "");
}

function requestHeaders(){
let headers = typeof authHeaders === "function" ? authHeaders() : {"Authorization":"Bearer " + localStorage.getItem("token")};
if(!headers["Content-Type"] && !(headers instanceof Headers)) headers["Content-Type"] = "application/json";
return headers;
}

async function fetchJson(url, options){
let res = await fetch(url, options || {});
let data = await res.json().catch(()=>null);
if(!res.ok) throw new Error((data && (data.detail || data.error || data.message)) || "Request failed");
return data;
}

async function resolvePlanJob(plan){
if(plan?.entities?.job_id) return {id:plan.entities.job_id, job_title:plan.entities.job_title || "Selected job"};
if(state.selectedJob?.id) return state.selectedJob;
let jobs = await getJobs();
let matches = matchJobs(jobs, plan?.entities?.job_title);
if(matches.length === 1){
state.selectedJob = matches[0];
return matches[0];
}
throw new Error(matches.length ? "Please select the exact job first." : "Job not found. Open or select the job first.");
}

async function executeActionAgent(){
let plan = state.lastParsedPlan;
let actionPlan = plan?.action_agent_plan || {};
let actions = Array.isArray(actionPlan.actions) ? actionPlan.actions : (Array.isArray(plan?.actions) ? plan.actions : []);
if(!actions.length){
addMessage("agent", "<strong>No executable action is available.</strong><p>I can still show the visual guide.</p>");
return;
}
if(mode() !== "action" || !actionEnabled()){
showPermission();
return;
}
let missingFields = Array.isArray(actionPlan.missing_fields) ? actionPlan.missing_fields.filter(field => !(field === "job" && (state.selectedJob?.id || plan?.entities?.job_id))) : [];
if(missingFields.length){
addMessage("agent", `<strong>I need a little more detail before taking action.</strong><p>Missing: ${esc(missingFields.join(", "))}</p>`);
return;
}
let ok = window.confirm("Action Agent will perform the planned workflow. Continue?");
if(!ok) return;

let base = apiBase();
if(!base){
addMessage("agent", "<strong>API base is unavailable.</strong><p>I cannot run actions from this page yet.</p>");
return;
}

let loadingMessage = {role:"agent", html:"<em>Action Agent is working...</em>", actions:[]};
state.messages.push(loadingMessage);
renderMessages();

try{
if(plan?.confirmation?.token){
let data = await fetchJson(`${base}/api/v1/help/execute`, {
method:"POST",
headers:requestHeaders(),
body:JSON.stringify({confirmation_token:plan.confirmation.token})
});
removeMessage(loadingMessage);
let receipts = Array.isArray(data?.receipts) ? data.receipts.map(item => `<li>${esc(item.action_id || "action")}: ${esc(item.status || "completed")} (${esc(item.count ?? 0)})</li>`).join("") : "";
state.jobsCache = null;
addMessage("agent", `<strong>Action Agent completed.</strong><p>${esc(data?.candidate_count || 0)} candidate${Number(data?.candidate_count || 0) === 1 ? "" : "s"} processed for ${esc(data?.job?.job_title || plan?.entities?.job_title || "the selected job")}.</p>${receipts ? `<ul>${receipts}</ul>` : ""}`, [
actionButton("Open Recruiter","openPage",{page:"results"}),
actionButton("Open Communication","openPage",{page:"communication"})
]);
return;
}
let job = await resolvePlanJob(plan);
let context = {job_id: job.id, candidate_ids: Array.isArray(plan.entities?.candidate_ids) ? [...plan.entities.candidate_ids] : [], candidates: []};
let limit = Number(plan.entities?.limit || 10);
let didChangeCandidates = false;

for(let action of actions){
if(action.action_id === "find_top_candidates"){
let data = await fetchJson(`${base}/results/${encodeURIComponent(context.job_id)}`, {headers:requestHeaders()});
let rows = Array.isArray(data?.results) ? data.results : [];
context.candidates = rows
.filter(row => !["Rejected","Dropped","Communication"].includes(row.status))
.slice(0, limit);
context.candidate_ids = context.candidates.map(row => row.id).filter(Boolean);
if(!context.candidate_ids.length) throw new Error("No candidate IDs found in top results.");
}
if(action.action_id === "shortlist_candidates"){
for(let candidateId of context.candidate_ids){
await fetchJson(`${base}/shortlist/${encodeURIComponent(candidateId)}`, {method:"POST", headers:requestHeaders()});
}
didChangeCandidates = true;
}
if(action.action_id === "move_to_communication"){
await fetchJson(`${base}/move-to-communication?job_id=${encodeURIComponent(context.job_id)}`, {method:"POST", headers:requestHeaders()});
didChangeCandidates = true;
}
}

removeMessage(loadingMessage);
if(!didChangeCandidates){
let preview = context.candidates.slice(0, 5).map((candidate, index) => `<li>#${index + 1} ${esc(candidate.full_name || candidate.name || "Candidate")} - score ${esc(candidate.final_score ?? candidate.score ?? "N/A")}</li>`).join("");
addMessage("agent", `<strong>Top candidates found for ${esc(job.job_title || "the selected job")}.</strong><ol>${preview}</ol><p>No candidate status was changed.</p>`, [
actionButton("Open Recruiter","openPage",{page:"results"}),
actionButton("Start Visual Tour","tour",{tourId:"review_ai_ranked_candidates", page:"results"})
]);
return;
}
addMessage("agent", `<strong>Action Agent completed.</strong><p>${esc(context.candidate_ids.length)} candidate${context.candidate_ids.length === 1 ? "" : "s"} processed for ${esc(job.job_title || "the selected job")}.</p>`, [
actionButton("Open Communication","openPage",{page:"communication"}),
actionButton("Start Visual Tour","tour",{tourId:"send_candidate_email", page:"communication"})
]);
}catch(error){
removeMessage(loadingMessage);
addMessage("agent", `<strong>Action Agent could not complete this.</strong><p>${esc(error.message || "Please try again.")}</p>`, [
actionButton("Start Visual Tour","planTour",{})
]);
}
}

function showTourStep(){
cleanupTourStep();
applyRuntimeHelpIds();
let tour = state.tour;
if(!tour.active || !tour.steps.length) return endTour();
let step = tour.steps[tour.index];
let target = findTourTarget(step);
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

function findTourTarget(step){
let id = step?.id || "";
let direct = document.querySelector(`[data-help-id="${id}"]`);
if(direct) return direct;
if(id && document.getElementById(id)) return document.getElementById(id);
let fallbackSelectors = {
"recruiter-menu":"button[onclick*=\"showPage('results')\"]",
"outreach-menu":"button[onclick*=\"showPage('communication')\"]",
"interview-menu":"button[onclick*=\"showPage('interviewDashboard')\"]",
"support-menu":"button[onclick*=\"support\"], button[onclick*=\"navigateToPage('support')\"]",
"apply-page-list":"#applyJobPage select, #applyJobPage table, #applyJobPage",
"job-form":"#jobPage form",
"recruiter-job-list":"#resultsPage .ats-recruiter-job-card, #resultsPage button[onclick*='viewResults'], #resultsPage",
"candidate-results-table":"#resultsTable, #jobResultPage",
"job-upload-button":"button[onclick*='uploadResume'], button[onclick*='upload'], input[type='file'], #dashboardJobTable button",
"communication-job-list":"#communicationJobsContainer, #communicationJobSelect, #communicationPage",
"communication-email-button":"#communicationResultsPage button, #communicationPage button",
"schedule-interview-button":"button[onclick*='startNewInterviewSchedule'], #interviewDashboardPage button",
"interview-table":"#interviewDashboardTable, #interviewDashboardPage",
"pilot-create-form":"#pilotUsersPage form, #pilotUsersPage",
"support-form":"#supportForm, #supportPage form, #supportPage",
"screening-test-button":"button[onclick*='sendAssessment'], button[onclick*='screening'], button[onclick*='test']"
};
let selector = fallbackSelectors[id];
return selector ? document.querySelector(selector) : null;
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
addMessage("agent", `<strong>Action Agent is enabled.</strong><p>I can now run supported candidate workflows after you confirm each action plan.</p>`);
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
["button[onclick*=\"showPage('results')\"]","recruiter-menu"],
["button[onclick*=\"showPage('communication')\"]","outreach-menu"],
["button[onclick*=\"showPage('interviewDashboard')\"]","interview-menu"],
["button[onclick*=\"navigateToPage('support')\"], button[onclick*=\"showPage('support')\"]","support-menu"],
["button[onclick*=\"showPage('applyJob')\"]","public-apply-link-button"],
["#applyJobPage select, #applyJobPage table, #applyJobPage","apply-page-list"],
["button[onclick*=\"showPage('job')\"]","create-job-button"],
["#jobPage form","job-form"],
["#dashboardJobTable","job-card"],
["#dashboardJobTable button[onclick*='upload'], #dashboardJobTable button[onclick*='Folder'], input[type='file']","job-upload-button"],
["#resultsPage .ats-recruiter-job-card, #resultsPage button[onclick*='viewResults'], #resultsPage","recruiter-job-list"],
["#resultsTable, #shortlistTable","candidate-results-table"],
["#jobResultPage, #resultsPage","job-details-section"],
["#resumeUpload, input[type='file']","resume-file-dropzone"],
["button[onclick*='shortlist'], .shortlist-btn","shortlist-button"],
["button[onclick*='reject'], .reject-btn","reject-button"],
["#communicationJobsContainer, #communicationJobSelect, #communicationPage","communication-job-list"],
["button[onclick*='Communication'], #communicationResultsPage button, #communicationPage button","communication-email-button"],
["button[onclick*='startNewInterviewSchedule'], button[onclick*='Interview'], #interviewDashboardPage button","schedule-interview-button"],
["#interviewDashboardTable, #interviewDashboardPage","interview-table"],
["button[onclick*='test'], button[onclick*='assessment']","screening-test-button"],
["#pilotUsersPage","pilot-access-tab"],
["#pilotUsersPage form","pilot-create-form"],
["#applicationsBySourceCard","plan-usage-card"],
["#supportForm, #supportPage form","support-form"],
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
if(item.action === "tour") startTour(item.data.tourId, item.data.page);
if(item.action === "planTour") startPlanTour();
if(item.action === "actionAgent") executeActionAgent();
if(item.action === "readGuide") readGuide(item.data.workflowId);
if(item.action === "workflow") handleWorkflow({intent:item.data.workflowId, entities:{}, confidence:1, clarification_needed:false});
},
selectJob:async function(index){
let job = state.lastJobOptions[index];
if(!job) return;
state.selectedJob = job;
state.selectedCandidate = null;
state.conversationContext = Object.assign({}, state.conversationContext, {job_id:job.id, job_title:job.job_title, candidate_ids:[]});
state.pendingContextType = null;
addMessage("user", esc(job.job_title || "Selected job"));
let plan = state.lastParsedPlan || {intent:state.lastIntent || "upload_resumes", entities:{}, confidence:1, clarification_needed:false};
plan.entities = Object.assign({}, plan.entities || {}, {job_id:job.id, job_title:job.job_title || plan.entities?.job_title});
if(state.lastUserText && plan.requires_confirmation && !plan.confirmation?.token){
try{
let refreshed = await parseIntentWithBackend(state.lastUserText);
state.conversationContext = mergeEntities(state.conversationContext, refreshed.entities || {});
if(refreshed.clarification_needed) return showClarification(refreshed, state.lastUserText);
return handleWorkflow(refreshed, {job});
}catch(error){
addMessage("agent", `<strong>I could not rebuild the action preview.</strong><p>${esc(error.message || "Please try again.")}</p>`);
return;
}
}
handleWorkflow(plan, {job});
},
nextTour, prevTour, endTour,
startPlanTour, executeActionAgent,
resolveIntent,
_state: state,
_workflows: WORKFLOWS
};

document.addEventListener("DOMContentLoaded", init);
window.addEventListener("load", () => setTimeout(applyRuntimeHelpIds, 1000));
})();
