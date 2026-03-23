import { ROLE_ID_TO_SITE_ROLE, SITE_ROLES, SiteRole } from '@/constants/role'
import { User } from '@/interfaces/user/user.interface'
import { PATHS } from '@/routers/path'

export const getSiteRole = (user?: Partial<User> | null) => {
    if (user?.role?.toLowerCase() === 'admin') {
        return SITE_ROLES.ADMIN
    } else if (user?.role?.toLowerCase() === 'employer') {
        return SITE_ROLES.EMPLOYER
    } else if (user?.role?.toLowerCase() === 'candidate') {
        return SITE_ROLES.CANDIDATE
    }
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
