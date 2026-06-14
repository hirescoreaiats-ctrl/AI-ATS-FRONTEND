import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../ai_explanation.js", import.meta.url), "utf8");

const testCode = `
const raw = '{"summary":"Candidate appears strong","strengths":["ML evidence","OCR evidence"],"concerns":["Parser flag: ai_parse_recovered","Verify LLM depth"],"recommendation":"Shortlist","ranking_reason":"Rank score 96.5/100: strong applied ML evidence.","experience_summary":{"total_years":6.93,"relevant_years":6.35,"label":"direct_match"}}';
const report = formatCandidateExplanation(raw);
assert.equal(report.summary, "Candidate appears strong");
assert.deepEqual(report.strengths, ["ML evidence", "OCR evidence"]);
assert.deepEqual(report.concerns, ["Verify LLM depth"]);
assert.equal(report.recommendation, "Shortlist");
assert.equal(report.experience_summary.relevant_years, 6.35);
assert.ok(report.data_quality_notes.includes("Resume parse was repaired after an initial extraction issue."));

const arrayReport = formatCandidateExplanation(["One strength", "Two strength"]);
assert.deepEqual(arrayReport.strengths, ["One strength", "Two strength"]);

const prioritized = prioritizeMatchedSkills(
  ["Xamarin", "Python", "YOLO", "React", "PyTorch", "SQL", "LLM", "LangChain", "AWS", "TensorFlow", "Docker", "OCR", "R-CNN", "Machine Learning", "Deep Learning", "Scikit Learn", "Model Evaluation", "Computer Vision", "Object Detection", "Generative AI", "Extra"],
  { job_title: "Data Scientist / Applied ML Engineer" },
  "Applied ML Computer Vision OCR LLM"
);
assert.equal(prioritized.visible[0], "Machine Learning");
assert.ok(prioritized.visible.includes("YOLO"));
assert.equal(prioritized.visible.length, 18);
assert.equal(prioritized.hiddenCount, 3);

const projects = sortProjectEvidenceByRelevance([
  { name: "Mobile app", description: "Android and iOS Xamarin C# work", technologies: ["C#"] },
  { name: "Vision model", description: "YOLO and R-CNN object detection using Python and PyTorch", technologies: ["Python", "PyTorch"] }
], "Data Scientist / Applied ML Engineer");
assert.equal(projects[0].name, "Vision model");
assert.equal(projects[0].relevanceLabel, "Direct JD Evidence");
`;

vm.runInNewContext(`${source}\n${testCode}`, { assert, console });
