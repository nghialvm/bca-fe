import { useMemo, useState } from 'react'

import {
    Button,
    Card,
    Input,
    Segmented,
    Space,
    Table,
    Tag,
    Typography,
} from 'antd'

import {
    CheckCircleOutlined,
    DownloadOutlined,
    FilterOutlined,
    InfoCircleOutlined,
    SafetyOutlined,
    SearchOutlined,
    WarningOutlined,
} from '@ant-design/icons'

import { systemLogs } from '@/mock/adminData'

import styles from '../styles/AdminUi.module.css'

const severityStyles = {
    info: { color: 'processing', icon: <InfoCircleOutlined /> },
    success: { color: 'success', icon: <CheckCircleOutlined /> },
    warning: { color: 'warning', icon: <WarningOutlined /> },
    error: { color: 'error', icon: <SafetyOutlined /> },
} as const

const AdminManageLogPage = () => {
    const [search, setSearch] = useState('')
    const [type, setType] = useState('all')

    const filteredLogs = useMemo(() => {
        return systemLogs.filter((log) => {
            const keyword = search.trim().toLowerCase()
            const matchesKeyword =
                !keyword ||
                log.user.toLowerCase().includes(keyword) ||
                log.action.toLowerCase().includes(keyword) ||
                log.ip.toLowerCase().includes(keyword)
            const matchesType = type === 'all' || log.type === type

            return matchesKeyword && matchesType
        })
    }, [search, type])

    return (
        <div className={styles.page}>
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Nhật ký</span>
                <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    align="start"
                    wrap
                >
                    <div>
                        <Typography.Title level={2}>
                            Quản lý nhật ký hệ thống
                        </Typography.Title>
                        <Typography.Paragraph style={{ maxWidth: 720 }}>
                            Theo dõi đăng nhập, thao tác nghiệp vụ và các cảnh
                            báo bảo mật trên toàn hệ thống.
                        </Typography.Paragraph>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<DownloadOutlined />}
                    >
                        Xuất nhật ký
                    </Button>
                </Space>
            </section>

            <div className={styles.metricGrid}>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <InfoCircleOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>1,234</div>
                        <div className={styles.metricLabel}>
                            Hoạt động hôm nay
                        </div>
                    </div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <CheckCircleOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>567</div>
                        <div className={styles.metricLabel}>Đăng nhập</div>
                    </div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <WarningOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>23</div>
                        <div className={styles.metricLabel}>Cảnh báo</div>
                    </div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <SafetyOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>5</div>
                        <div className={styles.metricLabel}>
                            Sự kiện bảo mật
                        </div>
                    </div>
                </div>
            </div>

            <Card variant="borderless" className={styles.filterCard}>
                <div className={styles.filterRow}>
                    <Input
                        allowClear
                        size="large"
                        prefix={<SearchOutlined />}
                        value={search}
                        className={styles.flexGrow}
                        placeholder="Tìm kiếm theo user, IP hoặc hành động..."
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <Segmented
                        size="large"
                        value={type}
                        options={[
                            { value: 'all', label: 'Tất cả' },
                            { value: 'login', label: 'Đăng nhập' },
                            { value: 'operation', label: 'Thao tác' },
                            { value: 'security', label: 'Bảo mật' },
                        ]}
                        onChange={(value) => setType(String(value))}
                    />
                    <Button size="large" icon={<FilterOutlined />}>
                        Lọc nâng cao
                    </Button>
                </div>
            </Card>

            <Card variant="borderless" className={styles.sectionCard}>
                <Table
                    rowKey="key"
                    dataSource={filteredLogs}
                    pagination={{ pageSize: 8 }}
                    columns={[
                        {
                            title: 'Mức độ',
                            dataIndex: 'severity',
                            key: 'severity',
                            render: (value: keyof typeof severityStyles) => (
                                <Tag
                                    color={severityStyles[value].color}
                                    icon={severityStyles[value].icon}
                                    className={styles.statusTag}
                                >
                                    {value.toUpperCase()}
                                </Tag>
                            ),
                        },
                        {
                            title: 'Thời gian',
                            dataIndex: 'timestamp',
                            key: 'timestamp',
                        },
                        {
                            title: 'Người dùng',
                            dataIndex: 'user',
                            key: 'user',
                        },
                        {
                            title: 'Hành động',
                            dataIndex: 'action',
                            key: 'action',
                            render: (value: string) => (
                                <span className={styles.tableMainText}>
                                    {value}
                                </span>
                            ),
                        },
                        {
                            title: 'IP',
                            dataIndex: 'ip',
                            key: 'ip',
                        },
                        {
                            title: 'Chi tiết',
                            dataIndex: 'details',
                            key: 'details',
                        },
                    ]}
                />
            </Card>
        </div>
    )
}

export default AdminManageLogPage
