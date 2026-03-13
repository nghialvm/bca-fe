import { useMemo, useState } from 'react'

import {
    Button,
    Card,
    Col,
    List,
    Radio,
    Row,
    Space,
    Tag,
    Typography,
} from 'antd'

import {
    CalendarOutlined,
    ClockCircleOutlined,
    PlusOutlined,
    TeamOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import { EmployerInterview, employerInterviews } from '@/mock/employerData'

const { Paragraph, Text, Title } = Typography

const interviewTypeLabel: Record<EmployerInterview['type'], string> = {
    video: 'Video call',
    phone: 'Điện thoại',
    'in-person': 'Trực tiếp',
}

const interviewStatusColor: Record<EmployerInterview['status'], string> = {
    scheduled: 'blue',
    completed: 'green',
    cancelled: 'red',
}

const interviewStatusLabel: Record<EmployerInterview['status'], string> = {
    scheduled: 'Đã lên lịch',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
}

const EmployerManageInterviewPage = () => {
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

    const grouped = useMemo(
        () => ({
            upcoming: employerInterviews.filter(
                (item) => item.status === 'scheduled'
            ),
            completed: employerInterviews.filter(
                (item) => item.status === 'completed'
            ),
        }),
        []
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
                            Màn hình lịch phỏng vấn được đồng bộ về cùng hệ
                            layout và card với admin, đồng thời giữ cách tổ chức
                            nội dung rõ ràng cho recruiter theo từng trạng thái.
                        </Paragraph>
                    </div>
                    <Button type="primary" size="large" icon={<PlusOutlined />}>
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
                                                    color={
                                                        interviewStatusColor[
                                                            item.status
                                                        ]
                                                    }
                                                >
                                                    {
                                                        interviewStatusLabel[
                                                            item.status
                                                        ]
                                                    }
                                                </Tag>
                                            </Space>
                                            <Row gutter={[12, 12]}>
                                                <Col xs={24} md={12}>
                                                    <Text>
                                                        <CalendarOutlined />{' '}
                                                        {dayjs(
                                                            item.date
                                                        ).format('DD/MM/YYYY')}
                                                    </Text>
                                                </Col>
                                                <Col xs={24} md={12}>
                                                    <Text>
                                                        <ClockCircleOutlined />{' '}
                                                        {item.time}
                                                    </Text>
                                                </Col>
                                                <Col xs={24} md={12}>
                                                    <Text>
                                                        <VideoCameraOutlined />{' '}
                                                        {
                                                            interviewTypeLabel[
                                                                item.type
                                                            ]
                                                        }
                                                    </Text>
                                                </Col>
                                                <Col xs={24} md={12}>
                                                    <Text>
                                                        <TeamOutlined />{' '}
                                                        {item.interviewer}
                                                    </Text>
                                                </Col>
                                            </Row>
                                            {item.notes ? (
                                                <Card size="small">
                                                    <Text className="portal-muted">
                                                        {item.notes}
                                                    </Text>
                                                </Card>
                                            ) : null}
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} xl={10}>
                        <Card
                            title={`Đã hoàn thành (${grouped.completed.length})`}
                            className="portal-section-card"
                        >
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
                                                {dayjs(item.date).format(
                                                    'DD/MM/YYYY'
                                                )}{' '}
                                                - {item.time}
                                            </Text>
                                            <Text>{item.notes}</Text>
                                        </Space>
                                    </List.Item>
                                )}
                            />
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
                            Khung lịch chi tiết chưa được mở rộng trong phạm vi
                            chỉnh sửa này, nhưng theme và layout đã sẵn sàng để
                            gắn `Calendar` của Ant Design ở bước tiếp theo.
                        </Text>
                    </Space>
                </Card>
            )}
        </div>
    )
}

export default EmployerManageInterviewPage
