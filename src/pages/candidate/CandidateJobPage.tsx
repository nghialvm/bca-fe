import { useMemo, useState } from 'react'

import {
    Button,
    Card,
    Col,
    Empty,
    Input,
    Row,
    Select,
    Space,
    Tag,
    Typography,
} from 'antd'

import {
    EnvironmentOutlined,
    FilterOutlined,
    FireOutlined,
    SearchOutlined,
    TeamOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import { candidateJobs } from '@/mock/candidateData'

const { Paragraph, Text, Title } = Typography

const CandidateJobPage = () => {
    const [search, setSearch] = useState('')
    const [department, setDepartment] = useState<string>('all')
    const [location, setLocation] = useState<string>('all')

    const departments = useMemo(
        () => [
            { label: 'Tất cả đơn vị', value: 'all' },
            ...Array.from(
                new Set(candidateJobs.map((job) => job.department))
            ).map((item) => ({
                label: item,
                value: item,
            })),
        ],
        []
    )

    const locations = useMemo(
        () => [
            { label: 'Tất cả địa điểm', value: 'all' },
            ...Array.from(
                new Set(candidateJobs.map((job) => job.location))
            ).map((item) => ({
                label: item,
                value: item,
            })),
        ],
        []
    )

    const filteredJobs = useMemo(
        () =>
            candidateJobs.filter((job) => {
                const normalized = search.trim().toLowerCase()
                const matchesSearch =
                    !normalized ||
                    job.title.toLowerCase().includes(normalized) ||
                    job.department.toLowerCase().includes(normalized) ||
                    job.summary.toLowerCase().includes(normalized)

                const matchesDepartment =
                    department === 'all' || job.department === department
                const matchesLocation =
                    location === 'all' || job.location === location

                return matchesSearch && matchesDepartment && matchesLocation
            }),
        [department, location, search]
    )

    return (
        <div className="portal-page">
            <section className="portal-hero">
                <span className="portal-hero__eyebrow">Việc làm phù hợp</span>
                <Title level={2}>
                    Danh sách vị trí phù hợp với hồ sơ của bạn
                </Title>
                <Paragraph style={{ maxWidth: 720 }}>
                    Trang danh sách việc làm được làm gọn theo tinh thần design
                    candidate: đầu trang rõ ràng, khối lọc nổi bật và các job
                    card thống nhất với hệ màu chủ đạo `#0B3D2E`.
                </Paragraph>
            </section>

            <Card className="portal-section-card">
                <Row gutter={[16, 16]} align="bottom">
                    <Col xs={24} md={12}>
                        <Text strong>Tìm kiếm</Text>
                        <Input
                            allowClear
                            size="large"
                            prefix={<SearchOutlined />}
                            placeholder="Nhập từ khóa, phòng ban, kỹ năng..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </Col>
                    <Col xs={24} md={6}>
                        <Text strong>Đơn vị</Text>
                        <Select
                            size="large"
                            options={departments}
                            value={department}
                            onChange={setDepartment}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={24} md={6}>
                        <Text strong>Địa điểm</Text>
                        <Select
                            size="large"
                            options={locations}
                            value={location}
                            onChange={setLocation}
                            style={{ width: '100%' }}
                        />
                    </Col>
                </Row>
                <Space
                    style={{
                        width: '100%',
                        justifyContent: 'space-between',
                        marginTop: 18,
                    }}
                >
                    <Text className="portal-muted">
                        Tìm thấy {filteredJobs.length} vị trí tuyển dụng
                    </Text>
                    <Button icon={<FilterOutlined />}>Bộ lọc nâng cao</Button>
                </Space>
            </Card>

            {filteredJobs.length ? (
                <Row gutter={[24, 24]}>
                    {filteredJobs.map((job) => {
                        const daysRemaining = dayjs(job.deadline).diff(
                            dayjs(),
                            'day'
                        )

                        return (
                            <Col xs={24} md={12} xl={8} key={job.id}>
                                <Card
                                    hoverable
                                    className="portal-section-card"
                                    style={{ height: '100%' }}
                                >
                                    <Space
                                        direction="vertical"
                                        size={16}
                                        style={{ width: '100%' }}
                                    >
                                        <Space
                                            style={{
                                                width: '100%',
                                                justifyContent: 'space-between',
                                            }}
                                            align="start"
                                        >
                                            <div>
                                                {job.featured ? (
                                                    <Tag
                                                        className="portal-tag-soft"
                                                        color="gold"
                                                    >
                                                        <FireOutlined /> Nổi bật
                                                    </Tag>
                                                ) : null}
                                                <Title
                                                    level={4}
                                                    style={{
                                                        margin: '12px 0 8px',
                                                    }}
                                                >
                                                    {job.title}
                                                </Title>
                                                <Text className="portal-muted">
                                                    {job.department}
                                                </Text>
                                            </div>
                                            <Tag color="green">
                                                {job.matchScore}% phù hợp
                                            </Tag>
                                        </Space>

                                        <Paragraph className="portal-muted">
                                            {job.summary}
                                        </Paragraph>

                                        <Space wrap>
                                            {job.tags.map((tag) => (
                                                <Tag
                                                    key={tag}
                                                    className="portal-tag-soft"
                                                >
                                                    {tag}
                                                </Tag>
                                            ))}
                                        </Space>

                                        <Space
                                            direction="vertical"
                                            size={10}
                                            style={{ width: '100%' }}
                                        >
                                            <Text>
                                                <EnvironmentOutlined />{' '}
                                                {job.location}
                                            </Text>
                                            <Text>
                                                <TeamOutlined /> Số lượng:{' '}
                                                {job.quantity} người
                                            </Text>
                                            <Text strong>{job.salary}</Text>
                                        </Space>

                                        <Space
                                            style={{
                                                width: '100%',
                                                justifyContent: 'space-between',
                                                paddingTop: 12,
                                                borderTop:
                                                    '1px solid rgba(11, 61, 46, 0.08)',
                                            }}
                                        >
                                            <Text
                                                strong={daysRemaining <= 7}
                                                type={
                                                    daysRemaining <= 7
                                                        ? 'danger'
                                                        : undefined
                                                }
                                            >
                                                {daysRemaining > 0
                                                    ? `Còn ${daysRemaining} ngày`
                                                    : 'Đã hết hạn'}
                                            </Text>
                                            <Button type="primary">
                                                Ứng tuyển ngay
                                            </Button>
                                        </Space>
                                    </Space>
                                </Card>
                            </Col>
                        )
                    })}
                </Row>
            ) : (
                <Card className="portal-section-card portal-empty">
                    <Empty
                        description="Không tìm thấy vị trí phù hợp với bộ lọc hiện tại"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </Card>
            )}
        </div>
    )
}

export default CandidateJobPage
