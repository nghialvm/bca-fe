import {
    formatCount,
    getApplicationStatusColor,
    getApplicationStatusLabel,
    getRecruitmentRequestStatusColor,
    getRecruitmentRequestStatusLabel,
} from '@/utils/admin'

const normalizeKey = (value: unknown) =>
    String(value ?? '')
        .trim()
        .replace(/[\s_-]+/g, '')
        .toLowerCase()

export const getInterviewTypeLabel = (type: unknown) => {
    const key = normalizeKey(type)

    if (['1', 'offline'].includes(key)) return 'Trực tiếp'
    if (['2', 'online'].includes(key)) return 'Trực tuyến'
    if (['3', 'phone'].includes(key)) return 'Điện thoại'

    return String(type || '-')
}

export const getInterviewStatusLabel = (status: unknown) => {
    const key = normalizeKey(status)

    if (['1', 'pending'].includes(key)) return 'Chờ xác nhận'
    if (['2', 'confirmed'].includes(key)) return 'Đã xác nhận'
    if (['3', 'rescheduled'].includes(key)) return 'Đổi lịch'
    if (['4', 'cancelled'].includes(key)) return 'Đã hủy'
    if (['5', 'completed'].includes(key)) return 'Hoàn thành'

    return String(status || '-')
}

export const getInterviewStatusColor = (status: unknown) => {
    const key = normalizeKey(status)

    if (['1', 'pending', '2', 'confirmed', '3', 'rescheduled'].includes(key)) {
        return 'processing'
    }

    if (['5', 'completed'].includes(key)) {
        return 'success'
    }

    if (['4', 'cancelled'].includes(key)) {
        return 'error'
    }

    return 'default'
}

export const getOfferStatusLabel = (status: unknown) => {
    const key = normalizeKey(status)

    if (['1', 'draft'].includes(key)) return 'Nháp'
    if (['2', 'sent'].includes(key)) return 'Đã gửi'
    if (['3', 'accepted'].includes(key)) return 'Đã chấp nhận'
    if (['4', 'declined'].includes(key)) return 'Đã từ chối'
    if (['5', 'expired'].includes(key)) return 'Hết hạn'

    return String(status || '-')
}

export const getOfferStatusColor = (status: unknown) => {
    const key = normalizeKey(status)

    if (['2', 'sent'].includes(key)) return 'processing'
    if (['3', 'accepted'].includes(key)) return 'success'
    if (['4', 'declined', '5', 'expired'].includes(key)) return 'error'

    return 'default'
}

export const getEmploymentTypeLabel = (value?: string | null) => {
    const key = normalizeKey(value)

    if (['fulltime'].includes(key)) return 'Toàn thời gian'
    if (['parttime'].includes(key)) return 'Bán thời gian'
    if (['contract'].includes(key)) return 'Hợp đồng'

    return value?.trim() || '-'
}

export const formatSalaryRange = (
    min?: number | null,
    max?: number | null
) => {
    const formatter = new Intl.NumberFormat('vi-VN')

    if (min && max) {
        return `${formatter.format(min)} - ${formatter.format(max)} VNĐ`
    }

    if (min) {
        return `Từ ${formatter.format(min)} VNĐ`
    }

    if (max) {
        return `Đến ${formatter.format(max)} VNĐ`
    }

    return 'Thỏa thuận'
}

export const isRecruitmentRequestPublished = (status: unknown) =>
    ['4', 'published'].includes(normalizeKey(status))

export const isApplicationHired = (status: unknown) =>
    ['11', 'hired'].includes(normalizeKey(status))

export const isApplicationSelected = (status: unknown) =>
    ['9', 'offeraccepted', '11', 'hired'].includes(normalizeKey(status))

export const getApplicationStageBucket = (status: unknown) => {
    const key = normalizeKey(status)

    if (['1', 'submitted'].includes(key)) return 'Hồ sơ mới'
    if (['2', 'screening', '3', 'screeningrejected'].includes(key)) {
        return 'Sàng lọc'
    }
    if (
        ['4', 'interviewscheduled', '5', 'interviewing', '6', 'passedinterview', '7', 'failedinterview'].includes(
            key
        )
    ) {
        return 'Phỏng vấn'
    }
    if (['8', 'offered', '9', 'offeraccepted', '10', 'offerdeclined'].includes(key)) {
        return 'Offer'
    }
    if (['11', 'hired'].includes(key)) return 'Đã tuyển'

    return 'Khác'
}

export const buildApplicationStageStats = (
    statuses: Array<string | number | null | undefined>
) => {
    const buckets = ['Hồ sơ mới', 'Sàng lọc', 'Phỏng vấn', 'Offer', 'Đã tuyển']

    const counts = statuses.reduce(
        (accumulator, status) => {
            const bucket = getApplicationStageBucket(status)
            accumulator[bucket] = (accumulator[bucket] || 0) + 1
            return accumulator
        },
        {} as Record<string, number>
    )

    return buckets.map((bucket) => ({
        type: bucket,
        value: counts[bucket] || 0,
    }))
}

export const formatRecruitmentStatus = (status: unknown) => ({
    label: getRecruitmentRequestStatusLabel(status),
    color: getRecruitmentRequestStatusColor(status),
})

export const formatApplicationStatus = (status: unknown) => ({
    label: getApplicationStatusLabel(status),
    color: getApplicationStatusColor(status),
})

export const formatEmployerKpi = (value?: number | null) => formatCount(value)
