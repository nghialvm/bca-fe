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
    SearchOutlined,
    TeamOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import { useCandidateWorkspace } from '@/hooks/useCandidateWorkspace'
import { formatSalaryRange } from '@/utils/candidate'

const { Paragraph, Text, Title } = Typography

const CandidateJobPage = () => {
    const [search, setSearch] = useState('')
    const [department, setDepartment] = useState<string>('all')
    const [location, setLocation] = useState<string>('all')
    const { jobs, loading, applyToJob, applyingJobId } = useCandidateWorkspace()

    const departments = useMemo(
        () => [
            { label: 'Tat ca don vi', value: 'all' },
            ...Array.from(new Set(jobs.map((job) => job.departmentName)))
                .filter(Boolean)
                .map((item) => ({
                    label: item,
                    value: item,
                })),
        ],
        [jobs]
    )

    const locations = useMemo(
        () => [
            { label: 'Tat ca dia diem', value: 'all' },
            ...Array.from(
                new Set(jobs.map((job) => job.workLocation || 'Chua cap nhat'))
            ).map((item) => ({
                label: item,
                value: item,
            })),
        ],
        [jobs]
    )

    const filteredJobs = useMemo(
        () =>
            jobs.filter((job) => {
                const normalized = search.trim().toLowerCase()
                const haystack = [
                    job.title,
                    job.departmentName,
                    job.jobPositionName,
                    job.description,
                    job.requirement,
                    job.workLocation,
                    job.requestCode,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase()

                const matchesSearch = !normalized || haystack.includes(normalized)
                const matchesDepartment =
                    department === 'all' || job.departmentName === department
                const jobLocation = job.workLocation || 'Chua cap nhat'
                const matchesLocation =
                    location === 'all' || jobLocation === location

                return matchesSearch && matchesDepartment && matchesLocation
            }),
        [department, jobs, location, search]
    )

    return (
        <div className="portal-page">
            <section className="portal-hero">
                <span className="portal-hero__eyebrow">Viec lam phu hop</span>
                <Title level={2}>Danh sach vi tri dang mo cho ung vien</Title>
                <Paragraph style={{ maxWidth: 720 }}>
                    Trang viec lam da duoc noi API candidate portal, tu dong dong bo
                    danh sach recruitment request dang publish va trang thai da ung
                    tuyen cua ban.
                </Paragraph>
            </section>

            <Card className="portal-section-card">
                <Row gutter={[16, 16]} align="bottom">
                    <Col xs={24} md={12}>
                        <Text strong>Tim kiem</Text>
                        <Input
                            allowClear
                            size="large"
                            prefix={<SearchOutlined />}
                            placeholder="Nhap tu khoa, don vi, ma phieu..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </Col>
                    <Col xs={24} md={6}>
                        <Text strong>Don vi</Text>
                        <Select
                            size="large"
                            options={departments}
                            value={department}
                            onChange={setDepartment}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={24} md={6}>
                        <Text strong>Dia diem</Text>
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
                        Tim thay {filteredJobs.length} vi tri tuyen dung dang mo
                    </Text>
                    <Button icon={<FilterOutlined />}>Bo loc nhanh</Button>
                </Space>
            </Card>

            {filteredJobs.length ? (
                <Row gutter={[24, 24]}>
                    {filteredJobs.map((job) => {
                        const daysRemaining = job.applicationDeadline
                            ? dayjs(job.applicationDeadline).diff(dayjs(), 'day')
                            : null

                        return (
                            <Col xs={24} md={12} xl={8} key={job.id}>
                                <Card
                                    hoverable
                                    loading={loading}
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
                                                <Tag className="portal-tag-soft">
                                                    {job.requestCode}
                                                </Tag>
                                                <Title
                                                    level={4}
                                                    style={{ margin: '12px 0 8px' }}
                                                >
                                                    {job.title}
                                                </Title>
                                                <Text className="portal-muted">
                                                    {job.departmentName}
                                                </Text>
                                            </div>
                                            <Tag color={job.hasApplied ? 'blue' : 'green'}>
                                                {job.hasApplied
                                                    ? 'Da ung tuyen'
                                                    : job.employmentType}
                                            </Tag>
                                        </Space>

                                        <Paragraph className="portal-muted">
                                            {job.description ||
                                                job.requirement ||
                                                'Chua co mo ta chi tiet cho vi tri nay.'}
                                        </Paragraph>

                                        <Space wrap>
                                            <Tag className="portal-tag-soft">
                                                {job.jobPositionName}
                                            </Tag>
                                            <Tag className="portal-tag-soft">
                                                {job.employmentType}
                                            </Tag>
                                            <Tag className="portal-tag-soft">
                                                {job.headcount} chi tieu
                                            </Tag>
                                        </Space>

                                        <Space
                                            direction="vertical"
                                            size={10}
                                            style={{ width: '100%' }}
                                        >
                                            <Text>
                                                <EnvironmentOutlined />{' '}
                                                {job.workLocation || 'Chua cap nhat'}
                                            </Text>
                                            <Text>
                                                <TeamOutlined /> So luong: {job.headcount}{' '}
                                                nguoi
                                            </Text>
                                            <Text strong>
                                                {formatSalaryRange(
                                                    job.salaryMin,
                                                    job.salaryMax
                                                )}
                                            </Text>
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
                                                strong={
                                                    daysRemaining !== null &&
                                                    daysRemaining <= 7
                                                }
                                                type={
                                                    daysRemaining !== null &&
                                                    daysRemaining <= 7
                                                        ? 'danger'
                                                        : undefined
                                                }
                                            >
                                                {daysRemaining === null
                                                    ? 'Khong gioi han han nop'
                                                    : daysRemaining >= 0
                                                      ? `Con ${daysRemaining} ngay`
                                                      : 'Da het han'}
                                            </Text>
                                            <Button
                                                type={job.hasApplied ? 'default' : 'primary'}
                                                disabled={job.hasApplied}
                                                loading={applyingJobId === job.id}
                                                onClick={() => void applyToJob(job.id)}
                                            >
                                                {job.hasApplied
                                                    ? 'Da ung tuyen'
                                                    : 'Ung tuyen ngay'}
                                            </Button>
                                        </Space>
                                    </Space>
                                </Card>
                            </Col>
                        )
                    })}
                </Row>
            ) : (
                <Card className="portal-section-card portal-empty" loading={loading}>
                    <Empty
                        description="Khong tim thay vi tri phu hop voi bo loc hien tai"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </Card>
            )}
        </div>
    )
}

export default CandidateJobPage
