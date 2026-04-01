import { useMemo, useState } from 'react'

import {
    Button,
    Card,
    Col,
    Empty,
    Form,
    Modal,
    Radio,
    Row,
    Space,
    Tag,
    Typography,
    notification,
} from 'antd'

import {
    CalendarOutlined,
    ClockCircleOutlined,
    EditOutlined,
    EyeOutlined,
    PlusOutlined,
    TeamOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'

import {
    buildInterviewSchedulePayload,
    createInterviewInitialValues,
    InterviewScheduleFormFields,
    type InterviewFormValues,
} from '@/components/modals/interviewScheduleForm.shared'
import { useEmployerWorkspace } from '@/hooks/useEmployerWorkspace'
import type {
    ApplicationDto,
    CandidateDto,
    InterviewScheduleDto,
    InterviewScheduleUpdateDto,
} from '@/services/admin'
import AdminService from '@/services/admin'
import { formatDisplayDateTime, getApplicationStatusLabel } from '@/utils/admin'
import {
    getInterviewStatusColor,
    getInterviewStatusLabel,
    getInterviewTypeLabel,
} from '@/utils/employer'

const { Paragraph, Text, Title } = Typography

type RootState = {
    auth: {
        user?: {
            id?: string
        } | null
    }
}

type InterviewRow = {
    id: string
    interview: InterviewScheduleDto
    application: ApplicationDto
    candidate?: CandidateDto
    candidateName: string
    position: string
    department: string
    applicationCode: string
    applicationStatus: string | number
    scheduledTime: string
    interviewer: string
    interviewType: string | number
    status: string | number
    roundNumber: number
    durationMinutes: number
    note?: string | null
    location?: string | null
    meetingLink?: string | null
}

const isUpcomingInterview = (status: string | number) =>
    ['1', '2', '3', 'pending', 'confirmed', 'rescheduled'].includes(
        String(status).toLowerCase()
    )

const isCompletedInterview = (status: string | number) =>
    ['5', 'completed'].includes(String(status).toLowerCase())

const getTextValue = (value?: string | null) => value?.trim() || '-'

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

const EmployerManageInterviewPage = () => {
    const currentUser = useSelector((state: RootState) => state.auth.user)
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
    const [detailInterview, setDetailInterview] = useState<InterviewRow | null>(
        null
    )
    const [editingInterview, setEditingInterview] =
        useState<InterviewRow | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [form] = Form.useForm<InterviewFormValues>()
    const { applicationRows, interviews, loading, reload } =
        useEmployerWorkspace()

    const applicationMap = useMemo(
        () => new Map(applicationRows.map((row) => [row.application.id, row])),
        [applicationRows]
    )

    const interviewRows = useMemo<InterviewRow[]>(
        () =>
            interviews
                .map((item) => {
                    const applicationRow = applicationMap.get(
                        item.applicationId
                    )

                    return {
                        id: item.id,
                        interview: item,
                        application: applicationRow?.application || {
                            id: item.applicationId,
                            applicationCode: '-',
                            recruitmentRequestId: '',
                            candidateId: '',
                            appliedTime: '',
                            status: '-',
                        },
                        candidate: applicationRow?.candidate,
                        candidateName:
                            applicationRow?.candidate?.fullName || 'Ứng viên',
                        position:
                            applicationRow?.recruitmentRequest?.title ||
                            applicationRow?.jobPosition?.name ||
                            '-',
                        department: applicationRow?.department?.name || '-',
                        applicationCode:
                            applicationRow?.application?.applicationCode || '-',
                        applicationStatus:
                            applicationRow?.application?.status || '-',
                        scheduledTime: item.scheduledTime,
                        interviewer:
                            item.contactPerson ||
                            'Chưa cập nhật người phụ trách',
                        interviewType: item.interviewType,
                        status: item.status,
                        roundNumber: item.roundNumber,
                        durationMinutes: item.durationMinutes,
                        note: item.note,
                        location: item.location,
                        meetingLink: item.meetingLink,
                    }
                })
                .sort(
                    (left, right) =>
                        dayjs(left.scheduledTime).valueOf() -
                        dayjs(right.scheduledTime).valueOf()
                ),
        [applicationMap, interviews]
    )

    const upcomingInterviews = useMemo(
        () => interviewRows.filter((item) => isUpcomingInterview(item.status)),
        [interviewRows]
    )

    const completedInterviews = useMemo(
        () => interviewRows.filter((item) => isCompletedInterview(item.status)),
        [interviewRows]
    )

    const applicationOptions = useMemo(
        () =>
            applicationRows
                .map((row) => ({
                    label: `${row.candidate?.fullName || 'Ứng viên'} • ${
                        row.recruitmentRequest?.title ||
                        row.jobPosition?.name ||
                        '-'
                    } • ${row.application.applicationCode}`,
                    value: row.application.id,
                }))
                .sort((left, right) =>
                    left.label.localeCompare(right.label, 'vi')
                ),
        [applicationRows]
    )

    const openCreateModal = () => {
        form.resetFields()
        form.setFieldsValue(
            createInterviewInitialValues({
                applicationId: applicationRows[0]?.application.id,
            })
        )
        setFormMode('create')
        setEditingInterview(null)
        setModalOpen(true)
    }

    const openEditModal = (row: InterviewRow) => {
        form.resetFields()
        form.setFieldsValue(
            createInterviewInitialValues({
                applicationId: row.application.id,
                roundNumber: row.roundNumber,
                interviewType: Number(row.interviewType),
                scheduledTime: dayjs(row.scheduledTime),
                durationMinutes: row.durationMinutes,
                status: Number(row.status),
                contactPerson: row.interviewer,
                location: row.location || '',
                meetingLink: row.meetingLink || '',
                note: row.note || '',
            })
        )
        setFormMode('edit')
        setEditingInterview(row)
        setModalOpen(true)
    }

    const closeFormModal = () => {
        setModalOpen(false)
        setEditingInterview(null)
        form.resetFields()
    }

    const handleSubmit = async () => {
        if (!currentUser?.id) {
            notification.error({
                message: 'Không xác định được người thao tác',
                description:
                    'Phiên đăng nhập hiện tại không có thông tin người dùng để tạo hoặc cập nhật lịch phỏng vấn.',
            })
            return
        }

        try {
            const values = await form.validateFields()
            const payload = buildInterviewSchedulePayload(
                values as InterviewFormValues & { applicationId: string },
                currentUser.id
            )

            setSubmitting(true)

            if (formMode === 'edit' && editingInterview) {
                const updatePayload: InterviewScheduleUpdateDto = { ...payload }

                await AdminService.updateInterviewSchedule(
                    editingInterview.id,
                    updatePayload
                )
            } else {
                await AdminService.createInterviewSchedule(payload)
            }

            notification.success({
                message:
                    formMode === 'edit'
                        ? 'Đã cập nhật lịch phỏng vấn'
                        : 'Đã tạo lịch phỏng vấn',
            })

            closeFormModal()
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
                message:
                    formMode === 'edit'
                        ? 'Không cập nhật được lịch phỏng vấn'
                        : 'Không tạo được lịch phỏng vấn',
                description: getErrorMessage(error),
            })
        } finally {
            setSubmitting(false)
        }
    }

    const renderInterviewCard = (item: InterviewRow) => (
        <Card key={item.id} size="small">
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    align="start"
                    wrap
                >
                    <div>
                        <Title level={5} style={{ marginBottom: 4 }}>
                            {item.candidateName}
                        </Title>
                        <Text className="portal-muted">
                            {item.position} • {item.department}
                        </Text>
                    </div>
                    <Space wrap size={[8, 8]}>
                        <Tag color={getInterviewStatusColor(item.status)}>
                            {getInterviewStatusLabel(item.status)}
                        </Tag>
                        <Tag>Vòng {item.roundNumber}</Tag>
                    </Space>
                </Space>

                <Row gutter={[12, 12]}>
                    <Col xs={24} md={12}>
                        <Text>
                            <CalendarOutlined />{' '}
                            {dayjs(item.scheduledTime).format('DD/MM/YYYY')}
                        </Text>
                    </Col>
                    <Col xs={24} md={12}>
                        <Text>
                            <ClockCircleOutlined />{' '}
                            {dayjs(item.scheduledTime).format('HH:mm')}
                        </Text>
                    </Col>
                    <Col xs={24} md={12}>
                        <Text>
                            <VideoCameraOutlined />{' '}
                            {getInterviewTypeLabel(item.interviewType)}
                        </Text>
                    </Col>
                    <Col xs={24} md={12}>
                        <Text>
                            <TeamOutlined /> {item.interviewer}
                        </Text>
                    </Col>
                </Row>

                <Space wrap size={[8, 8]}>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => setDetailInterview(item)}
                    >
                        Chi tiết
                    </Button>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => openEditModal(item)}
                    >
                        Chỉnh sửa
                    </Button>
                </Space>
            </Space>
        </Card>
    )

    return (
        <div className="portal-page">
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Phỏng vấn</span>
                <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    align="start"
                    wrap
                >
                    <div>
                        <Title level={2}>Quản lý lịch phỏng vấn</Title>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={openCreateModal}
                        disabled={!applicationRows.length}
                    >
                        Lên lịch phỏng vấn
                    </Button>
                </Space>
            </section>

            <Radio.Group
                value={viewMode}
                onChange={(event) => setViewMode(event.target.value)}
                optionType="button"
                buttonStyle="solid"
                options={[
                    { label: 'Danh sách', value: 'list' },
                    { label: 'Lịch', value: 'calendar' },
                ]}
            />

            {viewMode === 'list' ? (
                <Row gutter={[24, 24]}>
                    <Col xs={24} xl={14}>
                        <Card
                            title={`Sắp tới (${upcomingInterviews.length})`}
                            className="portal-section-card"
                        >
                            {loading ? (
                                <Typography.Paragraph>
                                    Đang tải dữ liệu lịch phỏng vấn...
                                </Typography.Paragraph>
                            ) : upcomingInterviews.length ? (
                                <Space
                                    direction="vertical"
                                    size={16}
                                    style={{ width: '100%' }}
                                >
                                    {upcomingInterviews.map(
                                        renderInterviewCard
                                    )}
                                </Space>
                            ) : (
                                <Empty description="Chưa có lịch phỏng vấn sắp tới" />
                            )}
                        </Card>
                    </Col>

                    <Col xs={24} xl={10}>
                        <Card
                            title={`Đã hoàn thành (${completedInterviews.length})`}
                            className="portal-section-card"
                        >
                            {loading ? (
                                <Typography.Paragraph>
                                    Đang tải dữ liệu lịch phỏng vấn...
                                </Typography.Paragraph>
                            ) : completedInterviews.length ? (
                                <Space
                                    direction="vertical"
                                    size={16}
                                    style={{ width: '100%' }}
                                >
                                    {completedInterviews.map(
                                        renderInterviewCard
                                    )}
                                </Space>
                            ) : (
                                <Empty description="Chưa có lịch phỏng vấn hoàn thành" />
                            )}
                        </Card>
                    </Col>
                </Row>
            ) : (
                <Card className="portal-section-card">
                    {interviewRows.length ? (
                        <Space
                            direction="vertical"
                            size={16}
                            style={{ width: '100%' }}
                        >
                            {interviewRows.map((item) => (
                                <Card key={item.id} size="small">
                                    <Row gutter={[16, 16]} align="middle">
                                        <Col xs={24} md={8}>
                                            <Text strong>
                                                {item.candidateName}
                                            </Text>
                                            <div className="portal-muted">
                                                {item.position}
                                            </div>
                                        </Col>
                                        <Col xs={24} md={7}>
                                            <Text>
                                                {formatDisplayDateTime(
                                                    item.scheduledTime
                                                )}
                                            </Text>
                                        </Col>
                                        <Col xs={24} md={5}>
                                            <Tag
                                                color={getInterviewStatusColor(
                                                    item.status
                                                )}
                                            >
                                                {getInterviewStatusLabel(
                                                    item.status
                                                )}
                                            </Tag>
                                        </Col>
                                        <Col xs={24} md={4}>
                                            <Space wrap>
                                                <Button
                                                    size="small"
                                                    icon={<EyeOutlined />}
                                                    onClick={() =>
                                                        setDetailInterview(item)
                                                    }
                                                >
                                                    Xem
                                                </Button>
                                                <Button
                                                    size="small"
                                                    type="primary"
                                                    icon={<EditOutlined />}
                                                    onClick={() =>
                                                        openEditModal(item)
                                                    }
                                                >
                                                    Sửa
                                                </Button>
                                            </Space>
                                        </Col>
                                    </Row>
                                </Card>
                            ))}
                        </Space>
                    ) : (
                        <Empty description="Chưa có lịch phỏng vấn nào" />
                    )}
                </Card>
            )}

            <Modal
                title="Chi tiết lịch phỏng vấn"
                open={Boolean(detailInterview)}
                onCancel={() => setDetailInterview(null)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setDetailInterview(null)}
                    >
                        Đóng
                    </Button>,
                    <Button
                        key="edit"
                        type="primary"
                        onClick={() => {
                            if (!detailInterview) return
                            setDetailInterview(null)
                            openEditModal(detailInterview)
                        }}
                    >
                        Chỉnh sửa
                    </Button>,
                ]}
                width={760}
            >
                {detailInterview ? (
                    <Space
                        direction="vertical"
                        size={16}
                        style={{ width: '100%' }}
                    >
                        <div>
                            <Title level={4} style={{ marginBottom: 4 }}>
                                {detailInterview.candidateName}
                            </Title>
                            <Space wrap size={[8, 8]}>
                                <Tag>{detailInterview.applicationCode}</Tag>
                                <Tag
                                    color={getInterviewStatusColor(
                                        detailInterview.status
                                    )}
                                >
                                    {getInterviewStatusLabel(
                                        detailInterview.status
                                    )}
                                </Tag>
                                <Tag>Vòng {detailInterview.roundNumber}</Tag>
                            </Space>
                        </div>
                        <Card size="small">
                            <Space direction="vertical" size={8}>
                                <Text>
                                    Vị trí:{' '}
                                    <Text strong>
                                        {detailInterview.position}
                                    </Text>
                                </Text>
                                <Text>
                                    Phòng ban:{' '}
                                    <Text strong>
                                        {detailInterview.department}
                                    </Text>
                                </Text>
                                <Text>
                                    Trạng thái hồ sơ:{' '}
                                    <Text strong>
                                        {getApplicationStatusLabel(
                                            detailInterview.applicationStatus
                                        )}
                                    </Text>
                                </Text>
                                <Text>
                                    Email ứng viên:{' '}
                                    {getTextValue(
                                        detailInterview.candidate?.email
                                    )}
                                </Text>
                            </Space>
                        </Card>

                        <Card size="small">
                            <Space direction="vertical" size={8}>
                                <Text>
                                    Thời gian:{' '}
                                    <Text strong>
                                        {formatDisplayDateTime(
                                            detailInterview.scheduledTime
                                        )}
                                    </Text>
                                </Text>
                                <Text>
                                    Hình thức:{' '}
                                    <Text strong>
                                        {getInterviewTypeLabel(
                                            detailInterview.interviewType
                                        )}
                                    </Text>
                                </Text>
                                <Text>
                                    Thời lượng:{' '}
                                    <Text strong>
                                        {detailInterview.durationMinutes} phút
                                    </Text>
                                </Text>
                                <Text>
                                    Người phụ trách:{' '}
                                    <Text strong>
                                        {detailInterview.interviewer}
                                    </Text>
                                </Text>
                                <Text>
                                    Địa điểm:{' '}
                                    {getTextValue(detailInterview.location)}
                                </Text>
                                <Text>
                                    Link họp:{' '}
                                    {detailInterview.meetingLink ? (
                                        <a
                                            href={detailInterview.meetingLink}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {detailInterview.meetingLink}
                                        </a>
                                    ) : (
                                        '-'
                                    )}
                                </Text>
                                <Text>
                                    Ghi chú:{' '}
                                    {getTextValue(detailInterview.note)}
                                </Text>
                            </Space>
                        </Card>
                    </Space>
                ) : null}
            </Modal>

            <Modal
                title={
                    formMode === 'edit'
                        ? 'Chỉnh sửa lịch phỏng vấn'
                        : 'Lên lịch phỏng vấn'
                }
                open={modalOpen}
                onCancel={closeFormModal}
                onOk={() => void handleSubmit()}
                okText={formMode === 'edit' ? 'Lưu thay đổi' : 'Tạo lịch'}
                cancelText="Hủy"
                confirmLoading={submitting}
                destroyOnClose
                width={760}
            >
                <Form form={form} layout="vertical">
                    <InterviewScheduleFormFields
                        includeApplication
                        applicationOptions={applicationOptions}
                        mode={formMode}
                    />
                </Form>
            </Modal>
        </div>
    )
}

export default EmployerManageInterviewPage
