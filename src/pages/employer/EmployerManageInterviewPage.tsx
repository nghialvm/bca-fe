import { useMemo, useState } from 'react'

import {
    Button,
    Card,
    Col,
    Empty,
    List,
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
    PlusOutlined,
    TeamOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import { useEmployerWorkspace } from '@/hooks/useEmployerWorkspace'
import {
    getInterviewStatusColor,
    getInterviewStatusLabel,
    getInterviewTypeLabel,
} from '@/utils/employer'

const { Paragraph, Text, Title } = Typography

type InterviewRow = {
    id: string
    candidateName: string
    position: string
    scheduledTime: string
    interviewer: string
    interviewType: string | number
    status: string | number
    note?: string | null
    location?: string | null
    meetingLink?: string | null
}

const EmployerManageInterviewPage = () => {
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
    const { applicationRows, interviews, loading } = useEmployerWorkspace()

    const interviewRows = useMemo<InterviewRow[]>(
        () =>
            interviews
                .map((item) => {
                    const applicationRow = applicationRows.find(
                        (row) => row.application.id === item.applicationId
                    )

                    return {
                        id: item.id,
                        candidateName:
                            applicationRow?.candidate?.fullName || 'Ứng viên',
                        position:
                            applicationRow?.recruitmentRequest?.title ||
                            applicationRow?.jobPosition?.name ||
                            '-',
                        scheduledTime: item.scheduledTime,
                        interviewer:
                            item.contactPerson || 'Chưa cập nhật người phụ trách',
                        interviewType: item.interviewType,
                        status: item.status,
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
        [applicationRows, interviews]
    )

    const grouped = useMemo(
        () => ({
            upcoming: interviewRows.filter((item) =>
                ['1', '2', '3', 'pending', 'confirmed', 'rescheduled'].includes(
                    String(item.status).toLowerCase()
                )
            ),
            completed: interviewRows.filter((item) =>
                ['5', 'completed'].includes(String(item.status).toLowerCase())
            ),
        }),
        [interviewRows]
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
                        <Paragraph style={{ maxWidth: 760 }}>
                            Trang này lấy dữ liệu trực tiếp từ API lịch phỏng
                            vấn để recruiter theo dõi ứng viên, thời gian, hình
                            thức và trạng thái của từng buổi phỏng vấn.
                        </Paragraph>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            notification.info({
                                message: 'Chức năng đang được cập nhật',
                                description:
                                    'Tính năng lên lịch phỏng vấn trực tiếp sẽ được bổ sung ở bước tiếp theo.',
                            })
                        }}
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
                            title={`Sắp tới (${grouped.upcoming.length})`}
                            className="portal-section-card"
                        >
                            {loading ? (
                                <Typography.Paragraph>
                                    Đang tải dữ liệu lịch phỏng vấn...
                                </Typography.Paragraph>
                            ) : grouped.upcoming.length ? (
                                <List
                                    dataSource={grouped.upcoming}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <Space
                                                direction="vertical"
                                                size={12}
                                                style={{ width: '100%' }}
                                            >
                                                <Space
                                                    style={{
                                                        width: '100%',
                                                        justifyContent:
                                                            'space-between',
                                                    }}
                                                    align="start"
                                                >
                                                    <div>
                                                        <Title
                                                            level={5}
                                                            style={{
                                                                marginBottom: 4,
                                                            }}
                                                        >
                                                            {item.candidateName}
                                                        </Title>
                                                        <Text className="portal-muted">
                                                            {item.position}
                                                        </Text>
                                                    </div>
                                                    <Tag
                                                        color={getInterviewStatusColor(
                                                            item.status
                                                        )}
                                                    >
                                                        {getInterviewStatusLabel(
                                                            item.status
                                                        )}
                                                    </Tag>
                                                </Space>
                                                <Row gutter={[12, 12]}>
                                                    <Col xs={24} md={12}>
                                                        <Text>
                                                            <CalendarOutlined />{' '}
                                                            {dayjs(
                                                                item.scheduledTime
                                                            ).format(
                                                                'DD/MM/YYYY'
                                                            )}
                                                        </Text>
                                                    </Col>
                                                    <Col xs={24} md={12}>
                                                        <Text>
                                                            <ClockCircleOutlined />{' '}
                                                            {dayjs(
                                                                item.scheduledTime
                                                            ).format('HH:mm')}
                                                        </Text>
                                                    </Col>
                                                    <Col xs={24} md={12}>
                                                        <Text>
                                                            <VideoCameraOutlined />{' '}
                                                            {getInterviewTypeLabel(
                                                                item.interviewType
                                                            )}
                                                        </Text>
                                                    </Col>
                                                    <Col xs={24} md={12}>
                                                        <Text>
                                                            <TeamOutlined />{' '}
                                                            {item.interviewer}
                                                        </Text>
                                                    </Col>
                                                </Row>
                                                {item.location ? (
                                                    <Text className="portal-muted">
                                                        Địa điểm: {item.location}
                                                    </Text>
                                                ) : null}
                                                {item.meetingLink ? (
                                                    <Text className="portal-muted">
                                                        Link họp:{' '}
                                                        {item.meetingLink}
                                                    </Text>
                                                ) : null}
                                                {item.note ? (
                                                    <Card size="small">
                                                        <Text className="portal-muted">
                                                            {item.note}
                                                        </Text>
                                                    </Card>
                                                ) : null}
                                            </Space>
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Empty description="Chưa có lịch phỏng vấn sắp tới" />
                            )}
                        </Card>
                    </Col>

                    <Col xs={24} xl={10}>
                        <Card
                            title={`Đã hoàn thành (${grouped.completed.length})`}
                            className="portal-section-card"
                        >
                            {loading ? (
                                <Typography.Paragraph>
                                    Đang tải dữ liệu lịch phỏng vấn...
                                </Typography.Paragraph>
                            ) : grouped.completed.length ? (
                                <List
                                    dataSource={grouped.completed}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <Space
                                                direction="vertical"
                                                size={8}
                                                style={{ width: '100%' }}
                                            >
                                                <div className="portal-split">
                                                    <div>
                                                        <Text strong>
                                                            {item.candidateName}
                                                        </Text>
                                                        <div>
                                                            <Text className="portal-muted">
                                                                {item.position}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                    <Tag color="green">
                                                        Hoàn thành
                                                    </Tag>
                                                </div>
                                                <Text className="portal-muted">
                                                    {dayjs(
                                                        item.scheduledTime
                                                    ).format('DD/MM/YYYY HH:mm')}
                                                </Text>
                                                <Text>{item.note || '-'}</Text>
                                            </Space>
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Empty description="Chưa có lịch phỏng vấn hoàn thành" />
                            )}
                        </Card>
                    </Col>
                </Row>
            ) : (
                <Card className="portal-section-card portal-empty">
                    <Space direction="vertical" size={16}>
                        <CalendarOutlined
                            style={{ fontSize: 48, color: '#0B3D2E' }}
                        />
                        <Title level={4} style={{ marginBottom: 0 }}>
                            Chế độ xem lịch
                        </Title>
                        <Text className="portal-muted">
                            Dữ liệu phỏng vấn đã được lấy từ API. Chế độ hiển thị
                            dạng lịch chi tiết sẽ được bổ sung ở bước tiếp theo.
                        </Text>
                    </Space>
                </Card>
            )}
        </div>
    )
}

export default EmployerManageInterviewPage
