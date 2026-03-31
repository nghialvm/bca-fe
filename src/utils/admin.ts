import dayjs from 'dayjs'

const recruitmentRequestStatusLabels: Record<string, string> = {
    '0': 'Nháp',
    draft: 'Nháp',
    '1': 'Chờ duyệt',
    pendingapproval: 'Chờ duyệt',
    '2': 'Đã duyệt',
    approved: 'Đã duyệt',
    '3': 'Từ chối',
    rejected: 'Từ chối',
    '4': 'Đang tuyển',
    published: 'Đang tuyển',
    '5': 'Đã đóng',
    closed: 'Đã đóng',
    '6': 'Đã hủy',
    cancelled: 'Đã hủy',
}

const applicationStatusLabels: Record<string, string> = {
    '1': 'Đã nộp',
    submitted: 'Đã nộp',
    '2': 'Sàng lọc',
    screening: 'Sàng lọc',
    '3': 'Loại hồ sơ',
    screeningrejected: 'Loại hồ sơ',
    '4': 'Đã lên lịch PV',
    interviewscheduled: 'Đã lên lịch PV',
    '5': 'Đang phỏng vấn',
    interviewing: 'Đang phỏng vấn',
    '6': 'Đạt phỏng vấn',
    passedinterview: 'Đạt phỏng vấn',
    '7': 'Trượt phỏng vấn',
    failedinterview: 'Trượt phỏng vấn',
    '8': 'Đã gửi offer',
    offered: 'Đã gửi offer',
    '9': 'Nhận offer',
    offeraccepted: 'Nhận offer',
    '10': 'Từ chối offer',
    offerdeclined: 'Từ chối offer',
    '11': 'Đã tuyển',
    hired: 'Đã tuyển',
    '12': 'Bị loại',
    rejected: 'Bị loại',
    '13': 'Đã hủy',
    cancelled: 'Đã hủy',
}

const userStatusLabels: Record<string, string> = {
    true: 'Hoạt động',
    false: 'Tạm khóa',
}

const normalizeKey = (value: unknown) =>
    String(value ?? '')
        .trim()
        .replace(/[\s_-]+/g, '')
        .toLowerCase()

export const getRecruitmentRequestStatusLabel = (status: unknown) =>
    recruitmentRequestStatusLabels[normalizeKey(status)] ||
    String(status || '-')

export const getRecruitmentRequestStatusColor = (status: unknown) => {
    const key = normalizeKey(status)

    if (['1', 'pendingapproval'].includes(key)) return 'processing'
    if (['2', 'approved', '4', 'published'].includes(key)) return 'success'
    if (['3', 'rejected', '6', 'cancelled'].includes(key)) return 'error'
    if (['5', 'closed'].includes(key)) return 'default'

    return 'warning'
}

export const isRecruitmentRequestPending = (status: unknown) =>
    ['1', 'pendingapproval'].includes(normalizeKey(status))

export const isRecruitmentRequestActive = (status: unknown) =>
    [
        '0',
        'draft',
        '1',
        'pendingapproval',
        '2',
        'approved',
        '4',
        'published',
    ].includes(normalizeKey(status))

export const getApplicationStatusLabel = (status: unknown) =>
    applicationStatusLabels[normalizeKey(status)] || String(status || '-')

export const getApplicationStatusColor = (status: unknown) => {
    const key = normalizeKey(status)

    if (
        [
            '1',
            'submitted',
            '2',
            'screening',
            '4',
            'interviewscheduled',
            '5',
            'interviewing',
        ].includes(key)
    ) {
        return 'processing'
    }

    if (
        [
            '6',
            'passedinterview',
            '8',
            'offered',
            '9',
            'offeraccepted',
            '11',
            'hired',
        ].includes(key)
    ) {
        return 'success'
    }

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
        return 'error'
    }

    return 'default'
}

export const getUserStatusLabel = (isActive?: boolean) =>
    userStatusLabels[String(Boolean(isActive))]

export const getUserStatusColor = (isActive?: boolean) =>
    isActive ? 'success' : 'warning'

export const formatDisplayDate = (value?: string | null) =>
    value ? dayjs(value).format('DD/MM/YYYY') : '-'

export const formatDisplayDateTime = (value?: string | null) =>
    value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '-'

export const formatCount = (value?: number | null) =>
    new Intl.NumberFormat('vi-VN').format(value || 0)

export const formatPercent = (value?: number | null) =>
    `${new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value || 0)}%`

export const getDisplayName = (user?: {
    name?: string
    surname?: string
    userName?: string
    email?: string
}) => {
    const fullName = [user?.name, user?.surname]
        .filter(Boolean)
        .join(' ')
        .trim()

    return fullName || user?.userName || user?.email || 'Chưa cập nhật'
}
