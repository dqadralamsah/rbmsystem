export const AUTH_SESSION_COOKIE = "rbm_dev_session";
export const AUTH_SESSION_MAX_AGE = 60 * 60 * 8;

export const DASHBOARD_PERMISSION_CODES = {
  dashboard: "dashboard.view",
  reimbursement: [
    "reimbursement.create",
    "reimbursement.update",
    "reimbursement.submit",
  ],
  approval: [
    "approval.review",
    "approval.approve",
    "approval.return",
    "approval.reject",
  ],
  masterData: [
    "master.user",
    "master.role",
    "master.department",
    "master.category",
  ],
  settings: "settings.view",
} as const;
