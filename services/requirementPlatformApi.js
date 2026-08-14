import { apiGet, apiPatch, apiPost, apiUpload } from "./apiClient.js";

const root = "/api/v1/requirement-platform";

export const requirementPlatformApi = {
  profile: () => apiGet(`${root}/profile`),
  createProfile: (payload) => apiPost(`${root}/profile`, payload),
  updateProfile: (payload) => apiPatch(`${root}/profile`, payload),
  submitVerification: (payload) => apiPost(`${root}/verification/submit`, payload),
  requirements: (query = "") => apiGet(`${root}/requirements${query ? `?${query}` : ""}`),
  recommendedRequirements: () => apiGet(`${root}/requirements/recommended`),
  createRequirement: (payload) => apiPost(`${root}/requirements`, payload),
  professionals: (query = "") => apiGet(`${root}/professionals${query ? `?${query}` : ""}`),
  sourcingPartners: (requirementId) => apiGet(`${root}/requirements/${requirementId}/sourcing-partners`),
  requestToSource: (requirementId, payload) => apiPost(`${root}/requirements/${requirementId}/source-request`, payload),
  invite: (requirementId, payload) => apiPost(`${root}/requirements/${requirementId}/invitations`, payload),
  respondInvitation: (invitationId, payload) => apiPatch(`${root}/invitations/${invitationId}`, payload),
  assignments: () => apiGet(`${root}/assignments`),
  workspace: () => apiGet(`${root}/workspace`),
  submitCandidate: (assignmentId, payload) => apiUpload(`${root}/assignments/${assignmentId}/candidates`, payload),
  candidates: (requirementId) => apiGet(`${root}/requirements/${requirementId}/candidates`),
  updateCandidateStatus: (candidateId, status) => apiPatch(`${root}/candidates/${candidateId}/status`, { status }),
  report: (payload) => apiPost(`${root}/reports`, payload)
};
