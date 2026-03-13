import { useMemo, useState } from 'react'

import {
    Button,
    Card,
    Empty,
    Input,
    Select,
    Space,
    Table,
    Tag,
    Typography,
} from 'antd'

import {
    FileTextOutlined,
    FilterOutlined,
    MailOutlined,
    PhoneOutlined,
    SearchOutlined,
    StarFilled,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

import {
    EmployerCandidate,
    RecruitmentStage,
    employerCandidates,
} from '@/mock/employerData'

const { Paragraph, Text, Title } = Typography

const stageColor: Record<RecruitmentStage, string> = {
    application: 'blue',
    screening: 'purple',
    'written-exam': 'gold',
    interview: 'green',
    selected: 'success',
    rejected: 'error',
}

const stageLabel: Record<RecruitmentStage, string> = {
    application: 'Hồ sơ mới',
    screening: 'Sàng lọc',
    'written-exam': 'Thi viết',
    interview: 'Phỏng vấn',
    selected: 'Đã chọn',
    rejected: 'Từ chối',
}

const columns: ColumnsType<EmployerCandidate> = [
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
        title: 'Giai đoạn',
        dataIndex: 'stage',
        key: 'stage',
        render: (value: RecruitmentStage) => (
            <Tag color={stageColor[value]}>{stageLabel[value]}</Tag>
        ),
    },
    {
        title: 'Học vấn',
        dataIndex: 'education',
        key: 'education',
        ellipsis: true,
    },
    {
        title: 'Kỹ năng',
        dataIndex: 'skills',
        key: 'skills',
        render: (skills: string[]) => (
            <Space size={[0, 8]} wrap>
                {skills.slice(0, 3).map((skill) => (
                    <Tag key={skill} className="portal-tag-soft">
                        {skill}
                    </Tag>
                ))}
            </Space>
        ),
    },
    {
        title: 'Điểm',
        dataIndex: 'score',
        key: 'score',
        align: 'right',
        render: (value: number) => (
            <Text strong>
                <StarFilled style={{ color: '#D4AF37' }} /> {value}/100
            </Text>
        ),
    },
    {
        title: 'Thao tác',
        key: 'action',
        align: 'right',
        render: () => (
            <Space>
                <Button icon={<FileTextOutlined />}>Hồ sơ</Button>
                <Button type="primary">Đánh giá</Button>
            </Space>
        ),
    },
]

const EmployerManageCandidatePage = () => {
    const [search, setSearch] = useState('')
    const [stage, setStage] = useState<RecruitmentStage | 'all'>('all')

    const filteredCandidates = useMemo(
        () =>
            employerCandidates.filter((candidate) => {
                const normalized = search.trim().toLowerCase()
                const matchesSearch =
                    !normalized ||
                    candidate.name.toLowerCase().includes(normalized) ||
                    candidate.position.toLowerCase().includes(normalized)
                const matchesStage =
                    stage === 'all' || candidate.stage === stage

                return matchesSearch && matchesStage
            }),
        [search, stage]
    )

    return (
        <div className="portal-page">
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Ứng viên</span>
                <Title level={2}>Quản lý danh sách ứng viên</Title>
                <Paragraph style={{ maxWidth: 760 }}>
                    Danh sách ứng viên đã được chuyển sang dạng bảng để phù hợp
                    hơn với tác vụ back-office, giúp so sánh nhanh thông tin,
                    lọc theo giai đoạn và thao tác trực tiếp trên từng hồ sơ.
                </Paragraph>
            </section>

            <Card className="portal-section-card">
                <Space wrap size="middle">
                    <Input
                        allowClear
                        size="large"
                        prefix={<SearchOutlined />}
                        placeholder="Tìm theo tên ứng viên, vị trí..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        style={{ width: 320, height: 40 }}
                    />
                    <Select
                        size="large"
                        value={stage}
                        onChange={setStage}
                        style={{ width: 240 }}
                        options={[
                            { label: 'Tất cả giai đoạn', value: 'all' },
                            { label: 'Hồ sơ mới', value: 'application' },
                            { label: 'Sàng lọc', value: 'screening' },
                            { label: 'Thi viết', value: 'written-exam' },
                            { label: 'Phỏng vấn', value: 'interview' },
                            { label: 'Đã chọn', value: 'selected' },
                            { label: 'Từ chối', value: 'rejected' },
                        ]}
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

            {filteredCandidates.length ? (
                <Card className="portal-section-card">
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={filteredCandidates}
                        pagination={{ pageSize: 6 }}
                        scroll={{ x: 1100 }}
                    />
                </Card>
            ) : (
                <Card className="portal-section-card portal-empty">
                    <Empty description="Không tìm thấy ứng viên phù hợp" />
                </Card>
            )}
        </div>
    )
}

export default EmployerManageCandidatePage
