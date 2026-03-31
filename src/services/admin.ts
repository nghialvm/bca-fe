import {
    APPLICATION_API,
    APPLICATION_SCREENING_API,
    CANDIDATE_API,
    CANDIDATE_RESPONSE_API,
    DEPARTMENT_API,
    EMAIL_API,
    IDENTITY_ROLE_API,
    IDENTITY_USER_API,
    INTERVIEW_SCHEDULE_API,
    JOB_POSITION_API,
    OFFER_API,
    PERMISSION_API,
    RECRUITMENT_REPORT_API,
    RECRUITMENT_REQUEST_API,
} from '@/constants/api'
import type {
    ApplicationScreeningCreateDto,
    ApplicationScreeningUpdateDto,
    ApplicationUpdateDto,
    CandidateResponseQuery,
    CreateCandidateResponseDto,
    CreateOfferDto,
    DashboardFilter,
    DepartmentCreateDto,
    DepartmentUpdateDto,
    IdentityUserCreateDto,
    IdentityUserUpdateDto,
    IdentityUserUpdateRolesDto,
    InterviewScheduleCreateDto,
    InterviewScheduleUpdateDto,
    JobPositionCreateDto,
    JobPositionUpdateDto,
    PagedQuery,
    RecruitmentRequestCreateDto,
    RecruitmentRequestUpdateDto,
    SendEmailDto,
    UpdateOfferDto,
    UpdatePermissionsDto,
} from '@/interfaces/admin/admin.interface'
import http from '@/services/http'

export type {
    ApplicationDto,
    ApplicationScreeningCreateDto,
    ApplicationScreeningDto,
    ApplicationScreeningUpdateDto,
    ApplicationStatusCount,
    ApplicationUpdateDto,
    CandidateDto,
    CandidateResponseDto,
    CandidateResponseQuery,
    CreateCandidateResponseDto,
    CreateOfferDto,
    DashboardFilter,
    DepartmentCreateDto,
    DepartmentDto,
    DepartmentStatisticsItem,
    DepartmentUpdateDto,
    GetPermissionListResultDto,
    HiringStatistics,
    IdentityRoleDto,
    IdentityUserCreateDto,
    IdentityUserDto,
    IdentityUserUpdateDto,
    IdentityUserUpdateRolesDto,
    InterviewScheduleCreateDto,
    InterviewScheduleDto,
    InterviewScheduleUpdateDto,
    JobPositionCreateDto,
    JobPositionDto,
    JobPositionUpdateDto,
    OfferDto,
    OfferStatistics,
    PagedQuery,
    PagedResult,
    PermissionGrantInfoDto,
    PermissionGroupDto,
    RecruitmentDashboardSummary,
    RecruitmentFunnel,
    RecruitmentRequestCreateDto,
    RecruitmentRequestDto,
    RecruitmentRequestUpdateDto,
    RecruitmentTrendItem,
    SendEmailDto,
    UpdateOfferDto,
    UpdatePermissionDto,
    UpdatePermissionsDto,
} from '@/interfaces/admin/admin.interface'

const defaultPagedQuery: Required<PagedQuery> = {
    Filter: '',
    Sorting: '',
    SkipCount: 0,
    MaxResultCount: 1000,
}

export class AdminService {
    async getDashboardSummary(filter: DashboardFilter = {}) {
        return await http.get(RECRUITMENT_REPORT_API.DASHBOARD_SUMMARY, {
            params: filter,
        })
    }

    async getRecruitmentFunnel(filter: DashboardFilter = {}) {
        return await http.get(RECRUITMENT_REPORT_API.RECRUITMENT_FUNNEL, {
            params: filter,
        })
    }

    async getApplicationStatusStatistics(filter: DashboardFilter = {}) {
        return await http.get(
            RECRUITMENT_REPORT_API.APPLICATION_STATUS_STATISTICS,
            {
                params: filter,
            }
        )
    }

    async getOfferStatistics(filter: DashboardFilter = {}) {
        return await http.get(RECRUITMENT_REPORT_API.OFFER_STATISTICS, {
            params: filter,
        })
    }

    async getHiringStatistics(filter: DashboardFilter = {}) {
        return await http.get(RECRUITMENT_REPORT_API.HIRING_STATISTICS, {
            params: filter,
        })
    }

    async getRecruitmentTrend(filter: DashboardFilter = {}) {
        return await http.get(RECRUITMENT_REPORT_API.RECRUITMENT_TREND, {
            params: filter,
        })
    }

    async getDepartmentStatistics(filter: DashboardFilter = {}) {
        return await http.get(RECRUITMENT_REPORT_API.DEPARTMENT_STATISTICS, {
            params: filter,
        })
    }

    async getDepartments(query: PagedQuery = {}) {
        return await http.get(DEPARTMENT_API.LIST, {
            params: {
                ...defaultPagedQuery,
                ...query,
            },
        })
    }

    async getJobPositions(query: PagedQuery = {}) {
        return await http.get(JOB_POSITION_API.LIST, {
            params: {
                ...defaultPagedQuery,
                ...query,
            },
        })
    }

    async getJobPosition(id: string) {
        return await http.get(JOB_POSITION_API.DETAIL(id))
    }

    async getDepartment(id: string) {
        return await http.get(DEPARTMENT_API.DETAIL(id))
    }

    async createDepartment(input: DepartmentCreateDto) {
        return await http.post(DEPARTMENT_API.LIST, input)
    }

    async updateDepartment(id: string, input: DepartmentUpdateDto) {
        return await http.put(DEPARTMENT_API.DETAIL(id), input)
    }

    async deleteDepartment(id: string) {
        return await http.delete(DEPARTMENT_API.DETAIL(id))
    }

    async createJobPosition(input: JobPositionCreateDto) {
        return await http.post(JOB_POSITION_API.LIST, input)
    }

    async updateJobPosition(id: string, input: JobPositionUpdateDto) {
        return await http.put(JOB_POSITION_API.DETAIL(id), input)
    }

    async deleteJobPosition(id: string) {
        return await http.delete(JOB_POSITION_API.DETAIL(id))
    }

    async getRecruitmentRequests(query: PagedQuery = {}) {
        return await http.get(RECRUITMENT_REQUEST_API.LIST, {
            params: {
                ...defaultPagedQuery,
                ...query,
            },
        })
    }

    async getRecruitmentRequest(id: string) {
        return await http.get(RECRUITMENT_REQUEST_API.DETAIL(id))
    }

    async createRecruitmentRequest(input: RecruitmentRequestCreateDto) {
        return await http.post(RECRUITMENT_REQUEST_API.LIST, input)
    }

    async updateRecruitmentRequest(
        id: string,
        input: RecruitmentRequestUpdateDto
    ) {
        return await http.put(RECRUITMENT_REQUEST_API.DETAIL(id), input)
    }

    async deleteRecruitmentRequest(id: string) {
        return await http.delete(RECRUITMENT_REQUEST_API.DETAIL(id))
    }

    async approveRecruitmentRequest(id: string) {
        return await http.post(RECRUITMENT_REQUEST_API.APPROVE(id), {})
    }

    async submitRecruitmentRequestForApproval(id: string) {
        return await http.post(
            RECRUITMENT_REQUEST_API.SUBMIT_FOR_APPROVAL(id),
            {}
        )
    }

    async rejectRecruitmentRequest(id: string, reason: string) {
        return await http.post(RECRUITMENT_REQUEST_API.REJECT(id), {
            reason,
        })
    }

    async publishRecruitmentRequest(id: string) {
        return await http.post(RECRUITMENT_REQUEST_API.PUBLISH(id), {})
    }

    async closeRecruitmentRequest(id: string, reason = '') {
        return await http.post(RECRUITMENT_REQUEST_API.CLOSE(id), {
            reason,
        })
    }

    async getApplications(query: PagedQuery = {}) {
        return await http.get(APPLICATION_API.LIST, {
            params: {
                ...defaultPagedQuery,
                ...query,
            },
        })
    }

    async updateApplication(id: string, input: ApplicationUpdateDto) {
        return await http.put(APPLICATION_API.DETAIL(id), input)
    }

    async getCandidates(query: PagedQuery = {}) {
        return await http.get(CANDIDATE_API.LIST, {
            params: {
                ...defaultPagedQuery,
                ...query,
            },
        })
    }

    async getInterviewSchedules(query: PagedQuery = {}) {
        return await http.get(INTERVIEW_SCHEDULE_API.LIST, {
            params: {
                ...defaultPagedQuery,
                ...query,
            },
        })
    }

    async getInterviewSchedule(id: string) {
        return await http.get(INTERVIEW_SCHEDULE_API.DETAIL(id))
    }

    async createInterviewSchedule(input: InterviewScheduleCreateDto) {
        return await http.post(INTERVIEW_SCHEDULE_API.LIST, input)
    }

    async updateInterviewSchedule(
        id: string,
        input: InterviewScheduleUpdateDto
    ) {
        return await http.put(INTERVIEW_SCHEDULE_API.DETAIL(id), input)
    }

    async getApplicationScreenings(query: PagedQuery = {}) {
        return await http.get(APPLICATION_SCREENING_API.LIST, {
            params: {
                ...defaultPagedQuery,
                ...query,
            },
        })
    }

    async createApplicationScreening(input: ApplicationScreeningCreateDto) {
        return await http.post(APPLICATION_SCREENING_API.LIST, input)
    }

    async updateApplicationScreening(
        id: string,
        input: ApplicationScreeningUpdateDto
    ) {
        return await http.put(APPLICATION_SCREENING_API.DETAIL(id), input)
    }

    async getOffers(query: PagedQuery = {}) {
        return await http.get(OFFER_API.LIST, {
            params: {
                ...defaultPagedQuery,
                ...query,
            },
        })
    }

    async createOffer(input: CreateOfferDto) {
        return await http.post(OFFER_API.LIST, input)
    }

    async updateOffer(id: string, input: UpdateOfferDto) {
        return await http.put(OFFER_API.DETAIL(id), input)
    }

    async getCandidateResponses(query: CandidateResponseQuery = {}) {
        return await http.get(CANDIDATE_RESPONSE_API.LIST, {
            params: {
                ...defaultPagedQuery,
                ...query,
            },
        })
    }

    async createCandidateResponse(input: CreateCandidateResponseDto) {
        return await http.post(CANDIDATE_RESPONSE_API.LIST, input)
    }

    async getIdentityUsers(query: PagedQuery = {}) {
        return await http.get(IDENTITY_USER_API.LIST, {
            params: {
                ...defaultPagedQuery,
                ...query,
            },
        })
    }

    async getIdentityUser(id: string) {
        return await http.get(IDENTITY_USER_API.DETAIL(id))
    }

    async createIdentityUser(input: IdentityUserCreateDto) {
        return await http.post(IDENTITY_USER_API.LIST, input)
    }

    async updateIdentityUser(id: string, input: IdentityUserUpdateDto) {
        return await http.put(IDENTITY_USER_API.DETAIL(id), input)
    }

    async deleteIdentityUser(id: string) {
        return await http.delete(IDENTITY_USER_API.DETAIL(id))
    }

    async getIdentityUserRoles(id: string) {
        return await http.get(IDENTITY_USER_API.ROLES(id))
    }

    async updateIdentityUserRoles(
        id: string,
        input: IdentityUserUpdateRolesDto
    ) {
        return await http.put(IDENTITY_USER_API.ROLES(id), input)
    }

    async getIdentityRoles(query: PagedQuery = {}) {
        return await http.get(IDENTITY_ROLE_API.LIST, {
            params: {
                ...defaultPagedQuery,
                ...query,
            },
        })
    }

    async getPermissions(providerName: string, providerKey: string) {
        return await http.get(PERMISSION_API.LIST, {
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
        return await http.put(PERMISSION_API.LIST, input, {
            params: {
                providerName,
                providerKey,
            },
        })
    }

    async sendEmail(input: SendEmailDto) {
        return await http.post(EMAIL_API.SEND, input)
    }
}

export default new AdminService()
