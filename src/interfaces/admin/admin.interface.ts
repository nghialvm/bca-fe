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

export interface JobPositionCreateDto {
    code: string
    name: string
    departmentId: string
    description?: string
    isActive: boolean
}

export interface JobPositionUpdateDto {
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

export interface RecruitmentRequestCreateDto {
    requestCode: string
    title: string
    departmentId: string
    positionId: string
    headcount: number
    employmentType: string
    workLocation?: string
    salaryMin?: number | null
    salaryMax?: number | null
    description?: string
    requirement?: string
    benefit?: string
    applicationDeadline?: string | null
}

export interface RecruitmentRequestUpdateDto {
    title: string
    departmentId: string
    positionId: string
    headcount: number
    employmentType: string
    workLocation?: string
    salaryMin?: number | null
    salaryMax?: number | null
    description?: string
    requirement?: string
    benefit?: string
    applicationDeadline?: string | null
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

export interface ApplicationUpdateDto {
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
    candidateType?: string | number | null
    employeeId?: string | null
    fullName: string
    dateOfBirth?: string | null
    gender?: string | number | null
    email: string
    phoneNumber?: string
    address?: string | null
    identityNumber?: string | null
    currentCompany?: string | null
    currentPosition?: string
    yearsOfExperience?: number | null
    highestEducation?: string | null
    universityName?: string | null
    major?: string | null
    status?: string | number
    source?: string | null
    note?: string | null
}

export interface ApplicationScreeningDto {
    id: string
    applicationId: string
    screenedByUserId: string
    screeningTime: string
    result: string | number
    comment?: string | null
    score?: number | null
    criteriaSummary?: string | null
    creationTime?: string
}

export interface ApplicationScreeningCreateDto {
    applicationId: string
    screenedByUserId: string
    screeningTime: string
    result: string | number
    comment?: string | null
    score?: number | null
    criteriaSummary?: string | null
}

export interface ApplicationScreeningUpdateDto {
    applicationId: string
    screenedByUserId: string
    screeningTime: string
    result: string | number
    comment?: string | null
    score?: number | null
    criteriaSummary?: string | null
}

export interface InterviewScheduleDto {
    id: string
    applicationId: string
    roundNumber: number
    interviewType: string | number
    scheduledTime: string
    durationMinutes: number
    location?: string | null
    meetingLink?: string | null
    contactPerson?: string | null
    note?: string | null
    status: string | number
    createdByUserId?: string | null
    creationTime?: string
}

export interface InterviewScheduleCreateDto {
    applicationId: string
    roundNumber: number
    interviewType: string | number
    scheduledTime: string
    durationMinutes: number
    location?: string | null
    meetingLink?: string | null
    contactPerson?: string | null
    note?: string | null
    status: string | number
    createdByUserId?: string | null
}

export interface InterviewScheduleUpdateDto {
    applicationId: string
    roundNumber: number
    interviewType: string | number
    scheduledTime: string
    durationMinutes: number
    location?: string | null
    meetingLink?: string | null
    contactPerson?: string | null
    note?: string | null
    status: string | number
    createdByUserId?: string | null
}

export interface OfferDto {
    id: string
    applicationId: string
    salary: number
    startDate?: string | null
    probationMonths?: number | null
    workLocation?: string | null
    benefit?: string | null
    note?: string | null
    status: string | number
    sentTime?: string | null
    expiredTime?: string | null
    creationTime?: string
}

export interface CreateOfferDto {
    applicationId: string
    salary: number
    startDate?: string | null
    probationMonths?: number | null
    workLocation?: string | null
    benefit?: string | null
    note?: string | null
    sentTime?: string | null
    expiredTime?: string | null
}

export interface UpdateOfferDto extends CreateOfferDto {
    status: string | number
}

export interface CandidateResponseDto {
    id: string
    applicationId: string
    offerId?: string | null
    responseType: string | number
    responseChannel: string | number
    responseTime: string
    responseContent: string
    note?: string | null
    creationTime?: string
}

export interface CreateCandidateResponseDto {
    applicationId: string
    offerId?: string | null
    responseType: string | number
    responseChannel: string | number
    responseTime: string
    responseContent: string
    note?: string | null
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

export interface CandidateResponseQuery extends PagedQuery {
    ApplicationId?: string
    OfferId?: string
    ResponseType?: string | number
    ResponseChannel?: string | number
}
