import { useEffect, useMemo, useState } from 'react'

import {
    Button,
    Card,
    DatePicker,
    Empty,
    Select,
    Skeleton,
    Space,
    Table,
    Typography,
} from 'antd'

import { Column, Line, Pie } from '@ant-design/charts'
import {
    CalendarOutlined,
    DownloadOutlined,
    FileTextOutlined,
    ReloadOutlined,
    RiseOutlined,
    TeamOutlined,
} from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'

import AdminStatCard from '@/components/cards/AdminStatCard'
import { getVisiblePieChartData } from '@/configs/chart.config'
import AdminService, {
    ApplicationDto,
    ApplicationStatusCount,
    DashboardFilter,
    DepartmentDto,
    DepartmentStatisticsItem,
    HiringStatistics,
    JobPositionDto,
    OfferStatistics,
    RecruitmentDashboardSummary,
    RecruitmentFunnel,
    RecruitmentRequestDto,
    RecruitmentTrendItem,
} from '@/services/admin'
import {
    formatCount,
    formatPercent,
    getApplicationStatusLabel,
} from '@/utils/admin'

import styles from '../styles/AdminUi.module.css'

const { RangePicker } = DatePicker

const metricIcons = [
    <FileTextOutlined />,
    <TeamOutlined />,
    <RiseOutlined />,
    <CalendarOutlined />,
]
const metricColors = ['#0B3D2E', '#166534', '#2E7D60', '#B7791F']

type TrendPoint = {
    month: string
    type: string
    value: number
}

type DistributionPoint = {
    name: string
    value: number
}

type PositionPoint = {
    key: string
    position: string
    applications: number
    departmentName: string
}

type FilterState = {
    dateRange: [Dayjs, Dayjs] | null
    departmentId?: string
    jobPositionId?: string
}

const getMonthLabel = (value?: string | null) => {
    if (!value) return '-'

    const parsed = dayjs(value)
    if (parsed.isValid()) {
        return parsed.format('MM/YYYY')
    }

    return value
}

const isWithinRange = (
    value: string | undefined | null,
    dateRange: [Dayjs, Dayjs] | null
) => {
    if (!dateRange || !value) return true

    const parsed = dayjs(value)
    if (!parsed.isValid()) return false

    const timeValue = parsed.valueOf()
    const fromValue = dateRange[0].startOf('day').valueOf()
    const toValue = dateRange[1].endOf('day').valueOf()

    return timeValue >= fromValue && timeValue <= toValue
}

const downloadCsv = (filename: string, rows: string[][]) => {
    const escapeCell = (value: string | number) =>
        `"${String(value ?? '').replace(/"/g, '""')}"`

    const csvContent = rows
        .map((row) => row.map(escapeCell).join(','))
        .join('\n')
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

const AdminReportPage = () => {
    const [chartsReady, setChartsReady] = useState(false)
    const [loading, setLoading] = useState(false)
    const [departments, setDepartments] = useState<DepartmentDto[]>([])
    const [jobPositions, setJobPositions] = useState<JobPositionDto[]>([])
    const [filters, setFilters] = useState<FilterState>({
        dateRange: null,
    })
    const [summary, setSummary] = useState<RecruitmentDashboardSummary | null>(
        null
    )
    const [hiringStats, setHiringStats] = useState<HiringStatistics | null>(
        null
    )
    const [offerStats, setOfferStats] = useState<OfferStatistics | null>(null)
    const [funnel, setFunnel] = useState<RecruitmentFunnel | null>(null)
    const [monthlyTrendData, setMonthlyTrendData] = useState<TrendPoint[]>([])
    const [statusDistribution, setStatusDistribution] = useState<
        DistributionPoint[]
    >([])
    const [departmentItems, setDepartmentItems] = useState<
        DepartmentStatisticsItem[]
    >([])
    const [topPositions, setTopPositions] = useState<PositionPoint[]>([])

    const visibleStatusDistribution = useMemo(
        () => getVisiblePieChartData(statusDistribution),
        [statusDistribution]
    )

    useEffect(() => {
        let frameId = 0
        let nextFrameId = 0

        frameId = window.requestAnimationFrame(() => {
            nextFrameId = window.requestAnimationFrame(() => {
                setChartsReady(true)
            })
        })

        return () => {
            window.cancelAnimationFrame(frameId)
            window.cancelAnimationFrame(nextFrameId)
        }
    }, [])

    useEffect(() => {
        const loadFilters = async () => {
            try {
                const [departmentResponse, jobPositionResponse] =
                    await Promise.all([
                        AdminService.getDepartments({
                            Sorting: 'name asc',
                            MaxResultCount: 1000,
                        }),
                        AdminService.getJobPositions({
                            Sorting: 'name asc',
                            MaxResultCount: 1000,
                        }),
                    ])

                setDepartments(
                    (departmentResponse?.items || []) as DepartmentDto[]
                )
                setJobPositions(
                    (jobPositionResponse?.items || []) as JobPositionDto[]
                )
            } catch {
                setDepartments([])
                setJobPositions([])
            }
        }

        void loadFilters()
    }, [])

    useEffect(() => {
        if (
            filters.jobPositionId &&
            filters.departmentId &&
            !jobPositions.some(
                (item) =>
                    item.id === filters.jobPositionId &&
                    item.departmentId === filters.departmentId
            )
        ) {
            setFilters((currentValue) => ({
                ...currentValue,
                jobPositionId: undefined,
            }))
        }
    }, [filters.departmentId, filters.jobPositionId, jobPositions])

    const activeFilter = useMemo<DashboardFilter>(
        () => ({
            FromDate: filters.dateRange?.[0]?.startOf('day').toISOString(),
            ToDate: filters.dateRange?.[1]?.endOf('day').toISOString(),
            DepartmentId: filters.departmentId,
            JobPositionId: filters.jobPositionId,
        }),
        [filters]
    )

    useEffect(() => {
        const loadReport = async () => {
            setLoading(true)
            try {
                const [
                    summaryResponse,
                    hiringResponse,
                    offerResponse,
                    funnelResponse,
                    statusResponse,
                    departmentResponse,
                    trendResponse,
                    recruitmentResponse,
                    applicationResponse,
                ] = await Promise.all([
                    AdminService.getDashboardSummary(activeFilter),
                    AdminService.getHiringStatistics(activeFilter),
                    AdminService.getOfferStatistics(activeFilter),
                    AdminService.getRecruitmentFunnel(activeFilter),
                    AdminService.getApplicationStatusStatistics(activeFilter),
                    AdminService.getDepartmentStatistics(activeFilter),
                    AdminService.getRecruitmentTrend(activeFilter),
                    AdminService.getRecruitmentRequests({
                        Sorting: 'creationTime desc',
                        MaxResultCount: 1000,
                    }),
                    AdminService.getApplications({
                        Sorting: 'appliedTime desc',
                        MaxResultCount: 1000,
                    }),
                ])

                const summaryData =
                    summaryResponse as RecruitmentDashboardSummary
                const hiringData = hiringResponse as HiringStatistics
                const offerData = offerResponse as OfferStatistics
                const funnelData = funnelResponse as RecruitmentFunnel
                const statusItems = (statusResponse ||
                    []) as ApplicationStatusCount[]
                const departmentStats = (departmentResponse ||
                    []) as DepartmentStatisticsItem[]
                const trendItems = (trendResponse ||
                    []) as RecruitmentTrendItem[]
                const recruitments = (recruitmentResponse?.items ||
                    []) as RecruitmentRequestDto[]
                const applications = (applicationResponse?.items ||
                    []) as ApplicationDto[]

                const filteredRecruitments = recruitments.filter((item) => {
                    if (
                        activeFilter.DepartmentId &&
                        item.departmentId !== activeFilter.DepartmentId
                    ) {
                        return false
                    }

                    if (
                        activeFilter.JobPositionId &&
                        item.jobPositionId !== activeFilter.JobPositionId
                    ) {
                        return false
                    }

                    return isWithinRange(item.creationTime, filters.dateRange)
                })

                const filteredRecruitmentIds = new Set(
                    filteredRecruitments.map((item) => item.id)
                )

                const filteredApplications = applications.filter((item) => {
                    if (
                        !filteredRecruitmentIds.has(item.recruitmentRequestId)
                    ) {
                        return false
                    }

                    return isWithinRange(item.appliedTime, filters.dateRange)
                })

                const recruitmentByMonth = filteredRecruitments.reduce(
                    (accumulator, item) => {
                        const month = getMonthLabel(item.creationTime)
                        accumulator[month] = (accumulator[month] || 0) + 1

                        return accumulator
                    },
                    {} as Record<string, number>
                )

                const trendPoints = trendItems.flatMap((item) => [
                    {
                        month: getMonthLabel(item.period),
                        type: 'Tin tuyển dụng',
                        value:
                            recruitmentByMonth[getMonthLabel(item.period)] || 0,
                    },
                    {
                        month: getMonthLabel(item.period),
                        type: 'Ứng viên',
                        value: item.totalApplications || 0,
                    },
                ])

                const applicationsByRequest = filteredApplications.reduce(
                    (accumulator, item) => {
                        accumulator[item.recruitmentRequestId] =
                            (accumulator[item.recruitmentRequestId] || 0) + 1

                        return accumulator
                    },
                    {} as Record<string, number>
                )

                const departmentsById = new Map(
                    departments.map((item) => [item.id, item.name])
                )

                const topPositionItems = filteredRecruitments
                    .map((item) => ({
                        key: item.id,
                        position: item.title,
                        applications: applicationsByRequest[item.id] || 0,
                        departmentName:
                            departmentsById.get(item.departmentId) || '-',
                    }))
                    .sort(
                        (left, right) => right.applications - left.applications
                    )
                    .slice(0, 5)

                setSummary(summaryData)
                setHiringStats(hiringData)
                setOfferStats(offerData)
                setFunnel(funnelData)
                setMonthlyTrendData(trendPoints)
                setStatusDistribution(
                    statusItems.map((item) => ({
                        name: getApplicationStatusLabel(item.status),
                        value: item.count || 0,
                    }))
                )
                setDepartmentItems(departmentStats)
                setTopPositions(topPositionItems)
            } catch {
                setSummary(null)
                setHiringStats(null)
                setOfferStats(null)
                setFunnel(null)
                setMonthlyTrendData([])
                setStatusDistribution([])
                setDepartmentItems([])
                setTopPositions([])
            } finally {
                setLoading(false)
            }
        }

        void loadReport()
    }, [activeFilter, departments, filters.dateRange])

    const filteredJobPositionOptions = useMemo(
        () =>
            jobPositions
                .filter(
                    (item) =>
                        !filters.departmentId ||
                        item.departmentId === filters.departmentId
                )
                .map((item) => ({
                    value: item.id,
                    label: item.name,
                })),
        [filters.departmentId, jobPositions]
    )

    const reportMetrics = useMemo(
        () => [
            {
                key: 'requests',
                label: 'Tổng tin tuyển dụng',
                value: formatCount(summary?.totalRecruitmentRequests),
                change: `${formatCount(
                    summary?.totalPublishedRecruitmentRequests
                )} đang mở`,
            },
            {
                key: 'candidates',
                label: 'Tổng ứng viên',
                value: formatCount(summary?.totalCandidates),
                change: `${formatCount(summary?.totalApplications)} hồ sơ`,
            },
            {
                key: 'hiringRate',
                label: 'Tỷ lệ tuyển dụng',
                value: formatPercent(hiringStats?.applicationToHireRate),
                change: `${formatCount(summary?.totalHiredEmployees)} đã tuyển`,
            },
            {
                key: 'offerRate',
                label: 'Tỉ lệ nhận offer',
                value: formatPercent(summary?.offerAcceptanceRate),
                change: `${formatCount(summary?.totalOfferAccepted)} nhận offer`,
            },
        ],
        [hiringStats, summary]
    )

    const funnelRows = useMemo(
        () => [
            {
                key: 'applications',
                label: 'Hồ sơ',
                value: funnel?.totalApplications || 0,
            },
            {
                key: 'screening',
                label: 'Qua sàng lọc',
                value: funnel?.screeningPassed || 0,
            },
            {
                key: 'interviews',
                label: 'Đã phỏng vấn',
                value: funnel?.interviewScheduled || 0,
            },
            {
                key: 'passed',
                label: 'Đạt phỏng vấn',
                value: funnel?.interviewPassed || 0,
            },
            {
                key: 'offered',
                label: 'Đã gửi offer',
                value: funnel?.offered || 0,
            },
            {
                key: 'hired',
                label: 'Đã tuyển',
                value: funnel?.hired || 0,
            },
        ],
        [funnel]
    )

    const funnelBase = funnelRows[0]?.value || 1
    const maxApplications = topPositions[0]?.applications || 1

    const handleResetFilters = () => {
        setFilters({
            dateRange: null,
        })
    }

    const handleExport = (mode: 'summary' | 'department' | 'pipeline') => {
        if (mode === 'summary') {
            downloadCsv('bao-cao-tong-hop.csv', [
                ['Chỉ số', 'Giá trị'],
                ['Tổng tin tuyển dụng', reportMetrics[0].value],
                ['Tổng ứng viên', reportMetrics[1].value],
                ['Tỷ lệ tuyển dụng', reportMetrics[2].value],
                ['Tỉ lệ nhận offer', reportMetrics[3].value],
            ])
            return
        }

        if (mode === 'department') {
            downloadCsv('bao-cao-don-vi.csv', [
                ['Đơn vị', 'Nhu cầu tuyển', 'Hồ sơ', 'Offer', 'Đã tuyển'],
                ...departmentItems.map((item) => [
                    item.departmentName,
                    formatCount(item.totalRecruitmentRequests),
                    formatCount(item.totalApplications),
                    formatCount(item.totalOffers),
                    formatCount(item.totalHired),
                ]),
            ])
            return
        }

        downloadCsv('bao-cao-pipeline.csv', [
            ['Giai đoạn', 'Số lượng'],
            ...funnelRows.map((item) => [item.label, formatCount(item.value)]),
        ])
    }

    return (
        <div className={styles.page}>
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">
                    Thống kê báo cáo
                </span>
                <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    align="start"
                    wrap
                >
                    <div>
                        <Typography.Title level={2}>
                            Quản lý thống kê và báo cáo
                        </Typography.Title>
                    </div>
                    <Space wrap>
                        <Button
                            size="large"
                            icon={<ReloadOutlined />}
                            onClick={handleResetFilters}
                        >
                            Làm mới
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            icon={<DownloadOutlined />}
                            onClick={() => handleExport('summary')}
                        >
                            Xuất báo cáo
                        </Button>
                    </Space>
                </Space>
            </section>

            <Card variant="borderless" className={styles.filterCard}>
                <div className={styles.filterRow}>
                    <RangePicker
                        size="large"
                        placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                        value={filters.dateRange}
                        onChange={(value) =>
                            setFilters((currentValue) => ({
                                ...currentValue,
                                dateRange:
                                    value && value[0] && value[1]
                                        ? [value[0], value[1]]
                                        : null,
                            }))
                        }
                    />
                    <Select
                        allowClear
                        size="large"
                        placeholder="Tất cả đơn vị"
                        style={{ minWidth: 240 }}
                        value={filters.departmentId}
                        options={departments.map((item) => ({
                            value: item.id,
                            label: item.name,
                        }))}
                        onChange={(value) =>
                            setFilters((currentValue) => ({
                                ...currentValue,
                                departmentId: value,
                            }))
                        }
                    />
                    <Select
                        allowClear
                        size="large"
                        placeholder="Tất cả vị trí"
                        style={{ minWidth: 240 }}
                        value={filters.jobPositionId}
                        options={filteredJobPositionOptions}
                        onChange={(value) =>
                            setFilters((currentValue) => ({
                                ...currentValue,
                                jobPositionId: value,
                            }))
                        }
                    />
                </div>
            </Card>

            <div className={styles.statsGrid}>
                {reportMetrics.map((item, index) => (
                    <AdminStatCard
                        key={item.key}
                        label={item.label}
                        value={item.value}
                        change={item.change}
                        icon={metricIcons[index]}
                        accentColor={metricColors[index]}
                    />
                ))}
            </div>

            <div className={styles.chartGrid}>
                <Card
                    variant="borderless"
                    className={styles.sectionCard}
                    title={
                        <span className={styles.sectionTitle}>
                            Phân bố trạng thái hồ sơ
                        </span>
                    }
                >
                    <div className={styles.chart}>
                        {loading || !chartsReady ? (
                            <Skeleton active paragraph={{ rows: 8 }} />
                        ) : visibleStatusDistribution.length ? (
                            <Pie
                                data={visibleStatusDistribution}
                                angleField="value"
                                colorField="name"
                                label={{
                                    text: 'name',
                                }}
                                legend={{ color: { position: 'right' } }}
                                meta={{
                                    name: { alias: 'Trạng thái' },
                                    value: { alias: 'Số lượng' },
                                }}
                                tooltip={{
                                    title: 'name',
                                    items: [
                                        (datum) => ({
                                            name: 'Số lượng',
                                            value: datum.value,
                                        }),
                                    ],
                                }}
                                scale={{
                                    color: {
                                        range: [
                                            '#0B3D2E',
                                            '#166534',
                                            '#B7791F',
                                            '#2E7D60',
                                            '#10B981',
                                        ],
                                    },
                                }}
                            />
                        ) : (
                            <Empty description="Không có dữ liệu trạng thái" />
                        )}
                    </div>
                </Card>
            </div>

            <div className={styles.chartGrid}>
                <Card
                    variant="borderless"
                    className={styles.sectionCard}
                    title={
                        <span className={styles.sectionTitle}>
                            Tuyển dụng theo đơn vị
                        </span>
                    }
                >
                    <div className={styles.chartShort}>
                        {loading || !chartsReady ? (
                            <Skeleton active paragraph={{ rows: 6 }} />
                        ) : departmentItems.length ? (
                            <Column
                                data={departmentItems.map((item) => ({
                                    name: item.departmentName,
                                    applications: item.totalApplications || 0,
                                }))}
                                xField="name"
                                yField="applications"
                                color="#0B3D2E"
                                label={{
                                    position: 'top',
                                }}
                                meta={{
                                    name: { alias: 'Đơn vị' },
                                    applications: { alias: 'Số hồ sơ' },
                                }}
                                tooltip={{
                                    title: 'name',
                                    items: [
                                        (datum) => ({
                                            name: 'Số hồ sơ',
                                            value: datum.applications,
                                        }),
                                    ],
                                }}
                            />
                        ) : (
                            <Empty description="Không có dữ liệu theo đơn vị" />
                        )}
                    </div>
                </Card>

                <Card
                    variant="borderless"
                    className={styles.sectionCard}
                    title={
                        <span className={styles.sectionTitle}>
                            Top vị trí được ứng tuyển nhiều nhất
                        </span>
                    }
                >
                    <div className={styles.rankList}>
                        {topPositions.length ? (
                            topPositions.map((item, index) => (
                                <div key={item.key} className={styles.rankItem}>
                                    <div className={styles.rankBadge}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className={styles.tableMainText}>
                                            {item.position}
                                        </div>
                                        <div className={styles.tableSubText}>
                                            {item.departmentName}
                                        </div>
                                        <div className={styles.rankBarTrack}>
                                            <div
                                                className={styles.rankBar}
                                                style={{
                                                    width: `${(item.applications / maxApplications) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.tableMainText}>
                                        {formatCount(item.applications)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <Empty description="Không có vị trí được ứng tuyển" />
                        )}
                    </div>
                </Card>
            </div>

            <div className={styles.chartGrid}>
                <Card
                    variant="borderless"
                    className={styles.sectionCard}
                    title={
                        <span className={styles.sectionTitle}>
                            Phễu tuyển dụng
                        </span>
                    }
                >
                    <div className={styles.rankList}>
                        {funnelRows.map((item) => (
                            <div key={item.key} className={styles.rankItem}>
                                <div className={styles.rankBadge}>
                                    {formatCount(item.value)}
                                </div>
                                <div>
                                    <div className={styles.tableMainText}>
                                        {item.label}
                                    </div>
                                    <div className={styles.rankBarTrack}>
                                        <div
                                            className={styles.rankBar}
                                            style={{
                                                width: `${Math.min(
                                                    100,
                                                    (item.value / funnelBase) *
                                                        100
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className={styles.tableSubText}>
                                    {formatPercent(
                                        funnelBase
                                            ? (item.value / funnelBase) * 100
                                            : 0
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card
                    variant="borderless"
                    className={styles.sectionCard}
                    title={
                        <span className={styles.sectionTitle}>
                            Hiệu quả offer
                        </span>
                    }
                >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        <span className={styles.summaryPill}>
                            Tổng offer: {formatCount(offerStats?.totalOffers)}
                        </span>
                        <span className={styles.summaryPill}>
                            Đã gửi: {formatCount(offerStats?.sentOffers)}
                        </span>
                        <span className={styles.summaryPill}>
                            Chấp nhận: {formatCount(offerStats?.acceptedOffers)}
                        </span>
                        <span className={styles.summaryPill}>
                            Từ chối: {formatCount(offerStats?.declinedOffers)}
                        </span>
                        <span className={styles.summaryPill}>
                            Hết hạn: {formatCount(offerStats?.expiredOffers)}
                        </span>
                        <span className={styles.summaryPill}>
                            Tỉ lệ nhận:{' '}
                            {formatPercent(offerStats?.acceptanceRate)}
                        </span>
                    </div>
                </Card>
            </div>

            <Card
                variant="borderless"
                className={styles.sectionCard}
                title={
                    <span className={styles.sectionTitle}>
                        Bảng so sánh theo đơn vị
                    </span>
                }
                extra={
                    <Button
                        type="link"
                        icon={<DownloadOutlined />}
                        onClick={() => handleExport('department')}
                    >
                        Xuất CSV
                    </Button>
                }
            >
                <Table
                    rowKey="departmentId"
                    loading={loading}
                    pagination={{ pageSize: 6 }}
                    locale={{
                        emptyText: (
                            <Empty description="Không có dữ liệu đơn vị phù hợp" />
                        ),
                    }}
                    dataSource={departmentItems}
                    columns={[
                        {
                            title: 'Đơn vị',
                            dataIndex: 'departmentName',
                            key: 'departmentName',
                            render: (value: string) => (
                                <span className={styles.tableMainText}>
                                    {value}
                                </span>
                            ),
                        },
                        {
                            title: 'Nhu cầu tuyển',
                            dataIndex: 'totalRecruitmentRequests',
                            key: 'totalRecruitmentRequests',
                            render: (value: number) => formatCount(value),
                        },
                        {
                            title: 'Hồ sơ',
                            dataIndex: 'totalApplications',
                            key: 'totalApplications',
                            render: (value: number) => formatCount(value),
                        },
                        {
                            title: 'Offer',
                            dataIndex: 'totalOffers',
                            key: 'totalOffers',
                            render: (value: number) => formatCount(value),
                        },
                        {
                            title: 'Đã tuyển',
                            dataIndex: 'totalHired',
                            key: 'totalHired',
                            render: (value: number) => formatCount(value),
                        },
                    ]}
                />
            </Card>

            <Card
                variant="borderless"
                className={styles.sectionCard}
                title={
                    <span className={styles.sectionTitle}>Xuất báo cáo</span>
                }
            >
                <div className={styles.actionTiles}>
                    {[
                        {
                            key: 'summary',
                            title: 'Báo cáo tổng hợp',
                            description:
                                'Xuất nhanh bộ chỉ số chính theo bộ lọc hiện tại.',
                        },
                        {
                            key: 'department',
                            title: 'Báo cáo theo đơn vị',
                            description:
                                'Xuất bảng so sánh nhu cầu, hồ sơ, offer và kết quả tuyển.',
                        },
                        {
                            key: 'pipeline',
                            title: 'Báo cáo pipeline',
                            description:
                                'Xuất phễu tuyển dụng để theo dõi tỉ lệ chuyển đổi.',
                        },
                    ].map((option) => (
                        <div
                            key={option.key}
                            className={styles.actionTile}
                            onClick={() =>
                                handleExport(
                                    option.key as
                                        | 'summary'
                                        | 'department'
                                        | 'pipeline'
                                )
                            }
                        >
                            <div className={styles.tableMainText}>
                                {option.title}
                            </div>
                            <div className={styles.sectionHint}>
                                {option.description}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}

export default AdminReportPage
