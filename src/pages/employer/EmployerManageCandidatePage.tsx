import { useMemo, useState } from 'react'

import {
    Button,
    Card,
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
import dayjs from 'dayjs'

import {
    FileTextOutlined,
    FilterOutlined,
    MailOutlined,
    PhoneOutlined,
    SearchOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useSelector } from 'react-redux'

import { useEmployerWorkspace } from '@/hooks/useEmployerWorkspace'
import type {
    ApplicationDto,
    ApplicationScreeningCreateDto,
    ApplicationScreeningDto,
    ApplicationScreeningUpdateDto,
    CandidateDto,
} from '@/services/admin'
import AdminService from '@/services/admin'
import {
    formatDisplayDate,
    formatDisplayDateTime,
    getApplicationStatusColor,
    getApplicationStatusLabel,
} from '@/utils/admin'

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
}

type EvaluationFormValues = {
    result: number
    score?: number
    criteriaSummary?: string
    comment?: string
}

const screeningResultOptions = [
    { label: 'Đạt sàng lọc', value: 1 },
    { label: 'Không đạt', value: 2 },
]

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

const getErrorMessage = (error: unknown) => {
    const message =
        (error as {
            response?: {
                data?: {
                    error?: {
                        message?: string
                    }
                    message?: string
                }
            }
            message?: string
        })?.response?.data?.error?.message ||
        (error as {
            response?: {
                data?: {
                    message?: string
                }
            }
            message?: string
        })?.response?.data?.message ||
        (error as { message?: string })?.message

    return message || 'Vui lòng kiểm tra lại quyền truy cập hoặc dữ liệu đầu vào.'
}

const EmployerManageCandidatePage = () => {
    const currentUser = useSelector((state: RootState) => state.auth.user)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<string | 'all'>('all')
    const [profileCandidate, setProfileCandidate] =
        useState<EmployerCandidateRow | null>(null)
    const [evaluationCandidate, setEvaluationCandidate] =
        useState<EmployerCandidateRow | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [form] = Form.useForm<EvaluationFormValues>()
    const { applicationRows, applicationScreenings, loading, reload } =
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

    const candidateRows = useMemo<EmployerCandidateRow[]>(
        () =>
            applicationRows.map((row) => ({
                id: `${row.application.id}-${row.candidate?.id || 'candidate'}`,
                applicationId: row.application.id,
                applicationCode: row.application.applicationCode,
                name: row.candidate?.fullName || 'Ứng viên',
                email: row.candidate?.email || '-',
                phone: row.candidate?.phoneNumber || '-',
                position: row.recruitmentRequest?.title || row.jobPosition?.name || '-',
                department: row.department?.name || '-',
                status: row.application.status,
                appliedTime: row.application.appliedTime,
                currentPosition: row.candidate?.currentPosition || '-',
                candidate: row.candidate,
                application: row.application,
                latestScreening: latestScreeningByApplicationId.get(
                    row.application.id
                ),
            })),
        [applicationRows, latestScreeningByApplicationId]
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
                ).values(),
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

            notification.error({
                message: 'Không lưu được đánh giá ứng viên',
                description: getErrorMessage(error),
            })
        } finally {
            setSubmitting(false)
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
                        {candidate.latestScreening ? 'Đánh giá lại' : 'Đánh giá'}
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
                    Danh sách ứng viên được đồng bộ từ hồ sơ ứng tuyển thực tế. Nhà
                    tuyển dụng có thể mở hồ sơ chi tiết, xem CV đã nộp và ghi nhận
                    kết quả sàng lọc ngay tại đây.
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
                    <Button key="close" onClick={() => setProfileCandidate(null)}>
                        Đóng
                    </Button>,
                ]}
                width={820}
            >
                {profileCandidate ? (
                    <Space direction="vertical" size={20} style={{ width: '100%' }}>
                        <div>
                            <Title level={4} style={{ marginBottom: 4 }}>
                                {profileCandidate.name}
                            </Title>
                            <Space wrap size={[8, 8]}>
                                <Tag color={getApplicationStatusColor(profileCandidate.status)}>
                                    {getApplicationStatusLabel(profileCandidate.status)}
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
                                {getGenderLabel(profileCandidate.candidate?.gender)}
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
                                {profileCandidate.candidate?.yearsOfExperience ??
                                    '-'}
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
                                {getTextValue(profileCandidate.candidate?.address)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày nộp hồ sơ">
                                {formatDisplayDateTime(profileCandidate.appliedTime)}
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
                                        href={profileCandidate.application.submittedCvUrl}
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
                                {getTextValue(profileCandidate.application.note)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Đánh giá gần nhất">
                                {profileCandidate.latestScreening ? (
                                    <Space direction="vertical" size={4}>
                                        <Tag
                                            color={getScreeningResultColor(
                                                profileCandidate.latestScreening.result
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
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                        <Card size="small">
                            <Space direction="vertical" size={4}>
                                <Text strong>{evaluationCandidate.name}</Text>
                                <Text type="secondary">
                                    {evaluationCandidate.position} •{' '}
                                    {evaluationCandidate.department}
                                </Text>
                                <Text type="secondary">
                                    Mã hồ sơ: {evaluationCandidate.applicationCode}
                                </Text>
                            </Space>
                        </Card>

                        <Form form={form} layout="vertical">
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
