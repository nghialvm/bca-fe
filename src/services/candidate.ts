import http from '@/services/http'

export interface CandidatePortalProfileDto {
    id: string
    candidateCode: string
    fullName: string
    dateOfBirth?: string | null
    gender?: string | number
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
    status?: string | number
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
}

export interface CreateCandidatePortalApplicationDto {
    recruitmentRequestId: string
    submittedCvUrl?: string
    source?: string
    note?: string
}

export class CandidateService {
    async getProfile(): Promise<CandidatePortalProfileDto> {
        return await http.get('app/candidate-portal/profile')
    }

    async getJobs(): Promise<CandidatePortalJobDto[]> {
        return await http.get('app/candidate-portal/jobs')
    }

    async getApplications(): Promise<CandidatePortalApplicationDto[]> {
        return await http.get('app/candidate-portal/applications')
    }

    async apply(input: CreateCandidatePortalApplicationDto) {
        return await http.post('app/candidate-portal/apply', input)
    }
}

export default new CandidateService()
