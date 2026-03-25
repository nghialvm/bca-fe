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
import { getApplicationStatusColor, getApplicationStatusLabel } from '@/utils/admin'
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
                title: 'Vi tri dang mo',
                value: jobs.length,
                icon: <FileSearchOutlined />,
            },
            {
                key: 'applications',
                title: 'Ho so da nop',
                value: applications.length,
                icon: <FileTextOutlined />,
            },
            {
                key: 'interviews',
                title: 'Dang o vong phong van',
                value: applications.filter((item) =>
                    isCandidateInterviewStage(item.status)
                ).length,
                icon: <CalendarOutlined />,
            },
            {
                key: 'actions',
                title: 'Can xu ly ngay',
                value: applications.filter((item) =>
                    isCandidateActionRequired(item.status)
                ).length,
                icon: <BellOutlined />,
            },
        ],
        [applications, jobs.length]
    )

    const announcements = useMemo(() => {
        const items: Array<{ id: string; title: string; description: string }> = []

        const interviewItems = applications.filter((item) =>
            isCandidateInterviewStage(item.status)
        )
        if (interviewItems.length) {
            items.push({
                id: 'interview',
                title: 'Ban dang co ho so o vong phong van',
                description:
                    'Theo doi lich hen va ghi chu trong tung ho so de khong bo lo tien do.',
            })
        }

        const actionItems = applications.filter((item) =>
            isCandidateActionRequired(item.status)
        )
        if (actionItems.length) {
            items.push({
                id: 'action',
                title: 'He thong dang cho phan hoi tu ban',
                description:
                    'Mot so ho so dang can ban xac nhan lich phong van hoac xu ly offer.',
            })
        }

        if (!items.length) {
            items.push({
                id: 'welcome',
                title: 'Khong gian candidate da duoc dong bo API',
                description:
                    'Du lieu profile, viec lam va ho so ung tuyen hien dang lay truc tiep tu backend.',
            })
        }

        if (profile?.note) {
            items.push({
                id: 'profile-note',
                title: 'Ghi chu ho so',
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
                <span className="portal-hero__eyebrow">Tong quan ung vien</span>
                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} lg={15}>
                        <Title level={2}>
                            Theo doi ho so va tim co hoi phu hop trong mot giao dien
                            thong nhat
                        </Title>
                        <Paragraph style={{ maxWidth: 720, marginBottom: 24 }}>
                            Dashboard candidate hien lay du lieu thuc tu backend de
                            tong hop profile, ho so ung tuyen va danh sach viec lam dang
                            mo trong cung mot man hinh.
                        </Paragraph>
                        <Space wrap size="middle">
                            <Link to={PATHS.CANDIDATE_JOBS}>
                                <Button type="primary" size="large">
                                    Kham pha vi tri
                                </Button>
                            </Link>
                            <Link to={PATHS.CANDIDATE_APPLICATIONS}>
                                <Button size="large">Theo doi ho so</Button>
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
                                    <Text className="portal-muted">Ho so cua ban</Text>
                                    <Title level={4} style={{ margin: 0 }}>
                                        {profile.fullName}
                                    </Title>
                                    <Text>
                                        {profile.currentPosition ||
                                            profile.major ||
                                            'Chua cap nhat vi tri hien tai'}
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
                                                Chua co diem nhan ho so.
                                            </Text>
                                        )}
                                    </div>
                                </Space>
                            ) : (
                                <Empty description="Chua tim thay ho so candidate" />
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
                            <div className="portal-stat-card__icon">{item.icon}</div>
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
                        title="Tien do cac ho so gan day"
                        className="portal-section-card"
                    >
                        <List
                            loading={loading}
                            dataSource={recentApplications}
                            locale={{
                                emptyText: 'Ban chua co ho so ung tuyen nao.',
                            }}
                            renderItem={(item) => {
                                const label = getApplicationStatusLabel(item.status)
                                const color = getApplicationStatusColor(item.status)

                                return (
                                    <List.Item>
                                        <div style={{ width: '100%' }}>
                                            <div className="portal-split">
                                                <div>
                                                    <Title
                                                        level={5}
                                                        style={{ marginBottom: 4 }}
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
                                                    `${item.jobPositionName || 'Vi tri'} tai ${item.workLocation || 'he thong BCA'}.`}
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
                                                    Nop ngay{' '}
                                                    {dayjs(item.appliedTime).format(
                                                        'DD/MM/YYYY'
                                                    )}
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
                        <Card
                            title="Thong bao tu he thong"
                            className="portal-section-card"
                        >
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
                            title="Co hoi noi bat"
                            extra={
                                <Link to={PATHS.CANDIDATE_JOBS}>Xem tat ca</Link>
                            }
                            className="portal-section-card"
                        >
                            <List
                                loading={loading}
                                dataSource={highlightedJobs}
                                locale={{ emptyText: 'Chua co vi tri dang mo.' }}
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
                                                    <Text strong>{item.title}</Text>
                                                    <div>
                                                        <Text className="portal-muted">
                                                            {item.departmentName}
                                                        </Text>
                                                    </div>
                                                </div>
                                                <Tag color={item.hasApplied ? 'blue' : 'green'}>
                                                    {item.hasApplied
                                                        ? 'Da ung tuyen'
                                                        : 'Dang mo'}
                                                </Tag>
                                            </Space>
                                            <Link to={PATHS.CANDIDATE_JOBS}>
                                                <Button
                                                    type="link"
                                                    style={{ paddingInline: 0 }}
                                                    icon={<RightOutlined />}
                                                    iconPosition="end"
                                                >
                                                    Xem chi tiet
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
