import type {
    CandidateDto,
    CandidateResponseDto,
    DepartmentDto,
    JobPositionDto,
    OfferDto,
    RecruitmentRequestDto,
} from '@/interfaces/admin/admin.interface'

export interface CandidatePortalProfileDto {
    id: string
    candidateCode: string
    candidateType?: string | number | null
    employeeId?: string | null
    fullName: string
    dateOfBirth?: string | null
    gender?: string | number | null
    phoneNumber?: string | null
    email?: string | null
    address?: string | null
    identityNumber?: string | null
    currentCompany?: string | null
    currentPosition?: string | null
    yearsOfExperience?: number | null
    highestEducation?: string | null
    universityName?: string | null
    major?: string | null
    status?: string | number | null
    source?: string | null
    note?: string | null
}

export interface CandidatePortalJobDto {
    id: string
    requestCode: string
    title: string
    departmentId: string
    departmentName: string
    jobPositionId: string
    jobPositionName: string
    headcount: number
    employmentType: string
    workLocation?: string | null
    salaryMin?: number | null
    salaryMax?: number | null
    description?: string | null
    requirement?: string | null
    benefit?: string | null
    applicationDeadline?: string | null
    status: string | number
    publishedTime?: string | null
    hasApplied: boolean
}

export interface CandidatePortalApplicationDto {
    id: string
    applicationCode: string
    recruitmentRequestId: string
    recruitmentRequestCode: string
    title: string
    departmentId: string
    departmentName: string
    jobPositionId: string
    jobPositionName: string
    workLocation?: string | null
    appliedTime: string
    status: string | number
    submittedCvUrl?: string | null
    source?: string | null
    note?: string | null
    finalResult?: string | null
    offer?: OfferDto | null
    latestOfferResponse?: CandidateResponseDto | null
}

export interface CandidatePortalApplicationProfileInput {
    fullName: string
    email: string
    phoneNumber: string
    address: string
    dateOfBirth?: string | null
    identityNumber: string
    currentCompany?: string
    currentPosition: string
    yearsOfExperience: number
    highestEducation: string
    universityName?: string
    major?: string
    gender?: number | null
}

export interface CreateCandidatePortalApplicationDto {
    recruitmentRequestId: string
    cvFile: File
    cvDescription?: string
    source?: string
    note?: string
    profile: CandidatePortalApplicationProfileInput
}

export interface UpdateCandidatePortalProfileDto {
    candidateCode: string
    candidateType: number
    employeeId?: string | null
    fullName: string
    dateOfBirth?: string | null
    gender: number
    phoneNumber: string
    email: string
    address: string
    identityNumber: string
    currentCompany: string
    currentPosition: string
    yearsOfExperience: number
    highestEducation: string
    universityName: string
    major: string
    status: number
    source: string
    note: string
}

export interface CandidateCvUploadResultDto {
    documentId: string
    fileName: string
    fileUrl: string
    fileSize: number
    contentType: string
}

export interface CandidateWorkspaceUser {
    id?: string
    userName?: string
    email?: string
    full_name?: string
}

export interface CandidateWorkspaceDto {
    profile: CandidatePortalProfileDto | null
    jobs: CandidatePortalJobDto[]
    applications: CandidatePortalApplicationDto[]
}

export type CandidatePortalReferenceData = {
    candidates: CandidateDto[]
    departments: DepartmentDto[]
    jobPositions: JobPositionDto[]
    recruitmentRequests: RecruitmentRequestDto[]
}
