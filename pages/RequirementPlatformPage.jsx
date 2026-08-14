import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, BriefcaseBusiness, Building2, CheckCircle2, Clock3, FileUp, Filter, MapPin, Search, ShieldCheck, Star, UserRoundCheck, UsersRound } from "lucide-react";
import { requirementPlatformApi as api } from "../services/requirementPlatformApi.js";
import "../styles/requirement-platform.css";

const emptyProfile = {
  profile_type: "recruiter",
  display_name: "",
  professional_headline: "",
  professional_email: "",
  phone: "",
  city: "",
  state_region: "",
  country: "India",
  linkedin_url: "",
  website_url: "",
  availability: "available_now",
  preferred_engagements: ["freelance_project"],
  is_available_for_sourcing: true,
  details: {},
  taxonomy: { market: ["India"], industry: [], specialization: [], employment_type: [], sourcing_channel: [] }
};

const profileLabels = {
  vendor: "Vendor / Company",
  recruiter: "Recruiter",
  hr_professional: "HR Professional",
  recruitment_agency: "Recruitment Agency"
};

function pathSection() {
  const segment = window.location.pathname.split("/")[2];
  return ["requirements", "professionals", "workspace", "profile", "onboarding", "post-requirement"].includes(segment) ? segment : "requirements";
}

function go(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function messageFrom(error) {
  return error?.message || "Something went wrong. Please try again.";
}

export function RequirementPlatformPage() {
  const [section, setSection] = useState(pathSection());
  const [profile, setProfile] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const onPop = () => setSection(pathSection());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    api.profile()
      .then((data) => setProfile(data))
      .catch((error) => {
        if (error.status === 401) {
          const next = encodeURIComponent(window.location.pathname);
          window.location.href = `/login.html?next=${next}`;
          return;
        }
        if (error.status === 404) setNeedsOnboarding(true);
        else setNotice(messageFrom(error));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <RequirementLoading />;
  if (needsOnboarding || section === "onboarding") return <Onboarding onComplete={(data) => { setProfile(data); setNeedsOnboarding(false); go("/requirement-platform/profile"); }} />;
  if (!profile) return <ErrorState message={notice || "Requirement Platform profile could not be loaded."} />;

  return (
    <div className="rp-shell">
      <section className="rp-heading">
        <div>
          <span className="rp-kicker"><ShieldCheck size={16} /> Verified recruitment collaboration network</span>
          <h2>Requirement Platform</h2>
          <p>Vendor requirements, verified sourcing partners, and candidate submissions in one independent workspace.</p>
        </div>
        <ProfileStatus profile={profile} />
      </section>
      <nav className="rp-tabs" aria-label="Requirement Platform navigation">
        {[["requirements", "Requirements", BriefcaseBusiness], ["professionals", "Recruiters & HR", UsersRound], ["workspace", "Workspace", Building2]].map(([key, label, Icon]) => (
          <button key={key} className={section === key ? "is-active" : ""} onClick={() => go(`/requirement-platform/${key}`)}><Icon size={18} />{label}</button>
        ))}
      </nav>
      {notice && <div className="rp-notice" role="status">{notice}</div>}
      {profile.status !== "verified" ? <VerificationGate profile={profile} onUpdate={setProfile} /> : (
        <>
          {section === "requirements" && <Requirements profile={profile} setNotice={setNotice} />}
          {section === "professionals" && <Professionals profile={profile} setNotice={setNotice} />}
          {section === "workspace" && <Workspace profile={profile} setNotice={setNotice} />}
          {section === "profile" && <ProfileSummary profile={profile} />}
          {section === "post-requirement" && <Requirements profile={profile} setNotice={setNotice} forceComposer />}
        </>
      )}
    </div>
  );
}

function RequirementLoading() {
  return <div className="rp-loading"><span /><strong>Opening Requirement Platform…</strong></div>;
}

function ErrorState({ message }) {
  return <div className="rp-empty"><ShieldCheck size={38} /><h2>Requirement Platform unavailable</h2><p>{message}</p></div>;
}

function ProfileStatus({ profile }) {
  const verified = profile.status === "verified";
  return <button className={`rp-profile-status ${verified ? "is-verified" : ""}`} onClick={() => go("/requirement-platform/profile")}><span>{verified ? <BadgeCheck size={20} /> : <Clock3 size={20} />}</span><div><strong>{profile.display_name || "Your profile"}</strong><small>{verified ? "HireScore Verified" : profile.status.replaceAll("_", " ")}</small></div></button>;
}

function VerificationGate({ profile, onUpdate }) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  async function submit() {
    setSubmitting(true);
    try {
      await api.submitVerification({ verification_types: ["email", "phone", "professional", ...(profile.profile_type === "vendor" ? ["company_domain"] : [])] });
      onUpdate({ ...profile, status: "verification_pending" });
      setMessage("Your profile has been submitted for admin review.");
    } catch (error) { setMessage(messageFrom(error)); }
    finally { setSubmitting(false); }
  }
  return <section className="rp-gate"><ShieldCheck size={44} /><span>Marketplace access</span><h3>{profile.status === "verification_pending" || profile.status === "under_review" ? "Verification review in progress" : "Complete verification to continue"}</h3><p>Only verified and active professionals can browse requirements, invite sourcing partners, or submit candidates.</p><div className="rp-progress"><i style={{ width: `${profile.profile_completeness || 0}%` }} /></div><small>{profile.profile_completeness || 0}% profile complete</small>{["draft", "profile_incomplete", "more_information_required", "rejected"].includes(profile.status) && <button className="rp-primary" disabled={submitting || profile.profile_completeness < 80} onClick={submit}>{submitting ? "Submitting…" : "Submit for Review"}</button>}{message && <p role="status">{message}</p>}</section>;
}

function Onboarding({ onComplete }) {
  const [form, setForm] = useState(emptyProfile);
  const [skills, setSkills] = useState("");
  const [industries, setIndustries] = useState("");
  const [markets, setMarkets] = useState("India");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event) {
    event.preventDefault(); setSaving(true); setError("");
    const payload = { ...form, taxonomy: { ...form.taxonomy, specialization: commaList(skills), industry: commaList(industries), market: commaList(markets) }, details: detailPayload(form) };
    try { onComplete(await api.createProfile(payload)); } catch (reason) { setError(messageFrom(reason)); } finally { setSaving(false); }
  }
  return <div className="rp-onboarding"><header><span className="rp-kicker"><ShieldCheck size={16} /> Verified professionals only</span><h1>Create your professional profile</h1><p>Your contact information remains private. Marketplace access starts only after admin verification.</p></header><form onSubmit={submit} className="rp-form-card"><label className="rp-wide">Professional type<select value={form.profile_type} onChange={(e) => update("profile_type", e.target.value)}>{Object.entries(profileLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Full name / organization name<input required value={form.display_name} onChange={(e) => update("display_name", e.target.value)} /></label><label>Professional headline<input required value={form.professional_headline} onChange={(e) => update("professional_headline", e.target.value)} /></label><label>Professional email<input type="email" required value={form.professional_email} onChange={(e) => update("professional_email", e.target.value)} /></label><label>Phone<input required value={form.phone} onChange={(e) => update("phone", e.target.value)} /></label><label>City<input value={form.city} onChange={(e) => update("city", e.target.value)} /></label><label>State / Region<input value={form.state_region} onChange={(e) => update("state_region", e.target.value)} /></label><label>Country<input required value={form.country} onChange={(e) => update("country", e.target.value)} /></label><label>LinkedIn URL<input type="url" required value={form.linkedin_url} onChange={(e) => update("linkedin_url", e.target.value)} /></label><label>Website / Portfolio<input type="url" value={form.website_url} onChange={(e) => update("website_url", e.target.value)} /></label><label>Availability<select value={form.availability} onChange={(e) => update("availability", e.target.value)}><option value="available_now">Available Now</option><option value="limited_availability">Limited Availability</option><option value="not_accepting_projects">Not Accepting Projects</option></select></label><label className="rp-wide">Markets worked in<input value={markets} onChange={(e) => setMarkets(e.target.value)} placeholder="India, USA, Canada" /></label><label className="rp-wide">Industry specialization<input value={industries} onChange={(e) => setIndustries(e.target.value)} placeholder="Information Technology, Healthcare, BFSI" /></label><label className="rp-wide">Recruitment specialization<input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Data & Analytics, Java, Cloud, DevOps" /></label>{form.profile_type === "hr_professional" && <label className="rp-check rp-wide"><input type="checkbox" checked={form.is_available_for_sourcing} onChange={(e) => update("is_available_for_sourcing", e.target.checked)} />Available for Recruitment / Sourcing Projects</label>}<div className="rp-wide rp-form-actions"><button className="rp-primary" disabled={saving}>{saving ? "Saving profile…" : "Save and Continue"}</button>{error && <p role="alert">{error}</p>}</div></form></div>;
}

function detailPayload(form) {
  if (form.profile_type === "vendor") return { company_name: form.display_name, business_email: form.professional_email, company_type: "Direct Employer" };
  if (form.profile_type === "recruitment_agency") return { agency_name: form.display_name, business_email: form.professional_email };
  if (form.profile_type === "hr_professional") return { current_job_title: form.professional_headline, hr_specializations_json: [] };
  return { current_job_title: form.professional_headline, employment_type: "Freelance Recruiter" };
}

function commaList(value) { return value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 50); }

function Requirements({ profile, setNotice, forceComposer = false }) {
  const vendor = ["vendor", "recruitment_agency"].includes(profile.profile_type);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composer, setComposer] = useState(forceComposer);
  const [query, setQuery] = useState("");
  const load = () => { setLoading(true); (vendor ? api.requirements() : api.recommendedRequirements()).then((data) => setItems(data.results || [])).catch((error) => setNotice(messageFrom(error))).finally(() => setLoading(false)); };
  useEffect(load, [vendor]);
  const filtered = useMemo(() => items.filter((item) => !query || `${item.title} ${item.primary_skills?.join(" ")} ${item.location}`.toLowerCase().includes(query.toLowerCase())), [items, query]);
  return <section className="rp-content"><div className="rp-toolbar"><label><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search role, skills, or location" /></label><button><Filter size={18} />Filters</button>{vendor && <button className="rp-primary" onClick={() => setComposer(true)}>Post a Requirement</button>}</div>{composer && <RequirementComposer onClose={() => setComposer(false)} onCreated={() => { setComposer(false); load(); }} setNotice={setNotice} />}{loading ? <RequirementLoading /> : filtered.length ? <div className="rp-card-grid">{filtered.map((item) => <RequirementCard key={item.id} item={item} vendor={vendor} setNotice={setNotice} />)}</div> : <div className="rp-empty"><BriefcaseBusiness size={38} /><h3>No matching requirements</h3><p>No matching requirements are available right now. We’ll surface relevant opportunities here when they match your sourcing profile.</p></div>}</section>;
}

function RequirementCard({ item, vendor, setNotice }) {
  const [requesting, setRequesting] = useState(false);
  async function request() {
    setRequesting(true);
    try { await api.requestToSource(item.id, { suitability: "My verified sourcing profile and specialization align with this requirement.", estimated_delivery_timeline: "3-5 business days", estimated_candidate_profiles: 5 }); setNotice("Sourcing request sent to the vendor."); }
    catch (error) { setNotice(messageFrom(error)); } finally { setRequesting(false); }
  }
  return <article className="rp-card"><header><div className="rp-card-icon"><BriefcaseBusiness size={20} /></div>{item.match && <span className="rp-match">{item.match.match_percentage}% Match</span>}</header><h3>{item.title}</h3><p className="rp-meta"><MapPin size={15} />{[item.location, item.country].filter(Boolean).join(", ") || "Location flexible"}</p><div className="rp-pills">{[item.employment_type, item.work_mode, ...(item.primary_skills || []).slice(0, 3)].filter(Boolean).map((value) => <span key={value}>{value}</span>)}</div>{item.vendor && <p className="rp-posted">Posted by <strong>{item.vendor.display_name}</strong>{item.vendor.hire_score_verified && <BadgeCheck size={15} />}</p>}{item.match?.reasons?.length > 0 && <ul className="rp-reasons">{item.match.reasons.slice(0, 3).map((reason) => <li key={reason}><CheckCircle2 size={14} />{reason}</li>)}</ul>}<footer><button className="rp-secondary">View Requirement</button>{!vendor && <button className="rp-primary" disabled={requesting} onClick={request}>{requesting ? "Sending…" : "Request to Source"}</button>}</footer></article>;
}

function RequirementComposer({ onClose, onCreated, setNotice }) {
  const [saving, setSaving] = useState(false);
  async function submit(event) {
    event.preventDefault(); setSaving(true); const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    try { await api.createRequirement({ ...data, description: data.description, primary_skills: commaList(data.primary_skills), secondary_skills: commaList(data.secondary_skills), experience_min: Number(data.experience_min || 0), experience_max: Number(data.experience_max || 0), openings: Number(data.openings || 1), sourcing_partners_needed: Number(data.sourcing_partners_needed || 1), submission_limit_per_partner: Number(data.submission_limit_per_partner || 10), status: "open", us_details: {} }); setNotice("Requirement posted successfully."); onCreated(); }
    catch (error) { setNotice(messageFrom(error)); } finally { setSaving(false); }
  }
  return <div className="rp-modal-backdrop"><form className="rp-modal" onSubmit={submit}><header><div><span>New requirement</span><h3>Post a recruitment requirement</h3></div><button type="button" onClick={onClose}>×</button></header><div className="rp-modal-grid"><label className="rp-wide">Job title<input name="title" required /></label><label className="rp-wide">Job description<textarea name="description" rows="5" required minLength="20" /></label><label className="rp-wide">Primary skills<input name="primary_skills" required placeholder="Java, Spring Boot, AWS" /></label><label className="rp-wide">Secondary skills<input name="secondary_skills" /></label><label>Industry<input name="industry" /></label><label>Country<input name="country" required /></label><label>Location<input name="location" /></label><label>Work mode<select name="work_mode"><option>Remote</option><option>Hybrid</option><option>Onsite</option></select></label><label>Employment type<select name="employment_type"><option>Full-Time</option><option>Contract</option><option>C2C</option><option>W2</option><option>C2H</option><option>1099</option></select></label><label>Openings<input name="openings" type="number" min="1" defaultValue="1" /></label><label>Minimum experience<input name="experience_min" type="number" min="0" step="0.5" /></label><label>Maximum experience<input name="experience_max" type="number" min="0" step="0.5" /></label><label>Sourcing partners needed<input name="sourcing_partners_needed" type="number" min="1" defaultValue="1" /></label><label>Submission limit / partner<input name="submission_limit_per_partner" type="number" min="1" defaultValue="10" /></label><label>Visibility<select name="visibility"><option value="public_marketplace">Public Marketplace</option><option value="invite_only">Invite Only</option><option value="private_network">Private Network</option></select></label></div><footer><button type="button" className="rp-secondary" onClick={onClose}>Cancel</button><button className="rp-primary" disabled={saving}>{saving ? "Posting…" : "Post Requirement"}</button></footer></form></div>;
}

function Professionals({ profile, setNotice }) {
  const [items, setItems] = useState([]); const [query, setQuery] = useState("");
  useEffect(() => { api.professionals().then((data) => setItems(data.results || [])).catch((error) => setNotice(messageFrom(error))); }, []);
  const visible = items.filter((item) => item.id !== profile.id && (!query || `${item.display_name} ${item.professional_headline}`.toLowerCase().includes(query.toLowerCase())));
  return <section className="rp-content"><div className="rp-toolbar"><label><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search verified recruiters and HR" /></label><button><Filter size={18} />Filters</button></div>{visible.length ? <div className="rp-card-grid">{visible.map((item) => <ProfessionalCard key={item.id} item={item} />)}</div> : <div className="rp-empty"><UsersRound size={38} /><h3>No strong sourcing matches found yet</h3><p>Try broadening your requirement criteria.</p></div>}</section>;
}

function ProfessionalCard({ item }) {
  const tags = Object.values(item.taxonomy || {}).flat().map((entry) => entry.value).slice(0, 4);
  return <article className="rp-card rp-professional-card"><header><div className="rp-avatar">{(item.display_name || "P").slice(0, 2).toUpperCase()}</div><span className={`rp-availability is-${item.availability}`}>{item.availability?.replaceAll("_", " ") || "Profile available"}</span></header><h3>{item.display_name} {item.hire_score_verified && <BadgeCheck size={18} />}</h3><p>{item.professional_headline || profileLabels[item.profile_type]}</p><p className="rp-meta"><MapPin size={15} />{[item.location?.city, item.location?.country].filter(Boolean).join(", ")}</p><div className="rp-pills">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="rp-score-row"><span><ShieldCheck size={17} />Trust Score</span><strong>{item.trust_score ?? "New"}</strong></div><footer><button className="rp-secondary">View Profile</button><button className="rp-primary">Invite to Requirement</button></footer></article>;
}

function Workspace({ profile, setNotice }) {
  const [data, setData] = useState(null); const [assignments, setAssignments] = useState([]);
  useEffect(() => { Promise.all([api.workspace(), api.assignments()]).then(([workspace, assignmentData]) => { setData(workspace); setAssignments(assignmentData.results || []); }).catch((error) => setNotice(messageFrom(error))); }, []);
  if (!data) return <RequirementLoading />;
  return <section className="rp-content"><div className="rp-stat-grid">{Object.entries(data.stats || {}).map(([label, value]) => <article key={label}><span>{label.replaceAll("_", " ")}</span><strong>{value}</strong></article>)}</div><div className="rp-workspace-panel"><header><div><span>Current sourcing work</span><h3>Active Assignments</h3></div><UserRoundCheck size={24} /></header>{assignments.length ? assignments.map((assignment) => <div className="rp-assignment" key={assignment.id}><div><strong>Requirement {assignment.requirement_id.slice(0, 8)}</strong><small>Started {new Date(assignment.started_at).toLocaleDateString()}</small></div><span>{assignment.status}</span>{data.role === "sourcing_professional" && <CandidateSubmit assignment={assignment} setNotice={setNotice} />}</div>) : <div className="rp-empty compact"><BriefcaseBusiness size={30} /><p>No active assignments yet.</p></div>}</div></section>;
}

function CandidateSubmit({ assignment, setNotice }) {
  const [open, setOpen] = useState(false); const [saving, setSaving] = useState(false);
  async function submit(event) { event.preventDefault(); setSaving(true); try { await api.submitCandidate(assignment.id, new FormData(event.currentTarget)); setNotice("Candidate submitted securely."); setOpen(false); } catch (error) { setNotice(messageFrom(error)); } finally { setSaving(false); } }
  return <>{<button className="rp-secondary" onClick={() => setOpen(true)}><FileUp size={16} />Submit Candidate</button>}{open && <div className="rp-modal-backdrop"><form className="rp-modal" onSubmit={submit}><header><div><span>Standalone submission</span><h3>Submit candidate</h3></div><button type="button" onClick={() => setOpen(false)}>×</button></header><div className="rp-modal-grid"><label>Full name<input name="full_name" required /></label><label>Email<input name="email" type="email" /></label><label>Phone<input name="phone" /></label><label>Current location<input name="current_location" /></label><label>Total experience<input name="total_experience" type="number" step="0.5" /></label><label>Current employer<input name="current_employer" /></label><label>Current job title<input name="current_job_title" /></label><label>Work authorization<input name="work_authorization" /></label><label className="rp-wide">Relevant skills<input name="relevant_skills" /></label><label className="rp-wide">Resume (PDF, DOC, DOCX)<input name="resume" type="file" accept=".pdf,.doc,.docx" required /></label><label className="rp-wide">Recruiter notes<textarea name="recruiter_notes" rows="3" /></label></div><footer><button type="button" className="rp-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="rp-primary" disabled={saving}>{saving ? "Submitting…" : "Submit Candidate"}</button></footer></form></div>}</>;
}

function ProfileSummary({ profile }) {
  return <section className="rp-content"><article className="rp-profile-summary"><div className="rp-avatar large">{(profile.display_name || "P").slice(0, 2).toUpperCase()}</div><div><span>{profileLabels[profile.profile_type]}</span><h3>{profile.display_name}</h3><p>{profile.professional_headline}</p><div className="rp-pills">{profile.hire_score_verified && <span><BadgeCheck size={14} />HireScore Verified</span>}<span>{profile.profile_completeness}% complete</span><span>Trust Score {profile.trust_score ?? "New"}</span></div></div></article></section>;
}
