import { SITE_ROLES, SiteRole } from '@/constants/role'
import { User } from '@/interfaces/user/user.interface'
import { PATHS } from '@/routers/path'

const ROLE_KEY_TO_SITE_ROLE: Record<string, SiteRole> = {
    admin: SITE_ROLES.ADMIN,
    administrator: SITE_ROLES.ADMIN,
    employer: SITE_ROLES.EMPLOYER,
    recruiter: SITE_ROLES.EMPLOYER,
    candidate: SITE_ROLES.CANDIDATE,
    applicant: SITE_ROLES.CANDIDATE,
}

const ROLE_DISPLAY_NAME_MAP: Record<string, string> = {
    admin: 'Quản trị viên',
    administrator: 'Quản trị viên',
    employer: 'Nhà tuyển dụng (đơn vị)',
    recruiter: 'Nhà tuyển dụng (đơn vị)',
    candidate: 'Ứng viên',
    applicant: 'Ứng viên',
}

const normalizeRoleKey = (role?: string | null) => role?.trim().toLowerCase()

export const getSiteRole = (user?: Partial<User> | null) => {
    const normalizedRole = normalizeRoleKey(user?.role)

    if (normalizedRole) {
        return ROLE_KEY_TO_SITE_ROLE[normalizedRole]
    }
}

export const getRoleDisplayName = (role?: string | null) => {
    const normalizedRole = normalizeRoleKey(role)

    if (!normalizedRole) {
        return ''
    }

    return ROLE_DISPLAY_NAME_MAP[normalizedRole] || role?.trim() || ''
}

export const formatRoleNames = (roles: Array<string | null | undefined>) => {
    return roles
        .map((role) => getRoleDisplayName(role))
        .filter((roleName): roleName is string => Boolean(roleName))
}

export const getDefaultPathByRole = (role?: SiteRole) => {
    switch (role) {
        case SITE_ROLES.ADMIN:
            return PATHS.ADMIN_REPORT
        case SITE_ROLES.EMPLOYER:
            return PATHS.EMPLOYER_REPORT
        case SITE_ROLES.CANDIDATE:
        default:
            return PATHS.CANDIDATE_DASHBOARD
    }
}

export const getProfilePathByRole = (role?: SiteRole) => {
    switch (role) {
        case SITE_ROLES.ADMIN:
            return PATHS.ADMIN_PROFILE
        case SITE_ROLES.EMPLOYER:
            return PATHS.EMPLOYER_PROFILE
        case SITE_ROLES.CANDIDATE:
        default:
            return PATHS.CANDIDATE_PROFILE
    }
}
