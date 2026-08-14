import { useEffect, useMemo, useState } from "react";
import { EnterpriseSidebar } from "../components/recruiter/EnterpriseSidebar.jsx";
import { CommandMenu } from "../components/design-system/CommandMenu.jsx";
import { OrganizationSwitcher } from "../components/recruiter/OrganizationSwitcher.jsx";
import { RecruiterCommandBar } from "../components/recruiter/RecruiterCommandBar.jsx";
import { resolveRoute } from "../routes/router.js";
import { useTalentSearch } from "../hooks/useTalentSearch.js";
import { useWorkspaceSocket } from "../hooks/useWorkspaceSocket.js";

export function App() {
  const [path, setPath] = useState(resolveInitialPath);
  const [query, setQuery] = useState("senior python backend engineer fastapi distributed systems");
  const [stage, setStage] = useState("all");
  const [commandOpen, setCommandOpen] = useState(false);
  const { data } = useTalentSearch({ query, stage });
  useWorkspaceSocket("default");
  const candidates = data?.results || [];
  const Route = useMemo(() => resolveRoute(path), [path]);

  function navigate(nextPath) {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
    setCommandOpen(false);
  }

  function exportCandidates() {
    const headers = ["Name", "Email", "Stage", "Score", "Designation"];
    const rows = candidates.map((candidate) => [
      candidate.full_name || candidate.name || "",
      candidate.email || "",
      candidate.stage || "",
      Math.round(candidate.final_score || candidate.score || 0),
      candidate.designation || ""
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hirescore-candidates.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname === "/" ? "/pipeline" : window.location.pathname);
    window.addEventListener("popstate", onPopState);
    function onKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  const isRequirementPlatform = path.startsWith("/requirement-platform");

  return (
    <div className="flex min-h-screen bg-ats-surface">
      <EnterpriseSidebar active={path} onNavigate={navigate} />
      <main className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-ats-line bg-white px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold text-ats-ink">{isRequirementPlatform ? "Requirement Platform" : "Enterprise Recruiting Workspace"}</h1>
            <p className="mt-1 text-sm text-ats-muted">{isRequirementPlatform ? "Verified recruitment collaboration, independent from ATS jobs and candidates." : "Pipeline, AI discovery, interviews, collaboration, and offers in one operating system."}</p>
          </div>
          <OrganizationSwitcher />
        </header>
        {!isRequirementPlatform && <RecruiterCommandBar
          query={query}
          onQuery={setQuery}
          onBulkMove={() => setStage("hiring_manager_review")}
          onOutreach={() => navigate("/inbox")}
          onExport={exportCandidates}
          onCandidate={() => navigate("/candidates")}
          onCopilot={() => navigate("/copilot")}
        />}
        <Route candidates={candidates} query={query} stage={stage} setStage={setStage} />
      </main>
      <CommandMenu
        open={commandOpen}
        query={query}
        onQuery={setQuery}
        onClose={() => setCommandOpen(false)}
        commands={[
          { label: "Open AI Copilot", hint: "Ask analyst", action: () => navigate("/copilot") },
          { label: "Talent discovery", hint: "Semantic search", action: () => navigate("/talent") },
          { label: "Move filtered candidates", hint: "Bulk action", action: () => setStage("hiring_manager_review") }
        ]}
      />
    </div>
  );
}

function resolveInitialPath() {
  const requested = new URLSearchParams(window.location.search).get("route");
  if (requested && requested.startsWith("/requirement-platform/") && !requested.startsWith("//")) {
    window.history.replaceState({}, "", requested);
    return requested;
  }
  return window.location.pathname === "/" || window.location.pathname.endsWith("/enterprise.html") ? "/pipeline" : window.location.pathname;
}
