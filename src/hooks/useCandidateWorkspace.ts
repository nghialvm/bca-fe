import { useEffect, useState } from 'react'

import { notification } from 'antd'
import { useSelector } from 'react-redux'

import CandidateService, {
    CandidatePortalApplicationDto,
    CandidatePortalJobDto,
    CandidatePortalProfileDto,
} from '@/services/candidate'

type RootState = {
    auth: {
        user?: {
            id?: string
        } | null
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
            const [profile, jobs, applications] = await Promise.all([
                CandidateService.getProfile(),
                CandidateService.getJobs(),
                CandidateService.getApplications(),
            ])

            setData({
                profile,
                jobs: Array.isArray(jobs) ? jobs : [],
                applications: Array.isArray(applications) ? applications : [],
            })
        } catch (error) {
            notification.error({
                message: 'Khong tai duoc du lieu ung vien',
                description: getErrorDescription(
                    error,
                    'Vui long kiem tra ket noi hoac quyen truy cap candidate portal API.'
                ),
            })
            setData(emptyWorkspace)
        } finally {
            setLoading(false)
        }
    }

    const applyToJob = async (recruitmentRequestId: string) => {
        setApplyingJobId(recruitmentRequestId)
        try {
            await CandidateService.apply({
                recruitmentRequestId,
                source: 'CandidatePortal',
            })

            notification.success({
                message: 'Ung tuyen thanh cong',
                description:
                    'Ho so cua ban da duoc ghi nhan tren he thong tuyen dung.',
            })

            await loadData()
            return true
        } catch (error) {
            notification.error({
                message: 'Khong the ung tuyen',
                description: getErrorDescription(
                    error,
                    'Vui long thu lai sau hoac kiem tra ho so candidate hien tai.'
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
