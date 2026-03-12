export const SITE_ROLES = {
    ADMIN: 'admin',
    EMPLOYER: 'employer',
    CANDIDATE: 'candidate',
} as const

export type SiteRole = (typeof SITE_ROLES)[keyof typeof SITE_ROLES]

export const ROLE_ID_TO_SITE_ROLE: Record<number, SiteRole> = {
    1: SITE_ROLES.ADMIN,
    2: SITE_ROLES.EMPLOYER,
    3: SITE_ROLES.CANDIDATE,
}
