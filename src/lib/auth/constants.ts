export const AUTH_SESSION_COOKIE = "rbm_dev_session";
export const AUTH_SESSION_MAX_AGE = 60 * 60 * 8;

export const NAVIGATION_PERMISSION_REQUIREMENTS = {
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
  finance: [
    "finance.review",
    "finance.approve",
    "finance.return",
    "finance.reject",
    "finance.mark_paid",
  ],
  masterData: [
    "master.user",
    "master.role",
    "master.department",
    "master.category",
  ],
  settings: "settings.view",
} as const;
