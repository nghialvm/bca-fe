export const AUTH_API = {
    LOGIN: '/account/login',
    LOGOUT: '/Account/Logout',
    REGISTER: '/account/register',
    CHANGE_PASSWORD: 'app/auth/change-password',
    FORGOT_PASSWORD: 'app/auth/forgot-password',
    RESET_PASSWORD: 'app/auth/reset-password',
}

export const USER_API = {
    GET_CURRENT_USER: 'app/auth/me',
}

export const RECRUITMENT_REPORT_API = {
    DASHBOARD_SUMMARY: 'app/recruitment-report/dashboard-summary',
    RECRUITMENT_FUNNEL: 'app/recruitment-report/recruitment-funnel',
    APPLICATION_STATUS_STATISTICS:
        'app/recruitment-report/application-status-statistics',
    OFFER_STATISTICS: 'app/recruitment-report/offer-statistics',
    HIRING_STATISTICS: 'app/recruitment-report/hiring-statistics',
    RECRUITMENT_TREND: 'app/recruitment-report/recruitment-trend',
    DEPARTMENT_STATISTICS: 'app/recruitment-report/department-statistics',
}

export const DEPARTMENT_API = {
    LIST: 'app/department',
    DETAIL: (id: string) => `app/department/${id}`,
}

export const JOB_POSITION_API = {
    LIST: 'app/job-position',
    DETAIL: (id: string) => `app/job-position/${id}`,
}

export const RECRUITMENT_REQUEST_API = {
    LIST: 'app/recruitment-request',
    DETAIL: (id: string) => `app/recruitment-request/${id}`,
    APPROVE: (id: string) => `app/recruitment-request/${id}/approve`,
    SUBMIT_FOR_APPROVAL: (id: string) =>
        `app/recruitment-request/${id}/submit-for-approval`,
    REJECT: (id: string) => `app/recruitment-request/${id}/reject`,
    PUBLISH: (id: string) => `app/recruitment-request/${id}/publish`,
    CLOSE: (id: string) => `app/recruitment-request/${id}/close`,
}

export const APPLICATION_API = {
    LIST: 'app/application',
    DETAIL: (id: string) => `app/application/${id}`,
}

export const CANDIDATE_API = {
    LIST: 'app/candidate',
    DETAIL: (id: string) => `app/candidate/${id}`,
}

export const INTERVIEW_SCHEDULE_API = {
    LIST: 'app/interview-schedule',
    DETAIL: (id: string) => `app/interview-schedule/${id}`,
}

export const APPLICATION_SCREENING_API = {
    LIST: 'app/application-screening',
    DETAIL: (id: string) => `app/application-screening/${id}`,
}

export const OFFER_API = {
    LIST: 'app/offer',
    DETAIL: (id: string) => `app/offer/${id}`,
}

export const CANDIDATE_RESPONSE_API = {
    LIST: 'app/candidate-response',
    DETAIL: (id: string) => `app/candidate-response/${id}`,
}

export const CANDIDATE_DOCUMENT_API = {
    UPLOAD_CV: 'app/candidate-document/upload-cv',
}

export const IDENTITY_USER_API = {
    LIST: 'identity/users',
    DETAIL: (id: string) => `identity/users/${id}`,
    ROLES: (id: string) => `identity/users/${id}/roles`,
}

export const IDENTITY_ROLE_API = {
    LIST: 'identity/roles',
}

export const PERMISSION_API = {
    LIST: 'permission-management/permissions',
}

export const EMAIL_API = {
    SEND: 'app/email/send',
}
