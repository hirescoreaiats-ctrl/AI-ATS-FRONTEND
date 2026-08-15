(() => {
    window.pilotRegistryData = {users: [], invitations: []}
    window.managedPilotUserId = null
    window.managedPilotUser = null

    const text = value => String(value ?? "")
    const apiMessage = (data, fallback) => typeof data?.detail === "object" ? data.detail.message || fallback : data?.detail || fallback
    const limitText = value => value === null || value === undefined ? "Unlimited" : Number(value).toLocaleString()
    const usageText = (used, limit) => `${Number(used || 0).toLocaleString()} / ${limitText(limit)}`
    const escapeHtml = value => typeof safeHtml === "function" ? safeHtml(value) : text(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]))
    const escapeJs = value => typeof safeJs === "function" ? safeJs(value) : text(value).replaceAll("\\", "\\\\").replaceAll("'", "\\'")

    function dateInput(value) {
        if (!value) return ""
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return ""
        const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        return local.toISOString().slice(0, 16)
    }

    function expiryText(item) {
        if (["expired", "invite_expired"].includes(item.status)) return "Expired"
        if (item.days_remaining === 0) return "Expires today"
        if (Number.isFinite(item.days_remaining)) return `${item.days_remaining} day${item.days_remaining === 1 ? "" : "s"} left`
        const value = item.pilot_expires_at || item.expires_at
        return value ? new Date(value).toLocaleDateString() : "No expiry"
    }

    window.pilotStatusBadge = status => {
        const normalized = text(status || "pending").toLowerCase()
        const className = normalized === "active" ? "is-active" : ["expired", "deactivated", "cancelled", "invite_expired"].includes(normalized) ? "is-inactive" : normalized === "suspended" ? "is-danger" : normalized === "expiring_soon" ? "is-warning" : "is-pending"
        const label = normalized.replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase())
        return `<span class="ats-pilot-status ${className}">${escapeHtml(label)}</span>`
    }

    async function request(path, options = {}) {
        const response = await fetch(API + path, {...options, headers: authHeaders()})
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(apiMessage(data, "Pilot action failed"))
        return data
    }

    window.loadPilotUsers = async () => {
        const table = document.getElementById("pilotUsersTable")
        if (!table) return
        table.innerHTML = `<tr><td colspan="7" class="ats-pilot-empty">Loading pilot access...</td></tr>`
        try {
            window.pilotRegistryData = await request("/admin/pilot-users")
            window.renderPilotRegistry()
        } catch (error) {
            table.innerHTML = `<tr><td colspan="7" class="ats-pilot-empty">${escapeHtml(error.message)}</td></tr>`
        }
    }

    window.renderPilotRegistry = () => {
        const table = document.getElementById("pilotUsersTable")
        if (!table) return
        const query = text(document.getElementById("pilotSearch")?.value).trim().toLowerCase()
        const filter = document.getElementById("pilotStatusFilter")?.value || "all"
        const sort = document.getElementById("pilotSort")?.value || "newest"
        const entries = [
            ...(window.pilotRegistryData.users || []).map(item => ({...item, entryType: "user"})),
            ...(window.pilotRegistryData.invitations || []).map(item => ({...item, entryType: "invite", name: item.config?.name || "Pending Invitation", company_name: item.config?.company_name, pilot_expires_at: item.config?.pilot_expires_at})),
        ].filter(item => {
            const haystack = `${item.name || ""} ${item.email || ""} ${item.company_name || ""}`.toLowerCase()
            return (!query || haystack.includes(query)) && (filter === "all" || item.status === filter || (filter === "pending" && item.status === "pending"))
        })
        entries.sort((a, b) => {
            if (sort === "oldest") return new Date(a.created_at || 0) - new Date(b.created_at || 0)
            if (sort === "expiry") return new Date(a.pilot_expires_at || a.expires_at || "9999-01-01") - new Date(b.pilot_expires_at || b.expires_at || "9999-01-01")
            if (sort === "usage") return Number(b.usage?.total_resumes || 0) - Number(a.usage?.total_resumes || 0)
            return new Date(b.created_at || 0) - new Date(a.created_at || 0)
        })
        const rows = entries.map(item => {
            if (item.entryType === "invite") {
                const actions = item.status === "accepted" ? "—" : `<div class="ats-pilot-row-actions">${item.signup_url ? `<button class="ats-pilot-row-action" onclick="copyPilotText('${escapeJs(item.signup_url)}')">Copy</button>` : ""}<button class="ats-pilot-row-action" onclick="resendPilotInvite('${escapeJs(item.id)}')">Resend</button><button class="ats-pilot-row-action is-danger" onclick="cancelPilotInvite('${escapeJs(item.id)}')">Cancel</button></div>`
                return `<tr><td><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.email || "")}</small><small>${escapeHtml(item.company_name || "")}</small></td><td>${pilotStatusBadge(item.status)}</td><td>—</td><td>—</td><td>—</td><td>${escapeHtml(expiryText(item))}</td><td>${actions}</td></tr>`
            }
            const usage = item.usage || {}, limits = usage.limits || {}
            return `<tr><td><strong>${escapeHtml(item.name || "Pilot Recruiter")}</strong><small>${escapeHtml(item.email || "")}</small><small>${escapeHtml(item.company_name || "")}</small></td><td>${pilotStatusBadge(item.status)}</td><td>${escapeHtml(usageText(usage.total_jobs, limits.total_jobs))}</td><td>${escapeHtml(usageText(usage.active_jobs, limits.active_jobs))}</td><td>${escapeHtml(usageText(usage.total_resumes, limits.total_resumes))}</td><td>${escapeHtml(expiryText(item))}</td><td><button class="ats-pilot-row-action" onclick="openPilotManage('${escapeJs(item.id)}')">Manage</button></td></tr>`
        })
        table.innerHTML = rows.length ? rows.join("") : `<tr><td colspan="7" class="ats-pilot-empty">No matching pilot users or invitations.</td></tr>`
    }

    window.updatePilotExpiryPreview = () => {
        const start = document.getElementById("pilotStartDate"), expiry = document.getElementById("pilotExpiryDate"), duration = document.getElementById("pilotDuration")?.value || "14"
        if (!start || !expiry) return
        if (!start.value) start.value = dateInput(new Date())
        if (duration !== "custom") {
            const date = new Date(start.value)
            date.setDate(date.getDate() + Number(duration))
            expiry.value = dateInput(date)
            expiry.readOnly = true
        } else expiry.readOnly = false
    }

    const optionalNumber = id => document.getElementById(id)?.value === "" ? null : Number(document.getElementById(id)?.value)

    window.createPilotUser = async event => {
        event.preventDefault()
        const name = text(document.getElementById("pilotUserName")?.value).trim(), email = text(document.getElementById("pilotUserEmail")?.value).trim()
        if (!name || !email.includes("@")) return alert("Enter a valid name and pilot user email.")
        const button = document.getElementById("pilotCreateButton")
        setButtonLoading(button, true, "Creating...")
        try {
            const payload = {
                name, email, company_name: text(document.getElementById("pilotCompanyName")?.value).trim(),
                max_total_jobs: optionalNumber("pilotMaxTotalJobs"), max_active_jobs: optionalNumber("pilotMaxActiveJobs"),
                max_resumes_per_job: optionalNumber("pilotMaxResumesPerJob"), max_total_resumes: optionalNumber("pilotMaxTotalResumes"),
                duration_days: document.getElementById("pilotDuration")?.value,
                pilot_started_at: new Date(document.getElementById("pilotStartDate").value).toISOString(),
                pilot_expires_at: new Date(document.getElementById("pilotExpiryDate").value).toISOString(),
                pilot_notes: text(document.getElementById("pilotNotes")?.value).trim(), pilot_source: document.getElementById("pilotSource")?.value,
            }
            const data = await request("/admin/pilot-users", {method: "POST", body: JSON.stringify(payload)})
            const result = document.getElementById("pilotInviteResult"), url = document.getElementById("pilotInviteUrl"), message = document.getElementById("pilotInviteMessage"), help = document.getElementById("pilotInviteHelp"), copy = document.getElementById("pilotCopyButton")
            result?.classList.remove("hidden"); result?.classList.toggle("is-error", data.email_sent === false)
            if (message) message.innerText = data.message || "Pilot access created"
            if (url) url.value = data.signup_url || ""
            url?.parentElement?.classList.toggle("hidden", !data.signup_url); copy?.classList.toggle("hidden", !data.signup_url)
            if (help) help.innerText = data.signup_url ? "Invitation created. Copy the private link as a backup." : "The existing account now has active pilot access."
            document.getElementById("pilotUserName").value = ""; document.getElementById("pilotUserEmail").value = ""
            await window.loadPilotUsers()
        } catch (error) { alert("Pilot access failed: " + error.message) }
        finally { setButtonLoading(button, false) }
    }

    window.resendPilotInvite = async id => { try { await request(`/admin/pilot-invitations/${encodeURIComponent(id)}/resend`, {method: "POST"}); await loadPilotUsers() } catch (error) { alert(error.message) } }
    window.cancelPilotInvite = async id => { if (!confirm("Cancel this unused pilot invitation?")) return; try { await request(`/admin/pilot-invitations/${encodeURIComponent(id)}/cancel`, {method: "POST"}); await loadPilotUsers() } catch (error) { alert(error.message) } }

    window.openPilotManage = async userId => {
        window.managedPilotUserId = userId
        document.getElementById("pilotManageOverlay")?.classList.remove("hidden")
        document.getElementById("pilotManageLoading")?.classList.remove("hidden")
        document.getElementById("pilotManageContent")?.classList.add("hidden")
        try {
            const user = await request(`/admin/pilot-users/${encodeURIComponent(userId)}`)
            window.managedPilotUser = user
            document.getElementById("pilotManageTitle").innerText = user.name || "Pilot User"
            document.getElementById("pilotManageIdentity").innerText = `${user.email || ""}${user.company_name ? " · " + user.company_name : ""}`
            const details = [["Status", pilotStatusBadge(user.status)], ["Account", escapeHtml(user.account_status || "Enabled")], ["Started", escapeHtml(user.pilot_started_at ? new Date(user.pilot_started_at).toLocaleString() : "—")], ["Expires", escapeHtml(user.pilot_expires_at ? new Date(user.pilot_expires_at).toLocaleString() : "No expiry")], ["Last Login", escapeHtml(user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "—")], ["Last Activity", escapeHtml(user.last_activity_at ? new Date(user.last_activity_at).toLocaleString() : "—")]]
            document.getElementById("pilotManageAccount").innerHTML = details.map(([key, value]) => `<div><span>${key}</span><strong>${value}</strong></div>`).join("")
            const usage = user.usage || {}, limits = usage.limits || {}
            document.getElementById("pilotManageUsage").innerHTML = [["Jobs", usageText(usage.total_jobs, limits.total_jobs)], ["Active", usageText(usage.active_jobs, limits.active_jobs)], ["Resumes", usageText(usage.total_resumes, limits.total_resumes)], ["Per Job", `Max ${limitText(limits.resumes_per_job)}`]].map(([key, value]) => `<div><span>${key}</span><strong>${escapeHtml(value)}</strong></div>`).join("")
            document.getElementById("pilotPerJobUsage").innerHTML = (usage.per_job || []).map(job => `<div><strong>${escapeHtml(job.job_title || "Job")}</strong><span>${job.active ? "Active" : "Closed"} · ${job.resumes} / ${limitText(limits.resumes_per_job)} resumes</span></div>`).join("") || "<small>No jobs created yet.</small>"
            ;[["managePilotTotalJobs", limits.total_jobs], ["managePilotActiveJobs", limits.active_jobs], ["managePilotResumePerJob", limits.resumes_per_job], ["managePilotTotalResumes", limits.total_resumes]].forEach(([id, value]) => document.getElementById(id).value = value ?? "")
            document.getElementById("managePilotExpiry").value = dateInput(user.pilot_expires_at)
            document.getElementById("managePilotCompany").value = user.company_name || ""
            document.getElementById("managePilotSource").value = user.pilot_source || "manual"
            document.getElementById("managePilotNotes").value = user.pilot_notes || ""
            document.getElementById("pilotManageHistory").innerHTML = (user.history || []).map(log => `<div><strong>${escapeHtml((log.action || "").replaceAll("_", " ").replaceAll(".", " · "))}</strong><span>${log.created_at ? new Date(log.created_at).toLocaleString() : ""}</span></div>`).join("") || "<small>No admin changes recorded yet.</small>"
            document.getElementById("pilotManageLoading").classList.add("hidden"); document.getElementById("pilotManageContent").classList.remove("hidden")
        } catch (error) { document.getElementById("pilotManageLoading").innerText = error.message }
    }

    window.closePilotManage = event => { if (event && event.target !== document.getElementById("pilotManageOverlay")) return; document.getElementById("pilotManageOverlay")?.classList.add("hidden") }
    const refreshManaged = async () => { if (window.managedPilotUserId) await openPilotManage(window.managedPilotUserId); await loadPilotUsers() }
    window.savePilotUser = async () => {
        try {
            const expiryValue = document.getElementById("managePilotExpiry").value
            if (!expiryValue || Number.isNaN(new Date(expiryValue).getTime())) return alert("Select a valid pilot expiry date.")
            const payload = {
                max_total_jobs: optionalNumber("managePilotTotalJobs"), max_active_jobs: optionalNumber("managePilotActiveJobs"),
                max_resumes_per_job: optionalNumber("managePilotResumePerJob"), max_total_resumes: optionalNumber("managePilotTotalResumes"),
                pilot_expires_at: new Date(expiryValue).toISOString(), company_name: document.getElementById("managePilotCompany").value,
                pilot_source: document.getElementById("managePilotSource").value, pilot_notes: document.getElementById("managePilotNotes").value,
            }
            const old = window.managedPilotUser || {}, limits = old.usage?.limits || {}
            const reduced = [[payload.max_total_jobs, limits.total_jobs], [payload.max_active_jobs, limits.active_jobs], [payload.max_resumes_per_job, limits.resumes_per_job], [payload.max_total_resumes, limits.total_resumes]].some(([next, previous]) => next !== null && (previous === null || previous === undefined || next < previous))
            const shortened = old.pilot_expires_at && new Date(payload.pilot_expires_at) < new Date(old.pilot_expires_at)
            if ((reduced || shortened) && !confirm("This change reduces pilot access. Existing data will remain preserved. Continue?")) return
            await request(`/admin/pilot-users/${encodeURIComponent(window.managedPilotUserId)}`, {method: "PATCH", body: JSON.stringify(payload)})
            await refreshManaged()
        } catch (error) { alert(error.message) }
    }
    window.extendPilotAccess = async days => { if (!confirm(`Extend access by ${days} days?`)) return; try { await request(`/admin/pilot-users/${encodeURIComponent(window.managedPilotUserId)}/extend`, {method: "POST", body: JSON.stringify({days})}); await refreshManaged() } catch (error) { alert(error.message) } }
    window.suspendManagedPilot = async () => { const reason = prompt("Suspension reason:"); if (!reason || !confirm("Suspend this pilot? Existing data will not be deleted.")) return; try { await request(`/admin/pilot-users/${encodeURIComponent(window.managedPilotUserId)}/suspend`, {method: "POST", body: JSON.stringify({reason})}); await refreshManaged() } catch (error) { alert(error.message) } }
    window.deactivateManagedPilot = async () => { const reason = prompt("Reason for deactivation:"); if (!reason || !confirm("Deactivate this pilot now? Existing data will not be deleted.")) return; try { await request(`/admin/pilot-users/${encodeURIComponent(window.managedPilotUserId)}/deactivate`, {method: "POST", body: JSON.stringify({reason})}); await refreshManaged() } catch (error) { alert(error.message) } }
    window.reactivateManagedPilot = async () => { const expiry = document.getElementById("managePilotExpiry").value; if (!expiry || !confirm("Reactivate this pilot with the selected future expiry date?")) return; try { await request(`/admin/pilot-users/${encodeURIComponent(window.managedPilotUserId)}/reactivate`, {method: "POST", body: JSON.stringify({pilot_expires_at: new Date(expiry).toISOString()})}); await refreshManaged() } catch (error) { alert(error.message) } }

    document.addEventListener("DOMContentLoaded", window.updatePilotExpiryPreview)
})()
