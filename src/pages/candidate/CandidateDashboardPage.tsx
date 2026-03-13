import { useMemo } from 'react'

import {
    Button,
    Card,
    Col,
    List,
    Progress,
    Row,
    Space,
    Statistic,
    Tag,
    Typography,
} from 'antd'

import {
    BellOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    FileSearchOutlined,
    FileTextOutlined,
    RightOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'

import {
    CandidateApplicationStatus,
    candidateAnnouncements,
    candidateApplications,
    candidateJobs,
    candidateProfile,
} from '@/mock/candidateData'
import { PATHS } from '@/routers/path'

const { Paragraph, Text, Title } = Typography

const statusMeta: Record<
    CandidateApplicationStatus,
    { label: string; color: string; percent: number; icon: React.ReactNode }
> = {
    pending: {
        label: 'Tiếp nhận',
        color: 'default',
        percent: 25,
        icon: <ClockCircleOutlined />,
    },
    reviewing: {
        label: 'Đang xét duyệt',
        color: 'processing',
        percent: 50,
        icon: <FileTextOutlined />,
    },
    interview: {
        label: 'Mời phỏng vấn',
        color: 'warning',
        percent: 80,
        icon: <CalendarOutlined />,
    },
    accepted: {
        label: 'Đã trúng tuyển',
        color: 'success',
        percent: 100,
        icon: <CheckCircleOutlined />,
    },
    rejected: {
        label: 'Không đạt',
        color: 'error',
        percent: 100,
        icon: <BellOutlined />,
    },
    supplement: {
        label: 'Cần bổ sung hồ sơ',
        color: 'gold',
        percent: 60,
        icon: <BellOutlined />,
    },
}

const CandidateDashboardPage = () => {
    const stats = useMemo(
        () => [
            {
                key: 'matched',
                title: 'Vị trí phù hợp',
                value: candidateJobs.length,
                icon: <FileSearchOutlined />,
            },
            {
                key: 'applications',
                title: 'Hồ sơ đã nộp',
                value: candidateApplications.length,
                icon: <FileTextOutlined />,
            },
            {
                key: 'interviews',
                title: 'Sắp phỏng vấn',
                value: candidateApplications.filter(
                    (item) => item.status === 'interview'
                ).length,
                icon: <CalendarOutlined />,
            },
            {
                key: 'alerts',
                title: 'Cần xử lý ngay',
                value: candidateApplications.filter(
                    (item) => item.status === 'supplement'
                ).length,
                icon: <BellOutlined />,
            },
        ],
        []
    )

    return (
        <div className="portal-page">
            <section className="portal-hero">
                <span className="portal-hero__eyebrow">Tổng quan ứng viên</span>
                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} lg={15}>
                        <Title level={2}>
                            Theo dõi hồ sơ và tìm cơ hội phù hợp trong một giao
                            diện thống nhất
                        </Title>
                        <Paragraph style={{ maxWidth: 720, marginBottom: 24 }}>
                            Trang tổng quan được làm lại để gần với design
                            candidate hơn: phần mở đầu đậm nét, nhóm chỉ số rõ
                            ràng và các khu vực hồ sơ, thông báo, cơ hội được
                            sắp xếp mạch lạc trong cùng một nhịp giao diện.
                        </Paragraph>
                        <Space wrap size="middle">
                            <Link to={PATHS.CANDIDATE_JOBS}>
                                <Button type="primary" size="large">
                                    Khám phá vị trí
                                </Button>
                            </Link>
                            <Link to={PATHS.CANDIDATE_APPLICATIONS}>
                                <Button size="large">Theo dõi hồ sơ</Button>
                            </Link>
                        </Space>
                    </Col>
                    <Col xs={24} lg={9}>
                        <Card className="portal-section-card">
                            <Space
                                direction="vertical"
                                size={12}
                                style={{ width: '100%' }}
                            >
                                <Text className="portal-muted">
                                    Hồ sơ của bạn
                                </Text>
                                <Title level={4} style={{ margin: 0 }}>
                                    {candidateProfile.fullName}
                                </Title>
                                <Text>{candidateProfile.experience}</Text>
                                <div className="portal-chip-row">
                                    {candidateProfile.strengths.map((skill) => (
                                        <Tag
                                            key={skill}
                                            className="portal-tag-soft"
                                        >
                                            {skill}
                                        </Tag>
                                    ))}
                                </div>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </section>

            <div className="portal-summary-strip">
                {stats.map((item) => (
                    <Card
                        key={item.key}
                        className="portal-section-card portal-stat-card"
                    >
                        <Space
                            direction="vertical"
                            size={16}
                            style={{ width: '100%' }}
                        >
                            <div className="portal-stat-card__icon">
                                {item.icon}
                            </div>
                            <Statistic
                                title={item.title}
                                value={item.value}
                                valueStyle={{ color: '#102117' }}
                            />
                        </Space>
                    </Card>
                ))}
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} xl={15}>
                    <Card
                        title="Tiến độ các hồ sơ gần đây"
                        className="portal-section-card"
                    >
                        <List
                            dataSource={candidateApplications}
                            renderItem={(item) => {
                                const meta = statusMeta[item.status]

                                return (
                                    <List.Item>
                                        <div style={{ width: '100%' }}>
                                            <div className="portal-split">
                                                <div>
                                                    <Title
                                                        level={5}
                                                        style={{
                                                            marginBottom: 4,
                                                        }}
                                                    >
                                                        {item.title}
                                                    </Title>
                                                    <Text className="portal-muted">
                                                        {item.department}
                                                    </Text>
                                                </div>
                                                <Tag color={meta.color}>
                                                    {meta.label}
                                                </Tag>
                                            </div>
                                            <Paragraph
                                                className="portal-muted"
                                                style={{ marginTop: 12 }}
                                            >
                                                {item.note}
                                            </Paragraph>
                                            <Progress
                                                percent={meta.percent}
                                                strokeColor="#0B3D2E"
                                                showInfo={false}
                                            />
                                            <Space
                                                style={{
                                                    width: '100%',
                                                    justifyContent:
                                                        'space-between',
                                                    marginTop: 8,
                                                }}
                                            >
                                                <Text className="portal-muted">
                                                    Nộp ngày{' '}
                                                    {dayjs(
                                                        item.submittedDate
                                                    ).format('DD/MM/YYYY')}
                                                </Text>
                                                <Text strong>{meta.label}</Text>
                                            </Space>
                                        </div>
                                    </List.Item>
                                )
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={24} xl={9}>
                    <Space
                        direction="vertical"
                        size={24}
                        style={{ width: '100%' }}
                    >
                        <Card
                            title="Thông báo từ hệ thống"
                            className="portal-section-card"
                        >
                            <List
                                dataSource={candidateAnnouncements}
                                renderItem={(item) => (
                                    <List.Item>
                                        <div>
                                            <Text strong>{item.title}</Text>
                                            <Paragraph
                                                className="portal-muted"
                                                style={{ margin: '8px 0' }}
                                            >
                                                {item.description}
                                            </Paragraph>
                                            <Text className="portal-muted">
                                                {dayjs(item.createdAt).format(
                                                    'DD/MM/YYYY'
                                                )}
                                            </Text>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </Card>

                        <Card
                            title="Cơ hội nổi bật"
                            extra={
                                <Link to={PATHS.CANDIDATE_JOBS}>
                                    Xem tất cả
                                </Link>
                            }
                            className="portal-section-card"
                        >
                            <List
                                dataSource={candidateJobs.slice(0, 3)}
                                renderItem={(item) => (
                                    <List.Item>
                                        <div style={{ width: '100%' }}>
                                            <Space
                                                style={{
                                                    width: '100%',
                                                    justifyContent:
                                                        'space-between',
                                                }}
                                            >
                                                <div>
                                                    <Text strong>
                                                        {item.title}
                                                    </Text>
                                                    <div>
                                                        <Text className="portal-muted">
                                                            {item.department}
                                                        </Text>
                                                    </div>
                                                </div>
                                                <Tag color="green">
                                                    {item.matchScore}% phù hợp
                                                </Tag>
                                            </Space>
                                            <Link to={PATHS.CANDIDATE_JOBS}>
                                                <Button
                                                    type="link"
                                                    style={{ paddingInline: 0 }}
                                                    icon={<RightOutlined />}
                                                    iconPosition="end"
                                                >
                                                    Xem chi tiết
                                                </Button>
                                            </Link>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Space>
                </Col>
            </Row>
        </div>
    )
}

export default CandidateDashboardPage
