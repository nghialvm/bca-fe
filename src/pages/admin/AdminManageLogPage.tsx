import { useEffect, useMemo, useState } from 'react'

import {
    Button,
    Card,
    Empty,
    Input,
    Select,
    Skeleton,
    Space,
    Table,
    Tag,
    Typography,
} from 'antd'

import {
    ClockCircleOutlined,
    DownloadOutlined,
    FileTextOutlined,
    SearchOutlined,
    UserOutlined,
    WarningOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import AdminService, {
    ApplicationDto,
    CandidateDto,
    DepartmentDto,
    IdentityUserDto,
    RecruitmentRequestDto,
} from '@/services/admin'
import { formatCount, formatDisplayDateTime, getDisplayName } from '@/utils/admin'

import styles from '../styles/AdminUi.module.css'

type LogEntry = {
    id: string
    key: string
    time: string
    type: string
    source: string
    severity: 'info' | 'success' | 'warning'
    title: string
    description: string
}

const downloadCsv = (filename: string, rows: string[][]) => {
    const escapeCell = (value: string | number) =>
        `"${String(value ?? '').replace(/"/g, '""')}"`

    const csvContent = rows.map((row) => row.map(escapeCell).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], {
        type: 'text/csv;charset=utf-8;',
    })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    window.URL.revokeObjectURL(url)
}

const AdminManageLogPage = () => {
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState<string | undefined>()
    const [entries, setEntries] = useState<LogEntry[]>([])

    useEffect(() => {
        const loadLogs = async () => {
            setLoading(true)
            try {
                const [
                    recruitmentResponse,
                    applicationResponse,
                    candidateResponse,
                    departmentResponse,
                    userResponse,
                ] = await Promise.all([
                    AdminService.getRecruitmentRequests({
                        Sorting: 'creationTime desc',
                        MaxResultCount: 1000,
                    }),
                    AdminService.getApplications({
                        Sorting: 'appliedTime desc',
                        MaxResultCount: 1000,
                    }),
                    AdminService.getCandidates({
                        Sorting: 'creationTime desc',
                        MaxResultCount: 1000,
                    }),
                    AdminService.getDepartments({
                        Sorting: 'name asc',
                        MaxResultCount: 1000,
                    }),
                    AdminService.getIdentityUsers({
                        Sorting: 'creationTime desc',
                        MaxResultCount: 1000,
                    }),
                ])

                const recruitments = (recruitmentResponse?.items ||
                    []) as RecruitmentRequestDto[]
                const applications = (applicationResponse?.items ||
                    []) as ApplicationDto[]
                const candidates = (candidateResponse?.items ||
                    []) as CandidateDto[]
                const departments = (departmentResponse?.items ||
                    []) as DepartmentDto[]
                const users = (userResponse?.items || []) as IdentityUserDto[]

                const candidatesById = new Map(
                    candidates.map((item) => [item.id, item.fullName])
                )
                const departmentsById = new Map(
                    departments.map((item) => [item.id, item.name])
                )
                const recruitmentById = new Map(
                    recruitments.map((item) => [item.id, item])
                )

                const recruitmentEntries = recruitments.flatMap((item) => {
                    const unitName = departmentsById.get(item.departmentId) || '-'
                    const result: LogEntry[] = []

                    if (item.creationTime) {
                        result.push({
                            id: `${item.id}-created`,
                            key: `${item.id}-created`,
                            time: item.creationTime,
                            type: 'Tuyển dụng',
                            source: 'app/recruitment-request',
                            severity: 'info',
                            title: `Tạo tin tuyển dụng: ${item.title}`,
                            description: `Đơn vị ${unitName}`,
                        })
                    }

                    if (item.publishedTime) {
                        result.push({
                            id: `${item.id}-published`,
                            key: `${item.id}-published`,
                            time: item.publishedTime,
                            type: 'Tuyển dụng',
                            source: 'app/recruitment-request',
                            severity: 'success',
                            title: `Đăng tin tuyển dụng: ${item.title}`,
                            description: `Đơn vị ${unitName}`,
                        })
                    }

                    if (item.closedTime) {
                        result.push({
                            id: `${item.id}-closed`,
                            key: `${item.id}-closed`,
                            time: item.closedTime,
                            type: 'Tuyển dụng',
                            source: 'app/recruitment-request',
                            severity: 'warning',
                            title: `Đóng tin tuyển dụng: ${item.title}`,
                            description: `Đơn vị ${unitName}`,
                        })
                    }

                    return result
                })

                const applicationEntries = applications.map((item) => {
                    const recruitment = recruitmentById.get(item.recruitmentRequestId)

                    return {
                        id: `${item.id}-application`,
                        key: `${item.id}-application`,
                        time: item.appliedTime,
                        type: 'Hồ sơ',
                        source: 'app/application',
                        severity: 'info' as const,
                        title: `Ứng viên nộp hồ sơ: ${
                            candidatesById.get(item.candidateId) || item.candidateId
                        }`,
                        description: recruitment?.title || 'Chưa xác định vị trí',
                    }
                })

                const userEntries = users
                    .filter((item) => item.creationTime)
                    .map((item) => ({
                        id: `${item.id}-user`,
                        key: `${item.id}-user`,
                        time: item.creationTime as string,
                        type: 'Tài khoản',
                        source: 'identity/users',
                        severity: 'info' as const,
                        title: `Tạo tài khoản: ${getDisplayName(item)}`,
                        description: item.email || item.userName || '-',
                    }))

                setEntries(
                    [...recruitmentEntries, ...applicationEntries, ...userEntries]
                        .filter((item) => Boolean(item.time))
                        .sort(
                            (left, right) =>
                                dayjs(right.time).valueOf() - dayjs(left.time).valueOf()
                        )
                )
            } catch {
                setEntries([])
            } finally {
                setLoading(false)
            }
        }

        void loadLogs()
    }, [])

    const filteredEntries = useMemo(() => {
        const keyword = search.trim().toLowerCase()

        return entries.filter((item) => {
            const matchesKeyword =
                !keyword ||
                item.title.toLowerCase().includes(keyword) ||
                item.description.toLowerCase().includes(keyword)

            return matchesKeyword && (!typeFilter || item.type === typeFilter)
        })
    }, [entries, search, typeFilter])

    const metrics = useMemo(() => {
        const last7Days = filteredEntries.filter((item) =>
            dayjs(item.time).isAfter(dayjs().subtract(7, 'day'))
        ).length

        return {
            total: filteredEntries.length,
            last7Days,
            warnings: filteredEntries.filter((item) => item.severity === 'warning')
                .length,
            userEvents: filteredEntries.filter((item) => item.type === 'Tài khoản')
                .length,
        }
    }, [filteredEntries])

    const recentEntries = filteredEntries.slice(0, 5)

    const handleExport = () => {
        downloadCsv('nhat-ky-van-hanh.csv', [
            ['Thời gian', 'Loại', 'Nguồn', 'Mức độ', 'Tiêu đề', 'Mô tả'],
            ...filteredEntries.map((item) => [
                formatDisplayDateTime(item.time),
                item.type,
                item.source,
                item.severity,
                item.title,
                item.description,
            ]),
        ])
    }

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
                            Nhật ký vận hành hệ thống
                        </Typography.Title>
                        <Typography.Paragraph style={{ maxWidth: 720 }}>
                            Trang này tổng hợp sự kiện vận hành từ tuyển dụng, hồ sơ
                            và tài khoản để hỗ trợ theo dõi nhanh khi backend chưa
                            expose audit log endpoint riêng.
                        </Typography.Paragraph>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<DownloadOutlined />}
                        onClick={handleExport}
                    >
                        Xuất CSV
                    </Button>
                </Space>
            </section>

            <Card variant="borderless" className={styles.filterCard}>
                <div className={styles.filterRow}>
                    <Input
                        allowClear
                        size="large"
                        prefix={<SearchOutlined />}
                        value={search}
                        className={styles.flexGrow}
                        placeholder="Tìm theo tiêu đề hoặc mô tả..."
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <Select
                        allowClear
                        size="large"
                        placeholder="Tất cả loại sự kiện"
                        style={{ minWidth: 220 }}
                        options={[
                            { value: 'Tuyển dụng', label: 'Tuyển dụng' },
                            { value: 'Hồ sơ', label: 'Hồ sơ' },
                            { value: 'Tài khoản', label: 'Tài khoản' },
                        ]}
                        onChange={(value) => setTypeFilter(value)}
                    />
                </div>
            </Card>

            <div className={styles.metricGrid}>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <FileTextOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>{formatCount(metrics.total)}</div>
                        <div className={styles.metricLabel}>Tổng sự kiện</div>
                    </div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <ClockCircleOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>{formatCount(metrics.last7Days)}</div>
                        <div className={styles.metricLabel}>7 ngày gần nhất</div>
                    </div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <WarningOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>{formatCount(metrics.warnings)}</div>
                        <div className={styles.metricLabel}>Sự kiện cảnh báo</div>
                    </div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <UserOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>{formatCount(metrics.userEvents)}</div>
                        <div className={styles.metricLabel}>Sự kiện tài khoản</div>
                    </div>
                </div>
            </div>

            <div className={styles.chartGrid}>
                <Card
                    variant="borderless"
                    className={styles.sectionCard}
                    title={
                        <span className={styles.sectionTitle}>
                            Timeline vận hành gần đây
                        </span>
                    }
                >
                    {loading ? (
                        <Skeleton active paragraph={{ rows: 10 }} />
                    ) : recentEntries.length ? (
                        <div className={styles.timelineList}>
                            {recentEntries.map((item) => (
                                <div key={item.key} className={styles.timelineItem}>
                                    <div className={styles.timelineDot} />
                                    <div>
                                        <div className={styles.tableMainText}>
                                            {item.title}
                                        </div>
                                        <div className={styles.tableSubText}>
                                            {formatDisplayDateTime(item.time)} · {item.source}
                                        </div>
                                        <div className={styles.sectionHint}>
                                            {item.description}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty description="Không có sự kiện phù hợp bộ lọc" />
                    )}
                </Card>

                <Card
                    variant="borderless"
                    className={styles.sectionCard}
                    title={
                        <span className={styles.sectionTitle}>
                            Ghi chú nguồn dữ liệu
                        </span>
                    }
                >
                    <div className={styles.detailList}>
                        <div className={styles.detailItem}>
                            <FileTextOutlined className={styles.detailIcon} />
                            <span>
                                `app/recruitment-request`: tạo, đăng và đóng tin tuyển dụng.
                            </span>
                        </div>
                        <div className={styles.detailItem}>
                            <ClockCircleOutlined className={styles.detailIcon} />
                            <span>
                                `app/application`: thời điểm ứng viên nộp hồ sơ.
                            </span>
                        </div>
                        <div className={styles.detailItem}>
                            <UserOutlined className={styles.detailIcon} />
                            <span>
                                `identity/users`: thời điểm tạo tài khoản nội bộ.
                            </span>
                        </div>
                        <div className={styles.detailItem}>
                            <WarningOutlined className={styles.detailIcon} />
                            <span>
                                Đây chưa phải audit log chuẩn. Khi backend expose endpoint riêng,
                                trang này có thể chuyển sang log mức request/security đầy đủ.
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            <Card
                variant="borderless"
                className={styles.sectionCard}
                title={<span className={styles.sectionTitle}>Bảng sự kiện</span>}
            >
                <Table
                    rowKey="key"
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                    locale={{
                        emptyText: (
                            <Empty description="Không có sự kiện phù hợp bộ lọc" />
                        ),
                    }}
                    dataSource={filteredEntries}
                    columns={[
                        {
                            title: 'Thời gian',
                            dataIndex: 'time',
                            key: 'time',
                            render: (value: string) => formatDisplayDateTime(value),
                        },
                        {
                            title: 'Loại',
                            dataIndex: 'type',
                            key: 'type',
                        },
                        {
                            title: 'Sự kiện',
                            dataIndex: 'title',
                            key: 'title',
                            render: (value: string) => (
                                <span className={styles.tableMainText}>{value}</span>
                            ),
                        },
                        {
                            title: 'Mô tả',
                            dataIndex: 'description',
                            key: 'description',
                        },
                        {
                            title: 'Mức độ',
                            dataIndex: 'severity',
                            key: 'severity',
                            render: (value: LogEntry['severity']) => (
                                <Tag
                                    color={
                                        value === 'success'
                                            ? 'success'
                                            : value === 'warning'
                                              ? 'warning'
                                              : 'processing'
                                    }
                                >
                                    {value === 'success'
                                        ? 'Thành công'
                                        : value === 'warning'
                                          ? 'Cảnh báo'
                                          : 'Thông tin'}
                                </Tag>
                            ),
                        },
                    ]}
                />
            </Card>
        </div>
    )
}

export default AdminManageLogPage
