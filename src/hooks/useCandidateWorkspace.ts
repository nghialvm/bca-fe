import { useEffect, useState } from 'react'

import { notification } from 'antd'

import { useSelector } from 'react-redux'

import CandidateService, {
    CandidatePortalApplicationDto,
    CandidatePortalApplicationProfileInput,
    CandidatePortalJobDto,
    CandidatePortalProfileDto,
    type CandidateWorkspaceUser,
    UpdateCandidatePortalProfileDto,
} from '@/services/candidate'

type RootState = {
    auth: {
        user?: CandidateWorkspaceUser | null
    }
}

type CandidateWorkspaceData = {
    profile: CandidatePortalProfileDto | null
    jobs: CandidatePortalJobDto[]
    applications: CandidatePortalApplicationDto[]
}

const emptyWorkspace: CandidateWorkspaceData = {
    profile: null,
    jobs: [],
    applications: [],
}

const getErrorDescription = (error: unknown, fallback: string) => {
    if (typeof error !== 'object' || error === null) {
        return fallback
    }

    const responseData = (
        error as {
            response?: {
                data?: {
                    message?: string
                    error?: {
                        message?: string
                        details?: string
                    }
                }
            }
        }
    ).response?.data

    return (
        responseData?.error?.message ||
        responseData?.error?.details ||
        responseData?.message ||
        fallback
    )
}

export const useCandidateWorkspace = () => {
    const user = useSelector((state: RootState) => state.auth.user)
    const [data, setData] = useState<CandidateWorkspaceData>(emptyWorkspace)
    const [loading, setLoading] = useState(false)
    const [applyingJobId, setApplyingJobId] = useState<string | null>(null)
    const [savingProfile, setSavingProfile] = useState(false)

    const loadData = async () => {
        if (!user?.id) {
            setData(emptyWorkspace)
            return
        }

        setLoading(true)
        try {
            const workspace = await CandidateService.loadWorkspace(user)

            setData({
                profile: workspace.profile,
                jobs: Array.isArray(workspace.jobs) ? workspace.jobs : [],
                applications: Array.isArray(workspace.applications)
                    ? workspace.applications
                    : [],
            })
        } catch (error) {
            notification.error({
                message: 'Không tải được dữ liệu ứng viên',
                description: getErrorDescription(
                    error,
                    'Vui lòng kiểm tra kết nối và thử lại.'
                ),
            })
            setData(emptyWorkspace)
        } finally {
            setLoading(false)
        }
    }

    const applyToJob = async (
        recruitmentRequestId: string,
        cvFile: File,
        profile: CandidatePortalApplicationProfileInput,
        note?: string
    ) => {
        setApplyingJobId(recruitmentRequestId)
        try {
            await CandidateService.apply(user, {
                recruitmentRequestId,
                cvFile,
                profile,
                source: 'Candidate',
                note,
            })

            notification.success({
                message: 'Ứng tuyển thành công',
                description: 'Hồ sơ của bạn đã được gửi.',
            })

            await loadData()
            return true
        } catch (error) {
            console.log(error)
            notification.error({
                message: 'Không thể ứng tuyển',
                description: getErrorDescription(
                    error,
                    'Vui lòng thử lại hoặc kiểm tra lại thông tin hồ sơ.'
                ),
            })
            return false
        } finally {
            setApplyingJobId(null)
        }
    }

    const updateProfile = async (input: UpdateCandidatePortalProfileDto) => {
        if (!user?.id) {
            notification.error({
                message: 'Không xác định được hồ sơ ứng viên',
                description:
                    'Phiên đăng nhập hiện tại không có thông tin hồ sơ để cập nhật.',
            })
            return false
        }

        setSavingProfile(true)
        try {
            await CandidateService.updateCandidateProfile(user.id, input)

            notification.success({
                message: 'Đã cập nhật hồ sơ',
                description: 'Thông tin hồ sơ đã được lưu.',
            })

            await loadData()
            return true
        } catch (error) {
            notification.error({
                message: 'Không thể cập nhật hồ sơ',
                description: getErrorDescription(
                    error,
                    'Vui lòng kiểm tra lại thông tin và thử lại.'
                ),
            })
            return false
        } finally {
            setSavingProfile(false)
        }
    }

    useEffect(() => {
        void loadData()
    }, [user?.id])

    return {
        ...data,
        loading,
        applyingJobId,
        savingProfile,
        applyToJob,
        updateProfile,
        reload: loadData,
    }
}
