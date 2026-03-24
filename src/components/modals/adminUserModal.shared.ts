import type { IdentityRoleDto, IdentityUserDto } from '@/services/admin'
import { formatDisplayDateTime, getDisplayName } from '@/utils/admin'
import { formatRoleNames } from '@/utils/role'

export type AdminUserRecord = {
    id: string
    key: string
    userName: string
    name?: string
    surname?: string
    displayName: string
    email: string
    phoneNumber?: string
    roleNames: string[]
    roleLabel: string
    unit: string
    isActive: boolean
    creationTime?: string
    creationTimeText: string
}

export type AdminUserFormValues = {
    userName: string
    name: string
    surname: string
    email: string
    phoneNumber?: string
    password?: string
    roleNames: string[]
    isActive: boolean
}

export const getAdminUserFormInitialValues = (
    user?: AdminUserRecord
): AdminUserFormValues => ({
    userName: user?.userName || '',
    name: user?.name || '',
    surname: user?.surname || '',
    email: user?.email === '-' ? '' : user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    password: '',
    roleNames: user?.roleNames || [],
    isActive: user?.isActive ?? true,
})

export const mapIdentityUserToAdminUserRecord = (
    user: IdentityUserDto,
    assignedRoles: IdentityRoleDto[] = []
): AdminUserRecord => {
    const roleNames = assignedRoles
        .map((role) => role.name)
        .filter((roleName): roleName is string => Boolean(roleName))

    return {
        id: user.id,
        key: user.id,
        userName: user.userName || '-',
        name: user.name,
        surname: user.surname,
        displayName: getDisplayName(user),
        email: user.email || '-',
        phoneNumber: user.phoneNumber || '',
        roleNames,
        roleLabel: roleNames.length
            ? formatRoleNames(roleNames).join(', ')
            : 'Chưa gán vai trò',
        unit: '-',
        isActive: Boolean(user.isActive),
        creationTime: user.creationTime,
        creationTimeText: formatDisplayDateTime(user.creationTime),
    }
}
