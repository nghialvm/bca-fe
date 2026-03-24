import type { DepartmentDto, IdentityUserDto } from '@/services/admin'

import { getDisplayName } from '@/utils/admin'

export type AdminOrganizationRecord = {
    id: string
    key: string
    code: string
    name: string
    managerUserId?: string
    managerName: string
    managerEmail: string
    managerPhone: string
    description: string
    isActive: boolean
    statusLabel: string
    users: number
    activeRecruitments: number
}

export type AdminOrganizationFormValues = {
    code: string
    name: string
    managerUserId?: string
    description: string
    isActive: boolean
}

export type OrganizationManagerOption = {
    label: string
    value: string
}

export const getAdminOrganizationFormInitialValues = (
    organization?: AdminOrganizationRecord | null
): AdminOrganizationFormValues => ({
    code: organization?.code || '',
    name: organization?.name || '',
    managerUserId: organization?.managerUserId || undefined,
    description: organization?.description || '',
    isActive: organization?.isActive ?? true,
})

export const mapDepartmentToAdminOrganizationRecord = (
    department: DepartmentDto,
    manager?: IdentityUserDto,
    activeRecruitments = 0
): AdminOrganizationRecord => ({
    id: department.id,
    key: department.id,
    code: department.code,
    name: department.name,
    managerUserId: department.managerUserId || undefined,
    managerName: manager ? getDisplayName(manager) : 'Chưa gán quản lý',
    managerEmail: manager?.email || '-',
    managerPhone: manager?.phoneNumber || '-',
    description: department.description?.trim() || 'Chưa cập nhật mô tả',
    isActive: Boolean(department.isActive),
    statusLabel: department.isActive ? 'Hoạt động' : 'Tạm dừng',
    users: manager ? 1 : 0,
    activeRecruitments,
})

export const mapIdentityUsersToOrganizationManagerOptions = (
    users: IdentityUserDto[]
): OrganizationManagerOption[] =>
    users.map((user) => ({
        value: user.id,
        label: user.email
            ? `${getDisplayName(user)} (${user.email})`
            : getDisplayName(user),
    }))
