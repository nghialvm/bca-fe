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
    notification,
} from 'antd'

import {
    FileTextOutlined,
    FilterOutlined,
    MailOutlined,
    PhoneOutlined,
    SearchOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

import { useEmployerWorkspace } from '@/hooks/useEmployerWorkspace'
import {
    formatDisplayDateTime,
    getApplicationStatusColor,
    getApplicationStatusLabel,
} from '@/utils/admin'

const { Paragraph, Text, Title } = Typography

type EmployerCandidateRow = {
    id: string
    applicationId: string
    name: string
    email: string
    phone: string
    position: string
    status: string | number
    appliedTime: string
    currentPosition: string
}

const EmployerManageCandidatePage = () => {
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<string | 'all'>('all')
    const { applicationRows, loading } = useEmployerWorkspace()

    const candidateRows = useMemo<EmployerCandidateRow[]>(
        () =>
            applicationRows.map((row) => ({
                id: `${row.application.id}-${row.candidate?.id || 'candidate'}`,
                applicationId: row.application.id,
                name: row.candidate?.fullName || 'Ứng viên',
                email: row.candidate?.email || '-',
                phone: row.candidate?.phoneNumber || '-',
                position:
                    row.recruitmentRequest?.title ||
                    row.jobPosition?.name ||
                    '-',
                status: row.application.status,
                appliedTime: row.application.appliedTime,
                currentPosition: row.candidate?.currentPosition || '-',
            })),
        [applicationRows]
    )

    const filteredCandidates = useMemo(
        () =>
            candidateRows.filter((candidate) => {
                const normalized = search.trim().toLowerCase()
                const matchesSearch =
                    !normalized ||
                    candidate.name.toLowerCase().includes(normalized) ||
                    candidate.position.toLowerCase().includes(normalized) ||
                    candidate.email.toLowerCase().includes(normalized)
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
                ).values()
            ),
        ],
        [candidateRows]
    )

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
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (value: string | number) => (
                <Tag color={getApplicationStatusColor(value)}>
                    {getApplicationStatusLabel(value)}
                </Tag>
            ),
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
                        onClick={() => {
                            notification.info({
                                message: 'Thông tin hồ sơ ứng viên',
                                description: `${candidate.name} - ${candidate.position}`,
                            })
                        }}
                    >
                        Hồ sơ
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => {
                            notification.info({
                                message: 'Đánh giá ứng viên',
                                description:
                                    'Tính năng đánh giá chi tiết sẽ được bổ sung ở bước tiếp theo.',
                            })
                        }}
                    >
                        Đánh giá
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
                    Danh sách ứng viên bên dưới được đồng bộ trực tiếp từ API hồ
                    sơ và ứng tuyển, giúp lọc nhanh theo trạng thái xử lý và vị
                    trí ứng tuyển của từng ứng viên.
                </Paragraph>
            </section>

            <Card className="portal-section-card">
                <Space wrap size="middle">
                    <Input
                        allowClear
                        size="large"
                        prefix={<SearchOutlined />}
                        placeholder="Tìm theo tên ứng viên, vị trí hoặc email..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        style={{ width: 320, height: 40 }}
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

            {filteredCandidates.length ? (
                <Card className="portal-section-card">
                    <Table
                        rowKey="id"
                        loading={loading}
                        columns={columns}
                        dataSource={filteredCandidates}
                        pagination={{ pageSize: 8 }}
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
