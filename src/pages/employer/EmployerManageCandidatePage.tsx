import { useMemo, useState } from 'react'

import {
    Button,
    Card,
    DatePicker,
    Descriptions,
    Empty,
    Form,
    Input,
    InputNumber,
    Modal,
    Select,
    Space,
    Table,
    Tag,
    Typography,
    notification,
} from 'antd'

import {
    FileTextOutlined,
    FilterOutlined,
    MailOutlined,
    PhoneOutlined,
    SearchOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { type Dayjs } from 'dayjs'
import { useSelector } from 'react-redux'

import { useEmployerWorkspace } from '@/hooks/useEmployerWorkspace'
import type {
    ApplicationDto,
    ApplicationScreeningCreateDto,
    ApplicationScreeningDto,
    ApplicationScreeningUpdateDto,
    ApplicationUpdateDto,
    CandidateDto,
    CreateOfferDto,
    OfferDto,
} from '@/services/admin'
import AdminService from '@/services/admin'
import {
    formatDisplayDate,
    formatDisplayDateTime,
    getApplicationStatusColor,
    getApplicationStatusLabel,
} from '@/utils/admin'
import { getOfferStatusColor, getOfferStatusLabel } from '@/utils/employer'

const { Paragraph, Text, Title } = Typography

type RootState = {
    auth: {
        user?: {
            id?: string
        } | null
    }
}

type EmployerCandidateRow = {
    id: string
    applicationId: string
    applicationCode: string
    name: string
    email: string
    phone: string
    position: string
    department: string
    status: string | number
    appliedTime: string
    currentPosition: string
    candidate?: CandidateDto
    application: ApplicationDto
    latestScreening?: ApplicationScreeningDto
    offer?: OfferDto
}

type EvaluationFormValues = {
    result: number
    applicationStatus: string | number
    score?: number
    criteriaSummary?: string
    comment?: string
}

type OfferFormValues = {
    salary: number
    startDate?: Dayjs
    probationMonths?: number
    workLocation?: string
    benefit?: string
    note?: string
    expiredTime?: Dayjs
}

const screeningResultOptions = [
    { label: 'Đạt sàng lọc', value: 1 },
    { label: 'Không đạt', value: 2 },
]

const applicationStatusOptions = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
].map((value) => ({
    label: getApplicationStatusLabel(value),
    value,
}))

const normalizeValue = (value: unknown) =>
    String(value ?? '')
        .trim()
        .replace(/[\s_-]+/g, '')
        .toLowerCase()

const normalizeScreeningResult = (value: unknown) => {
    const key = normalizeValue(value)

    if (['1', 'pass', 'passed'].includes(key)) return 1
    if (['2', 'fail', 'failed'].includes(key)) return 2

    return undefined
}

const getScreeningResultLabel = (value: unknown) => {
    const normalized = normalizeScreeningResult(value)

    if (normalized === 1) return 'Đạt sàng lọc'
    if (normalized === 2) return 'Không đạt'

    return 'Chưa đánh giá'
}

const getScreeningResultColor = (value: unknown) => {
    const normalized = normalizeScreeningResult(value)

    if (normalized === 1) return 'success'
    if (normalized === 2) return 'error'

    return 'default'
}

const getGenderLabel = (value: unknown) => {
    const key = normalizeValue(value)

    if (['0', 'female', 'nu', 'nữ'].includes(key)) return 'Nữ'
    if (['1', 'male', 'nam'].includes(key)) return 'Nam'
    if (['2', 'other', 'khac', 'khác'].includes(key)) return 'Khác'

    return '-'
}

const formatScore = (value?: number | null) => {
    if (value === null || value === undefined) return '-'

    return new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(value))
}

const getTextValue = (value?: string | null) => {
    const trimmed = value?.trim()

    return trimmed || '-'
}

const buildApplicationUpdatePayload = (
    application: ApplicationDto,
    status: string | number
): ApplicationUpdateDto => ({
    applicationCode: application.applicationCode,
    recruitmentRequestId: application.recruitmentRequestId,
    candidateId: application.candidateId,
    appliedTime: application.appliedTime,
    status,
    cvFileId: application.cvFileId ?? null,
    submittedCvUrl: application.submittedCvUrl?.trim() || null,
    source: application.source?.trim() || null,
    note: application.note?.trim() || null,
    finalResult: application.finalResult?.trim() || null,
})

const getErrorMessage = (error: unknown) => {
    const message =
        (
            error as {
                response?: {
                    data?: {
                        error?: {
                            message?: string
                        }
                        message?: string
                    }
                }
                message?: string
            }
        )?.response?.data?.error?.message ||
        (
            error as {
                response?: {
                    data?: {
                        message?: string
                    }
                }
                message?: string
            }
        )?.response?.data?.message ||
        (error as { message?: string })?.message

    return (
        message || 'Vui lòng kiểm tra lại quyền truy cập hoặc dữ liệu đầu vào.'
    )
}

const EmployerManageCandidatePage = () => {
    const currentUser = useSelector((state: RootState) => state.auth.user)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<string | 'all'>('all')
    const [profileCandidate, setProfileCandidate] =
        useState<EmployerCandidateRow | null>(null)
    const [evaluationCandidate, setEvaluationCandidate] =
        useState<EmployerCandidateRow | null>(null)
    const [offerCandidate, setOfferCandidate] =
        useState<EmployerCandidateRow | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [offerSubmitting, setOfferSubmitting] = useState(false)
    const [form] = Form.useForm<EvaluationFormValues>()
    const [offerForm] = Form.useForm<OfferFormValues>()
    const { applicationRows, applicationScreenings, offers, loading, reload } =
        useEmployerWorkspace()

    const latestScreeningByApplicationId = useMemo(() => {
        const map = new Map<string, ApplicationScreeningDto>()

        applicationScreenings.forEach((screening) => {
            if (!map.has(screening.applicationId)) {
                map.set(screening.applicationId, screening)
            }
        })

        return map
    }, [applicationScreenings])

    const offerByApplicationId = useMemo(() => {
        const map = new Map<string, OfferDto>()

        offers.forEach((offer) => {
            if (!map.has(offer.applicationId)) {
                map.set(offer.applicationId, offer)
            }
        })

        return map
    }, [offers])

    const candidateRows = useMemo<EmployerCandidateRow[]>(
        () =>
            applicationRows.map((row) => ({
                id: `${row.application.id}-${row.candidate?.id || 'candidate'}`,
                applicationId: row.application.id,
                applicationCode: row.application.applicationCode,
                name: row.candidate?.fullName || 'Ứng viên',
                email: row.candidate?.email || '-',
                phone: row.candidate?.phoneNumber || '-',
                position:
                    row.recruitmentRequest?.title ||
                    row.jobPosition?.name ||
                    '-',
                department: row.department?.name || '-',
                status: row.application.status,
                appliedTime: row.application.appliedTime,
                currentPosition: row.candidate?.currentPosition || '-',
                candidate: row.candidate,
                application: row.application,
                latestScreening: latestScreeningByApplicationId.get(
                    row.application.id
                ),
                offer: offerByApplicationId.get(row.application.id),
            })),
        [applicationRows, latestScreeningByApplicationId, offerByApplicationId]
    )

    const filteredCandidates = useMemo(
        () =>
            candidateRows.filter((candidate) => {
                const normalized = search.trim().toLowerCase()
                const matchesSearch =
                    !normalized ||
                    candidate.name.toLowerCase().includes(normalized) ||
                    candidate.position.toLowerCase().includes(normalized) ||
                    candidate.email.toLowerCase().includes(normalized) ||
                    candidate.applicationCode.toLowerCase().includes(normalized)
                const matchesStatus =
                    status === 'all' ||
                    String(candidate.status) === String(status)

                return matchesSearch && matchesStatus
            }),
        [candidateRows, search, status]
    )

    const statusOptions = useMemo(
        () => [
            { label: 'Tất cả trạng thái', value: 'all' },
            ...Array.from(
                new Map(
                    candidateRows.map((row) => [
                        String(row.status),
                        {
                            label: getApplicationStatusLabel(row.status),
                            value: String(row.status),
                        },
                    ])
                ).values()
            ),
        ],
        [candidateRows]
    )

    const openEvaluationModal = (candidate: EmployerCandidateRow) => {
        const existingResult = normalizeScreeningResult(
            candidate.latestScreening?.result
        )

        form.setFieldsValue({
            result: existingResult || 1,
            applicationStatus: candidate.application.status,
            score: candidate.latestScreening?.score ?? undefined,
            criteriaSummary: candidate.latestScreening?.criteriaSummary || '',
            comment: candidate.latestScreening?.comment || '',
        })
        setEvaluationCandidate(candidate)
    }

    const closeEvaluationModal = () => {
        setEvaluationCandidate(null)
        form.resetFields()
    }

    const openOfferModal = (candidate: EmployerCandidateRow) => {
        offerForm.setFieldsValue({
            salary: undefined,
            startDate: undefined,
            probationMonths: undefined,
            workLocation: '',
            benefit: '',
            note: '',
            expiredTime: undefined,
        })
        setOfferCandidate(candidate)
    }

    const closeOfferModal = () => {
        setOfferCandidate(null)
        offerForm.resetFields()
    }

    const handleSubmitEvaluation = async () => {
        if (!evaluationCandidate) return

        if (!currentUser?.id) {
            notification.error({
                message: 'Không xác định được người đánh giá',
                description:
                    'Phiên đăng nhập hiện tại không có thông tin người dùng để ghi nhận kết quả sàng lọc.',
            })
            return
        }

        let screeningSaved = false
        const error: unknown = undefined

        if (!currentUser?.id) {
            if (screeningSaved) {
                notification.warning({
                    message:
                        'Đã lưu đánh giá nhưng chưa cập nhật được trạng thái hồ sơ',
                    description: getErrorMessage(error),
                })

                closeEvaluationModal()
                await reload()
                return
            }

            notification.error({
                message: 'Không xác định được người đánh giá',
                description:
                    'Phiên đăng nhập hiện tại không có thông tin người dùng để ghi nhận kết quả sàng lọc.',
            })
            return
        }

        screeningSaved = false

        try {
            const values = await form.validateFields()
            const payloadBase: ApplicationScreeningCreateDto = {
                applicationId: evaluationCandidate.applicationId,
                screenedByUserId: currentUser.id,
                screeningTime: dayjs().toISOString(),
                result: values.result,
                score: values.score ?? null,
                criteriaSummary: values.criteriaSummary?.trim() || null,
                comment: values.comment?.trim() || null,
            }
            const hasStatusChanged =
                String(values.applicationStatus) !==
                String(evaluationCandidate.application.status)

            setSubmitting(true)

            if (evaluationCandidate.latestScreening?.id) {
                const updatePayload: ApplicationScreeningUpdateDto = {
                    ...payloadBase,
                }

                await AdminService.updateApplicationScreening(
                    evaluationCandidate.latestScreening.id,
                    updatePayload
                )
            } else {
                await AdminService.createApplicationScreening(payloadBase)
            }

            screeningSaved = true

            if (hasStatusChanged) {
                await AdminService.updateApplication(
                    evaluationCandidate.application.id,
                    buildApplicationUpdatePayload(
                        evaluationCandidate.application,
                        values.applicationStatus
                    )
                )
            }

            notification.success({
                message: 'Đã lưu đánh giá ứng viên',
                description: `${evaluationCandidate.name} đã được cập nhật kết quả sàng lọc.`,
            })

            closeEvaluationModal()
            await reload()
        } catch (error) {
            if (
                typeof error === 'object' &&
                error !== null &&
                'errorFields' in error
            ) {
                return
            }

            if (screeningSaved) {
                notification.warning({
                    message:
                        'Đã lưu đánh giá nhưng chưa cập nhật được trạng thái hồ sơ',
                    description: getErrorMessage(error),
                })

                closeEvaluationModal()
                await reload()
                return
            }

            notification.error({
                message: 'Không lưu được đánh giá ứng viên',
                description: getErrorMessage(error),
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleSubmitOffer = async () => {
        if (!offerCandidate) return
        if (offerCandidate.offer) {
            notification.info({
                message: 'Hồ sơ này đã có offer',
                description:
                    'Mỗi hồ sơ hiện chỉ hỗ trợ một offer. Vui lòng kiểm tra thông tin offer hiện có.',
            })
            return
        }

        try {
            const values = await offerForm.validateFields()
            const payload: CreateOfferDto = {
                applicationId: offerCandidate.applicationId,
                salary: values.salary,
                startDate: values.startDate?.toISOString() || null,
                probationMonths: values.probationMonths ?? null,
                workLocation: values.workLocation?.trim() || null,
                benefit: values.benefit?.trim() || null,
                note: values.note?.trim() || null,
                sentTime: dayjs().toISOString(),
                expiredTime: values.expiredTime?.toISOString() || null,
            }

            setOfferSubmitting(true)
            await AdminService.createOffer(payload)

            notification.success({
                message: 'Đã gửi offer',
                description: `Offer cho ứng viên ${offerCandidate.name} đã được tạo và gửi thành công.`,
            })

            closeOfferModal()
            await reload()
        } catch (error) {
            if (
                typeof error === 'object' &&
                error !== null &&
                'errorFields' in error
            ) {
                return
            }

            notification.error({
                message: 'Không gửi được offer',
                description: getErrorMessage(error),
            })
        } finally {
            setOfferSubmitting(false)
        }
    }

    const columns: ColumnsType<EmployerCandidateRow> = [
        {
            title: 'Ứng viên',
            dataIndex: 'name',
            key: 'name',
            render: (_, candidate) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{candidate.name}</div>
                    <div className="portal-muted">{candidate.position}</div>
                </div>
            ),
        },
        {
            title: 'Liên hệ',
            key: 'contact',
            render: (_, candidate) => (
                <Space direction="vertical" size={4}>
                    <Text>
                        <MailOutlined /> {candidate.email}
                    </Text>
                    <Text>
                        <PhoneOutlined /> {candidate.phone}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Vị trí hiện tại',
            dataIndex: 'currentPosition',
            key: 'currentPosition',
        },
        {
            title: 'Phòng ban',
            dataIndex: 'department',
            key: 'department',
        },
        {
            title: 'Trạng thái hồ sơ',
            dataIndex: 'status',
            key: 'status',
            render: (value: string | number) => (
                <Tag color={getApplicationStatusColor(value)}>
                    {getApplicationStatusLabel(value)}
                </Tag>
            ),
        },
        {
            title: 'Offer',
            key: 'offer',
            render: (_, candidate) =>
                candidate.offer ? (
                    <Space direction="vertical" size={4}>
                        <Tag color={getOfferStatusColor(candidate.offer.status)}>
                            {getOfferStatusLabel(candidate.offer.status)}
                        </Tag>
                        <Text type="secondary">
                            {formatDisplayDateTime(candidate.offer.sentTime)}
                        </Text>
                    </Space>
                ) : (
                    <Text type="secondary">Chưa gửi offer</Text>
                ),
        },
        {
            title: 'Đánh giá gần nhất',
            key: 'screening',
            render: (_, candidate) => {
                if (!candidate.latestScreening) {
                    return <Text type="secondary">Chưa đánh giá</Text>
                }

                return (
                    <Space direction="vertical" size={4}>
                        <Tag
                            color={getScreeningResultColor(
                                candidate.latestScreening.result
                            )}
                        >
                            {getScreeningResultLabel(
                                candidate.latestScreening.result
                            )}
                        </Tag>
                        <Text type="secondary">
                            {candidate.latestScreening.score !== null &&
                            candidate.latestScreening.score !== undefined
                                ? `Điểm: ${formatScore(candidate.latestScreening.score)}`
                                : 'Chưa chấm điểm'}
                        </Text>
                        <Text type="secondary">
                            {formatDisplayDateTime(
                                candidate.latestScreening.screeningTime
                            )}
                        </Text>
                    </Space>
                )
            },
        },
        {
            title: 'Ngày nộp',
            dataIndex: 'appliedTime',
            key: 'appliedTime',
            render: (value: string) => formatDisplayDateTime(value),
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'right',
            render: (_, candidate) => (
                <Space>
                    <Button
                        icon={<FileTextOutlined />}
                        onClick={() => setProfileCandidate(candidate)}
                    >
                        Hồ sơ
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => openEvaluationModal(candidate)}
                    >
                        {candidate.latestScreening
                            ? 'Đánh giá lại'
                            : 'Đánh giá'}
                    </Button>
                    <Button
                        onClick={() => openOfferModal(candidate)}
                        disabled={Boolean(candidate.offer)}
                    >
                        {candidate.offer ? 'Đã có offer' : 'Gửi offer'}
                    </Button>
                </Space>
            ),
        },
    ]

    return (
        <div className="portal-page">
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Ứng viên</span>
                <Title level={2}>Quản lý danh sách ứng viên</Title>
                <Paragraph style={{ maxWidth: 760 }}>
                    Theo dõi toàn bộ ứng viên đã nộp hồ sơ vào đơn vị, xem chi
                    tiết từng hồ sơ, CV đính kèm và cập nhật kết quả xử lý ngay
                    tại đây.
                </Paragraph>
            </section>

            <Card className="portal-section-card">
                <Space wrap size="middle">
                    <Input
                        allowClear
                        size="large"
                        prefix={<SearchOutlined />}
                        placeholder="Tìm theo tên ứng viên, mã hồ sơ, vị trí hoặc email..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        style={{ width: 340, height: 40 }}
                    />
                    <Select
                        size="large"
                        value={status}
                        onChange={setStatus}
                        style={{ width: 240 }}
                        options={statusOptions}
                    />
                    <Button
                        style={{ height: 40 }}
                        size="large"
                        icon={<FilterOutlined />}
                    >
                        Lọc
                    </Button>
                </Space>
            </Card>

            {filteredCandidates.length > 0 || loading ? (
                <Card className="portal-section-card">
                    <Table
                        rowKey="id"
                        loading={loading}
                        columns={columns}
                        dataSource={filteredCandidates}
                        pagination={{ pageSize: 8, showSizeChanger: false }}
                        scroll={{ x: 1400 }}
                    />
                </Card>
            ) : (
                <Card className="portal-section-card portal-empty">
                    <Empty description="Không tìm thấy ứng viên phù hợp" />
                </Card>
            )}

            <Modal
                title="Hồ sơ ứng viên"
                open={Boolean(profileCandidate)}
                onCancel={() => setProfileCandidate(null)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setProfileCandidate(null)}
                    >
                        Đóng
                    </Button>,
                ]}
                width={820}
            >
                {profileCandidate ? (
                    <Space
                        direction="vertical"
                        size={20}
                        style={{ width: '100%' }}
                    >
                        <div>
                            <Title level={4} style={{ marginBottom: 4 }}>
                                {profileCandidate.name}
                            </Title>
                            <Space wrap size={[8, 8]}>
                                <Tag
                                    color={getApplicationStatusColor(
                                        profileCandidate.status
                                    )}
                                >
                                    {getApplicationStatusLabel(
                                        profileCandidate.status
                                    )}
                                </Tag>
                                <Tag
                                    color={getScreeningResultColor(
                                        profileCandidate.latestScreening?.result
                                    )}
                                >
                                    {getScreeningResultLabel(
                                        profileCandidate.latestScreening?.result
                                    )}
                                </Tag>
                                <Tag>{profileCandidate.applicationCode}</Tag>
                            </Space>
                        </div>

                        <Descriptions column={1} size="small" bordered>
                            <Descriptions.Item label="Email">
                                {profileCandidate.email}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {profileCandidate.phone}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày sinh">
                                {formatDisplayDate(
                                    profileCandidate.candidate?.dateOfBirth
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giới tính">
                                {getGenderLabel(
                                    profileCandidate.candidate?.gender
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Vị trí ứng tuyển">
                                {profileCandidate.position}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phòng ban">
                                {profileCandidate.department}
                            </Descriptions.Item>
                            <Descriptions.Item label="Vị trí hiện tại">
                                {profileCandidate.currentPosition}
                            </Descriptions.Item>
                            <Descriptions.Item label="Công ty hiện tại">
                                {getTextValue(
                                    profileCandidate.candidate?.currentCompany
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số năm kinh nghiệm">
                                {profileCandidate.candidate
                                    ?.yearsOfExperience ?? '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Học vấn cao nhất">
                                {getTextValue(
                                    profileCandidate.candidate?.highestEducation
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trường / chuyên ngành">
                                {[
                                    profileCandidate.candidate?.universityName,
                                    profileCandidate.candidate?.major,
                                ]
                                    .filter(Boolean)
                                    .join(' / ') || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="CCCD / CMND">
                                {getTextValue(
                                    profileCandidate.candidate?.identityNumber
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ">
                                {getTextValue(
                                    profileCandidate.candidate?.address
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày nộp hồ sơ">
                                {formatDisplayDateTime(
                                    profileCandidate.appliedTime
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Nguồn hồ sơ">
                                {getTextValue(
                                    profileCandidate.application.source ||
                                        profileCandidate.candidate?.source
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="CV đã nộp">
                                {profileCandidate.application.submittedCvUrl ? (
                                    <a
                                        href={
                                            profileCandidate.application
                                                .submittedCvUrl
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Mở file CV
                                    </a>
                                ) : (
                                    '-'
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Nhận xét ứng viên">
                                {getTextValue(profileCandidate.candidate?.note)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú hồ sơ">
                                {getTextValue(
                                    profileCandidate.application.note
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Offer">
                                {profileCandidate.offer ? (
                                    <Space direction="vertical" size={4}>
                                        <Tag
                                            color={getOfferStatusColor(
                                                profileCandidate.offer.status
                                            )}
                                        >
                                            {getOfferStatusLabel(
                                                profileCandidate.offer.status
                                            )}
                                        </Tag>
                                        <Text>
                                            Lương:{' '}
                                            {formatScore(
                                                Number(
                                                    profileCandidate.offer.salary
                                                )
                                            )}{' '}
                                            VND
                                        </Text>
                                        <Text>
                                            Bắt đầu:{' '}
                                            {formatDisplayDate(
                                                profileCandidate.offer.startDate
                                            )}
                                        </Text>
                                        <Text>
                                            Thử việc:{' '}
                                            {profileCandidate.offer
                                                .probationMonths !== null &&
                                            profileCandidate.offer
                                                .probationMonths !== undefined
                                                ? `${profileCandidate.offer.probationMonths} tháng`
                                                : '-'}
                                        </Text>
                                        <Text>
                                            Địa điểm:{' '}
                                            {getTextValue(
                                                profileCandidate.offer
                                                    .workLocation
                                            )}
                                        </Text>
                                        <Text>
                                            Phúc lợi:{' '}
                                            {getTextValue(
                                                profileCandidate.offer.benefit
                                            )}
                                        </Text>
                                        <Text>
                                            Ghi chú:{' '}
                                            {getTextValue(
                                                profileCandidate.offer.note
                                            )}
                                        </Text>
                                        <Text>
                                            Gửi lúc:{' '}
                                            {formatDisplayDateTime(
                                                profileCandidate.offer.sentTime
                                            )}
                                        </Text>
                                        <Text>
                                            Hết hạn:{' '}
                                            {formatDisplayDateTime(
                                                profileCandidate.offer
                                                    .expiredTime
                                            )}
                                        </Text>
                                    </Space>
                                ) : (
                                    'Chưa gửi offer'
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Đánh giá gần nhất">
                                {profileCandidate.latestScreening ? (
                                    <Space direction="vertical" size={4}>
                                        <Tag
                                            color={getScreeningResultColor(
                                                profileCandidate.latestScreening
                                                    .result
                                            )}
                                        >
                                            {getScreeningResultLabel(
                                                profileCandidate.latestScreening
                                                    .result
                                            )}
                                        </Tag>
                                        <Text>
                                            Điểm:{' '}
                                            {formatScore(
                                                profileCandidate.latestScreening
                                                    .score
                                            )}
                                        </Text>
                                        <Text>
                                            Thời gian:{' '}
                                            {formatDisplayDateTime(
                                                profileCandidate.latestScreening
                                                    .screeningTime
                                            )}
                                        </Text>
                                        <Text>
                                            Tóm tắt:{' '}
                                            {getTextValue(
                                                profileCandidate.latestScreening
                                                    .criteriaSummary
                                            )}
                                        </Text>
                                        <Text>
                                            Nhận xét:{' '}
                                            {getTextValue(
                                                profileCandidate.latestScreening
                                                    .comment
                                            )}
                                        </Text>
                                    </Space>
                                ) : (
                                    'Chưa có đánh giá sàng lọc'
                                )}
                            </Descriptions.Item>
                        </Descriptions>
                    </Space>
                ) : null}
            </Modal>

            <Modal
                title="Gửi offer cho ứng viên"
                open={Boolean(offerCandidate)}
                onCancel={closeOfferModal}
                onOk={() => void handleSubmitOffer()}
                okText="Gửi offer"
                cancelText="Hủy"
                confirmLoading={offerSubmitting}
                destroyOnClose
                width={720}
            >
                {offerCandidate ? (
                    <Space
                        direction="vertical"
                        size={16}
                        style={{ width: '100%' }}
                    >
                        <Card size="small">
                            <Space direction="vertical" size={4}>
                                <Text strong>{offerCandidate.name}</Text>
                                <Text type="secondary">
                                    {offerCandidate.position} •{' '}
                                    {offerCandidate.department}
                                </Text>
                                <Text type="secondary">
                                    Mã hồ sơ: {offerCandidate.applicationCode}
                                </Text>
                            </Space>
                        </Card>

                        <Form form={offerForm} layout="vertical">
                            <Form.Item
                                label="Mức lương đề xuất"
                                name="salary"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Nhập mức lương cho offer.',
                                    },
                                ]}
                            >
                                <InputNumber
                                    min={1}
                                    style={{ width: '100%' }}
                                    placeholder="Ví dụ: 25000000"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Ngày bắt đầu"
                                name="startDate"
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Thời gian thử việc (tháng)"
                                name="probationMonths"
                            >
                                <InputNumber
                                    min={0}
                                    max={24}
                                    style={{ width: '100%' }}
                                    placeholder="Ví dụ: 2"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Địa điểm làm việc"
                                name="workLocation"
                            >
                                <Input placeholder="Nhập địa điểm làm việc" />
                            </Form.Item>

                            <Form.Item label="Phúc lợi" name="benefit">
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Mô tả ngắn các phúc lợi chính của offer."
                                />
                            </Form.Item>

                            <Form.Item label="Ghi chú" name="note">
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Ghi chú thêm cho ứng viên."
                                />
                            </Form.Item>

                            <Form.Item
                                label="Hạn phản hồi offer"
                                name="expiredTime"
                            >
                                <DatePicker
                                    showTime
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY HH:mm"
                                />
                            </Form.Item>
                        </Form>
                    </Space>
                ) : null}
            </Modal>

            <Modal
                title={
                    evaluationCandidate?.latestScreening
                        ? 'Cập nhật đánh giá ứng viên'
                        : 'Đánh giá ứng viên'
                }
                open={Boolean(evaluationCandidate)}
                onCancel={closeEvaluationModal}
                onOk={() => void handleSubmitEvaluation()}
                okText="Lưu đánh giá"
                cancelText="Hủy"
                confirmLoading={submitting}
                destroyOnClose
                width={720}
            >
                {evaluationCandidate ? (
                    <Space
                        direction="vertical"
                        size={16}
                        style={{ width: '100%' }}
                    >
                        <Card size="small">
                            <Space direction="vertical" size={4}>
                                <Text strong>{evaluationCandidate.name}</Text>
                                <Text type="secondary">
                                    {evaluationCandidate.position} •{' '}
                                    {evaluationCandidate.department}
                                </Text>
                                <Text type="secondary">
                                    Mã hồ sơ:{' '}
                                    {evaluationCandidate.applicationCode}
                                </Text>
                            </Space>
                        </Card>

                        <Form form={form} layout="vertical">
                            <Form.Item
                                label="Trạng thái hồ sơ"
                                name="applicationStatus"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Chọn trạng thái hồ sơ cần cập nhật cho ứng viên.',
                                    },
                                ]}
                            >
                                <Select
                                    options={applicationStatusOptions}
                                    placeholder="Chọn trạng thái hồ sơ"
                                />
                            </Form.Item>
                            <Form.Item
                                label="Kết quả sàng lọc"
                                name="result"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Chọn kết quả sàng lọc cho ứng viên.',
                                    },
                                ]}
                            >
                                <Select options={screeningResultOptions} />
                            </Form.Item>

                            <Form.Item label="Điểm đánh giá" name="score">
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    placeholder="Ví dụ: 8.5"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Tóm tắt tiêu chí"
                                name="criteriaSummary"
                            >
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Tóm tắt ngắn các tiêu chí đạt hoặc chưa đạt."
                                />
                            </Form.Item>

                            <Form.Item label="Nhận xét" name="comment">
                                <Input.TextArea
                                    rows={4}
                                    placeholder="Nhập nhận xét chi tiết cho hồ sơ ứng viên."
                                />
                            </Form.Item>
                        </Form>
                    </Space>
                ) : null}
            </Modal>
        </div>
    )
}

export default EmployerManageCandidatePage
