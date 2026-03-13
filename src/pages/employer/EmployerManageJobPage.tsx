import { useMemo, useState } from 'react'

import {
    Button,
    Card,
    Input,
    Select,
    Space,
    Table,
    Tag,
    Typography,
} from 'antd'

import {
    EyeOutlined,
    FilterOutlined,
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

import { EmployerJob, JobStatus, employerJobs } from '@/mock/employerData'

const { Paragraph, Title } = Typography

const statusColor: Record<JobStatus, string> = {
    active: 'green',
    draft: 'default',
    closed: 'red',
}

const statusLabel: Record<JobStatus, string> = {
    active: 'Đang mở',
    draft: 'Bản nháp',
    closed: 'Đã đóng',
}

const columns: ColumnsType<EmployerJob> = [
    {
        title: 'Vị trí',
        dataIndex: 'title',
        key: 'title',
        render: (_, record) => (
            <div>
                <div style={{ fontWeight: 600 }}>{record.title}</div>
                <div className="portal-muted">
                    {record.type === 'full-time'
                        ? 'Toàn thời gian'
                        : record.type === 'part-time'
                          ? 'Bán thời gian'
                          : 'Hợp đồng'}
                </div>
            </div>
        ),
    },
    {
        title: 'Phòng ban',
        dataIndex: 'department',
        key: 'department',
    },
    {
        title: 'Địa điểm',
        dataIndex: 'location',
        key: 'location',
    },
    {
        title: 'Ứng viên',
        dataIndex: 'applicants',
        key: 'applicants',
    },
    {
        title: 'Hạn nộp',
        dataIndex: 'deadline',
        key: 'deadline',
        render: (value: string) => dayjs(value).format('DD/MM/YYYY'),
    },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (value: JobStatus) => (
            <Tag color={statusColor[value]}>{statusLabel[value]}</Tag>
        ),
    },
    {
        title: 'Thao tác',
        key: 'action',
        render: () => (
            <Space>
                <Button icon={<EyeOutlined />}>Xem</Button>
            </Space>
        ),
    },
]

const EmployerManageJobPage = () => {
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<JobStatus | 'all'>('all')

    const dataSource = useMemo(
        () =>
            employerJobs.filter((job) => {
                const normalized = search.trim().toLowerCase()
                const matchesSearch =
                    !normalized ||
                    job.title.toLowerCase().includes(normalized) ||
                    job.department.toLowerCase().includes(normalized)
                const matchesStatus = status === 'all' || job.status === status

                return matchesSearch && matchesStatus
            }),
        [search, status]
    )

    return (
        <div className="portal-page">
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Tin tuyển dụng</span>
                <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    align="start"
                    wrap
                >
                    <div>
                        <Title level={2}>Quản lý tin tuyển dụng</Title>
                        <Paragraph style={{ maxWidth: 720 }}>
                            Bảng tin tuyển dụng đã được chuẩn hóa lại để dùng
                            cùng ngôn ngữ giao diện với admin: thanh công cụ,
                            filter card và bảng dữ liệu đồng nhất trong một
                            layout back-office chung.
                        </Paragraph>
                    </div>
                    <Button type="primary" size="large" icon={<PlusOutlined />}>
                        Tạo tin mới
                    </Button>
                </Space>
            </section>

            <Card className="portal-section-card">
                <Space wrap size="middle" style={{ width: '100%' }}>
                    <Input
                        allowClear
                        size="large"
                        prefix={<SearchOutlined />}
                        placeholder="Tìm theo tên vị trí, phòng ban..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        style={{ width: 320, height: 40 }}
                    />
                    <Select
                        size="large"
                        value={status}
                        onChange={setStatus}
                        style={{ width: 220 }}
                        options={[
                            { label: 'Tất cả trạng thái', value: 'all' },
                            { label: 'Đang mở', value: 'active' },
                            { label: 'Bản nháp', value: 'draft' },
                            { label: 'Đã đóng', value: 'closed' },
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

            <Card className="portal-section-card">
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={dataSource}
                    pagination={{ pageSize: 6 }}
                />
            </Card>
        </div>
    )
}

export default EmployerManageJobPage
