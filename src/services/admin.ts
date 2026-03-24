import http from '@/services/http'

export interface PagedResult<T> {
    items: T[]
    totalCount: number
}

export interface PagedQuery {
    Filter?: string
    Sorting?: string
    SkipCount?: number
    MaxResultCount?: number
}

export interface DashboardFilter {
    FromDate?: string
    ToDate?: string
    DepartmentId?: string
    JobPositionId?: string
}

export interface RecruitmentDashboardSummary {
    totalRecruitmentRequests: number
    totalPublishedRecruitmentRequests: number
    totalApplications: number
    totalCandidates: number
    totalScreenedApplications: number
    totalInterviewScheduled: number
    totalInterviewPassed: number
    totalOffers: number
    totalOfferAccepted: number
    totalHiredEmployees: number
    hiringRate: number
    offerAcceptanceRate: number
}

export interface RecruitmentFunnel {
    totalApplications: number
    screeningPassed: number
    interviewScheduled: number
    interviewPassed: number
    offered: number
    hired: number
}

export interface ApplicationStatusCount {
    status: string | number
    count: number
}

export interface OfferStatistics {
    totalOffers: number
    draftOffers: number
    sentOffers: number
    acceptedOffers: number
    declinedOffers: number
    expiredOffers: number
    acceptanceRate: number
}

export interface HiringStatistics {
    totalApplications: number
    totalOffersAccepted: number
    totalHiredEmployees: number
    applicationToHireRate: number
    offerAcceptedToHireRate: number
}

export interface RecruitmentTrendItem {
    period: string
    totalApplications: number
    totalOffers: number
    totalHired: number
}

export interface DepartmentStatisticsItem {
    departmentId: string
    departmentName: string
    totalRecruitmentRequests: number
    totalApplications: number
    totalOffers: number
    totalHired: number
}

export interface DepartmentDto {
    id: string
    code: string
    name: string
    managerUserId?: string | null
    description?: string
    isActive: boolean
}

export interface JobPositionDto {
    id: string
    code: string
    name: string
    departmentId: string
    description?: string
    isActive: boolean
}

export interface DepartmentCreateDto {
    code: string
    name: string
    managerUserId?: string | null
    description?: string
    isActive: boolean
}

export interface DepartmentUpdateDto {
    code: string
    name: string
    managerUserId?: string | null
    description?: string
    isActive: boolean
}

export interface RecruitmentRequestDto {
    id: string
    requestCode: string
    title: string
    departmentId: string
    jobPositionId: string
    headcount: number
    employmentType?: string
    workLocation?: string
    salaryMin?: number | null
    salaryMax?: number | null
    description?: string
    requirement?: string
    benefit?: string
    applicationDeadline?: string | null
    status: string | number
    createdByUserId?: string | null
    approvedByUserId?: string | null
    approvedTime?: string | null
    rejectReason?: string | null
    publishedTime?: string | null
    closedTime?: string | null
    creationTime?: string
}

export interface ApplicationDto {
    id: string
    applicationCode: string
    recruitmentRequestId: string
    candidateId: string
    appliedTime: string
    status: string | number
    cvFileId?: string | null
    submittedCvUrl?: string | null
    source?: string | null
    note?: string | null
    finalResult?: string | null
}

export interface CandidateDto {
    id: string
    candidateCode: string
    fullName: string
    email: string
    phoneNumber?: string
    currentPosition?: string
    status?: string | number
}

export interface IdentityRoleDto {
    id: string
    name: string
    isDefault?: boolean
    isStatic?: boolean
    isPublic?: boolean
    extraProperties?: Record<string, unknown>
}

export interface IdentityUserDto {
    id: string
    userName?: string
    name?: string
    surname?: string
    email?: string
    phoneNumber?: string
    isActive?: boolean
    creationTime?: string
    extraProperties?: Record<string, unknown>
}

export interface IdentityUserCreateDto {
    userName: string
    name?: string
    surname?: string
    password: string
    email: string
    phoneNumber?: string
    roleNames: string[]
    isActive: boolean
    lockoutEnabled?: boolean
}

export interface IdentityUserUpdateDto {
    userName: string
    name?: string
    surname?: string
    email: string
    phoneNumber?: string
    roleNames: string[]
    isActive: boolean
    lockoutEnabled?: boolean
}

export interface IdentityUserUpdateRolesDto {
    roleNames: string[]
}

export interface PermissionGrantInfoDto {
    name: string
    displayName?: string
    parentName?: string
    isGranted: boolean
    allowedProviders?: string[]
    grantedProviders?: {
        providerName?: string
        providerKey?: string
    }[]
}

export interface PermissionGroupDto {
    name: string
    displayName?: string
    permissions: PermissionGrantInfoDto[]
}

export interface GetPermissionListResultDto {
    entityDisplayName?: string
    groups: PermissionGroupDto[]
}

export interface UpdatePermissionDto {
    name: string
    isGranted: boolean
}

export interface UpdatePermissionsDto {
    permissions: UpdatePermissionDto[]
}

export interface SendEmailDto {
    to: string
    subject: string
    body: string
    isBodyHtml?: boolean
}

const defaultPagedQuery: Required<PagedQuery> = {
    Filter: '',
    Sorting: '',
    SkipCount: 0,
    MaxResultCount: 1000,
}

export class AdminService {
    async getDashboardSummary(filter: DashboardFilter = {}) {
        return await http.get('app/recruitment-report/dashboard-summary', {
            params: filter,
        })
    }

    async getRecruitmentFunnel(filter: DashboardFilter = {}) {
        return await http.get('app/recruitment-report/recruitment-funnel', {
            params: filter,
        })
    }

    async getApplicationStatusStatistics(filter: DashboardFilter = {}) {
        return await http.get(
            'app/recruitment-report/application-status-statistics',
            {
                params: filter,
            }
        )
    }

    async getOfferStatistics(filter: DashboardFilter = {}) {
        return await http.get('app/recruitment-report/offer-statistics', {
            params: filter,
        })
    }

    async getHiringStatistics(filter: DashboardFilter = {}) {
        return await http.get('app/recruitment-report/hiring-statistics', {
            params: filter,
        })
    }

    async getRecruitmentTrend(filter: DashboardFilter = {}) {
        return await http.get('app/recruitment-report/recruitment-trend', {
            params: filter,
        })
    }

    async getDepartmentStatistics(filter: DashboardFilter = {}) {
        return await http.get('app/recruitment-report/department-statistics', {
            params: filter,
        })
    }

    async getDepartments(query: PagedQuery = {}) {
        return await http.get('app/department', {
            params: {
                ...defaultPagedQuery,
                ...query,
            },
        })
    }

    async getJobPositions(query: PagedQuery = {}) {
        return await http.get('app/job-position', {
            params: {
                ...defaultPagedQuery,
                ...query,
            },
        })
    }

    async getDepartment(id: string) {
        return await http.get(`app/department/${id}`)
    }

    async createDepartment(input: DepartmentCreateDto) {
        return await http.post('app/department', input)
    }

    async updateDepartment(id: string, input: DepartmentUpdateDto) {
        return await http.put(`app/department/${id}`, input)
    }

    async deleteDepartment(id: string) {
        return await http.delete(`app/department/${id}`)
    }

    async getRecruitmentRequests(query: PagedQuery = {}) {
        return await http.get('app/recruitment-request', {
            params: {
                ...defaultPagedQuery,
                ...query,
            },
        })
    }

    async approveRecruitmentRequest(id: string) {
        return await http.put(`app/recruitment-request/${id}/approve`, {})
    }

    async rejectRecruitmentRequest(id: string, reason: string) {
        return await http.put(`app/recruitment-request/${id}/reject`, {
            reason,
        })
    }

    async getApplications(query: PagedQuery = {}) {
        return await http.get('app/application', {
            params: {
                ...defaultPagedQuery,
                ...query,
            },
        })
    }

    async getCandidates(query: PagedQuery = {}) {
        return await http.get('app/candidate', {
            params: {
                ...defaultPagedQuery,
                ...query,
            },
        })
    }

    async getIdentityUsers(query: PagedQuery = {}) {
        return await http.get('identity/users', {
            params: {
                ...defaultPagedQuery,
                ...query,
            },
        })
    }

    async getIdentityUser(id: string) {
        return await http.get(`identity/users/${id}`)
    }

    async createIdentityUser(input: IdentityUserCreateDto) {
        return await http.post('identity/users', input)
    }

    async updateIdentityUser(id: string, input: IdentityUserUpdateDto) {
        return await http.put(`identity/users/${id}`, input)
    }

    async deleteIdentityUser(id: string) {
        return await http.delete(`identity/users/${id}`)
    }

    async getIdentityUserRoles(id: string) {
        return await http.get(`identity/users/${id}/roles`)
    }

    async updateIdentityUserRoles(
        id: string,
        input: IdentityUserUpdateRolesDto
    ) {
        return await http.put(`identity/users/${id}/roles`, input)
    }

    async getIdentityRoles(query: PagedQuery = {}) {
        return await http.get('identity/roles', {
            params: {
                ...defaultPagedQuery,
                ...query,
            },
        })
    }

    async getPermissions(providerName: string, providerKey: string) {
        return await http.get('permission-management/permissions', {
            params: {
                providerName,
                providerKey,
            },
        })
    }

    async updatePermissions(
        providerName: string,
        providerKey: string,
        input: UpdatePermissionsDto
    ) {
        return await http.put('permission-management/permissions', input, {
            params: {
                providerName,
                providerKey,
            },
        })
    }

    async sendEmail(input: SendEmailDto) {
        return await http.post('app/email/send', input)
    }
}

export default new AdminService()
