(function(){
"use strict";

const SETTINGS_KEYS = {
onboardingSeen: "hs_help_onboarding_seen",
mode: "hs_help_agent_mode",
actionEnabled: "hs_action_agent_enabled",
confirmationRequired: "hs_action_confirmation_required",
panelOpen: "hs_recruiting_agent_top_panel_open_v2"
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

const AGENT_CONTRACT_VERSION = "2026-07-general-v1";
const MUTATING_ACTION_IDS = new Set([
"shortlist_candidates","reject_candidates","move_to_communication","move_to_interview_scheduling","schedule_interview_slot","send_mail"
]);

const WORKFLOWS = {
view_active_jobs: {
id:"view_active_jobs", title:"Active Jobs", category:"Jobs", requiredContext:[], route:"dashboard", tourId:"dashboard_overview",
description:"Show active jobs and their real applicant activity.", steps:["Review active jobs.","Open the job that needs action."], allowedModes:["guide"], isSensitiveAction:false
},
jobs_needing_attention: {
id:"jobs_needing_attention", title:"Jobs Needing Attention", category:"Jobs", requiredContext:[], route:"dashboard", tourId:"dashboard_overview",
description:"Find active jobs with candidates waiting for recruiter action.", steps:["Review attention counts.","Open a job and act on candidates."], allowedModes:["guide"], isSensitiveAction:false
},
applicant_metrics: {
id:"applicant_metrics", title:"Today's Applicants", category:"Jobs", requiredContext:[], route:"dashboard", tourId:"dashboard_overview",
description:"Show current applicant counts from the ATS database.", steps:["Review today's applicant count.","Open active jobs for details."], allowedModes:["guide"], isSensitiveAction:false
},
view_sourcing_status: {
id:"view_sourcing_status", title:"Sourcing Status", category:"Sourcing", requiredContext:["job"], route:"dashboard", tourId:"dashboard_overview",
description:"Check the selected job's sourcing request and approval status.", steps:["Open the job.","Review sourcing approval status."], allowedModes:["guide"], isSensitiveAction:false
},
filter_candidates: {
id:"filter_candidates", title:"Filter Candidates", category:"Candidates", requiredContext:["job"], route:"jobResult", tourId:"review_ai_ranked_candidates",
description:"Filter the current job's stored candidates by skill, experience, location, score, or recency.", steps:["Apply validated filters.","Review matching candidate evidence.","Select candidates for the next action."], allowedModes:["guide","action"], isSensitiveAction:false
},
search_talent: {
id:"search_talent", title:"Talent Search", category:"Candidates", requiredContext:[], route:"results", tourId:"review_ai_ranked_candidates",
description:"Search candidates across all jobs using role, skills, and resume evidence.",
steps:["Describe the role or skills you need.","Review semantic and ATS-ranked matches.","Open a candidate profile to validate evidence."],
allowedModes:["guide"], isSensitiveAction:false
},
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
view_top_candidates: {
id:"view_top_candidates", title:"Top 10 Candidates", category:"Candidates", requiredContext:["job"], route:"topCandidate", tourId:"top_candidates",
description:"Open the Top 10 page for a job, including rank, score, fit signals, and AI Explain actions.",
steps:["Open the selected job results.","Open the Top 10 candidates page.","Review the AI-ranked list.","Use AI Explain on a candidate when you need detailed evidence."],
allowedModes:["guide"], isSensitiveAction:false
},
view_ai_hiring_insights: {
id:"view_ai_hiring_insights", title:"AI Hiring Analytics", category:"AI Scoring", requiredContext:["job"], route:"insight", tourId:"ai_hiring_insights",
description:"Open AI hiring insights and analytics for the selected candidate pool.",
steps:["Open the selected job results.","Open AI Hiring Insights.","Review total candidates, average score, top talent, experience mix, skill signals, and score bands."],
allowedModes:["guide"], isSensitiveAction:false
},
view_shortlist_ai_explanation: {
id:"view_shortlist_ai_explanation", title:"Shortlist AI Explanation", category:"AI Scoring", requiredContext:["job"], route:"shortlistExplanation", tourId:"shortlist_ai_explanation",
description:"Generate recruiter-ready AI explanation for the shortlisted candidates of a job.",
steps:["Open the shortlist for the selected job.","Generate the AI shortlist explanation.","Review summary, priorities, risks, skill observations, and next steps."],
allowedModes:["guide"], isSensitiveAction:false
},
view_shortlist_analytics: {
id:"view_shortlist_analytics", title:"Shortlist Analytics", category:"AI Scoring", requiredContext:["job"], route:"shortlistAnalytics", tourId:"shortlist_analytics",
description:"Open analytics for shortlisted candidates, including score, experience, location, skills, and shortlist insights.",
steps:["Open the shortlist for the selected job.","Open shortlist analytics.","Review score distribution, experience mix, location spread, skills, and candidate insights."],
allowedModes:["guide"], isSensitiveAction:false
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

const FEATURE_PAGE_INTENTS = new Set([
"view_top_candidates",
"view_ai_hiring_insights",
"view_shortlist_ai_explanation",
"view_shortlist_analytics"
]);

const PRODUCT_FEATURES = [
{id:"top10", title:"Top 10 Candidate Page", route:"topCandidate", workflowId:"view_top_candidates", requiresJob:true, tourId:"top_candidates", phrases:["top 10", "top ten", "10 candidate", "10 candidates", "10 candidate page", "10 candidates page", "best 10", "best candidates", "top candidate page", "top candidates page"]},
{id:"candidate_results", title:"Candidate Results Page", route:"results", workflowId:"review_ai_ranked_candidates", requiresJob:true, tourId:"review_ai_ranked_candidates", phrases:["candidate result", "candidate results", "result page", "results page", "ai score", "ai scores", "ranked candidates", "score page"]},
{id:"ai_insights", title:"AI Hiring Analytics", route:"insight", workflowId:"view_ai_hiring_insights", requiresJob:true, tourId:"ai_hiring_insights", phrases:["ai analytics", "ai insight", "ai insights", "hiring analytics", "hiring insight", "hiring insights", "pool analytics", "candidate analytics"]},
{id:"shortlist", title:"Shortlisted Candidates", route:"results", workflowId:"view_shortlisted_candidates", requiresJob:true, tourId:"review_ai_ranked_candidates", phrases:["shortlisted candidates", "shortlist page", "shortlist list", "show shortlist", "view shortlist"]},
{id:"shortlist_explanation", title:"Shortlist AI Explanation", route:"shortlistExplanation", workflowId:"view_shortlist_ai_explanation", requiresJob:true, tourId:"shortlist_ai_explanation", phrases:["shortlist explanation", "shortlisted explanation", "ai shortlist explanation", "shortlist ai explanation"]},
{id:"shortlist_analytics", title:"Shortlist Analytics", route:"shortlistAnalytics", workflowId:"view_shortlist_analytics", requiresJob:true, tourId:"shortlist_analytics", phrases:["shortlist analytics", "shortlisted analytics", "shortlist insight", "shortlisted insight"]},
{id:"client_shortlist_report", title:"Client Shortlist Report", route:"clientShortlistReport", requiresJob:true, tourId:"shortlist_ai_explanation", phrases:["client shortlist report", "client report", "shortlist report", "client shortlist"]},
{id:"candidate_profile", title:"Candidate Profile", route:"candidateProfile", requiresCandidate:true, tourId:"review_ai_ranked_candidates", phrases:["candidate profile", "profile page", "candidate detail", "candidate details"]},
{id:"ai_explain", title:"Candidate AI Explanation", route:"topCandidate", workflowId:"view_top_candidates", requiresJob:true, tourId:"top_candidates", phrases:["ai explain", "ai explanation", "candidate explanation", "score explanation", "explain candidate", "explain score"]},
{id:"create_job", title:"Create Job", route:"job", workflowId:"create_job", tourId:"create_job", phrases:["create job", "new job", "add job", "jd upload", "upload jd", "job create"]},
{id:"edit_job", title:"Edit Job", route:"editJob", workflowId:"edit_job", requiresJob:true, tourId:"create_job", phrases:["edit job", "update job", "change job", "modify job"]},
{id:"apply_pages", title:"Apply Pages", route:"applyJob", workflowId:"share_public_apply_link", tourId:"share_public_apply_link", phrases:["apply page", "apply pages", "apply link", "application link", "public link"]},
{id:"job_posts", title:"Job Sourcing Posts", route:"jobPosts", requiresJob:true, tourId:"share_public_apply_link", phrases:["job post", "job posts", "sourcing post", "linkedin post", "whatsapp post", "naukri post", "platform post"]},
{id:"delete_jobs", title:"Delete Jobs", route:"deleteJobs", tourId:"dashboard_overview", phrases:["delete job", "remove job", "closed job", "inactive job"]},
{id:"jobs_dashboard", title:"Jobs Dashboard", route:"dashboard", tourId:"dashboard_overview", phrases:["jobs dashboard", "dashboard", "all jobs", "job list", "active jobs"]},
{id:"bulk_analyzer", title:"Bulk Resume Analyzer", route:"bulk", tourId:"dashboard_overview", phrases:["bulk analyzer", "bulk resume", "bulk resumes", "bulk upload", "bulk analysis"]},
{id:"bulk_top10", title:"Bulk Top 10", route:"bulkTop10", tourId:"dashboard_overview", phrases:["bulk top 10", "bulk top candidates", "bulk 10 candidates"]},
{id:"bulk_analytics", title:"Bulk Analytics", route:"bulkAnalytics", tourId:"dashboard_overview", phrases:["bulk analytics", "bulk insights", "bulk candidate insights"]},
{id:"outreach", title:"Outreach Dashboard", route:"communication", workflowId:"send_candidate_email", tourId:"send_candidate_email", phrases:["outreach", "communication dashboard", "mail dashboard", "email dashboard"]},
{id:"communication_queue", title:"Communication Queue", route:"communication", workflowId:"send_candidate_email", requiresJob:false, tourId:"send_candidate_email", phrases:["communication queue", "candidate outreach", "send email", "send mail", "email candidate", "mail candidate"]},
{id:"reply_sync", title:"Reply Sync", route:"replySync", tourId:"send_candidate_email", phrases:["sync replies", "reply sync", "gmail sync", "email replies"]},
{id:"sender_setup", title:"Sender Setup", route:"senderSetup", tourId:"send_candidate_email", phrases:["sender setup", "connect gmail", "hire score sender", "own domain sender", "domain sender"]},
{id:"screening_test", title:"Screening Test", route:"communication", workflowId:"send_screening_test", requiresCandidate:false, tourId:"send_screening_test", phrases:["screening test", "assessment test", "send test", "test result", "assessment result"]},
{id:"interviews", title:"Interview Dashboard", route:"interviewDashboard", workflowId:"schedule_interview", tourId:"schedule_interview", phrases:["interview dashboard", "interview page", "schedule interview", "interview schedule", "interview pipeline"]},
{id:"pilot_access", title:"Pilot Access", route:"pilotUsers", workflowId:"invite_pilot_user", tourId:"invite_pilot_user", phrases:["pilot access", "pilot user", "invite user", "client access", "admin access"]},
{id:"support", title:"Support", route:"support", workflowId:"view_plan_usage_limits", tourId:"view_plan_usage_limits", phrases:["support", "help ticket", "plan limit", "usage limit", "billing", "plan usage"]}
];

const INTENT_ALIASES = {
review_ai_scores: "review_ai_ranked_candidates",
top_candidates: "view_top_candidates",
top_10_candidates: "view_top_candidates",
ai_hiring_insights: "view_ai_hiring_insights",
ai_analytics: "view_ai_hiring_insights",
shortlist_ai_explanation: "view_shortlist_ai_explanation",
shortlist_analytics: "view_shortlist_analytics",
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
["help-agent-button","Recruiting Agent","Use the AI operating layer from any ATS screen."]
],
create_job: [["create-job-button","Create Job","Click Create Job, fill role details, add skills/JD, and save the opening."],["job-form","Job details form","Complete the required fields before saving."],["jobs-menu","Jobs menu","Return to Jobs to review the created role."]],
share_public_apply_link: [["public-apply-link-button","Apply Pages","Open Apply Pages from the Jobs dashboard."],["apply-page-list","Job apply links","Choose the job and copy the public application link."],["jobs-menu","Jobs menu","Return to Jobs when you need to manage openings."]],
upload_resumes: [["job-card","Choose the job","Find the job row where resumes should be uploaded."],["job-upload-button","Upload resumes","Use the Folder/Upload action on that job row to add resumes."],["ai-score-column","Wait for scoring","After upload, parsing and AI scoring will update candidate results."]],
review_ai_ranked_candidates: [["recruiter-menu","Open Recruiter","Use the Recruiter workspace to review AI-ranked candidates."],["recruiter-job-list","Choose a job","Open candidate results for the role you want to inspect."],["candidate-results-table","AI-ranked results","Review score, matched skills, missing skills, and evidence before acting."]],
top_candidates: [["candidate-results-table","Open job results","Load the selected job's ranked candidate pool."],["top-candidates-page","Top 10 candidates","Review the best ranked candidates, scores, signals, and AI Explain actions."],["ai-explain-button","AI Explain","Open candidate-level explanation from the Top 10 page."]],
ai_hiring_insights: [["candidate-results-table","Open job results","Load the selected job candidate pool first."],["ai-insights-page","AI analytics","Review score bands, skill coverage, experience mix, education signals, and top talent."],["candidate-results-table","Act on insights","Return to results to shortlist or contact candidates."]],
shortlist_ai_explanation: [["shortlist-table","Open shortlist","Load shortlisted candidates for the selected job."],["shortlist-explanation-page","AI shortlist explanation","Generate recruiter-ready explanation from shortlist data and JD context."]],
shortlist_analytics: [["shortlist-table","Open shortlist","Load shortlisted candidates for the selected job."],["shortlist-analytics-page","Shortlist analytics","Review shortlisted candidate score, skill, experience, and location analytics."]],
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
lastTalentSearch: null,
jobDraft: null,
pendingProductFeature: null,
pendingGroupEmailRequest: null,
pendingEmailCandidates: [],
pendingEmailSenderChoice: null,
interviewDraft: null,
sourcingDraft: null,
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
.replace(/\bmil\b|\bmeil\b|\bmaiil\b|\bmal\b/g,"mail")
.replace(/\bcandiate\b|\bcandaite\b|\bcnadiate\b|\bcandiadte\b/g,"candidate")
.replace(/\bcandiates\b|\bcandaites\b|\bcnadiates\b|\bcandiadtes\b/g,"candidates")
.replace(/\banalhyst\b|\banaylst\b|\banalst\b|\banalist\b|\bnalyst\b|\banalyts\b/g,"analyst")
.replace(/\bscintiest\b|\bsciencist\b|\bscientiest\b/g,"scientist")
.replace(/\bcommincation\b|\bcommuncation\b|\bcomunication\b/g,"communication")
.replace(/\bsehdule\b|\bshedule\b/g,"schedule")
.replace(/\bscedule\b|\bschedul\b|\bsheduleing\b|\bsheduling\b/g,"schedule")
.replace(/\binterveiw\b|\bintervieww\b|\binterviw\b|\bintreview\b/g,"interview")
.replace(/\brequimremnts?\b|\brequiemnts?\b|\brequierments?\b|\brequirments?\b/g,"requirement")
.replace(/\bsorcing\b|\bsoucing\b|\bsourching\b/g,"sourcing")
.replace(/\baply\b|\bappply\b/g,"apply")
.replace(/\bpaeg\b/g,"page")
.replace(/\bcreatre\b|\bcrate\b|\bcreatee\b/g,"create")
.replace(/\bstauts\b|\bstatuc\b/g,"status")
.replace(/\breslts\b|\bresutls\b/g,"results")
.replace(/\bprofil\b/g,"profile")
.replace(/\bkrna\b/g,"karna")
.replace(/\bkarni\b/g,"karna")
.replace(/\bwali\b/g,"wali")
.trim();
}

function includesAny(text, words){ return words.some(word => text.includes(word)); }

function jobRecordId(job){
return job?.id || job?.job_id || job?._id || "";
}

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
/(?:send|mail|email|message|outreach).*?(?:top\s*)?(?:candidate|candidates|resume|resumes|profile|profiles)\s+(?:of|for|in)\s+(.+?)(?:\s+(?:job|role|opening)\b|$)/i,
/(?:send|mail|email|message|outreach).*?(?:of|for|to)\s+(.+?)\s+(?:candidate|candidates|resume|resumes|profile|profiles)\b/i,
/(?:send|mail|email|message|outreach).*?\b(.+?)\s+(?:candidate|candidates|resume|resumes|profile|profiles)\b/i,
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
.replace(/\b(i|a|an|the|this|that|want|need|please|you|to|give|get|show|find|list|send|mail|email|message|outreach|top|candidate|candidates|resume|resumes|profile|profiles|of|for|in|job|role|opening|shortlist|select|review|ke|ka|ki|kai|kay)\b/g," ")
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
let discoveryMatch = text.match(/^(?:i want|show me|find|search|get|give me|mujhe)?\s*(.+?)\s+(?:candidate|candidates|profiles|resumes)$/);
let discoveryQuery = discoveryMatch ? normalizeJobTitle(discoveryMatch[1]) : null;
let numberedCandidateRequest = /\b(?:top\s+)?\d{1,3}\s+(?:top\s+)?(?:candidate|candidates|candiate|candiates|resume|resumes|profile|profiles)\b/.test(text);
let candidateSelection = numberedCandidateRequest || includesAny(text, ["top candidate", "top candidates", "best candidate", "best candidates", "candidate of", "candidates of", "candidate page", "candidates page"]);
let wantsShortlistAction = includesAny(text, ["shortlist candidate", "shortlist candidates", "shortlist resume", "shortlist resumes", "select candidate", "select candidates"]) || /\b(?:candidate|candidates|resume|resumes)\s+shortlist\b/.test(text);
let wantsViewShortlisted = text.includes("shortlisted") || includesAny(text, ["view shortlist", "show shortlist", "list shortlist", "shortlist list", "shortlisted candidate", "shortlisted candidates"]);
let wantsOpenFeature = includesAny(text, ["open", "show", "view", "dekh", "dikha", "kholo"]);
let wantsTopPage = wantsOpenFeature && candidateSelection && !wantsShortlistAction;
let wantsTenCandidatePage = wantsOpenFeature && numberedCandidateRequest && includesAny(text, ["this job", "current job", "is job", "ye job", "job"]);
let wantsAiAnalytics = includesAny(text, ["ai analytics", "ai insight", "ai insights", "hiring insight", "hiring insights", "candidate analytics", "pool analytics"]);
let wantsShortlistExplanation = includesAny(text, ["shortlist explanation", "shortlisted explanation", "ai shortlist explanation", "shortlist ai explanation"]);
let wantsShortlistAnalytics = includesAny(text, ["shortlist analytics", "shortlisted analytics", "shortlist insight", "shortlisted insight"]);
let wantsCandidateFitExplanation = includesAny(text, ["fit for", "fit this", "fit that", "fit role", "role fit", "good fit", "strong fit", "weak fit", "suitable", "suitability", "why this candidate", "why that candidate", "how this candidate", "how that candidate", "why is he", "why is she", "why this is the best candidate", "why is this the best candidate", "why that is the best candidate", "why is he the best", "why is she the best", "why best candidate", "why consider", "why should i consider", "why need to consider", "why i need to consider", "why do i need to consider", "why select", "why choose", "kyu best", "kyun best", "kyu select", "kyun select", "inha kyu", "inhe kyu", "inko kyu"])
&& includesAny(text, ["candidate", "candidates", "profile", "guy", "person", "he ", "she ", " him", " her", "this", "that", "these", "three", "them", "inha", "inhe", "inko", "fit", "suitable", "consider", "select", "choose"]);

if(wantsCandidateFitExplanation){
intent = "explain_candidate_score"; confidence = 0.97;
}else if(wantsShortlistExplanation){
intent = "view_shortlist_ai_explanation"; confidence = 0.95;
}else if(wantsShortlistAnalytics){
intent = "view_shortlist_analytics"; confidence = 0.95;
}else if(wantsAiAnalytics){
intent = "view_ai_hiring_insights"; confidence = 0.94;
}else if(wantsTopPage || wantsTenCandidatePage || (candidateSelection && text.includes("explain"))){
intent = "view_top_candidates"; confidence = 0.94;
}else if(discoveryQuery && !includesAny(text, ["top ", "shortlist", "reject", " job", " of ", " for "])){
intent = "search_talent"; confidence = 0.9;
}else if(allCandidates){
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
search_query: intent === "search_talent" ? discoveryQuery : null,
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
return state.conversationContext?.current_screen || window.location?.pathname || "dashboard";
}

function currentHelpContext(){
let contextCandidateIds = state.conversationContext?.job_id && state.selectedJob?.id && state.conversationContext.job_id !== state.selectedJob.id
? []
: (state.conversationContext?.candidate_ids || []);
return Object.assign({}, state.conversationContext || {}, {
current_screen: state.conversationContext?.current_screen || "dashboard",
job_id: state.selectedJob?.id || state.conversationContext?.job_id || window.currentJobId || null,
job_title: state.selectedJob?.job_title || state.conversationContext?.job_title || window.currentJobTitle || null,
candidate_id: state.selectedCandidate?.id || state.conversationContext?.candidate_id || null,
candidate_ids: state.selectedCandidate?.id ? [state.selectedCandidate.id] : contextCandidateIds,
active_filters: state.conversationContext?.active_filters || {},
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
let authoritative = data.agent_contract_version === AGENT_CONTRACT_VERSION;
let intent = WORKFLOWS[backendIntent] ? backendIntent : (authoritative ? null : localIntent);
if(!authoritative && localIntent === "select_top_candidates" && ["review_ai_ranked_candidates", "candidate_workflow"].includes(intent)){
intent = localIntent;
}
if(!authoritative && localIntent === "candidate_workflow" && intent === "send_candidate_email"){
intent = localIntent;
}
let entities = data.entities && typeof data.entities === "object" ? data.entities : {};
let localEntities = localResult?.entities || {};
let mergedEntities = authoritative ? entities : mergeEntities(localEntities, entities);
let actionPlan = data.action_agent_plan && typeof data.action_agent_plan === "object" ? data.action_agent_plan : null;
let actions = Array.isArray(data.actions) ? data.actions : [];
if(!authoritative && !actionPlan) actionPlan = buildLocalActionPlan(intent, mergedEntities, data);
if(!authoritative && !actions.length && Array.isArray(actionPlan?.actions)) actions = actionPlan.actions;
if(authoritative && !actionPlan) actionPlan = {enabled:false, actions:[], missing_fields:[], requires_confirmation:false};
let localConversation = !authoritative && localResult?.response_type === "conversation";
let clarificationNeeded = Boolean(data.clarification_needed || data.requires_clarification);
if((data.intent === "unknown" || data.intent === "clarify_workflow") && !intent) clarificationNeeded = true;
if(!authoritative && intent && localResult?.confidence >= 0.55 && (data.intent === "unknown" || data.intent === "clarify_workflow" || !WORKFLOWS[backendIntent])){
clarificationNeeded = false;
}
let responseType = localConversation
? "conversation"
: (["conversation","workflow","clarification"].includes(data.response_type)
? data.response_type
: (intent ? "workflow" : "clarification"));
return {
agent_contract_version: data.agent_contract_version || null,
response_type: responseType,
assistant_reply: localConversation
? (data.response_type === "conversation" ? (data.assistant_reply || data.reply || localResult?.assistant_reply) : localResult?.assistant_reply)
: (data.assistant_reply || data.reply || localResult?.assistant_reply || null),
intent,
entities: {
search_query: mergedEntities.search_query || null,
job_id: mergedEntities.job_id || null,
job_title: mergedEntities.job_title || null,
candidate_name: mergedEntities.candidate_name || null,
candidate_id: mergedEntities.candidate_id || null,
candidate_ids: Array.isArray(mergedEntities.candidate_ids) ? mergedEntities.candidate_ids : null,
filters: mergedEntities.filters && typeof mergedEntities.filters === "object" ? mergedEntities.filters : null,
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
ready_for_action_agent: authoritative ? Boolean(data.ready_for_action_agent) : Boolean(data.ready_for_action_agent || actions.length),
requires_confirmation: Boolean(data.requires_confirmation),
candidate_preview: Array.isArray(data.candidate_preview) ? data.candidate_preview : [],
job_options: Array.isArray(data.job_options) ? data.job_options : [],
job_preview: Array.isArray(data.job_preview) ? data.job_preview : (Array.isArray(data.ui?.job_cards) ? data.ui.job_cards : []),
confirmation: data.confirmation && typeof data.confirmation === "object" ? data.confirmation : null,
navigation: data.navigation && typeof data.navigation === "object" ? data.navigation : (data.ui?.navigation || null),
ui: data.ui && typeof data.ui === "object" ? data.ui : null,
guidance: data.assistant_reply || data.guidance || data.message || null,
confidence: Number(data.confidence || 0),
clarification_needed: responseType === "clarification" ? (clarificationNeeded || !intent) : false,
clarification_question: data.clarification_question || null
};
}

function mutationActions(intentResult){
let actions = Array.isArray(intentResult?.actions) ? intentResult.actions : [];
return actions.filter(action => MUTATING_ACTION_IDS.has(action?.action_id));
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
let entities = intentResult?.entities || {};
let isCandidateGroup = ["top_candidates","all","shortlisted"].includes(entities.candidate_group) || Number(entities.limit || 0) > 1;
if(isCandidateGroup) return false;
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
}).filter(item => item.score >= 50)
.sort((a,b) => b.score - a.score);
if(ranked.length > 1 && ranked[0].score >= 70 && ranked[0].score >= ranked[1].score + 25){
return [ranked[0].job];
}
return ranked.map(item => item.job);
}

async function resolveTalentSearchJobs(search){
let query = search?.query || "";
if(!query) return [];
let jobs = await getJobs();
return matchJobs(jobs, query).slice(0, 8);
}

async function handleTalentSearchFollowUp(raw){
let search = state.lastTalentSearch;
if(!search?.query) return false;
let text = normalizeText(raw);
if(!isTalentPageFollowUp(text) && !isTalentWorkflowFollowUp(text)) return false;
let matches = await resolveTalentSearchJobs(search);
if(matches.length === 1){
let job = matches[0];
state.selectedJob = job;
state.selectedCandidate = null;
state.conversationContext = Object.assign({}, state.conversationContext, {job_id:job.id, job_title:job.job_title, candidate_ids:[]});
if(isTalentPageFollowUp(text)){
openPage("results");
addMessage("agent", `<strong>Opened ${esc(job.job_title || search.query)} candidate results.</strong><p>You can now review AI score, resume evidence, matched skills, gaps, and shortlist from the page.</p>`, [
actionButton("Review AI Scores","workflow",{workflowId:"review_ai_ranked_candidates"}),
actionButton("Shortlist Candidates","workflow",{workflowId:"candidate_workflow"}),
actionButton("Start Visual Tour","tour",{tourId:"review_ai_ranked_candidates", page:"results"})
]);
return true;
}
return handleWorkflow({
response_type:"workflow",
intent:"candidate_workflow",
entities:{job_id:job.id, job_title:job.job_title || search.query, candidate_group:"top_candidates", limit:10},
guidance:`Use this workflow for the ${job.job_title || search.query} candidates I just found.`,
confidence:1,
clarification_needed:false
}, {job});
}
if(matches.length > 1){
state.pendingContextType = "job";
state.lastJobOptions = matches;
state.lastParsedPlan = {
response_type:"workflow",
intent:isTalentWorkflowFollowUp(text) ? "candidate_workflow" : "review_ai_ranked_candidates",
entities:{job_title:search.query, candidate_group:"top_candidates", limit:10},
confidence:1,
clarification_needed:false
};
addMessage("agent", `<strong>Which ${esc(search.query)} job should I open?</strong><p>I found more than one matching job. Select the exact job and I will continue from there.</p>${renderJobCards(state.lastJobOptions)}`);
return true;
}
if(isTalentPageFollowUp(text)){
openPage("results");
addMessage("agent", `<strong>I opened the recruiter results area.</strong><p>I found ${esc(search.total || search.candidates.length)} ${esc(search.query)} matches across the talent pool, but I could not map that search to one exact active job page. Create or select a job if you want job-specific shortlist actions.</p>`, [
actionButton("Create Job","workflow",{workflowId:"create_job"}),
actionButton("Review AI Scores","workflow",{workflowId:"review_ai_ranked_candidates"})
]);
return true;
}
addMessage("agent", talentSearchWorkflowHtml(search), [
actionButton("Open Recruiter","openPage",{page:"results"}),
actionButton("Create Matching Job","workflow",{workflowId:"create_job"}),
actionButton("Upload Resumes","workflow",{workflowId:"upload_resumes"})
]);
return true;
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

function yesAnswer(text){ return /^(?:yes|y|haan|han|ha|ok|okay|sure|confirm|kar do|kardo|do it)(?: please)?$/.test(normalizeText(text)); }
function noAnswer(text){ return /^(?:no|n|nahi|nahin|nope|cancel|mat karo|mat karna|skip)(?: please)?$/.test(normalizeText(text)); }

function isTalentPageFollowUp(text){
return includesAny(text, ["show me on page", "show on page", "open page", "view page", "open result", "open results", "candidate page", "results page", "on page", "page pe", "page par"]);
}

function isTalentWorkflowFollowUp(text){
return /\bwork\s*flow\b/.test(text) || includesAny(text, ["workflow", "next step", "what next", "process", "kaise proceed", "kya karna"]);
}

function rememberTalentSearch(query, candidates, total){
state.lastTalentSearch = {
query: clean(query),
candidates: Array.isArray(candidates) ? candidates.slice(0, 10) : [],
total: Number(total || 0),
createdAt: Date.now()
};
}

function talentSearchWorkflowHtml(search){
let query = search?.query || "these candidates";
return `<strong>Workflow for ${esc(query)} candidates</strong><p>Here is the clean recruiter flow:</p><ol><li>Open the matching job's candidate results page.</li><li>Review AI score, resume evidence, matched skills, and gaps for the top candidates.</li><li>Open the strongest profiles and compare them against the job requirement.</li><li>Shortlist the candidates you approve.</li><li>Move shortlisted candidates to Communication for outreach, then schedule interviews after they respond.</li></ol><p>I can open the right page and guide the next step without changing candidate status.</p>`;
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
<details class="hs-agent-mode-details">
<summary><span aria-hidden="true"></span><strong>Action Agent active</strong><small>Details</small></summary>
<div><p>I can perform supported tasks for you, but I will always ask for confirmation first.</p>
<ul><li>Find top candidates</li><li>Shortlist selected candidates after preview</li><li>Move shortlisted candidates to Communication</li><li>Prepare interview scheduling when slot details are available</li></ul>
<small>I will never perform sensitive actions without your confirmation.</small></div>
</details>
`;
}else{
modeInfo.innerHTML = `
<details class="hs-agent-mode-details">
<summary><span aria-hidden="true"></span><strong>Guide Agent active</strong><small>Details</small></summary>
<div><p>I can guide you step by step, open the right page, and start visual walkthroughs.</p>
<ul><li>Explain how to use HireScore AI</li><li>Open the correct page</li><li>Start visual walkthroughs</li><li>Show step-by-step guidance</li><li>Help find jobs or candidates</li></ul>
<small>Cannot upload resumes, send emails, schedule interviews, shortlist/reject candidates, send tests, or change plan/settings.</small></div>
</details>
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

function friendlyMissingField(field, intent){
let value = clean(field);
if(intent === "send_candidate_email" && value === "email") return "email subject/body or template";
if(value === "tool_unavailable:send_mail") return "send from Outreach composer; direct Action Agent email is not enabled for this plan";
if(value === "job") return "job selection";
return value.replace(/^tool_unavailable:/, "open the related product tool: ");
}

function candidateProfileButton(candidate, fallbackName){
let name = candidate?.full_name || candidate?.name || candidate?.candidate_name || fallbackName || "Candidate";
let key = "";
if(typeof window.registerCandidateProfile === "function"){
key = window.registerCandidateProfile(Object.assign({}, candidate || {}, {
full_name:name,
name,
id:candidate?.id || candidate?.resume_id || candidate?.candidate_id || candidate?.email || name,
resume_id:candidate?.resume_id || candidate?.id || candidate?.candidate_id || ""
}));
}else{
key = candidate?.resume_id || candidate?.id || candidate?.candidate_id || candidate?.email || "";
}
if(!key) return esc(name);
return `<button type="button" class="hs-help-candidate-link" data-profile-candidate-id="${esc(key)}" title="Open ${esc(name)} profile">${esc(name)}</button>`;
}

function plannerHtml(intentResult, workflow, context){
let title = workflow?.title || "Hiring Workflow";
let guidance = intentResult.guidance || workflow?.description || "I can guide this workflow visually.";
let taskHtml = Array.isArray(intentResult.tasks) && intentResult.tasks.length
? `<ol>${intentResult.tasks.map(task => `<li>${esc(task.description || task.intent)}</li>`).join("")}</ol>`
: "";
let missing = Array.isArray(intentResult.missing_fields) && intentResult.missing_fields.length
? `<p><strong>Need before action:</strong> ${esc(intentResult.missing_fields.map(field => friendlyMissingField(field, intentResult.intent)).join(", "))}</p>`
: "";
let contextLine = context && context.job ? `<p><strong>Job:</strong> ${esc(context.job.job_title || "Selected job")}</p>` : "";
let previewRows = Array.isArray(intentResult.candidate_preview) ? intentResult.candidate_preview.slice(0, 10) : [];
let preview = previewRows.length ? `<div class="hs-help-agent-preview"><strong>${intentResult.candidate_preview.length} matching candidate${intentResult.candidate_preview.length === 1 ? "" : "s"}</strong><ol>${previewRows.map((candidate, index) => {
let explanation = candidate.recruiter_explanation || candidate.ranking_reason || "Open the candidate profile to review detailed score evidence.";
let strengths = Array.isArray(candidate.strengths) && candidate.strengths.length ? `<p><b>Strengths:</b> ${esc(candidate.strengths.join("; "))}</p>` : "";
let concerns = Array.isArray(candidate.concerns) && candidate.concerns.length ? `<p><b>Gaps:</b> ${esc(candidate.concerns.join("; "))}</p>` : "";
let skills = Array.isArray(candidate.matched_skills) && candidate.matched_skills.length ? `<p><b>Matched skills:</b> ${esc(candidate.matched_skills.join(", "))}</p>` : "";
let candidateId = candidate.id || candidate.resume_id || candidate.candidate_id || "";
return `<li class="hs-agent-candidate-card"><span>#${index + 1} ${candidateProfileButton(candidate, "Candidate")}</span><small>Score ${esc(candidate.rank_score ?? candidate.final_score ?? "N/A")} | ${esc(candidate.stage || candidate.status || "Review")} | ${esc(candidate.relevant_experience_years ?? "N/A")} years</small><p>${esc(explanation)}</p>${strengths}${concerns}${skills}<div class="hs-agent-card-actions"><button type="button" onclick="window.HireScoreHelpAgent.candidateAction('${esc(candidateId)}','view')">View Candidate</button><button type="button" onclick="window.HireScoreHelpAgent.candidateAction('${esc(candidateId)}','shortlist')">Shortlist</button><button type="button" onclick="window.HireScoreHelpAgent.candidateAction('${esc(candidateId)}','compare')">Compare</button></div></li>`;
}).join("")}</ol></div>` : "";
let jobRows = Array.isArray(intentResult.job_preview) ? intentResult.job_preview.slice(0, 12) : [];
let jobs = jobRows.length ? `<div class="hs-help-agent-preview hs-agent-job-results"><strong>${jobRows.length} job${jobRows.length === 1 ? "" : "s"}</strong>${renderJobCards(jobRows)}</div>` : "";
let confirmation = intentResult.confirmation?.summary ? `<p><strong>Confirmation:</strong> ${esc(intentResult.confirmation.summary)}</p>` : "";
return `<strong>${esc(title)}</strong><p>${esc(guidance)}</p>${contextLine}${taskHtml}${jobs}${preview}${confirmation}${missing}`;
}

function contextQuickActions(){
let screen = state.conversationContext?.current_screen || "dashboard";
if(screen === "candidateProfile" || state.conversationContext?.candidate_id){
return [["explain_candidate_score","Why this score?"],["shortlist_candidate","Shortlist candidate"],["schedule_interview","Schedule interview"],["filter_candidates","Compare candidates"]];
}
if(["jobResult","topCandidate","insight","shortlistAnalytics","shortlistExplanation"].includes(screen)){
return [["select_top_candidates","Top 10 candidates"],["filter_candidates","Filter candidates"],["candidate_workflow","Shortlist best matches"],["view_sourcing_status","Sourcing status"]];
}
if(["job","editJob","editForm"].includes(screen)) return [["create_job","Build this job"],["share_public_apply_link","Public apply setup"],["upload_resumes","Plan resume upload"],["view_active_jobs","View active jobs"]];
if(screen === "results") return [["search_talent","Search talent"],["view_shortlisted_candidates","Review shortlist"],["jobs_needing_attention","Jobs needing attention"],["view_active_jobs","Active jobs"]];
if(["communication","communicationResults"].includes(screen)) return [["send_candidate_email","Draft outreach"],["view_shortlisted_candidates","Shortlisted candidates"],["move_candidates_to_interview","Move to interview"],["schedule_interview","Schedule interview"]];
if(screen === "interviewDashboard") return [["schedule_interview","Schedule interview"],["applicant_metrics","Today's applicants"],["view_active_jobs","Active jobs"]];
if(screen === "bulk") return [["search_talent","Search talent"],["select_top_candidates","Review top candidates"],["view_ai_hiring_insights","Hiring insights"],["view_active_jobs","Active jobs"]];
if(["applyJob","jobPosts"].includes(screen)) return [["share_public_apply_link","Apply page help"],["view_sourcing_status","Sourcing status"],["view_active_jobs","Active jobs"],["create_job","Create another job"]];
if(screen === "pilotUsers") return [["invite_pilot_user","Invite pilot user"],["view_plan_usage_limits","Review limits"],["deactivate_pilot_user","Manage pilot access"]];
return [["jobs_needing_attention","Jobs needing attention"],["applicant_metrics","Today's applicants"],["view_active_jobs","Active jobs"],["create_job","Create a job"]];
}

function agentPagePresentation(){
let context = currentHelpContext();
let screen = context.current_screen || "dashboard";
if(screen === "candidateProfile" || context.candidate_id) return {
prompt: context.candidate_name
? `Need help reviewing ${context.candidate_name}? I can explain the score, compare evidence, shortlist, or schedule an interview.`
: "Need help reviewing this candidate? I can explain the score, compare evidence, shortlist, or schedule an interview."
};
if(["jobResult","topCandidate","insight","shortlistAnalytics","shortlistExplanation"].includes(screen)) return {
prompt: context.job_title
? `Need help with ${context.job_title}? I can find top matches, verify skill gaps, shortlist candidates, or check sourcing.`
: "Need help with these candidates? I can find top matches, verify skill gaps, shortlist, or check sourcing."
};
let presentations = {
dashboard:"Need help with your jobs? I can review attention, applicants, active roles, or create a new job.",
job:"Creating a job? I can help structure the JD, required skills, experience, and sourcing details.",
editJob:"Editing a job? I can review role details, requirements, skills, and publishing setup.",
editForm:"Improving this job? I can refine the JD, required skills, experience, and sourcing details.",
results:"Need recruiting help? I can search talent, review shortlists, or open an active job.",
communication:"Working on outreach? I can draft messages and move shortlisted candidates forward.",
communicationResults:"Reviewing candidate outreach? I can check replies, draft follow-ups, and advance candidates.",
interviewDashboard:"Planning interviews? I can schedule interviews and review upcoming candidate activity.",
bulk:"Working on bulk hiring? I can search talent, review top candidates, and inspect hiring insights.",
applyJob:"Managing apply pages? I can help with public links and sourcing visibility.",
jobPosts:"Publishing a job? I can prepare job posts, apply links, and check sourcing status.",
pilotUsers:"Managing pilot access? I can invite users, review plan limits, or manage access.",
support:"Need help here? I can guide you through this screen or your recruiting workflow."
};
return {prompt:presentations[screen] || presentations.dashboard};
}

function renderLauncher(){
let presentation = agentPagePresentation();
let prompt = document.getElementById("hsHelpLauncherPrompt");
if(prompt) prompt.textContent = presentation.prompt;
}

function renderQuickActions(){
let box = document.getElementById("hsHelpQuick");
if(!box) return;
box.innerHTML = contextQuickActions().map(item => `<button type="button" onclick="window.HireScoreHelpAgent.quickAction('${item[0]}')">${esc(item[1])}</button>`).join("");
}

function renderContextBar(){
let box = document.getElementById("hsAgentContext");
if(!box) return;
let context = currentHelpContext();
let label = context.candidate_name
? `Reviewing ${context.candidate_name}${context.job_title ? ` for ${context.job_title}` : ""}`
: context.job_title
? `Viewing ${context.job_title}${context.candidate_count != null ? ` — ${context.candidate_count} candidates` : ""}`
: context.current_screen === "interviewDashboard" ? "Viewing upcoming interviews" : "Recruiting workspace";
box.innerHTML = `<span></span><strong>${esc(label)}</strong>`;
renderQuickActions();
renderLauncher();
}

function setContext(nextContext){
let next = nextContext && typeof nextContext === "object" ? nextContext : {};
state.conversationContext = Object.assign({}, state.conversationContext, next);
if(next.job_id || next.job_title) state.selectedJob = Object.assign({}, state.selectedJob || {}, {id:next.job_id || state.selectedJob?.id, job_title:next.job_title || state.selectedJob?.job_title});
if(Object.prototype.hasOwnProperty.call(next,"job_id") && !next.job_id) state.selectedJob = null;
if(Object.prototype.hasOwnProperty.call(next,"candidate_id")) state.selectedCandidate = next.candidate_id ? {id:next.candidate_id, full_name:next.candidate_name || "Candidate"} : null;
renderContextBar();
}

function openPageLabel(workflow){
let labels = {
view_top_candidates:"Open Top 10 Candidate Page",
view_ai_hiring_insights:"Open AI Analytics",
view_shortlist_ai_explanation:"Open AI Explanation",
view_shortlist_analytics:"Open Shortlist Analytics",
view_shortlisted_candidates:"Open Shortlisted Candidates"
};
return labels[workflow?.id] || "Open Page";
}

function isNavigationRequest(text){
return includesAny(text, ["open", "show", "view", "dekh", "dikha", "kholo", "go", "page", "dashboard"]);
}

function matchProductFeature(raw){
let text = normalizeText(raw || "");
if(!text || !isNavigationRequest(text)) return null;
let best = null;
for(let feature of PRODUCT_FEATURES){
let score = 0;
for(let phrase of feature.phrases || []){
let normalizedPhrase = normalizeText(phrase);
if(normalizedPhrase && text.includes(normalizedPhrase)){
score += normalizedPhrase.length + 20;
}
}
if(feature.requiresJob && /\b(?:this|current|is|ye|selected)\s+job\b/.test(text)) score += 12;
if(feature.id === "top10" && /\b(?:10|ten)\s+(?:candidate|candidates)\b/.test(text)) score += 30;
if(feature.id === "candidate_results" && /\bresult\s+page\b/.test(text)) score += 20;
if(feature.id === "outreach" && /\boutreach\b/.test(text)) score += 20;
if(score > 0 && (!best || score > best.score)){
best = {feature, score};
}
}
return best?.feature || null;
}

function productFeatureActions(feature){
let actions = [actionButton(`Open ${feature.title}`,"openPage",{page:feature.route})];
if(feature.workflowId) actions.push(actionButton("Read Guide","readGuide",{workflowId:feature.workflowId}));
if(feature.tourId) actions.push(actionButton("Start Visual Tour","tour",{tourId:feature.tourId, page:feature.route}));
return actions;
}

function isGroupCandidateEmailRequest(raw){
let text = normalizeText(raw || "");
if(!text) return false;
let wantsSend = /\b(?:send|bhej|bhejna|mail|email|outreach)\b/.test(text);
let emailWord = /\b(?:mail|email|message|outreach)\b/.test(text);
let candidateGroup = /\b(?:candidate|candidates|shortlisted|shortlist|top|best|all|every|\d{1,3}|ten)\b/.test(text);
let contextualCandidate = Boolean(state.selectedCandidate?.id || (state.conversationContext?.candidate_ids || []).length === 1)
&& /\b(?:this|that|him|her|guy|person|candidate|profile)\b/.test(text);
if(!wantsSend || !emailWord || (!candidateGroup && !contextualCandidate)) return false;
if(includesAny(text, ["reply sync", "sender setup", "connect gmail", "email dashboard", "mail dashboard"])) return false;
return true;
}

function extractGroupEmailJobQuery(raw){
let title = extractJobTitle(raw);
let text = normalizeText(raw || "");
let company = null;
let companyMatch = text.match(/\b(?:job|role|opening)\s+at\s+([a-z0-9+# ]+)$/) || text.match(/\bat\s+([a-z0-9+# ]+)$/);
if(companyMatch){
company = normalizeJobTitle(companyMatch[1]);
}
return [title, company].filter(Boolean).join(" ").trim() || title || null;
}

function groupEmailPlanFromText(raw){
let text = normalizeText(raw || "");
let limit = extractLimit(raw);
let group = "top_candidates";
let focusedIds = state.selectedCandidate?.id
? [state.selectedCandidate.id]
: (Array.isArray(state.conversationContext?.candidate_ids) && state.conversationContext.candidate_ids.length === 1 ? state.conversationContext.candidate_ids.slice(0, 1) : []);
let contextualCandidate = focusedIds.length === 1 && /\b(?:this|that|him|her|guy|person|candidate|profile)\b/.test(text);
if(contextualCandidate){
group = "selected";
limit = 1;
}else if(/\b(?:all|every|saare|sare|sabhi|sabi)\b/.test(text)){
group = "all";
limit = null;
}else if(/\bshortlist(?:ed)?\b/.test(text)){
group = "shortlisted";
limit = limit || null;
}else{
limit = limit || 10;
}
return {
intent:"send_candidate_email",
entities:{
job_title: extractJobTitle(raw),
candidate_group: group,
candidate_ids: contextualCandidate ? focusedIds : null,
limit,
target_stage:"communication"
},
job_query: extractGroupEmailJobQuery(raw),
confidence:0.98,
clarification_needed:false
};
}

function groupEmailLabel(plan){
let group = plan?.entities?.candidate_group;
let limit = plan?.entities?.limit;
if(group === "selected") return "the selected candidate";
if(group === "all") return "all candidates";
if(group === "shortlisted") return limit ? `top ${limit} shortlisted candidates` : "shortlisted candidates";
return `top ${limit || 10} candidates`;
}

function senderStatusForHelp(){
let fallback = {mode:"hirescore", from_email:"info@hirescoreai.com", reply_to:"", active:true};
try{
let parsed = JSON.parse(localStorage.getItem("outreachSenderConfig:v2") || "null");
if(parsed && typeof parsed === "object") return Object.assign({}, fallback, parsed);
}catch(error){}
let replyTo = clean(localStorage.getItem("outreachSenderEmail"));
return Object.assign({}, fallback, {reply_to:replyTo});
}

function senderStatusHtml(){
let config = senderStatusForHelp();
if(config.mode === "own_domain"){
let status = config.verification_status || "pending";
return status === "verified"
? `<p><strong>Current sender:</strong> ${esc(config.sender_name || config.from_name || "Recruiting Team")} &lt;${esc(config.from_email || "your domain email")}&gt; verified.</p>`
: `<p><strong>Current sender:</strong> Own domain is selected but DNS verification is ${esc(status)}. Use HireScore sender for now, or complete DNS before sending from ${esc(config.from_email || "your own domain")}.</p>`;
}
let reply = config.reply_to || localStorage.getItem("username") || "";
return `<p><strong>Current sender option:</strong> HireScore AI &lt;info@hirescoreai.com&gt;${reply ? `, replies go to ${esc(reply)}` : ". Add a Reply-To email before sending."}</p>`;
}

async function groupEmailCandidatePreview(plan, job){
let jobId = jobRecordId(job);
if(!jobId) return [];
try{
let data = await fetchJson(`${apiBase()}/results/${encodeURIComponent(jobId)}`, {headers:requestHeaders()});
let rows = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
if(!rows.length && String(window.currentJobId || "") === String(jobId || "") && Array.isArray(window.currentResultsSnapshot)){
rows = window.currentResultsSnapshot;
}
let group = plan?.entities?.candidate_group;
let limit = Number(plan?.entities?.limit || 10);
let explicitIds = Array.isArray(plan?.entities?.candidate_ids) ? plan.entities.candidate_ids.map(String) : [];
if(explicitIds.length){
rows = rows.filter(row => explicitIds.includes(String(row.id || row.candidate_id || row.resume_id || "")));
limit = explicitIds.length;
}
if(group === "shortlisted"){
rows = rows.filter(row => normalizeText(row.status || row.stage || "").includes("shortlist"));
}
if(group === "all"){
limit = Math.min(rows.length || 10, 25);
}
return rows
.filter(row => !["rejected","dropped"].includes(normalizeText(row.status || row.stage || "")))
.slice(0, limit || 10)
.map(row => ({
...row,
id: row.id || row.candidate_id || "",
name: row.full_name || row.name || "Candidate",
email: row.email || "",
score: row.final_score ?? row.score ?? row.rank_score ?? row.recruiter_rank_score ?? "N/A"
}));
}catch(error){
return [];
}
}

function groupEmailHtml(plan, job, candidates){
let groupLabel = groupEmailLabel(plan);
let jobTitle = job?.job_title || job?.title || plan?.entities?.job_title || "selected job";
let company = job?.company_name ? ` at ${job.company_name}` : "";
let candidateRows = Array.isArray(candidates) && candidates.length
? `<div class="hs-help-agent-preview"><strong>Candidate confirmation list</strong><ol>${candidates.map((candidate, index) => `<li><span>#${index + 1} ${candidateProfileButton(candidate, candidate.name)}</span><small>${esc(candidate.email || "Email missing")} | Score ${esc(candidate.score)}</small></li>`).join("")}</ol></div>`
: `<p><strong>Candidate confirmation list:</strong> Open the Top 10 Candidate Page / Outreach Queue to confirm the exact candidates before sending.</p>`;
return `<strong>Email workflow prepared for ${esc(groupLabel)}.</strong>
<p>Mail is <strong>not sent yet</strong>. Before sending, choose the sender: use HireScore AI &lt;info@hirescoreai.com&gt; with your Reply-To, or verify your own domain with DNS records.</p>
<p><strong>Job:</strong> ${esc(jobTitle)}${esc(company)}</p>
${senderStatusHtml()}
${candidateRows}
<ol>
<li>Choose sender: HireScore AI sender or your own verified domain.</li>
<li>If own domain: enter domain/from email, generate DNS records, add them at your DNS provider, then check verification and set active.</li>
<li>Review the candidate list and email subject/body.</li>
<li>Only after the final confirmation, send from the Outreach composer.</li>
</ol>
<p>Final confirmation should be: “These are the candidates. Should I send this email now?”</p>`;
}

function groupEmailActions(){
return [
actionButton("Use HireScore Sender","senderChoice",{choice:"hirescore"}),
actionButton("Use Own Domain / DNS","senderChoice",{choice:"own_domain"}),
actionButton("Open Top 10 Candidate Page","openPage",{page:"topCandidate"}),
actionButton("Open Outreach Queue","openPage",{page:"communication"}),
actionButton("Read Email Guide","readGuide",{workflowId:"send_candidate_email"})
];
}

async function respondWithGroupEmailPlan(plan, job){
let candidates = await groupEmailCandidatePreview(plan, job);
state.pendingEmailCandidates = candidates;
addMessage("agent", groupEmailHtml(plan, job, candidates), groupEmailActions());
}

function openSenderChoice(choice){
if(choice === "own_domain"){
state.pendingEmailSenderChoice = "own_domain";
if(typeof window.openOwnDomainSenderModal === "function") window.openOwnDomainSenderModal();
addMessage("agent", `<strong>Own domain sender setup.</strong><p>Enter your domain and from email, generate DNS records, add them in your DNS provider, then check verification. Mail cannot be sent from your own email/domain until DNS is verified.</p>`, [
actionButton("Open Own Domain DNS","senderChoice",{choice:"own_domain"}),
actionButton("Use HireScore Sender Instead","senderChoice",{choice:"hirescore"})
]);
return;
}
state.pendingEmailSenderChoice = "hirescore";
if(typeof window.openHireScoreSenderModal === "function") window.openHireScoreSenderModal();
addMessage("agent", `<strong>HireScore AI sender selected.</strong><p>No DNS is needed. Mail is <strong>not sent yet</strong>. When you send from the Outreach composer, it will use HireScore AI &lt;info@hirescoreai.com&gt; and replies will go to the Reply-To email you save here.</p>`, [
actionButton("Open Outreach Queue","openPage",{page:"communication"}),
actionButton("Use Own Domain / DNS","senderChoice",{choice:"own_domain"})
]);
}

function currentEmailWorkflowJob(){
let job = selectedJobIdentity();
if(job) return {id:job.id, job_id:job.id, job_title:job.title, title:job.title};
if(state.selectedJob?.id) return state.selectedJob;
return null;
}

function senderChoiceFromText(raw){
let text = normalizeText(raw || "");
if(includesAny(text, ["hirescore", "hire score", "info hirescoreai com", "info@hirescoreai.com"])) return "hirescore";
if(includesAny(text, ["own domain", "my domain", "company domain", "khud", "apni mail", "meri mail", "own mail", "own email", "client mail"])) return "own_domain";
return state.pendingEmailSenderChoice || null;
}

function extractDomainFromEmailValue(email){
let parts = clean(email).toLowerCase().split("@");
return parts.length === 2 ? parts[1].replace(/^www\./,"").trim() : "";
}

function normalizeDnsType(value){
let type = clean(value).toUpperCase();
if(type === "SPF" || type === "DMARC") return "TXT";
if(type === "DKIM") return "CNAME";
return type;
}

function parseDnsRecordLine(line){
let raw = clean(line).replace(/^[\s>*-]+/,"").replace(/^`|`$/g,"");
if(!raw || /\b(type|host|name|value|content|ttl)\b/i.test(raw) && /\b(header|example)\b/i.test(raw)) return null;
let cells = raw.split("|").map(cell => clean(cell)).filter(Boolean);
if(cells.length >= 3 && /^(TXT|CNAME|MX|SPF|DKIM|DMARC)$/i.test(cells[0])){
return {
type: normalizeDnsType(cells[0]),
host: cells[1],
value: cells[2],
ttl: cells[3] && /^\d+$/.test(cells[3]) ? cells[3] : "3600",
status:"pending"
};
}
let typeMatch = raw.match(/\b(TXT|CNAME|MX|SPF|DKIM|DMARC)\b/i);
if(!typeMatch) return null;
let type = normalizeDnsType(typeMatch[1]);
let hostMatch = raw.match(/\b(?:host|name|hostname)\s*[:=]\s*([^,|]+?)(?=\s+\b(?:value|content|target|points|ttl|status)\b\s*[:=]?|$)/i);
let valueMatch = raw.match(/\b(?:value|content|target|points\s+to)\s*[:=]?\s*(.+?)(?=\s+\b(?:ttl|status)\b\s*[:=]?|$)/i);
let ttlMatch = raw.match(/\bttl\s*[:=]\s*(\d{2,6})\b/i);
if(!hostMatch || !valueMatch){
let compact = raw.replace(typeMatch[0]," ").replace(/\s+/g," ").trim();
let parts = compact.split(/\s+/);
if(parts.length >= 2){
let host = parts.shift();
let value = parts.join(" ");
return {type, host, value, ttl:ttlMatch?.[1] || "3600", status:"pending"};
}
return null;
}
return {
type,
host: clean(hostMatch[1]),
value: clean(valueMatch[1]),
ttl: ttlMatch?.[1] || "3600",
status:"pending"
};
}

function parseDnsSetupFromChat(raw){
let text = String(raw || "");
let email = (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [null])[0];
let domainMatch = text.match(/\b(?:domain|sending domain)\s*[:=-]?\s*([a-z0-9.-]+\.[a-z]{2,})\b/i);
let fromMatch = text.match(/\b(?:from email|sender email|from)\s*[:=-]?\s*([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i);
let senderMatch = text.match(/\b(?:sender name|from name|display name)\s*[:=-]\s*([^\n|,]+)/i);
let records = text.split(/\r?\n/).map(parseDnsRecordLine).filter(Boolean);
return {
domain: domainMatch?.[1] || extractDomainFromEmailValue(fromMatch?.[1] || email || ""),
from_email: fromMatch?.[1] || email || "",
sender_name: senderMatch?.[1] ? clean(senderMatch[1]) : "",
records
};
}

function looksLikeDnsSetupText(raw){
let text = String(raw || "");
let normalized = normalizeText(text);
let hasDnsWord = includesAny(normalized, ["dns", "txt", "cname", "dkim", "dmarc", "spf", "domain", "from email", "sender email"]);
let hasRecord = /\b(TXT|CNAME|MX|SPF|DKIM|DMARC)\b/i.test(text) && /\b(?:host|name|value|content|target|points\s+to|@|_domainkey|_dmarc)\b/i.test(text);
let hasSenderContext = state.lastParsedPlan?.intent === "send_candidate_email" || senderStatusForHelp().mode === "own_domain";
return hasSenderContext && hasDnsWord && (hasRecord || /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text));
}

function handleDnsSetupFromChat(raw){
if(!looksLikeDnsSetupText(raw)) return false;
let parsed = parseDnsSetupFromChat(raw);
if(!parsed.from_email && !parsed.domain && !parsed.records.length){
addMessage("agent", `<strong>I need the sending email or DNS records.</strong><p>Paste the from email/domain and DNS rows like: <code>TXT @ value</code> or <code>CNAME brevo1._domainkey value</code>.</p>`, [
actionButton("Open Own Domain DNS","senderChoice",{choice:"own_domain"})
]);
return true;
}
if(typeof window.importOwnDomainDnsFromHelpAgent === "function"){
let result = window.importOwnDomainDnsFromHelpAgent(parsed);
addMessage("agent", `<strong>DNS setup imported.</strong><p>I added ${esc(result.records_count || 0)} DNS record${Number(result.records_count || 0) === 1 ? "" : "s"} to the own-domain sender setup for ${esc(result.from_email || result.domain || "your domain")}.</p><p>I still cannot change your external DNS provider without provider access. Add these records in Cloudflare/GoDaddy/Namecheap/Hostinger/etc., then click Check Verification Status.</p>`, [
actionButton("Open Own Domain DNS","senderChoice",{choice:"own_domain"}),
actionButton("Use HireScore Sender Instead","senderChoice",{choice:"hirescore"})
]);
return true;
}
addMessage("agent", `<strong>I read the DNS setup, but the sender setup tool is not loaded.</strong><p>Open Own Domain DNS and paste the records there.</p>`, [
actionButton("Open Own Domain DNS","senderChoice",{choice:"own_domain"})
]);
return true;
}

function handleEmailSenderChoiceFollowUp(raw){
let plan = state.lastParsedPlan;
if(plan?.intent !== "send_candidate_email") return false;
let text = normalizeText(raw || "");
if(includesAny(text, ["own domain", "my domain", "company domain", "khud", "apni mail", "meri mail", "own mail", "own email", "client mail"])){
openSenderChoice("own_domain");
return true;
}
if(includesAny(text, ["hirescore sender", "hirescore mail", "hirescore ai mail", "hire score ai mail", "info hirescoreai com", "info@hirescoreai.com", "default sender", "use hirescore", "from hirescore", "sent from hirescore"])){
openSenderChoice("hirescore");
return true;
}
return false;
}

function isEmailSendCommand(raw){
let text = normalizeText(raw || "");
let sendWord = /\b(?:send|sent|bhej|bhejo|bhejna|deliver|confirm|yes|ok|okay)\b/.test(text);
let mailContext = /\b(?:mail|email|now|candidate|candidates|hirescore|send|sent|bhej|bhejo|confirm|yes|ok|okay)\b/.test(text);
if(!sendWord || !mailContext) return false;
if(includesAny(text, ["not send", "do not send", "mat bhej", "cancel"])) return false;
return true;
}

async function handleEmailSendConfirmation(raw){
let plan = state.lastParsedPlan;
if(plan?.intent !== "send_candidate_email") return false;
if(!isEmailSendCommand(raw)) return false;
let job = currentEmailWorkflowJob();
if(!job){
addMessage("agent", `<strong>Select the job first.</strong><p>I need the exact job before sending outreach.</p>`);
return true;
}
let candidates = Array.isArray(state.pendingEmailCandidates) && state.pendingEmailCandidates.length
? state.pendingEmailCandidates
: await groupEmailCandidatePreview(plan, job);
state.pendingEmailCandidates = candidates;
let valid = candidates.filter(candidate => clean(candidate.email).includes("@"));
let skipped = candidates.length - valid.length;
if(!valid.length){
addMessage("agent", `<strong>No valid candidate emails found.</strong><p>I cannot send outreach because the selected candidate list has no valid email addresses.</p>`, [
actionButton("Open Top 10 Candidate Page","openPage",{page:"topCandidate"})
]);
return true;
}
let senderChoice = senderChoiceFromText(raw);
let confirmMessage = `Send email to ${valid.length} candidate${valid.length === 1 ? "" : "s"} for ${job.job_title || job.title || "this job"}${senderChoice === "hirescore" ? " using HireScore AI sender" : ""}?${skipped ? `\n\n${skipped} candidate${skipped === 1 ? "" : "s"} without valid email will be skipped.` : ""}`;
if(!window.confirm(confirmMessage)){
addMessage("agent", `<strong>Send cancelled.</strong><p>No email was sent. You can still review candidates or adjust the sender/template.</p>`, [
actionButton("Open Outreach Queue","openPage",{page:"communication"}),
actionButton("Use HireScore Sender","senderChoice",{choice:"hirescore"})
]);
return true;
}
if(typeof window.sendBulkMailFromHelpAgent !== "function"){
addMessage("agent", `<strong>Send tool is not available on this page.</strong><p>Open the Outreach Queue and send from the composer.</p>`, [
actionButton("Open Outreach Queue","openPage",{page:"communication"}),
]);
return true;
}
let loadingMessage = {role:"agent", html:"<em>Sending outreach emails...</em>", actions:[]};
state.messages.push(loadingMessage);
renderMessages();
try{
let result = await window.sendBulkMailFromHelpAgent({
job_id: job.id || job.job_id,
job_title: job.job_title || job.title,
candidates: valid,
sender_choice: senderChoice
});
removeMessage(loadingMessage);
let failures = Array.isArray(result.failures) && result.failures.length
? `<div class="hs-help-agent-preview"><strong>Failed sends</strong><ol>${result.failures.slice(0, 5).map(item => `<li><span>${esc(item.name || item.email)}</span><small>${esc(item.error || "Failed")}</small></li>`).join("")}</ol></div>`
: "";
addMessage("agent", `<strong>Email send completed.</strong><p>Sent: ${esc(result.sent)} / ${esc(result.attempted)}. Failed: ${esc(result.failed)}. Skipped missing/duplicate emails: ${esc(result.skipped + skipped)}.</p><p><strong>Subject:</strong> ${esc(result.subject || "Next Step")}</p><p><strong>Reply-To:</strong> ${esc(result.reply_to || "Not set")}</p>${failures}`, [
actionButton("Open Outreach Queue","openPage",{page:"communication"}),
actionButton("Sync Replies","openPage",{page:"replySync"})
]);
return true;
}catch(error){
removeMessage(loadingMessage);
addMessage("agent", `<strong>Email send failed.</strong><p>${esc(error.message || "Please check sender setup and try again.")}</p>`, [
actionButton("Use HireScore Sender","senderChoice",{choice:"hirescore"}),
actionButton("Use Own Domain / DNS","senderChoice",{choice:"own_domain"}),
actionButton("Open Outreach Queue","openPage",{page:"communication"})
]);
return true;
}
}

async function handleGroupCandidateEmailRequest(raw){
if(!isGroupCandidateEmailRequest(raw)) return false;
let plan = groupEmailPlanFromText(raw);
let currentJob = selectedJobIdentity();
if(currentJob && !plan.entities.job_title){
let job = {id:currentJob.id, job_id:currentJob.id, job_title:currentJob.title};
state.selectedJob = Object.assign({}, state.selectedJob || {}, job);
state.lastParsedPlan = plan;
await respondWithGroupEmailPlan(plan, state.selectedJob);
return true;
}
let jobs = await getJobs();
let matches = matchJobs(jobs, plan.job_query || plan.entities.job_title).slice(0, 8);
if(matches.length === 1){
let matchedJobId = jobRecordId(matches[0]);
state.selectedJob = Object.assign({}, matches[0], {id:matchedJobId, job_id:matchedJobId});
state.selectedCandidate = null;
state.conversationContext = Object.assign({}, state.conversationContext, {job_id:matchedJobId, job_title:matches[0].job_title, candidate_ids:[]});
plan.entities.job_id = matchedJobId;
plan.entities.job_title = matches[0].job_title || plan.entities.job_title;
state.lastParsedPlan = plan;
await respondWithGroupEmailPlan(plan, state.selectedJob);
return true;
}
state.pendingContextType = "job";
state.pendingGroupEmailRequest = plan;
state.lastParsedPlan = plan;
state.lastJobOptions = matches.length ? matches : (jobs || []).filter(job => job.is_active !== false).slice(0, 8);
if(state.lastJobOptions.length){
addMessage("agent", `<strong>Which job should I use for this email workflow?</strong><p>I will prepare outreach for ${esc(groupEmailLabel(plan))}. Select the job first; client does not need to know any backend job ID.</p>${renderJobCards(state.lastJobOptions)}`);
return true;
}
addMessage("agent", `<strong>I could not find a matching job for this email workflow.</strong><p>Create the job first, then I can help prepare candidate outreach.</p>`, [
actionButton("Create Job","openPage",{page:"job"}),
actionButton("View Jobs","openPage",{page:"dashboard"})
]);
return true;
}

function topCandidateExplanationHtml(candidateName, jobTitle, recommendation){
let summary = clean(recommendation?.summary || recommendation?.detailed_assessment || recommendation?.explanation || "");
let verdict = clean(recommendation?.verdict || recommendation?.fit_band || "AI explanation");
let strengths = Array.isArray(recommendation?.strengths) ? recommendation.strengths.filter(Boolean).slice(0, 6) : [];
let gaps = Array.isArray(recommendation?.gaps) ? recommendation.gaps.filter(Boolean).slice(0, 6) : [];
let projects = Array.isArray(recommendation?.project_evidence) ? recommendation.project_evidence.filter(Boolean).slice(0, 4) : (Array.isArray(recommendation?.projects) ? recommendation.projects.filter(Boolean).slice(0, 4) : []);
let list = (label, rows, cssClass="") => rows.length ? `<div class="hs-agent-fit-section ${cssClass}"><strong>${esc(label)}</strong><ul>${rows.map(item => `<li>${esc(typeof item === "string" ? item : (item.description || item.title || JSON.stringify(item)))}</li>`).join("")}</ul></div>` : "";
return `<strong>AI fit explanation for ${esc(candidateName || "the selected candidate")}</strong>
<p><strong>Job:</strong> ${esc(jobTitle || "Selected job")} · <strong>Verdict:</strong> ${esc(verdict)}</p>
${summary ? `<p>${esc(summary)}</p>` : ""}
${list("Why the candidate fits", strengths)}
${list("Gaps / points to verify", gaps, "is-gap")}
${list("Relevant project evidence", projects)}
<p><small>This is the same JD-based explanation used by the Top Candidate AI Explanation flow.</small></p>`;
}

function isGroupCandidateFitRequest(raw, candidateIds){
if(!Array.isArray(candidateIds) || candidateIds.length < 2) return false;
let text = normalizeText(raw || "");
let asksWhy = includesAny(text, ["why", "reason", "kyu", "kyun", "q select", "consider", "fit", "suitable"]);
let refersToGroup = includesAny(text, ["these", "those", "them", "three", "candidates", "all", "inha", "inhe", "inko", "unha", "unhe"]);
let decisionQuestion = includesAny(text, ["consider", "select", "choose", "shortlist", "fit", "suitable", "why"]);
return asksWhy && refersToGroup && decisionQuestion;
}

function groupCandidateExplanationHtml(jobTitle, rows){
let cards = rows.map((row, index) => {
let recommendation = row.recommendation || {};
let candidate = row.candidate || {};
let name = candidate.full_name || candidate.name || candidate.candidate_name || `Candidate ${index + 1}`;
let score = candidate.rank_score ?? candidate.final_score ?? candidate.score ?? "N/A";
let verdict = clean(recommendation.verdict || recommendation.fit_band || candidate.fit_band || "Review").replaceAll("_", " ");
let summary = clean(recommendation.summary || recommendation.detailed_assessment || recommendation.explanation || candidate.recruiter_explanation || candidate.ranking_reason || "Open the full explanation to review JD evidence.");
let strengths = Array.isArray(recommendation.strengths) ? recommendation.strengths.filter(Boolean).slice(0, 4) : (Array.isArray(candidate.strengths) ? candidate.strengths.filter(Boolean).slice(0, 4) : []);
let gaps = Array.isArray(recommendation.gaps) ? recommendation.gaps.filter(Boolean).slice(0, 4) : (Array.isArray(candidate.concerns) ? candidate.concerns.filter(Boolean).slice(0, 4) : []);
let list = (label, values, cssClass="") => values.length ? `<div class="hs-agent-fit-section ${cssClass}"><strong>${esc(label)}</strong><ul>${values.map(value => `<li>${esc(typeof value === "string" ? value : (value.description || value.title || JSON.stringify(value)))}</li>`).join("")}</ul></div>` : "";
return `<article class="hs-agent-candidate-card hs-agent-comparison-card"><strong>#${index + 1} ${candidateProfileButton(candidate, name)}</strong><small>Score ${esc(score)} · ${esc(verdict)}</small><p>${esc(summary)}</p>${list("Why consider", strengths)}${list("Verify before selection", gaps, "is-gap")}</article>`;
}).join("");
return `<strong>Why these ${rows.length} candidates are worth considering</strong><p><strong>Job:</strong> ${esc(jobTitle || "Selected job")}</p><p>I compared each candidate with the same JD-based AI Explanation used on the Top Candidate page. They should not be selected blindly—the strengths explain why they reached the top, while the verification points show the trade-offs.</p><div class="hs-help-agent-preview hs-agent-group-explanation">${cards}</div><p><small>Final shortlist decision should include recruiter validation of the highlighted gaps and role constraints.</small></p>`;
}

async function handleGroupCandidateFitExplanation(raw){
let candidateIds = state.selectedCandidate?.id ? [state.selectedCandidate.id] : (state.conversationContext?.candidate_ids || []);
if(!isGroupCandidateFitRequest(raw, candidateIds)) return false;
let job = selectedJobIdentity();
if(!job) return false;
let previews = Array.isArray(state.lastParsedPlan?.candidate_preview) ? state.lastParsedPlan.candidate_preview : state.lastCandidateOptions;
let selected = candidateIds.slice(0, 10).map(candidateId => {
let candidate = (previews || []).find(item => String(item.id || item.resume_id || item.candidate_id) === String(candidateId)) || {id:candidateId};
return {candidateId, candidate};
});
let loadingMessage = {role:"agent", html:`<em>Comparing ${selected.length} candidates with the job description and loading their AI explanations...</em>`, actions:[]};
state.messages.push(loadingMessage);
renderMessages();
try{
let settled = await Promise.allSettled(selected.map(async item => {
let recommendation;
try{
recommendation = await fetchJson(`${apiBase()}/top-candidate-recommendation/${encodeURIComponent(job.id)}/${encodeURIComponent(item.candidateId)}`, {headers:requestHeaders()});
}catch(error){
recommendation = await fetchJson(`${apiBase()}/ai-explanation/${encodeURIComponent(item.candidateId)}`, {headers:requestHeaders()});
}
return {...item, recommendation};
}));
let rows = settled.map((result, index) => result.status === "fulfilled" ? result.value : {...selected[index], recommendation:{}});
removeMessage(loadingMessage);
state.lastIntent = "explain_candidate_score";
addMessage("agent", groupCandidateExplanationHtml(job.title, rows), [
actionButton("Open Top Candidates Page","openPage",{page:"topCandidate"}),
actionButton("Compare Candidates","workflow",{workflowId:"filter_candidates"}),
actionButton("Shortlist After Review","workflow",{workflowId:"candidate_workflow"})
]);
return true;
}catch(error){
removeMessage(loadingMessage);
addMessage("agent", `<strong>I could not load the group AI explanation.</strong><p>${esc(error.message || "Please try again.")}</p>`, [actionButton("Open Top Candidates Page","openPage",{page:"topCandidate"})]);
return true;
}
}

async function handleCandidateFitExplanation(raw){
let local = resolveIntent(raw);
if(local?.intent !== "explain_candidate_score") return false;
let job = selectedJobIdentity();
let candidateIds = state.selectedCandidate?.id ? [state.selectedCandidate.id] : (state.conversationContext?.candidate_ids || []);
let candidateId = candidateIds.length === 1 ? candidateIds[0] : null;
if(!job || !candidateId) return false;
let candidateName = state.selectedCandidate?.full_name || state.conversationContext?.candidate_name || "the selected candidate";
let loadingMessage = {role:"agent", html:"<em>Loading the Top Candidate AI explanation...</em>", actions:[]};
state.messages.push(loadingMessage);
renderMessages();
try{
let recommendation;
try{
recommendation = await fetchJson(`${apiBase()}/top-candidate-recommendation/${encodeURIComponent(job.id)}/${encodeURIComponent(candidateId)}`, {headers:requestHeaders()});
}catch(error){
recommendation = await fetchJson(`${apiBase()}/ai-explanation/${encodeURIComponent(candidateId)}`, {headers:requestHeaders()});
}
removeMessage(loadingMessage);
state.lastIntent = "explain_candidate_score";
state.lastParsedPlan = {intent:"explain_candidate_score", entities:{job_id:job.id, job_title:job.title, candidate_id:candidateId, candidate_ids:[candidateId]}, candidate_preview:[], clarification_needed:false};
addMessage("agent", topCandidateExplanationHtml(candidateName, job.title, recommendation), [
actionButton("Open Full AI Explanation","candidateExplanation",{candidateId}),
actionButton("View Candidate","candidateAction",{candidateId, candidateAction:"view"})
]);
return true;
}catch(error){
removeMessage(loadingMessage);
addMessage("agent", `<strong>I could not load the AI explanation.</strong><p>${esc(error.message || "Please try again.")}</p>`, [
actionButton("Open Full AI Explanation","candidateExplanation",{candidateId}),
actionButton("View Candidate","candidateAction",{candidateId, candidateAction:"view"})
]);
return true;
}
}

function isCandidateStatusRequest(raw){
let text = normalizeText(raw || "");
let asksStatus = includesAny(text, ["check status", "his status", "her status", "candidate status", "profile status", "current status", "what stage", "which stage", "kis stage", "kya status", "status kya"]);
let contextualCandidate = Boolean(state.selectedCandidate?.id || (state.conversationContext?.candidate_ids || []).length === 1);
return asksStatus && contextualCandidate;
}

function candidateStatusHtml(data, fallbackName, fallbackJob){
let name = data?.name || fallbackName || "Selected candidate";
let jobTitle = data?.job_title || fallbackJob || "Selected job";
let stage = clean(data?.stage || data?.status || "Not available").replaceAll("_", " ");
let workflowStatus = clean(data?.status || stage).replaceAll("_", " ");
let mailStatus = clean(data?.mail_status || "Not contacted");
let responseStatus = clean(data?.response_status || "No candidate response yet");
let history = Array.isArray(data?.history) ? data.history.slice(0, 3) : [];
let historyHtml = history.length ? `<div class="hs-agent-fit-section"><strong>Recent stage updates</strong><ul>${history.map(item => `<li>${esc(clean(item.from_stage || "previous").replaceAll("_", " "))} → ${esc(clean(item.to_stage || "current").replaceAll("_", " "))}${item.reason ? ` — ${esc(item.reason)}` : ""}</li>`).join("")}</ul></div>` : "";
return `<strong>Current candidate status</strong>
<p><strong>${esc(name)}</strong> · ${esc(jobTitle)}</p>
<div class="hs-agent-fit-section"><ul>
<li><strong>Pipeline stage:</strong> ${esc(stage)}</li>
<li><strong>Workflow status:</strong> ${esc(workflowStatus)}</li>
<li><strong>Email status:</strong> ${esc(mailStatus)}</li>
<li><strong>Candidate response:</strong> ${esc(responseStatus)}</li>
</ul></div>${historyHtml}`;
}

async function handleCandidateStatusRequest(raw){
if(!isCandidateStatusRequest(raw)) return false;
let candidateIds = state.selectedCandidate?.id ? [state.selectedCandidate.id] : (state.conversationContext?.candidate_ids || []);
let candidateId = candidateIds.length === 1 ? candidateIds[0] : null;
if(!candidateId) return false;
let job = selectedJobIdentity();
let loadingMessage = {role:"agent", html:"<em>Checking the latest candidate, interview, and email status...</em>", actions:[]};
state.messages.push(loadingMessage);
renderMessages();
try{
let data = await fetchJson(`${apiBase()}/candidate-workflow/${encodeURIComponent(candidateId)}`, {headers:requestHeaders()});
removeMessage(loadingMessage);
addMessage("agent", candidateStatusHtml(data, state.selectedCandidate?.full_name, job?.title), [
actionButton("View Candidate","candidateAction",{candidateId, candidateAction:"view"}),
actionButton("Open Outreach Queue","openPage",{page:"communication"}),
actionButton("Open Interview Dashboard","openPage",{page:"interviewDashboard"})
]);
return true;
}catch(error){
removeMessage(loadingMessage);
addMessage("agent", `<strong>I could not load the latest candidate status.</strong><p>${esc(error.message || "Please try again.")}</p>`, [actionButton("View Candidate","candidateAction",{candidateId, candidateAction:"view"})]);
return true;
}
}

async function handleProductFeatureQuery(raw){
let feature = matchProductFeature(raw);
if(!feature) return false;
let currentJob = selectedJobIdentity();
if(feature.requiresJob && !currentJob){
let jobs = await getJobs();
let matches = matchJobs(jobs, extractJobTitle(raw)).slice(0, 8);
state.pendingContextType = "job";
state.pendingProductFeature = feature;
state.lastJobOptions = matches.length ? matches : (jobs || []).filter(job => job.is_active !== false).slice(0, 8);
if(state.lastJobOptions.length){
addMessage("agent", `<strong>Which job should I use for ${esc(feature.title)}?</strong><p>Select the job once and I will open the exact feature page.</p>${renderJobCards(state.lastJobOptions)}`);
return true;
}
}
if(feature.workflowId && WORKFLOWS[feature.workflowId]){
let workflow = WORKFLOWS[feature.workflowId];
if(workflow.requiredContext.includes("job") && !currentJob){
return handleWorkflow({intent:feature.workflowId, entities:{}, confidence:1, clarification_needed:false});
}
if(workflow.requiredContext.includes("candidate")){
return handleWorkflow({intent:feature.workflowId, entities:{}, confidence:1, clarification_needed:false});
}
state.lastIntent = feature.workflowId;
state.lastParsedPlan = {intent:feature.workflowId, entities:{job_id:currentJob?.id || null, job_title:currentJob?.title || null}, confidence:1, clarification_needed:false};
}
let opened = openPage(feature.route);
let job = selectedJobIdentity();
let jobLine = job ? `<p><strong>Job:</strong> ${esc(job.title)}</p>` : "";
let status = opened ? "Opening" : "I can open";
addMessage("agent", `<strong>${status} ${esc(feature.title)}.</strong>${jobLine}<p>This is the exact product area for that request. Use the action below if the page did not switch automatically.</p>`, productFeatureActions(feature));
return true;
}

function talentSearchHtml(query, candidates, total){
let rows = (candidates || []).slice(0, 10);
if(!rows.length){
return `<strong>No strong matches found for ${esc(query)}</strong><p>Try adding core skills, seniority, domain, or location—for example: “senior TPM with cloud migration”.</p>`;
}
let cards = rows.map((candidate, index) => {
let score = candidate.recruiter_rank_score ?? candidate.rank_score ?? candidate.final_score ?? "N/A";
let reason = candidate.recruiter_explanation || candidate.ranking_reason || "Matched using role, skills, and resume evidence.";
return `<li><span>#${index + 1} ${candidateProfileButton(candidate, "Candidate")}</span><small>${esc(candidate.designation || "Role not specified")} | ATS score ${esc(score)}</small><p>${esc(reason)}</p></li>`;
}).join("");
return `<strong>Found ${esc(total ?? rows.length)} candidate match${Number(total ?? rows.length) === 1 ? "" : "es"} for ${esc(query)}</strong><div class="hs-help-agent-preview"><ol>${cards}</ol></div><p><small>Results are ranked across your talent pool using role, skills, resume evidence, and ATS score.</small></p>`;
}

async function handleTalentSearch(intentResult){
state.lastIntent = "search_talent";
state.lastParsedPlan = Object.assign({}, intentResult, {actions:[], requires_confirmation:false, ready_for_action_agent:false});
state.selectedJob = null;
state.selectedCandidate = null;
state.conversationContext = Object.assign({}, state.conversationContext, {job_id:null, job_title:null, candidate_id:null, candidate_ids:[]});
let query = intentResult?.entities?.search_query || intentResult?.entities?.job_title || state.lastUserText;
if(!query){
addMessage("agent", "<strong>What kind of candidates do you need?</strong><p>Tell me the role, skills, seniority, domain, or location.</p>");
return;
}
let candidates = Array.isArray(intentResult.candidate_preview) ? intentResult.candidate_preview : [];
let total = candidates.length;
if(!candidates.length){
try{
let data = await fetchJson(`${apiBase()}/api/v1/talent/search?q=${encodeURIComponent(query)}&stage=all&page=1&page_size=10`, {headers:requestHeaders()});
candidates = Array.isArray(data?.results) ? data.results : [];
total = Number(data?.total ?? candidates.length);
}catch(error){
addMessage("agent", `<strong>I could not search the talent pool.</strong><p>${esc(error.message || "Please try again.")}</p>`);
return;
}
}
rememberTalentSearch(query, candidates, total);
addMessage("agent", talentSearchHtml(query, candidates, total), [
actionButton("Show On Page","talentPage",{}),
actionButton("Show Workflow","talentWorkflow",{}),
actionButton("Search Again","workflow",{workflowId:"search_talent"})
]);
}

async function handleWorkflow(intentResult, contextOverride){
if(!intentResult || !intentResult.intent || !WORKFLOWS[intentResult.intent]){
showClarification();
return;
}
let workflow = WORKFLOWS[intentResult.intent];
state.lastIntent = intentResult.intent;
state.lastParsedPlan = intentResult;

if(Array.isArray(intentResult.job_preview) && intentResult.job_preview.length){
state.lastJobOptions = intentResult.job_preview;
}
if(Array.isArray(intentResult.candidate_preview) && (intentResult.candidate_preview.length || intentResult.intent === "filter_candidates")){
state.lastCandidateOptions = intentResult.candidate_preview.slice(0, 10);
let candidateIds = intentResult.candidate_preview.map(item => item.id || item.resume_id || item.candidate_id).filter(Boolean);
state.conversationContext = Object.assign({}, state.conversationContext, {candidate_ids:candidateIds, active_filters:intentResult.entities?.filters || {}});
if(candidateIds.length === 1){
let focusedCandidate = intentResult.candidate_preview[0];
state.selectedCandidate = {id:candidateIds[0], full_name:focusedCandidate.full_name || focusedCandidate.name || focusedCandidate.candidate_name || "Candidate"};
state.conversationContext = Object.assign({}, state.conversationContext, {candidate_id:candidateIds[0], candidate_name:state.selectedCandidate.full_name});
}
if(intentResult.intent === "filter_candidates" && typeof window.applyAgentCandidateFilter === "function"){
window.applyAgentCandidateFilter(candidateIds);
}
}

if(workflow.id === "search_talent"){
return handleTalentSearch(intentResult);
}

if(workflow.requiredContext.includes("job") && !contextOverride?.job){
let currentJob = selectedJobIdentity();
if(currentJob && !intentResult.entities?.job_id && !intentResult.entities?.job_title){
let resolvedJob = {
id:currentJob.id,
job_id:currentJob.id,
job_title:currentJob.title
};
state.selectedJob = resolvedJob;
return handleWorkflow(intentResult, {job:resolvedJob});
}
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

if(shouldRequireCandidate(intentResult) && !contextOverride?.candidate && !state.selectedCandidate?.id && !intentResult.entities?.candidate_id && !(intentResult.entities?.candidate_ids || []).length){
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
actionButton(openPageLabel(workflow),"openPage",{page:workflow.route}),
actionButton("Read Guide","readGuide",{workflowId:workflow.id})
];
if(intentResult.requires_confirmation && mutationActions(intentResult).length){
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
<small>${esc(job.location || "Location N/A")} ${job.work_mode ? " | " + esc(job.work_mode) : ""} | ${Number(job.applicant_count ?? job.total_applicants ?? 0)} candidates | Top score ${esc(job.top_score ?? "N/A")} | ${job.is_active === false ? "Inactive" : "Active"}</small>
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
if(intentResult) state.lastParsedPlan = intentResult;
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

function interviewDateFromText(raw){
let source = String(raw || "").toLowerCase();
let text = normalizeText(raw);
let direct = source.match(/\b(20\d{2})[-\/]([01]?\d)[-\/]([0-3]?\d)\b/);
if(direct) return `${direct[1]}-${String(direct[2]).padStart(2,"0")}-${String(direct[3]).padStart(2,"0")}`;
let local = source.match(/\b([0-3]?\d)[-\/]([01]?\d)[-\/](20\d{2})\b/);
if(local) return `${local[3]}-${String(local[2]).padStart(2,"0")}-${String(local[1]).padStart(2,"0")}`;
let date = new Date();
if(/\btomorrow\b|\bkal\b/.test(text)) date.setDate(date.getDate() + 1);
else if(!/\btoday\b|\baaj\b/.test(text)) return "";
let pad = value => String(value).padStart(2,"0");
return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
}

function interviewTimeFromText(raw){
let text = String(raw || "").toLowerCase();
let match = text.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\s*(am|pm)?\b/) || text.match(/\b(1[0-2]|0?[1-9])\s*(am|pm)\b/);
if(!match) return "";
let hour = Number(match[1]);
let minute = Number(match[2] && /^\d+$/.test(match[2]) ? match[2] : 0);
let meridiem = (match[3] || (match[2] && /^(am|pm)$/.test(match[2]) ? match[2] : "") || "").toLowerCase();
if(meridiem === "pm" && hour < 12) hour += 12;
if(meridiem === "am" && hour === 12) hour = 0;
return `${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}`;
}

function meetingLinkFromText(raw){
return ((String(raw || "").match(/https?:\/\/[^\s<>"]+/i) || [""])[0] || "").replace(/[),.;]+$/,"");
}

async function candidateRecordForInterview(jobId, candidateId){
let data = await fetchJson(`${apiBase()}/results/${encodeURIComponent(jobId)}`, {headers:requestHeaders()});
let rows = Array.isArray(data?.results) ? data.results : [];
return rows.find(row => String(row.id || row.resume_id || row.candidate_id) === String(candidateId)) || null;
}

function askInterviewNext(){
let draft = state.interviewDraft;
if(!draft) return false;
if(!draft.date){
state.pendingContextType = "interview_date";
addMessage("agent", `<strong>Interview kis date ko schedule karna hai?</strong><p>Example: tomorrow, 25/08/2026, or 2026-08-25.</p>`);
return true;
}
if(!draft.time){
state.pendingContextType = "interview_time";
addMessage("agent", `<strong>Interview kitne baje rakhna hai?</strong><p>Example: 3 PM or 15:30. Time aapke local timezone (${esc(Intl.DateTimeFormat().resolvedOptions().timeZone || "local time")}) mein use hoga.</p>`);
return true;
}
if(!draft.meeting_url){
state.pendingContextType = "interview_link";
addMessage("agent", `<strong>Meeting link share kijiye.</strong><p>Google Meet, Zoom, or Microsoft Teams ka complete https:// link paste karein.</p>`);
return true;
}
if(draft.send_email == null){
state.pendingContextType = "interview_email";
addMessage("agent", `<strong>Kya main candidate ko interview email bhi bhej doon?</strong><p>Email mein role, date, time, duration, aur meeting link include hoga.</p>`, [
actionButton("Yes, send email","interviewReply",{value:"yes"}),
actionButton("No, schedule only","interviewReply",{value:"no"})
]);
return true;
}
state.pendingContextType = "interview_confirm";
let candidate = draft.candidate_name || "Selected candidate";
addMessage("agent", `<strong>Please confirm interview details</strong><p><strong>Candidate:</strong> ${esc(candidate)}</p><p><strong>Job:</strong> ${esc(draft.job_title)}</p><p><strong>When:</strong> ${esc(draft.date)} at ${esc(draft.time)} (${esc(Intl.DateTimeFormat().resolvedOptions().timeZone || "local time")})</p><p><strong>Duration:</strong> 45 minutes</p><p><strong>Meeting:</strong> ${esc(draft.meeting_url)}</p><p><strong>Candidate email:</strong> ${draft.send_email ? "Send after scheduling" : "Do not send"}</p><p>Nothing will change until you confirm.</p>`, [
actionButton("Confirm & Schedule","interviewReply",{value:"confirm"}),
actionButton("Cancel","interviewReply",{value:"cancel"})
]);
return true;
}

async function executeInterviewDraft(){
let draft = state.interviewDraft;
if(!draft) return true;
let loading = {role:"agent", html:"<em>Scheduling interview and cross-checking the candidate...</em>", actions:[]};
state.messages.push(loading); renderMessages();
try{
let candidate = await candidateRecordForInterview(draft.job_id, draft.candidate_id);
if(!candidate) throw new Error("Candidate is no longer available for this job.");
if(String(candidate.stage || "").toLowerCase() !== "interview_scheduling"){
await fetchJson(`${apiBase()}/move-to-interview-scheduling`, {method:"POST", headers:requestHeaders(), body:JSON.stringify({candidate_id:draft.candidate_id, job_id:draft.job_id, force_without_test:true})});
}
let scheduledAt = `${draft.date}T${draft.time}`;
await fetchJson(`${apiBase()}/schedule-interview-slot`, {method:"POST", headers:requestHeaders(), body:JSON.stringify({candidate_id:draft.candidate_id, job_id:draft.job_id, scheduled_at:scheduledAt, meeting_url:draft.meeting_url, duration_minutes:45})});
let emailLine = "Candidate email was not requested.";
if(draft.send_email){
let email = clean(candidate.email || candidate.contact_email);
if(!email.includes("@")) emailLine = "Interview scheduled, but candidate email is missing, so no email was sent.";
else if(typeof window.sendBulkMailFromHelpAgent === "function"){
let prettyDate = new Date(scheduledAt).toLocaleString([], {dateStyle:"medium", timeStyle:"short"});
let result = await window.sendBulkMailFromHelpAgent({job_id:draft.job_id, job_title:draft.job_title, candidates:[{...candidate, id:draft.candidate_id, email}], subject:`Interview scheduled — ${draft.job_title}`, body:`Hi ${candidate.name || candidate.full_name || "Candidate"},\n\nYour interview for ${draft.job_title} is scheduled for ${prettyDate}.\nDuration: 45 minutes\nMeeting link: ${draft.meeting_url}\n\nPlease reply to confirm your availability.\n\nRegards,\nHiring Team`, sender_choice:"hirescore"});
emailLine = Number(result?.sent || 0) ? `Interview email sent to ${email}.` : "Interview was scheduled, but the email could not be sent.";
}
}
removeMessage(loading);
state.interviewDraft = null; state.pendingContextType = null;
addMessage("agent", `<strong>Interview scheduled successfully.</strong><p>${esc(draft.candidate_name)} · ${esc(draft.date)} at ${esc(draft.time)}</p><p>${esc(emailLine)}</p>`, [actionButton("Open Interview Dashboard","openPage",{page:"interviewDashboard"}), actionButton("Check Candidate Status","interviewReply",{value:"check candidate status"})]);
}catch(error){
removeMessage(loading);
addMessage("agent", `<strong>Interview could not be completed.</strong><p>${esc(error.message || "Please try again.")}</p>`, [actionButton("Open Interview Dashboard","openPage",{page:"interviewDashboard"})]);
}
return true;
}

async function handleInterviewConversation(raw){
let normalized = normalizeText(raw);
if(state.pendingContextType && state.pendingContextType.startsWith("interview_") && state.interviewDraft){
if(noAnswer(normalized) && state.pendingContextType === "interview_confirm"){
state.interviewDraft = null; state.pendingContextType = null; addMessage("agent","<strong>Interview scheduling cancelled.</strong><p>No changes were made.</p>"); return true;
}
if(state.pendingContextType === "interview_date"){
let value = interviewDateFromText(raw); if(!value){ addMessage("agent","<strong>Please share a valid interview date.</strong><p>Example: tomorrow or 2026-08-25.</p>"); return true; } state.interviewDraft.date = value;
}else if(state.pendingContextType === "interview_time"){
let value = interviewTimeFromText(raw); if(!value){ addMessage("agent","<strong>Please share a valid interview time.</strong><p>Example: 3 PM or 15:30.</p>"); return true; } state.interviewDraft.time = value;
}else if(state.pendingContextType === "interview_link"){
let value = meetingLinkFromText(raw); if(!value){ addMessage("agent","<strong>Please paste a complete meeting URL.</strong><p>It must begin with http:// or https://.</p>"); return true; } state.interviewDraft.meeting_url = value;
}else if(state.pendingContextType === "interview_email"){
if(!yesAnswer(normalized) && !noAnswer(normalized)){ addMessage("agent","<strong>Candidate ko email bhejni hai?</strong><p>Reply yes or no.</p>"); return true; } state.interviewDraft.send_email = yesAnswer(normalized);
}else if(state.pendingContextType === "interview_confirm"){
if(!yesAnswer(normalized)){ addMessage("agent","<strong>Please confirm or cancel.</strong><p>Reply confirm to schedule, or cancel to stop.</p>"); return true; } return executeInterviewDraft();
}
return askInterviewNext();
}
let local = resolveIntent(raw);
if(local?.intent !== "schedule_interview") return false;
let job = selectedJobIdentity();
let candidateId = state.selectedCandidate?.id || state.conversationContext?.candidate_id || (state.conversationContext?.candidate_ids || [])[0];
if(!job || !candidateId) return false;
state.interviewDraft = {job_id:job.id, job_title:job.title, candidate_id:candidateId, candidate_name:state.selectedCandidate?.full_name || state.conversationContext?.candidate_name || "Selected candidate", date:interviewDateFromText(raw), time:interviewTimeFromText(raw), meeting_url:meetingLinkFromText(raw), send_email:null};
return askInterviewNext();
}

async function handleApplyPageRequest(raw){
let local = resolveIntent(raw);
if(local?.intent !== "share_public_apply_link") return false;
let job = selectedJobIdentity();
if(!job) return false;
let record = state.selectedJob || {};
let url = record.apply_link || record.apply_links?.main || record.apply_links?.direct || "";
if(!url){
try{ let data = await fetchJson(`${apiBase()}/public-job/${encodeURIComponent(job.id)}`, {headers:requestHeaders()}); url = data.apply_link || data.apply_links?.main || `${location.origin}/apply.html?job_id=${encodeURIComponent(job.id)}`; }catch(error){ url = `${location.origin}/apply.html?job_id=${encodeURIComponent(job.id)}`; }
}
addMessage("agent", `<strong>Public apply page for ${esc(job.title)}</strong><p>Candidates can apply from this tracked link:</p><p><small>${esc(url)}</small></p>`, [actionButton("Open Apply Page","openApplyLink",{url}), actionButton("Copy Apply Link","copyApplyLink",{url})]);
return true;
}

async function requestSourcingForSelectedJob(){
let job = selectedJobIdentity();
if(!job){ addMessage("agent","<strong>Select the job first.</strong><p>I need the exact job before sending a sourcing requirement.</p>"); return true; }
let loading = {role:"agent", html:"<em>Sending the requirement for admin approval...</em>", actions:[]}; state.messages.push(loading); renderMessages();
try{
let data = await fetchJson(`${apiBase()}/jobs/${encodeURIComponent(job.id)}/request-candidate-sourcing`, {method:"POST", headers:requestHeaders(), body:JSON.stringify({})});
removeMessage(loading); state.pendingContextType = null; state.sourcingDraft = null;
addMessage("agent", `<strong>Sourcing requirement submitted.</strong><p>The complete requirement has been emailed to info@hirescoreai.com for approval. It stays private until approved; the admin team will share pricing and any remaining requirements with you.</p><p><strong>Status:</strong> ${esc(data.status || "pending_approval")}</p>`, [actionButton("Check Sourcing Status","workflow",{workflowId:"view_sourcing_status"})]);
}catch(error){ removeMessage(loading); addMessage("agent", `<strong>Sourcing request could not be submitted.</strong><p>${esc(error.message || "Please try again.")}</p>`); }
return true;
}

async function handleSourcingConversation(raw){
let text = normalizeText(raw);
if(state.pendingContextType === "sourcing_confirm" && state.sourcingDraft){
if(noAnswer(text)){ state.pendingContextType = null; state.sourcingDraft = null; addMessage("agent","<strong>Sourcing request skipped.</strong><p>The job remains active and you can request sourcing later.</p>"); return true; }
if(yesAnswer(text)) return requestSourcingForSelectedJob();
}
if(!text.includes("sourcing") && !/\bsource candidates?\b/.test(text)) return false;
if(includesAny(text,["status","approved","approval","check"])) return false;
let job = selectedJobIdentity();
if(!job) return false;
state.sourcingDraft = {job_id:job.id}; state.pendingContextType = "sourcing_confirm";
addMessage("agent", `<strong>Candidate sourcing request bhejni hai?</strong><p>Main ${esc(job.title)} ki requirement info@hirescoreai.com par admin approval ke liye bhejunga. Admin pricing aur agar koi additional requirement ho to share karega. Approval ke baad hi requirement public marketplace par publish hogi.</p>`, [actionButton("Yes, submit for approval","sourcingReply",{value:"yes"}), actionButton("Not now","sourcingReply",{value:"no"})]);
return true;
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
if(state.pendingContextType === "job_create_missing" && state.jobDraft){
let draft = applyJobDraftAnswer(state.jobDraft, value);
return finishAgentJobDraft(draft);
}
if(await handleInterviewConversation(value)) return;
if(await handleSourcingConversation(value)) return;
if(state.pendingContextType){
state.pendingContextType = null;
state.lastJobOptions = [];
state.lastCandidateOptions = [];
state.pendingGroupEmailRequest = null;
}
if(await handleAgentJDText(value)) return;
if(await handleTalentSearchFollowUp(value)) return;
if(handleDnsSetupFromChat(value)) return;
if(await handleEmailSendConfirmation(value)) return;
if(handleEmailSenderChoiceFollowUp(value)) return;
if(await handleGroupCandidateFitExplanation(value)) return;
if(await handleCandidateFitExplanation(value)) return;
if(await handleCandidateStatusRequest(value)) return;
if(await handleGroupCandidateEmailRequest(value)) return;
if(await handleApplyPageRequest(value)) return;
if(await handleProductFeatureQuery(value)) return;
let localFeatureIntent = resolveIntent(value);
if(FEATURE_PAGE_INTENTS.has(localFeatureIntent?.intent) && localFeatureIntent.confidence >= 0.9){
state.conversationContext = mergeEntities(state.conversationContext, localFeatureIntent.entities || {});
state.clarificationAttempts = 0;
state.lastClarificationText = "";
return handleWorkflow(localFeatureIntent);
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
state.conversationContext = result.agent_contract_version === AGENT_CONTRACT_VERSION
? Object.assign({}, state.conversationContext, result.entities)
: mergeEntities(state.conversationContext, result.entities);
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

function openJobResultThen(callbackName){
let job = selectedJobIdentity();
if(job && typeof window.openJobResult === "function"){
window.openJobResult(job.id, job.title);
}
let run = () => {
let fn = window[callbackName];
if(typeof fn === "function") fn();
};
setTimeout(run, 900);
setTimeout(run, 1900);
return Boolean(job);
}

function openShortlistFeature(callbackName){
let job = selectedJobIdentity();
if(typeof window.showPage === "function") window.showPage("results");
let select = document.getElementById("shortlistJobSelect");
if(job && select){
select.value = String(job.id);
}
let load = window.loadShortlistedCandidates;
let run = () => {
let fn = window[callbackName];
if(typeof fn === "function") fn();
};
if(typeof load === "function"){
Promise.resolve(load()).finally(() => setTimeout(run, 250));
}else{
setTimeout(run, 700);
}
return Boolean(job);
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
if(target === "topCandidate"){
return openJobResultThen("openTopCandidates");
}
if(target === "insight"){
return openJobResultThen("openInsights");
}
if(target === "shortlistExplanation"){
return openShortlistFeature("openShortlistExplanation");
}
if(target === "shortlistAnalytics"){
return openShortlistFeature("openShortlistAnalytics");
}
if(target === "clientShortlistReport"){
return openShortlistFeature("openClientShortlistReport");
}
if(target === "jobPosts"){
if(job && typeof window.openJobPostKit === "function"){
window.openJobPostKit(job.id);
return true;
}
}
if(target === "bulkTop10"){
if(typeof window.showPage === "function") window.showPage("bulk");
setTimeout(()=>typeof window.showBulkSection === "function" && window.showBulkSection("top10"), 300);
return true;
}
if(target === "bulkAnalytics"){
if(typeof window.showPage === "function") window.showPage("bulk");
setTimeout(()=>typeof window.showBulkSection === "function" && window.showBulkSection("analytics"), 300);
return true;
}
if(target === "replySync"){
if(typeof window.openReplySyncModal === "function"){
window.openReplySyncModal();
return true;
}
}
if(target === "senderSetup"){
if(typeof window.openHireScoreSenderModal === "function"){
window.openHireScoreSenderModal();
return true;
}
}
if(target === "ownDomainSender"){
if(typeof window.openOwnDomainSenderModal === "function"){
window.openOwnDomainSenderModal();
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

function labelValueFromText(text, labels){
let source = String(text || "");
let pattern = labels.map(label => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
let lineMatch = source.match(new RegExp(`(?:^|\\n)\\s*(?:${pattern})\\s*[:\\-]\\s*([^\\n\\r]{2,120})`, "i"));
if(lineMatch) return clean(lineMatch[1]).replace(/[|;]+$/g, "").trim();
return "";
}

function looksLikeJDText(text){
let value = String(text || "");
return value.length > 180 && /\b(responsibilities|requirements|skills|experience|qualification|job description|about the role|role)\b/i.test(value);
}

function agentJobDraftFromParsed(jdText, fields){
let parsed = fields && typeof fields === "object" ? fields : {};
return {
job_title: clean(parsed.job_title || labelValueFromText(jdText, ["Job Title", "Role", "Position"])),
company_name: clean(parsed.company_name || labelValueFromText(jdText, ["Company", "Company Name", "Client"])),
department: clean(parsed.department),
location: clean(parsed.location || labelValueFromText(jdText, ["Location", "Job Location"])),
work_mode: clean(parsed.work_mode),
job_type: clean(parsed.job_type) || "Full Time",
salary_range: clean(parsed.salary_range) || "Not specified",
experience_required: clean(parsed.experience_required),
application_deadline: clean(parsed.application_deadline || labelValueFromText(jdText, ["Application Deadline", "Deadline"])),
hiring_manager: clean(parsed.hiring_manager || labelValueFromText(jdText, ["Hiring Manager", "Recruiter"])),
jd_text: clean(jdText)
};
}

function agentJobMissingFields(draft){
let missing = [];
if(!clean(draft?.job_title)) missing.push({key:"job_title", label:"Job title"});
if(!clean(draft?.company_name)) missing.push({key:"company_name", label:"Company/client name"});
if(!clean(draft?.location)) missing.push({key:"location", label:"Location"});
if(!clean(draft?.jd_text)) missing.push({key:"jd_text", label:"Job description"});
return missing;
}

function applyJobDraftAnswer(draft, raw){
let text = String(raw || "");
let next = Object.assign({}, draft || {});
let mappings = [
["job_title", ["Job Title", "Role", "Position"]],
["company_name", ["Company", "Company Name", "Client"]],
["location", ["Location", "Job Location"]],
["work_mode", ["Work Mode"]],
["job_type", ["Job Type", "Employment Type"]],
["salary_range", ["Salary", "Salary Range", "CTC", "Package", "Compensation"]],
["experience_required", ["Experience", "Experience Required"]],
["hiring_manager", ["Hiring Manager", "Recruiter"]],
["application_deadline", ["Application Deadline", "Deadline"]]
];
for(let [key, labels] of mappings){
let value = labelValueFromText(text, labels);
if(value) next[key] = value;
}
let missing = agentJobMissingFields(next);
if(missing.length === 1 && !labelValueFromText(text, mappings.flatMap(item => item[1]))){
next[missing[0].key] = clean(text);
}
return next;
}

function jobDraftPreviewHtml(draft){
return `<p><strong>Job:</strong> ${esc(draft.job_title || "Missing")}</p><p><strong>Company:</strong> ${esc(draft.company_name || "Missing")}</p><p><strong>Location:</strong> ${esc(draft.location || "Missing")}${draft.work_mode ? " / " + esc(draft.work_mode) : ""}</p><p><strong>Type:</strong> ${esc(draft.job_type || "Full Time")} | <strong>Salary:</strong> ${esc(draft.salary_range || "Not specified")}</p>`;
}

function askForJobDraftMissing(draft){
state.jobDraft = draft;
state.pendingContextType = "job_create_missing";
let missing = agentJobMissingFields(draft);
let names = missing.map(item => item.label).join(", ");
addMessage("agent", `<strong>JD read ho gayi. Bas ${esc(names)} missing hai.</strong>${jobDraftPreviewHtml(draft)}<p>Reply in simple format, for example: Company: Techindia, Location: Noida / Remote.</p>`);
}

async function createJobFromAgentDraft(draft){
let payload = {
job_title: clean(draft.job_title),
company_name: clean(draft.company_name),
department: clean(draft.department),
location: clean(draft.location),
work_mode: clean(draft.work_mode),
job_type: clean(draft.job_type) || "Full Time",
salary_range: clean(draft.salary_range) || "Not specified",
experience_required: clean(draft.experience_required),
application_deadline: clean(draft.application_deadline),
hiring_manager: clean(draft.hiring_manager),
jd_text: clean(draft.jd_text),
public_apply_enabled:true,
source_tracking_enabled:true
};
let data = await fetchJson(`${apiBase()}/create-job`, {
method:"POST",
headers:requestHeaders(),
body:JSON.stringify(payload)
});
state.jobsCache = null;
let createdJob = Object.assign({}, payload, {id:data.job_id, job_id:data.job_id, apply_link:data.apply_link, apply_links:data.apply_links || {}});
state.selectedJob = createdJob;
state.conversationContext = Object.assign({}, state.conversationContext, {job_id:data.job_id, job_title:payload.job_title, candidate_ids:[]});
state.jobDraft = null;
state.pendingContextType = "sourcing_confirm";
state.sourcingDraft = {job_id:data.job_id};
let applyLink = data.apply_link || data.apply_links?.main || "";
addMessage("agent", `<strong>Job created: ${esc(payload.job_title)}</strong>${jobDraftPreviewHtml(payload)}<p>Apply page ready hai. Kya is role ke liye HireScoreAI candidate sourcing bhi chahiye?</p><p><small>Sourcing request info@hirescoreai.com par approval ke liye jayegi. Admin pricing aur remaining requirements share karega; approval se pehle listing public nahi hogi.</small></p>${applyLink ? `<p><small>${esc(applyLink)}</small></p>` : ""}`, [
actionButton("Yes, request sourcing","sourcingReply",{value:"yes"}),
actionButton("No, source myself","sourcingReply",{value:"no"}),
actionButton("Open Apply Page","openApplyLink",{url:applyLink}),
actionButton("Copy Apply Link","copyApplyLink",{url:applyLink}),
actionButton("Upload Resumes","workflow",{workflowId:"upload_resumes"}),
actionButton("View Jobs","openPage",{page:"dashboard"})
]);
}

async function finishAgentJobDraft(draft){
let missing = agentJobMissingFields(draft);
if(missing.length){
askForJobDraftMissing(draft);
return true;
}
let loadingMessage = {role:"agent", html:"<em>Creating job from JD...</em>", actions:[]};
state.messages.push(loadingMessage);
renderMessages();
try{
await createJobFromAgentDraft(draft);
}catch(error){
addMessage("agent", `<strong>I could not create the job.</strong><p>${esc(error.message || "Please try again.")}</p>`, [
actionButton("Open Create Job","openPage",{page:"job"})
]);
}finally{
removeMessage(loadingMessage);
}
return true;
}

async function parseAgentJDText(text){
let data = await fetchJson(`${apiBase()}/parse-jd-text`, {
method:"POST",
headers:requestHeaders(),
body:JSON.stringify({jd_text:text})
});
return agentJobDraftFromParsed(text, data.fields || {});
}

async function handleAgentJDText(raw){
if(!looksLikeJDText(raw)) return false;
let loadingMessage = {role:"agent", html:"<em>Reading JD and preparing job...</em>", actions:[]};
state.messages.push(loadingMessage);
renderMessages();
try{
let draft = await parseAgentJDText(raw);
removeMessage(loadingMessage);
return finishAgentJobDraft(draft);
}catch(error){
removeMessage(loadingMessage);
addMessage("agent", `<strong>I could not read this JD.</strong><p>${esc(error.message || "Please upload PDF, DOCX, TXT, or paste a longer JD.")}</p>`, [
actionButton("Open Create Job","openPage",{page:"job"})
]);
return true;
}
}

async function handleAgentJDFile(file){
if(!file) return;
openDrawer();
addMessage("user", esc(`Upload JD: ${file.name || "job description"}`));
let formData = new FormData();
formData.append("file", file);
let loadingMessage = {role:"agent", html:"<em>Reading JD file and preparing job...</em>", actions:[]};
state.messages.push(loadingMessage);
renderMessages();
try{
let headers = requestHeaders();
if(headers instanceof Headers) headers.delete("Content-Type");
else delete headers["Content-Type"];
let data = await fetchJson(`${apiBase()}/parse-jd-file`, {method:"POST", headers, body:formData});
let draft = agentJobDraftFromParsed(data.jd_text || "", data.fields || {});
removeMessage(loadingMessage);
await finishAgentJobDraft(draft);
}catch(error){
removeMessage(loadingMessage);
addMessage("agent", `<strong>I could not read this JD file.</strong><p>${esc(error.message || "Upload PDF, DOCX, or TXT JD only.")}</p>`, [
actionButton("Open Create Job","openPage",{page:"job"})
]);
}
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
let mutations = actions.filter(action => MUTATING_ACTION_IDS.has(action?.action_id));
if(!mutations.length){
addMessage("agent", "<strong>This is a read-only result.</strong><p>No Action Agent step is required.</p>");
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
if(mutations.some(action => action.action_id === "send_mail") && !plan?.confirmation?.token){
addMessage("agent", `<strong>Email was not sent yet.</strong><p>This plan does not include a signed send-mail action, so I will not pretend the mail went out. Open the Outreach Queue, select the candidate, preview or generate the email draft, and send it from the composer after sender setup is valid.</p>`, [
actionButton("Open Outreach Queue","openPage",{page:"communication"}),
actionButton("Sender Setup","openPage",{page:"senderSetup"}),
actionButton("Open Top 10 Candidate Page","openPage",{page:"topCandidate"}),
actionButton("Read Email Guide","readGuide",{workflowId:"send_candidate_email"})
]);
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
if(typeof window.refreshAfterAgentAction === "function") await window.refreshAfterAgentAction(data);
addMessage("agent", `<strong>Action Agent completed.</strong><p>${esc(data?.candidate_count || 0)} candidate${Number(data?.candidate_count || 0) === 1 ? "" : "s"} processed for ${esc(data?.job?.job_title || plan?.entities?.job_title || "the selected job")}.</p>${receipts ? `<ul>${receipts}</ul>` : ""}`, [
actionButton("View Updated Candidates","openPage",{page:"jobResult"}),
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
if(typeof window.refreshAfterAgentAction === "function") await window.refreshAfterAgentAction({job:{id:context.job_id,job_title:job.job_title},candidate_ids:context.candidate_ids});
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
document.getElementById("hsHelpButton")?.classList.add("is-hidden");
setSetting(SETTINGS_KEYS.panelOpen, "true");
if(!state.messages.length){
addMessage("agent", `<strong>HireScore Recruiting Agent</strong><p>I can retrieve live jobs and candidates, explain stored scoring evidence, and execute confirmed recruiting actions.</p>`);
}
renderContextBar();
renderModeInfo();
}

function closeDrawer(){
document.getElementById("hsHelpRoot")?.classList.remove("is-open");
document.getElementById("hsHelpButton")?.classList.remove("is-hidden");
setSetting(SETTINGS_KEYS.panelOpen, "false");
}

function refreshPanel(){
let preservedContext = Object.assign({}, state.conversationContext || {});
state.messages = [];
state.lastIntent = null;
state.pendingContextType = null;
state.lastJobOptions = [];
state.lastCandidateOptions = [];
state.selectedJob = preservedContext.job_id || preservedContext.job_title ? Object.assign({}, state.selectedJob || {}, {id:preservedContext.job_id, job_title:preservedContext.job_title}) : null;
state.selectedCandidate = preservedContext.candidate_id ? {id:preservedContext.candidate_id, full_name:preservedContext.candidate_name || "Candidate"} : null;
state.lastTalentSearch = null;
state.jobDraft = null;
state.pendingProductFeature = null;
state.pendingGroupEmailRequest = null;
state.pendingEmailCandidates = [];
state.pendingEmailSenderChoice = null;
state.lastParsedPlan = null;
state.lastUserText = "";
state.conversationContext = preservedContext;
state.jobsCache = null;
state.clarificationAttempts = 0;
state.lastClarificationText = "";
document.getElementById("hsHelpInput")?.setAttribute("value", "");
let input = document.getElementById("hsHelpInput");
if(input) input.value = "";
renderMessages();
renderContextBar();
renderModeInfo();
applyRuntimeHelpIds();
let context = currentHelpContext();
let subject = context.candidate_name ? context.candidate_name : context.job_title ? context.job_title : "this workspace";
addMessage("agent", `<strong>Agent panel refreshed</strong><p>I refreshed this conversation and the latest page context for ${esc(subject)}. The dashboard stayed unchanged.</p>`);
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

async function quickAction(workflowId){
let workflow = WORKFLOWS[workflowId];
if(!workflow) return;
if(workflowId === "filter_candidates"){
let input = document.getElementById("hsHelpInput");
if(input){ input.placeholder = "e.g. Show top 10 candidates with AWS and 5+ years"; input.focus(); }
return;
}
let prompts = {
view_active_jobs:"Show my active jobs",
jobs_needing_attention:"Which jobs need attention?",
applicant_metrics:"How many candidates applied today?",
view_sourcing_status:"Is sourcing approved for this role?",
select_top_candidates:"Show me the top 10 candidates",
candidate_workflow:"Shortlist the best 5 candidates",
explain_candidate_score:"Why is this candidate a strong or weak fit?",
shortlist_candidate:"Shortlist this candidate",
schedule_interview:"Schedule an interview for this candidate",
create_job:"Help me create a new job",
share_public_apply_link:"Help me create and share the public apply link",
upload_resumes:"Help me plan the resume upload for this job",
search_talent:"Search the talent pool for matching candidates",
view_shortlisted_candidates:"Show shortlisted candidates",
send_candidate_email:"Draft an outreach email for the selected candidates",
move_candidates_to_interview:"Move the selected candidates to interview stage",
view_ai_hiring_insights:"Show AI hiring insights for this job",
invite_pilot_user:"Help me invite a pilot user",
view_plan_usage_limits:"Show my plan usage and limits",
deactivate_pilot_user:"Help me manage or deactivate pilot access"
};
return handleUserText(prompts[workflowId] || workflow.title);
}

function ensureShell(){
if(document.getElementById("hsHelpRoot")) return;
let root = document.createElement("div");
root.id = "hsHelpRoot";
root.innerHTML = `
<button id="hsHelpButton" class="hs-help-button" type="button" data-help-id="help-agent-button" onclick="window.HireScoreHelpAgent.openDrawer()">
<span class="hs-help-agent-mark">AI</span><strong class="hs-help-agent-name">HireScoreAI Agent</strong>
<span id="hsHelpLauncherPrompt" class="hs-help-launch-dialog">Need help with your jobs? I can review attention, applicants, active roles, or create a new job.</span>
<span class="hs-help-launch-open">Open AI Agent <b aria-hidden="true">→</b></span>
</button>
<aside class="hs-help-drawer" aria-label="HireScore AI Recruiting Agent">
<div class="hs-help-drawer-head">
<div><strong>HireScoreAI Agent</strong><span>Live recruiting workspace</span></div>
<div class="hs-help-drawer-actions">
<button type="button" aria-label="Refresh AI Agent panel" title="Refresh AI Agent panel" onclick="window.HireScoreHelpAgent.refreshPanel()">↻</button>
<button type="button" aria-label="Collapse Recruiting Agent" title="Close AI Agent panel" onclick="window.HireScoreHelpAgent.closeDrawer()">›</button>
</div>
</div>
<div id="hsAgentContext" class="hs-agent-context"></div>
<div id="hsHelpQuick" class="hs-help-quick">
</div>
<div id="hsHelpMessages" class="hs-help-messages"></div>
<div class="hs-help-compose">
<label class="hs-agent-mode"><span>Agent mode</span><select id="hsAgentMode" onchange="window.HireScoreHelpAgent.changeMode(this.value)"><option value="guide">Insights & navigation</option><option value="action">Confirmed recruiting actions</option></select></label>
<div id="hsHelpModeInfo" class="hs-help-mode-info"></div>
</div>
<form id="hsHelpForm" class="hs-help-form">
<label class="hs-help-attach" title="Upload JD file"><input id="hsHelpJDFile" type="file" accept=".pdf,.docx,.txt">JD</label>
<input id="hsHelpInput" type="text" placeholder="Ask about this screen or run a recruiting action" autocomplete="off">
<button type="submit">Send</button>
</form>
</aside>
<div id="hsHelpOnboarding" class="hs-help-modal-backdrop hidden">
<section class="hs-help-modal" role="dialog" aria-modal="true">
<strong>Welcome to HireScore AI &#128075;</strong>
<p>I can guide you through the product and help you get started faster.</p>
<span>Choose how you want to continue:</span>
<button type="button" onclick="window.HireScoreHelpAgent.startOnboardingTour()">Start Product Walkthrough</button>
<button type="button" onclick="window.HireScoreHelpAgent.askAgentFromOnboarding()">Ask Recruiting Agent</button>
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
let sidebarFooter = document.querySelector(".ats-sidebar-footer");
let launcher = document.getElementById("hsHelpButton");
if(sidebarFooter && launcher && window.innerWidth > 720) sidebarFooter.insertBefore(launcher, sidebarFooter.firstChild);
document.getElementById("hsHelpForm").addEventListener("submit", event => {
event.preventDefault();
let input = document.getElementById("hsHelpInput");
let text = input.value;
input.value = "";
handleUserText(text);
});
document.getElementById("hsHelpJDFile")?.addEventListener("change", event => {
let file = event.target.files && event.target.files[0];
event.target.value = "";
if(file) handleAgentJDFile(file);
});
renderModeInfo();
renderContextBar();
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
["#topCandidatePage, #topCandidateTable","top-candidates-page"],
["#topCandidatePage button[onclick*='openAIExplanation'], .ats-top10-action.is-ai","ai-explain-button"],
["#insightPage, #insightSkillChart, #insightScoreChart","ai-insights-page"],
["#shortlistTable, #shortlistTableMain","shortlist-table"],
["#shortlistExplanationPage, #shortlistExplainBody","shortlist-explanation-page"],
["#shortlistAnalyticsPage, #shortlistAnalyticsCandidates","shortlist-analytics-page"],
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
let shouldOpen = getSetting(SETTINGS_KEYS.panelOpen, "false") === "true";
if(shouldOpen) openDrawer();
if(getSetting(SETTINGS_KEYS.onboardingSeen, "false") !== "true"){
setTimeout(showOnboarding, 700);
}
}

window.HireScoreHelpAgent = {
openDrawer, closeDrawer, refreshPanel, quickAction, changeMode, enableActionAgent,
setContext,
candidateAction:function(candidateId, action){
let candidate = state.lastParsedPlan?.candidate_preview?.find(item => String(item.id || item.resume_id || item.candidate_id) === String(candidateId));
if(candidate) setContext({candidate_id:candidateId, candidate_name:candidate.full_name || candidate.name, candidate_ids:[candidateId]});
if(action === "view"){
let button = document.querySelector(`[data-profile-candidate-id="${CSS.escape(String(candidateId))}"]`);
if(button) button.click();
return;
}
if(action === "shortlist") return handleUserText("Shortlist this candidate");
let selected = Array.isArray(state.conversationContext.compare_candidate_ids) ? state.conversationContext.compare_candidate_ids : [];
selected = Array.from(new Set([...selected, candidateId])).slice(-2);
setContext({compare_candidate_ids:selected, candidate_ids:selected});
addMessage("agent", selected.length < 2 ? "<p>Select one more candidate to compare.</p>" : "<p>Two candidates selected. Ask what evidence you want compared.</p>");
},
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
if(item.action === "senderChoice") openSenderChoice(item.data.choice);
if(item.action === "candidateExplanation" && typeof window.openAIExplanation === "function") window.openAIExplanation(item.data.candidateId);
if(item.action === "candidateAction") window.HireScoreHelpAgent.candidateAction(item.data.candidateId, item.data.candidateAction || "view");
if(item.action === "talentPage") handleTalentSearchFollowUp("show me on page");
if(item.action === "talentWorkflow") handleTalentSearchFollowUp("i need workflow");
if(item.action === "openApplyLink"){
if(item.data.url) window.open(item.data.url, "_blank");
else openPage("applyJob");
}
if(item.action === "copyApplyLink" && item.data.url){
navigator.clipboard?.writeText(item.data.url);
addMessage("agent", "<strong>Apply link copied.</strong><p>You can share it with candidates now.</p>");
}
if(item.action === "interviewReply") handleUserText(item.data.value || "");
if(item.action === "sourcingReply") handleUserText(item.data.value || "");
if(item.action === "workflow"){
let previousPlan = state.lastParsedPlan || {};
let preservedEntities = mergeEntities(previousPlan.entities || {}, state.conversationContext || {});
if(item.data.workflowId === "send_candidate_email" && previousPlan.intent === "send_candidate_email"){
let job = currentEmailWorkflowJob();
if(job) return respondWithGroupEmailPlan(previousPlan, job);
}
handleWorkflow({
...previousPlan,
response_type:"workflow",
intent:item.data.workflowId,
entities:preservedEntities,
confidence:1,
clarification_needed:false,
clarification_question:null
});
}
},
selectJob:async function(index){
let job = state.lastJobOptions[index];
if(!job) return;
let selectedId = jobRecordId(job);
state.selectedJob = Object.assign({}, job, {id:selectedId, job_id:selectedId});
state.selectedCandidate = null;
state.conversationContext = Object.assign({}, state.conversationContext, {job_id:selectedId, job_title:job.job_title, candidate_ids:[]});
state.pendingContextType = null;
let selectedJobLabel = [job.job_title, job.company_name ? `at ${job.company_name}` : "", job.location ? `(${job.location})` : ""].filter(Boolean).join(" ");
addMessage("user", esc(selectedJobLabel || "Selected job"));
if(["view_active_jobs", "jobs_needing_attention", "applicant_metrics"].includes(state.lastParsedPlan?.intent)){
openPage("results");
addMessage("agent", `<strong>Opened ${esc(job.job_title || "the selected job")}.</strong><p>The center workspace now shows its live candidate results.</p>`);
return;
}
if(state.pendingProductFeature){
let feature = state.pendingProductFeature;
state.pendingProductFeature = null;
let opened = openPage(feature.route);
addMessage("agent", `<strong>${opened ? "Opening" : "I can open"} ${esc(feature.title)}.</strong><p><strong>Job:</strong> ${esc(job.job_title || "Selected job")}</p>`, productFeatureActions(feature));
return;
}
if(state.pendingGroupEmailRequest){
let plan = state.pendingGroupEmailRequest;
state.pendingGroupEmailRequest = null;
plan.entities = Object.assign({}, plan.entities || {}, {job_id:selectedId, job_title:job.job_title || plan.entities?.job_title});
state.lastParsedPlan = plan;
await respondWithGroupEmailPlan(plan, state.selectedJob);
return;
}
let plan = state.lastParsedPlan || {intent:state.lastIntent || "upload_resumes", entities:{}, confidence:1, clarification_needed:false};
plan.entities = Object.assign({}, plan.entities || {}, {job_id:selectedId, job_title:job.job_title || plan.entities?.job_title});
if(state.lastUserText){
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
_workflows: WORKFLOWS,
_groupEmailPlanFromText: groupEmailPlanFromText,
_matchJobs: matchJobs,
_interviewDateFromText: interviewDateFromText,
_interviewTimeFromText: interviewTimeFromText
};

document.addEventListener("DOMContentLoaded", init);
window.addEventListener("load", () => setTimeout(applyRuntimeHelpIds, 1000));
})();
