import { useMemo } from 'react'

import {
    Button,
    Card,
    Col,
    Empty,
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
    FileSearchOutlined,
    FileTextOutlined,
    RightOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'

import { useCandidateWorkspace } from '@/hooks/useCandidateWorkspace'
import { PATHS } from '@/routers/path'
import {
    getApplicationStatusColor,
    getApplicationStatusLabel,
} from '@/utils/admin'
import {
    getCandidateApplicationProgress,
    getCandidateProfileStrengths,
    isCandidateActionRequired,
    isCandidateInterviewStage,
} from '@/utils/candidate'

const { Paragraph, Text, Title } = Typography

const CandidateDashboardPage = () => {
    const { profile, jobs, applications, loading } = useCandidateWorkspace()

    const strengths = useMemo(
        () => getCandidateProfileStrengths(profile).slice(0, 5),
        [profile]
    )

    const stats = useMemo(
        () => [
            {
                key: 'jobs',
                title: 'Vị trí đang mở',
                value: jobs.length,
                icon: <FileSearchOutlined />,
            },
            {
                key: 'applications',
                title: 'Hồ sơ đã nộp',
                value: applications.length,
                icon: <FileTextOutlined />,
            },
            {
                key: 'interviews',
                title: 'Đang ở vòng phỏng vấn',
                value: applications.filter((item) =>
                    isCandidateInterviewStage(item.status)
                ).length,
                icon: <CalendarOutlined />,
            },
            {
                key: 'actions',
                title: 'Cần xử lý ngay',
                value: applications.filter((item) =>
                    isCandidateActionRequired(item.status)
                ).length,
                icon: <BellOutlined />,
            },
        ],
        [applications, jobs.length]
    )

    const announcements = useMemo(() => {
        const items: Array<{ id: string; title: string; description: string }> =
            []

        const interviewItems = applications.filter((item) =>
            isCandidateInterviewStage(item.status)
        )
        if (interviewItems.length) {
            items.push({
                id: 'interview',
                title: 'Bạn đang có hồ sơ ở vòng phỏng vấn',
                description:
                    'Theo dõi lịch hẹn và chuẩn bị thông tin cần thiết trong từng hồ sơ để không bỏ lỡ tiến độ.',
            })
        }

        const actionItems = applications.filter((item) =>
            isCandidateActionRequired(item.status)
        )
        if (actionItems.length) {
            items.push({
                id: 'action',
                title: 'Có hồ sơ đang chờ bạn phản hồi',
                description:
                    'Một số hồ sơ đang cần bạn xác nhận lịch phỏng vấn hoặc phản hồi offer.',
            })
        }

        if (!items.length) {
            items.push({
                id: 'welcome',
                title: 'Mọi thông tin của bạn đã sẵn sàng',
                description:
                    'Bạn có thể theo dõi hồ sơ cá nhân, quá trình ứng tuyển và các vị trí phù hợp ngay tại đây.',
            })
        }

        if (profile?.note) {
            items.push({
                id: 'profile-note',
                title: 'Ghi chú hồ sơ',
                description: profile.note,
            })
        }

        return items.slice(0, 3)
    }, [applications, profile?.note])

    const recentApplications = applications.slice(0, 3)
    const highlightedJobs = jobs.slice(0, 3)

    return (
        <div className="portal-page">
            <section className="portal-hero">
                <span className="portal-hero__eyebrow">Tổng quan ứng viên</span>
                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} lg={15}>
                        <Title level={2}>
                            Theo dõi hồ sơ và tìm cơ hội phù hợp trong một nơi
                        </Title>
                        <Paragraph
                            style={{
                                maxWidth: 720,
                                marginBottom: 24,
                                color: '#fff',
                            }}
                        >
                            Nhanh chóng xem lại hồ sơ cá nhân, tiến độ ứng tuyển
                            gần đây và những vị trí đang mở phù hợp với bạn.
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
                        <Card className="portal-section-card" loading={loading}>
                            {profile ? (
                                <Space
                                    direction="vertical"
                                    size={12}
                                    style={{ width: '100%' }}
                                >
                                    <Text className="portal-muted">
                                        Hồ sơ của bạn
                                    </Text>
                                    <Title level={4} style={{ margin: 0 }}>
                                        {profile.fullName}
                                    </Title>
                                    <Text>
                                        {profile.currentPosition ||
                                            profile.major ||
                                            'Chưa cập nhật vị trí hiện tại'}
                                    </Text>
                                    <div className="portal-chip-row">
                                        {strengths.length ? (
                                            strengths.map((item) => (
                                                <Tag
                                                    key={item}
                                                    className="portal-tag-soft"
                                                >
                                                    {item}
                                                </Tag>
                                            ))
                                        ) : (
                                            <Text className="portal-muted">
                                                Chưa có điểm nhấn hồ sơ.
                                            </Text>
                                        )}
                                    </div>
                                </Space>
                            ) : (
                                <Empty description="Chưa tìm thấy hồ sơ ứng viên" />
                            )}
                        </Card>
                    </Col>
                </Row>
            </section>

            <div className="portal-summary-strip">
                {stats.map((item) => (
                    <Card
                        key={item.key}
                        className="portal-section-card portal-stat-card"
                        loading={loading}
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
                            loading={loading}
                            dataSource={recentApplications}
                            locale={{
                                emptyText: 'Bạn chưa có hồ sơ ứng tuyển nào.',
                            }}
                            renderItem={(item) => {
                                const label = getApplicationStatusLabel(
                                    item.status
                                )
                                const color = getApplicationStatusColor(
                                    item.status
                                )

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
                                                        {item.departmentName}
                                                    </Text>
                                                </div>
                                                <Tag color={color}>{label}</Tag>
                                            </div>
                                            <Paragraph
                                                className="portal-muted"
                                                style={{ marginTop: 12 }}
                                            >
                                                {item.note ||
                                                    `${item.jobPositionName || 'Vị trí'} tại ${item.workLocation || 'BCA'}.`}
                                            </Paragraph>
                                            <Progress
                                                percent={getCandidateApplicationProgress(
                                                    item.status
                                                )}
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
                                                        item.appliedTime
                                                    ).format('DD/MM/YYYY')}
                                                </Text>
                                                <Text strong>{label}</Text>
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
                        <Card title="Thông báo" className="portal-section-card">
                            <List
                                loading={loading}
                                dataSource={announcements}
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
                                loading={loading}
                                dataSource={highlightedJobs}
                                locale={{
                                    emptyText: 'Chưa có vị trí đang mở.',
                                }}
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
                                                            {
                                                                item.departmentName
                                                            }
                                                        </Text>
                                                    </div>
                                                </div>
                                                <Tag
                                                    color={
                                                        item.hasApplied
                                                            ? 'blue'
                                                            : 'green'
                                                    }
                                                >
                                                    {item.hasApplied
                                                        ? 'Đã ứng tuyển'
                                                        : 'Đang mở'}
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
