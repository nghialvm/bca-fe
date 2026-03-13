import { ROLE_ID_TO_SITE_ROLE, SITE_ROLES, SiteRole } from '@/constants/role'
import { User } from '@/interfaces/user/user.interface'
import { PATHS } from '@/routers/path'

export const getSiteRole = (user?: Partial<User> | null): SiteRole => {
    const accessLevel = String(user?.access_level || 'candidate').toLowerCase()

    if (accessLevel.includes('admin')) {
        return SITE_ROLES.ADMIN
    }

    if (
        accessLevel.includes('employer') ||
        accessLevel.includes('recruit') ||
        accessLevel.includes('company') ||
        accessLevel.includes('organization')
    ) {
        return SITE_ROLES.EMPLOYER
    }

    if (
        accessLevel.includes('candidate') ||
        accessLevel.includes('applicant')
    ) {
        return SITE_ROLES.CANDIDATE
    }

    return ROLE_ID_TO_SITE_ROLE[user?.role_id || 0] || SITE_ROLES.CANDIDATE
}

export const getDefaultPathByRole = (role: SiteRole) => {
    switch (role) {
        case SITE_ROLES.ADMIN:
            return PATHS.ADMIN_DASHBOARD
        case SITE_ROLES.EMPLOYER:
            return PATHS.EMPLOYER_DASHBOARD
        case SITE_ROLES.CANDIDATE:
        default:
            return PATHS.CANDIDATE_DASHBOARD
    }
}

export const getProfilePathByRole = (role: SiteRole) => {
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
