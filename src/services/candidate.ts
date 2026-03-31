import dayjs from 'dayjs'

import {
    APPLICATION_API,
    CANDIDATE_API,
    CANDIDATE_DOCUMENT_API,
    CANDIDATE_RESPONSE_API,
    DEPARTMENT_API,
    JOB_POSITION_API,
    OFFER_API,
    RECRUITMENT_REQUEST_API,
} from '@/constants/api'
import type {
    ApplicationDto,
    CandidateDto,
    CandidateResponseDto,
    DepartmentDto,
    JobPositionDto,
    OfferDto,
    PagedResult,
    RecruitmentRequestDto,
} from '@/interfaces/admin/admin.interface'
import type {
    CandidateCvUploadResultDto,
    CandidatePortalApplicationDto,
    CandidatePortalApplicationProfileInput,
    CandidatePortalJobDto,
    CandidatePortalProfileDto,
    CandidateWorkspaceDto,
    CandidateWorkspaceUser,
    CreateCandidatePortalApplicationDto,
    UpdateCandidatePortalProfileDto,
} from '@/interfaces/candidate/candidate.interface'
import http from '@/services/http'

export type {
    CandidateCvUploadResultDto,
    CandidatePortalApplicationDto,
    CandidatePortalApplicationProfileInput,
    CandidatePortalJobDto,
    CandidatePortalProfileDto,
    CandidateWorkspaceDto,
    CandidateWorkspaceUser,
    CreateCandidatePortalApplicationDto,
    UpdateCandidatePortalProfileDto,
} from '@/interfaces/candidate/candidate.interface'

const defaultPagedQuery = {
    Filter: '',
    Sorting: '',
    SkipCount: 0,
    MaxResultCount: 1000,
}

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
    candidateType: candidate.candidateType,
    employeeId: candidate.employeeId ?? null,
    fullName: candidate.fullName,
    dateOfBirth: candidate.dateOfBirth ?? null,
    gender: candidate.gender,
    phoneNumber: candidate.phoneNumber,
    email: candidate.email,
    address: candidate.address ?? null,
    identityNumber: candidate.identityNumber ?? null,
    currentCompany: candidate.currentCompany ?? null,
    currentPosition: candidate.currentPosition,
    yearsOfExperience: candidate.yearsOfExperience ?? null,
    highestEducation: candidate.highestEducation ?? null,
    universityName: candidate.universityName ?? null,
    major: candidate.major ?? null,
    status: candidate.status,
    source: candidate.source ?? null,
    note: candidate.note ?? null,
})

const buildDepartmentMap = (items: DepartmentDto[]) =>
    new Map(items.map((item) => [item.id, item.name]))

const buildJobPositionMap = (items: JobPositionDto[]) =>
    new Map(items.map((item) => [item.id, item.name]))

const buildRecruitmentMap = (items: RecruitmentRequestDto[]) =>
    new Map(items.map((item) => [item.id, item]))

const isOfferResponseType = (value: unknown) =>
    ['4', 'offeraccepted', '5', 'offerdeclined'].includes(
        normalizeStatus(value)
    )

const getPagedItems = <T>(response: PagedResult<T> | T[] | undefined): T[] => {
    if (Array.isArray(response)) {
        return response
    }

    return Array.isArray(response?.items) ? response.items : []
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
    departmentName:
        departmentMap.get(item.departmentId) || 'ChÆ°a cáº­p nháº­t',
    jobPositionId: item.jobPositionId,
    jobPositionName:
        jobPositionMap.get(item.jobPositionId) || 'ChÆ°a cáº­p nháº­t',
    headcount: item.headcount,
    employmentType: item.employmentType || 'ToÃ n thá»i gian',
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
    jobPositionMap: Map<string, string>,
    offer?: OfferDto | null,
    latestOfferResponse?: CandidateResponseDto | null
): CandidatePortalApplicationDto => {
    const recruitment = recruitmentMap.get(item.recruitmentRequestId)

    return {
        id: item.id,
        applicationCode: item.applicationCode,
        recruitmentRequestId: item.recruitmentRequestId,
        recruitmentRequestCode: recruitment?.requestCode || '',
        title: recruitment?.title || 'Vá»‹ trÃ­ tuyá»ƒn dá»¥ng',
        departmentId: recruitment?.departmentId || '',
        departmentName: recruitment?.departmentId
            ? departmentMap.get(recruitment.departmentId) ||
              'ChÆ°a cáº­p nháº­t'
            : 'ChÆ°a cáº­p nháº­t',
        jobPositionId: recruitment?.jobPositionId || '',
        jobPositionName: recruitment?.jobPositionId
            ? jobPositionMap.get(recruitment.jobPositionId) ||
              'ChÆ°a cáº­p nháº­t'
            : 'ChÆ°a cáº­p nháº­t',
        workLocation: recruitment?.workLocation,
        appliedTime: item.appliedTime,
        status: item.status,
        submittedCvUrl: item.submittedCvUrl,
        source: item.source,
        note: item.note,
        finalResult: item.finalResult,
        offer: offer ?? null,
        latestOfferResponse: latestOfferResponse ?? null,
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
            offerResponse,
            candidateReplyResponse,
        ] = await Promise.all([
            http.get(CANDIDATE_API.LIST, { params: defaultPagedQuery }),
            http.get(RECRUITMENT_REQUEST_API.LIST, {
                params: defaultPagedQuery,
            }),
            http.get(APPLICATION_API.LIST, { params: defaultPagedQuery }),
            http.get(DEPARTMENT_API.LIST, { params: defaultPagedQuery }),
            http.get(JOB_POSITION_API.LIST, { params: defaultPagedQuery }),
            http.get(OFFER_API.LIST, { params: defaultPagedQuery }),
            http.get(CANDIDATE_RESPONSE_API.LIST, {
                params: defaultPagedQuery,
            }),
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
        const offers = getPagedItems<OfferDto>(
            offerResponse as unknown as PagedResult<OfferDto>
        )
        const candidateResponses = getPagedItems<CandidateResponseDto>(
            candidateReplyResponse as unknown as PagedResult<CandidateResponseDto>
        )

        const currentCandidate = user?.id
            ? candidates.find((item) => item.id === user.id) || null
            : null
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
        const applicationIds = new Set(
            candidateApplications.map((item) => item.id)
        )
        const candidateOffers = offers.filter((item) =>
            applicationIds.has(item.applicationId)
        )
        const offerByApplicationId = new Map(
            candidateOffers.map((item) => [item.applicationId, item])
        )
        const offerIds = new Set(candidateOffers.map((item) => item.id))
        const latestOfferResponseByApplicationId = new Map<
            string,
            CandidateResponseDto
        >()

        candidateResponses
            .filter(
                (item) =>
                    isOfferResponseType(item.responseType) &&
                    applicationIds.has(item.applicationId) &&
                    (item.offerId ? offerIds.has(item.offerId) : true)
            )
            .sort(
                (left, right) =>
                    dayjs(right.responseTime).valueOf() -
                    dayjs(left.responseTime).valueOf()
            )
            .forEach((item) => {
                if (
                    !latestOfferResponseByApplicationId.has(item.applicationId)
                ) {
                    latestOfferResponseByApplicationId.set(
                        item.applicationId,
                        item
                    )
                }
            })

        const jobs = recruitmentRequests
            .filter(
                (item) =>
                    isPublishedRecruitment(item) &&
                    isActiveDeadline(item.applicationDeadline)
            )
            .sort((left, right) => {
                const leftTime = dayjs(
                    left.publishedTime || left.creationTime
                ).valueOf()
                const rightTime = dayjs(
                    right.publishedTime || right.creationTime
                ).valueOf()
                return rightTime - leftTime
            })
            .map((item) =>
                mapJobDto(
                    item,
                    departmentMap,
                    jobPositionMap,
                    appliedRecruitmentIds
                )
            )

        return {
            profile: currentCandidate ? toProfileDto(currentCandidate) : null,
            jobs,
            applications: candidateApplications.map((item) =>
                mapApplicationDto(
                    item,
                    recruitmentMap,
                    departmentMap,
                    jobPositionMap,
                    offerByApplicationId.get(item.id),
                    latestOfferResponseByApplicationId.get(item.id)
                )
            ),
        }
    }

    async apply(
        user: CandidateWorkspaceUser | null | undefined,
        input: CreateCandidatePortalApplicationDto
    ) {
        const candidateId = user?.id

        if (!candidateId) {
            throw new Error(
                'KhÃ´ng xÃ¡c Ä‘á»‹nh Ä‘Æ°á»£c há»“ sÆ¡ á»©ng viÃªn tá»« phiÃªn Ä‘Äƒng nháº­p.'
            )
        }

        const profile = await this.getCandidateProfile(candidateId)

        await this.updateCandidateProfile(candidateId, {
            candidateCode: profile.candidateCode,
            candidateType: Number(profile.candidateType ?? 2),
            employeeId: profile.employeeId ?? null,
            fullName: input.profile.fullName.trim(),
            dateOfBirth:
                input.profile.dateOfBirth ?? profile.dateOfBirth ?? null,
            gender: Number(input.profile.gender ?? profile.gender ?? 1),
            phoneNumber: input.profile.phoneNumber.trim(),
            email: input.profile.email.trim(),
            address: input.profile.address.trim(),
            identityNumber:
                input.profile.identityNumber.trim() ||
                profile.identityNumber?.trim() ||
                '',
            currentCompany: input.profile.currentCompany?.trim() || '',
            currentPosition: input.profile.currentPosition.trim(),
            yearsOfExperience: input.profile.yearsOfExperience,
            highestEducation: input.profile.highestEducation.trim(),
            universityName: input.profile.universityName?.trim() || '',
            major: input.profile.major?.trim() || '',
            status: Number(profile.status ?? 1),
            source: profile.source?.trim() || 'Candidate',
            note: profile.note?.trim() || '',
        })

        const uploadResult = await this.uploadCv(candidateId, input.cvFile, {
            description: input.cvDescription,
        })

        const now = dayjs()
        const applicationCode = `APP-${now.format('YYYYMMDDHHmmss')}-${Math.random()
            .toString(36)
            .slice(2, 8)
            .toUpperCase()}`

        return await http.post(APPLICATION_API.LIST, {
            applicationCode,
            recruitmentRequestId: input.recruitmentRequestId,
            candidateId,
            appliedTime: now.toISOString(),
            cvFileId: uploadResult.documentId,
            submittedCvUrl: uploadResult.fileUrl,
            source: input.source || 'Candidate',
            note: input.note,
            finalResult: null,
        })
    }

    async getCandidateProfile(
        candidateId: string
    ): Promise<CandidatePortalProfileDto> {
        const candidate = (await http.get(
            CANDIDATE_API.DETAIL(candidateId)
        )) as CandidateDto
        return toProfileDto(candidate)
    }

    async updateCandidateProfile(
        candidateId: string,
        input: UpdateCandidatePortalProfileDto
    ) {
        return await http.put(CANDIDATE_API.DETAIL(candidateId), input)
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

        return await http.post(CANDIDATE_DOCUMENT_API.UPLOAD_CV, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    }

    async respondToOffer(input: {
        applicationId: string
        offerId: string
        responseType: number
        responseContent: string
        note?: string
    }) {
        const responseContent = input.responseContent.trim()
        const note = input.note?.trim() || responseContent

        return await http.post(CANDIDATE_RESPONSE_API.LIST, {
            applicationId: input.applicationId,
            offerId: input.offerId,
            responseType: input.responseType,
            responseChannel: 1,
            responseTime: dayjs().toISOString(),
            responseContent,
            note,
        })
    }
}

export default new CandidateService()
