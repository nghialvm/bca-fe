import { useEffect, useState } from 'react'

import { notification } from 'antd'
import { useSelector } from 'react-redux'

import CandidateService, {
    CandidatePortalApplicationDto,
    CandidatePortalJobDto,
    CandidatePortalProfileDto,
    type CandidateWorkspaceUser,
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
                    'Vui lòng kiểm tra kết nối hoặc quyền truy cập các API tuyển dụng hiện có.'
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
        note?: string
    ) => {
        setApplyingJobId(recruitmentRequestId)
        try {
            await CandidateService.apply(user, {
                recruitmentRequestId,
                cvFile,
                source: 'Candidate',
                note,
            })

            notification.success({
                message: 'Ứng tuyển thành công',
                description:
                    'Hồ sơ của bạn đã được ghi nhận trên hệ thống tuyển dụng.',
            })

            await loadData()
            return true
        } catch (error) {
            notification.error({
                message: 'Không thể ứng tuyển',
                description: getErrorDescription(
                    error,
                    'Vui lòng thử lại sau hoặc kiểm tra hồ sơ ứng viên hiện tại.'
                ),
            })
            return false
        } finally {
            setApplyingJobId(null)
        }
    }

    useEffect(() => {
        void loadData()
    }, [user?.id])

    return {
        ...data,
        loading,
        applyingJobId,
        applyToJob,
        reload: loadData,
    }
}
