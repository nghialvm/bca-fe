import dayjs from 'dayjs'

import type {
    ApplicationDto,
    CandidateDto,
    DepartmentDto,
    JobPositionDto,
    PagedResult,
    RecruitmentRequestDto,
} from '@/services/admin'
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
    cvFile: File
    cvDescription?: string
    source?: string
    note?: string
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

const defaultPagedQuery = {
    Filter: '',
    Sorting: '',
    SkipCount: 0,
    MaxResultCount: 1000,
}

const normalize = (value?: string | null) =>
    String(value || '')
        .trim()
        .toLowerCase()

const normalizeStatus = (value: unknown) =>
    String(value ?? '')
        .trim()
        .replace(/[\s_-]+/g, '')
        .toLowerCase()

const isPublishedRecruitment = (item: RecruitmentRequestDto) =>
    ['4', 'published'].includes(normalizeStatus(item.status))

const isActiveDeadline = (value?: string | null) =>
    !value || dayjs(value).endOf('day').isAfter(dayjs())

const toProfileDto = (candidate: CandidateDto): CandidatePortalProfileDto => ({
    id: candidate.id,
    candidateCode: candidate.candidateCode,
    fullName: candidate.fullName,
    dateOfBirth: null,
    gender: undefined,
    phoneNumber: candidate.phoneNumber,
    email: candidate.email,
    address: null,
    identityNumber: null,
    currentCompany: null,
    currentPosition: candidate.currentPosition,
    yearsOfExperience: null,
    highestEducation: null,
    universityName: null,
    major: null,
    status: candidate.status,
    source: null,
    note: null,
})

const buildDepartmentMap = (items: DepartmentDto[]) =>
    new Map(items.map((item) => [item.id, item.name]))

const buildJobPositionMap = (items: JobPositionDto[]) =>
    new Map(items.map((item) => [item.id, item.name]))

const buildRecruitmentMap = (items: RecruitmentRequestDto[]) =>
    new Map(items.map((item) => [item.id, item]))

const getPagedItems = <T>(response: PagedResult<T> | T[] | undefined): T[] => {
    if (Array.isArray(response)) {
        return response
    }

    return Array.isArray(response?.items) ? response.items : []
}

const findCurrentCandidate = (
    candidates: CandidateDto[],
    user?: CandidateWorkspaceUser | null
) => {
    const userEmail = normalize(user?.email)
    const userName = normalize(user?.userName)
    const fullName = normalize(user?.full_name)

    return (
        candidates.find((item) => normalize(item.email) === userEmail) ||
        candidates.find((item) => normalize(item.candidateCode) === userName) ||
        candidates.find((item) => normalize(item.email) === userName) ||
        candidates.find((item) => normalize(item.fullName) === fullName) ||
        null
    )
}

const mapJobDto = (
    item: RecruitmentRequestDto,
    departmentMap: Map<string, string>,
    jobPositionMap: Map<string, string>,
    appliedRecruitmentIds: Set<string>
): CandidatePortalJobDto => ({
    id: item.id,
    requestCode: item.requestCode,
    title: item.title,
    departmentId: item.departmentId,
    departmentName: departmentMap.get(item.departmentId) || 'Chưa cập nhật',
    jobPositionId: item.jobPositionId,
    jobPositionName:
        jobPositionMap.get(item.jobPositionId) || 'Chưa cập nhật',
    headcount: item.headcount,
    employmentType: item.employmentType || 'Toàn thời gian',
    workLocation: item.workLocation,
    salaryMin: item.salaryMin,
    salaryMax: item.salaryMax,
    description: item.description,
    requirement: item.requirement,
    benefit: item.benefit,
    applicationDeadline: item.applicationDeadline,
    status: item.status,
    publishedTime: item.publishedTime,
    hasApplied: appliedRecruitmentIds.has(item.id),
})

const mapApplicationDto = (
    item: ApplicationDto,
    recruitmentMap: Map<string, RecruitmentRequestDto>,
    departmentMap: Map<string, string>,
    jobPositionMap: Map<string, string>
): CandidatePortalApplicationDto => {
    const recruitment = recruitmentMap.get(item.recruitmentRequestId)

    return {
        id: item.id,
        applicationCode: item.applicationCode,
        recruitmentRequestId: item.recruitmentRequestId,
        recruitmentRequestCode: recruitment?.requestCode || '',
        title: recruitment?.title || 'Vị trí tuyển dụng',
        departmentId: recruitment?.departmentId || '',
        departmentName: recruitment?.departmentId
            ? departmentMap.get(recruitment.departmentId) || 'Chưa cập nhật'
            : 'Chưa cập nhật',
        jobPositionId: recruitment?.jobPositionId || '',
        jobPositionName: recruitment?.jobPositionId
            ? jobPositionMap.get(recruitment.jobPositionId) || 'Chưa cập nhật'
            : 'Chưa cập nhật',
        workLocation: recruitment?.workLocation,
        appliedTime: item.appliedTime,
        status: item.status,
        submittedCvUrl: item.submittedCvUrl,
        source: item.source,
        note: item.note,
        finalResult: item.finalResult,
    }
}

export class CandidateService {
    async loadWorkspace(
        user?: CandidateWorkspaceUser | null
    ): Promise<CandidateWorkspaceDto> {
        const [
            candidateResponse,
            recruitmentResponse,
            applicationResponse,
            departmentResponse,
            jobPositionResponse,
        ] = await Promise.all([
            http.get('app/candidate', { params: defaultPagedQuery }),
            http.get('app/recruitment-request', { params: defaultPagedQuery }),
            http.get('app/application', { params: defaultPagedQuery }),
            http.get('app/department', { params: defaultPagedQuery }),
            http.get('app/job-position', { params: defaultPagedQuery }),
        ])

        const candidates = getPagedItems<CandidateDto>(
            candidateResponse as unknown as PagedResult<CandidateDto>
        )
        const recruitmentRequests = getPagedItems<RecruitmentRequestDto>(
            recruitmentResponse as unknown as PagedResult<RecruitmentRequestDto>
        )
        const applications = getPagedItems<ApplicationDto>(
            applicationResponse as unknown as PagedResult<ApplicationDto>
        )
        const departments = getPagedItems<DepartmentDto>(
            departmentResponse as unknown as PagedResult<DepartmentDto>
        )
        const jobPositions = getPagedItems<JobPositionDto>(
            jobPositionResponse as unknown as PagedResult<JobPositionDto>
        )

        const currentCandidate = findCurrentCandidate(candidates, user)
        const departmentMap = buildDepartmentMap(departments)
        const jobPositionMap = buildJobPositionMap(jobPositions)
        const recruitmentMap = buildRecruitmentMap(recruitmentRequests)

        const candidateApplications = currentCandidate
            ? applications
                  .filter((item) => item.candidateId === currentCandidate.id)
                  .sort(
                      (left, right) =>
                          dayjs(right.appliedTime).valueOf() -
                          dayjs(left.appliedTime).valueOf()
                  )
            : []

        const appliedRecruitmentIds = new Set(
            candidateApplications.map((item) => item.recruitmentRequestId)
        )

        const jobs = recruitmentRequests
            .filter((item) => isPublishedRecruitment(item) && isActiveDeadline(item.applicationDeadline))
            .sort((left, right) => {
                const leftTime = dayjs(left.publishedTime || left.creationTime).valueOf()
                const rightTime = dayjs(right.publishedTime || right.creationTime).valueOf()
                return rightTime - leftTime
            })
            .map((item) =>
                mapJobDto(item, departmentMap, jobPositionMap, appliedRecruitmentIds)
            )

        return {
            profile: currentCandidate ? toProfileDto(currentCandidate) : null,
            jobs,
            applications: candidateApplications.map((item) =>
                mapApplicationDto(
                    item,
                    recruitmentMap,
                    departmentMap,
                    jobPositionMap
                )
            ),
        }
    }

    async apply(
        user: CandidateWorkspaceUser | null | undefined,
        input: CreateCandidatePortalApplicationDto
    ) {
        const candidateResponse = await http.get('app/candidate', {
            params: defaultPagedQuery,
        })
        const candidates = getPagedItems<CandidateDto>(
            candidateResponse as unknown as PagedResult<CandidateDto>
        )
        const currentCandidate = findCurrentCandidate(candidates, user)

        if (!currentCandidate) {
            throw new Error('Không tìm thấy hồ sơ ứng viên phù hợp.')
        }

        const uploadResult = await this.uploadCv(currentCandidate.id, input.cvFile, {
            description: input.cvDescription,
        })

        const now = dayjs()
        const applicationCode = `APP-${now.format('YYYYMMDDHHmmss')}-${Math.random()
            .toString(36)
            .slice(2, 8)
            .toUpperCase()}`

        return await http.post('app/application', {
            applicationCode,
            recruitmentRequestId: input.recruitmentRequestId,
            candidateId: currentCandidate.id,
            appliedTime: now.toISOString(),
            cvFileId: uploadResult.documentId,
            submittedCvUrl: uploadResult.fileUrl,
            source: input.source || 'Candidate',
            note: input.note,
            finalResult: null,
        })
    }

    async uploadCv(
        candidateId: string,
        file: File,
        options?: {
            description?: string
        }
    ): Promise<CandidateCvUploadResultDto> {
        const formData = new FormData()
        formData.append('candidateId', candidateId)
        formData.append('file', file)

        if (options?.description?.trim()) {
            formData.append('description', options.description.trim())
        }

        return await http.post('app/candidate-document/upload-cv', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    }
}

export default new CandidateService()
