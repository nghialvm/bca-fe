import { useEffect, useState } from 'react'

import { notification } from 'antd'
import { useSelector } from 'react-redux'

import AdminService, {
    ApplicationDto,
    CandidateDto,
    CandidateResponseDto,
    DepartmentDto,
    IdentityUserDto,
    InterviewScheduleDto,
    JobPositionDto,
    OfferDto,
    RecruitmentRequestDto,
} from '@/services/admin'

type RootState = {
    auth: {
        user?: {
            id?: string
        } | null
    }
}

export type EmployerApplicationRow = {
    application: ApplicationDto
    recruitmentRequest?: RecruitmentRequestDto
    candidate?: CandidateDto
    jobPosition?: JobPositionDto
    department?: DepartmentDto
}

export type EmployerWorkspaceData = {
    currentDepartment: DepartmentDto | null
    managedDepartments: DepartmentDto[]
    managerUser: IdentityUserDto | null
    departments: DepartmentDto[]
    jobPositions: JobPositionDto[]
    recruitmentRequests: RecruitmentRequestDto[]
    applications: ApplicationDto[]
    candidates: CandidateDto[]
    identityUsers: IdentityUserDto[]
    interviews: InterviewScheduleDto[]
    offers: OfferDto[]
    candidateResponses: CandidateResponseDto[]
    applicationRows: EmployerApplicationRow[]
}

const emptyWorkspace: EmployerWorkspaceData = {
    currentDepartment: null,
    managedDepartments: [],
    managerUser: null,
    departments: [],
    jobPositions: [],
    recruitmentRequests: [],
    applications: [],
    candidates: [],
    identityUsers: [],
    interviews: [],
    offers: [],
    candidateResponses: [],
    applicationRows: [],
}

export const useEmployerWorkspace = () => {
    const user = useSelector((state: RootState) => state.auth.user)
    const [data, setData] = useState<EmployerWorkspaceData>(emptyWorkspace)
    const [loading, setLoading] = useState(false)

    const loadData = async () => {
        if (!user?.id) {
            setData(emptyWorkspace)
            return
        }

        setLoading(true)
        try {
            const [
                departmentResponse,
                jobPositionResponse,
                recruitmentResponse,
                applicationResponse,
                candidateResponse,
                interviewResponse,
                offerResponse,
                candidateReplyResponse,
                identityUserResponse,
            ] = await Promise.all([
                AdminService.getDepartments({
                    Sorting: 'name asc',
                    MaxResultCount: 1000,
                }),
                AdminService.getJobPositions({
                    Sorting: 'name asc',
                    MaxResultCount: 1000,
                }),
                AdminService.getRecruitmentRequests({
                    Sorting: 'creationTime desc',
                    MaxResultCount: 1000,
                }),
                AdminService.getApplications({
                    Sorting: 'appliedTime desc',
                    MaxResultCount: 1000,
                }),
                AdminService.getCandidates({
                    Sorting: 'creationTime desc',
                    MaxResultCount: 1000,
                }),
                AdminService.getInterviewSchedules({
                    Sorting: 'scheduledTime desc',
                    MaxResultCount: 1000,
                }),
                AdminService.getOffers({
                    Sorting: 'creationTime desc',
                    MaxResultCount: 1000,
                }),
                AdminService.getCandidateResponses({
                    Sorting: 'responseTime desc',
                    MaxResultCount: 1000,
                }),
                AdminService.getIdentityUsers({
                    Sorting: 'userName asc',
                    MaxResultCount: 1000,
                }),
            ])

            const departments = (departmentResponse?.items || []) as DepartmentDto[]
            const jobPositions = (jobPositionResponse?.items ||
                []) as JobPositionDto[]
            const allRecruitmentRequests = (recruitmentResponse?.items ||
                []) as RecruitmentRequestDto[]
            const allApplications = (applicationResponse?.items ||
                []) as ApplicationDto[]
            const allCandidates = (candidateResponse?.items ||
                []) as CandidateDto[]
            const allInterviews = (interviewResponse?.items ||
                []) as InterviewScheduleDto[]
            const allOffers = (offerResponse?.items || []) as OfferDto[]
            const allCandidateResponses = (candidateReplyResponse?.items ||
                []) as CandidateResponseDto[]
            const identityUsers = (identityUserResponse?.items ||
                []) as IdentityUserDto[]

            let managedDepartments = departments.filter(
                (department) => department.managerUserId === user.id
            )

            let recruitmentRequests = allRecruitmentRequests.filter((request) =>
                managedDepartments.some(
                    (department) => department.id === request.departmentId
                )
            )

            if (!managedDepartments.length) {
                recruitmentRequests = allRecruitmentRequests.filter(
                    (request) => request.createdByUserId === user.id
                )

                const fallbackDepartmentIds = new Set(
                    recruitmentRequests.map((request) => request.departmentId)
                )
                managedDepartments = departments.filter((department) =>
                    fallbackDepartmentIds.has(department.id)
                )
            }

            const recruitmentRequestIds = new Set(
                recruitmentRequests.map((request) => request.id)
            )
            const applications = allApplications.filter((application) =>
                recruitmentRequestIds.has(application.recruitmentRequestId)
            )
            const applicationIds = new Set(applications.map((item) => item.id))
            const candidateIds = new Set(applications.map((item) => item.candidateId))
            const candidates = allCandidates.filter((candidate) =>
                candidateIds.has(candidate.id)
            )
            const interviews = allInterviews.filter((interview) =>
                applicationIds.has(interview.applicationId)
            )
            const offers = allOffers.filter((offer) =>
                applicationIds.has(offer.applicationId)
            )
            const offerIds = new Set(offers.map((offer) => offer.id))
            const candidateResponses = allCandidateResponses.filter(
                (response) =>
                    applicationIds.has(response.applicationId) ||
                    (response.offerId ? offerIds.has(response.offerId) : false)
            )

            const recruitmentRequestById = new Map(
                recruitmentRequests.map((item) => [item.id, item])
            )
            const candidateById = new Map(candidates.map((item) => [item.id, item]))
            const jobPositionById = new Map(
                jobPositions.map((item) => [item.id, item])
            )
            const departmentById = new Map(
                departments.map((item) => [item.id, item])
            )

            const applicationRows = applications.map((application) => {
                const recruitmentRequest = recruitmentRequestById.get(
                    application.recruitmentRequestId
                )

                return {
                    application,
                    recruitmentRequest,
                    candidate: candidateById.get(application.candidateId),
                    jobPosition: recruitmentRequest
                        ? jobPositionById.get(recruitmentRequest.jobPositionId)
                        : undefined,
                    department: recruitmentRequest
                        ? departmentById.get(recruitmentRequest.departmentId)
                        : undefined,
                }
            })

            setData({
                currentDepartment: managedDepartments[0] || null,
                managedDepartments,
                managerUser:
                    identityUsers.find((identityUser) => identityUser.id === user.id) ||
                    null,
                departments,
                jobPositions,
                recruitmentRequests,
                applications,
                candidates,
                identityUsers,
                interviews,
                offers,
                candidateResponses,
                applicationRows,
            })
        } catch (error) {
            notification.error({
                message: 'Không tải được dữ liệu nhà tuyển dụng',
                description:
                    'Vui lòng kiểm tra kết nối hoặc quyền truy cập các API tuyển dụng.',
            })
            setData(emptyWorkspace)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadData()
    }, [user?.id])

    return {
        ...data,
        loading,
        reload: loadData,
    }
}
