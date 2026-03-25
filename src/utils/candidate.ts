import type { CandidatePortalProfileDto } from '@/services/candidate'

const normalizeStatus = (status: unknown) =>
    String(status ?? '')
        .trim()
        .replace(/[\s_-]+/g, '')
        .toLowerCase()

export const getCandidateApplicationProgress = (status: unknown) => {
    const key = normalizeStatus(status)

    if (['1', 'submitted'].includes(key)) return 25
    if (['2', 'screening'].includes(key)) return 45
    if (['4', 'interviewscheduled'].includes(key)) return 70
    if (['5', 'interviewing'].includes(key)) return 80
    if (['6', 'passedinterview', '8', 'offered'].includes(key)) return 90
    if (['9', 'offeraccepted', '11', 'hired'].includes(key)) return 100
    if (
        [
            '3',
            'screeningrejected',
            '7',
            'failedinterview',
            '10',
            'offerdeclined',
            '12',
            'rejected',
            '13',
            'cancelled',
        ].includes(key)
    ) {
        return 100
    }

    return 35
}

export const isCandidateInterviewStage = (status: unknown) => {
    const key = normalizeStatus(status)
    return ['4', 'interviewscheduled', '5', 'interviewing'].includes(key)
}

export const isCandidateActionRequired = (status: unknown) => {
    const key = normalizeStatus(status)
    return ['4', 'interviewscheduled', '8', 'offered'].includes(key)
}

export const formatSalaryRange = (
    salaryMin?: number | null,
    salaryMax?: number | null
) => {
    const formatter = new Intl.NumberFormat('vi-VN')

    if (salaryMin && salaryMax) {
        return `${formatter.format(salaryMin)} - ${formatter.format(salaryMax)} VND`
    }

    if (salaryMin) {
        return `Từ ${formatter.format(salaryMin)} VND`
    }

    if (salaryMax) {
        return `Đến ${formatter.format(salaryMax)} VND`
    }

    return 'Thỏa thuận'
}

export const getCandidateProfileStrengths = (
    profile?: CandidatePortalProfileDto | null
) => {
    if (!profile) return []

    return [
        profile.currentPosition,
        profile.major,
        profile.highestEducation,
        profile.currentCompany,
        profile.yearsOfExperience
            ? `${profile.yearsOfExperience} năm kinh nghiệm`
            : null,
    ].filter((item): item is string => Boolean(item && item.trim()))
}
