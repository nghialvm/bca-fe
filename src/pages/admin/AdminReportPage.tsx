import { useEffect, useMemo, useState } from 'react'

import { Button, Card, Empty, Skeleton, Space, Typography } from 'antd'

import { Column, Line, Pie } from '@ant-design/charts'
import {
    CalendarOutlined,
    DownloadOutlined,
    FileTextOutlined,
    RiseOutlined,
    TeamOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import AdminStatCard from '@/components/cards/AdminStatCard'
import AdminService, {
    ApplicationDto,
    ApplicationStatusCount,
    DepartmentStatisticsItem,
    HiringStatistics,
    RecruitmentDashboardSummary,
    RecruitmentRequestDto,
    RecruitmentTrendItem,
} from '@/services/admin'
import {
    formatCount,
    formatPercent,
    getApplicationStatusLabel,
} from '@/utils/admin'

import styles from '../styles/AdminUi.module.css'

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
    position: string
    applications: number
}

const reportExportOptions = [
    {
        key: 'summary',
        title: 'Báo cáo tổng hợp',
        description:
            'Tổng hợp KPI tuyển dụng, tỷ lệ tuyển và số liệu theo tháng.',
    },
    {
        key: 'department',
        title: 'Báo cáo theo đơn vị',
        description:
            'So sánh lượng nhu cầu, hồ sơ và kết quả tuyển dụng giữa các đơn vị.',
    },
    {
        key: 'pipeline',
        title: 'Báo cáo pipeline',
        description:
            'Phân tích trạng thái hồ sơ, offer và tỉ lệ chuyển đổi từng giai đoạn.',
    },
]

const getMonthLabel = (value?: string | null) => {
    if (!value) return '-'

    const parsed = dayjs(value)
    if (parsed.isValid()) {
        return parsed.format('MM/YYYY')
    }

    return value
}

const AdminReportPage = () => {
    const [chartsReady, setChartsReady] = useState(false)
    const [loading, setLoading] = useState(false)
    const [summary, setSummary] = useState<RecruitmentDashboardSummary | null>(
        null
    )
    const [hiringStats, setHiringStats] = useState<HiringStatistics | null>(
        null
    )
    const [monthlyTrendData, setMonthlyTrendData] = useState<TrendPoint[]>([])
    const [statusDistribution, setStatusDistribution] = useState<
        DistributionPoint[]
    >([])
    const [recruitmentByUnit, setRecruitmentByUnit] = useState<
        Array<{ name: string; applications: number }>
    >([])
    const [topPositions, setTopPositions] = useState<PositionPoint[]>([])

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
        const loadReport = async () => {
            setLoading(true)
            try {
                const [
                    summaryResponse,
                    hiringResponse,
                    statusResponse,
                    departmentResponse,
                    trendResponse,
                    recruitmentResponse,
                    applicationResponse,
                ] = await Promise.all([
                    AdminService.getDashboardSummary(),
                    AdminService.getHiringStatistics(),
                    AdminService.getApplicationStatusStatistics(),
                    AdminService.getDepartmentStatistics(),
                    AdminService.getRecruitmentTrend(),
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
                const statusItems = (statusResponse ||
                    []) as ApplicationStatusCount[]
                const departmentItems = (departmentResponse ||
                    []) as DepartmentStatisticsItem[]
                const trendItems = (trendResponse ||
                    []) as RecruitmentTrendItem[]
                const recruitments = (recruitmentResponse?.items ||
                    []) as RecruitmentRequestDto[]
                const applications = (applicationResponse?.items ||
                    []) as ApplicationDto[]

                const recruitmentByMonth = recruitments.reduce(
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

                const applicationsByRequest = applications.reduce(
                    (accumulator, item) => {
                        accumulator[item.recruitmentRequestId] =
                            (accumulator[item.recruitmentRequestId] || 0) + 1

                        return accumulator
                    },
                    {} as Record<string, number>
                )

                const topPositionItems = recruitments
                    .map((item) => ({
                        position: item.title,
                        applications: applicationsByRequest[item.id] || 0,
                    }))
                    .sort(
                        (left, right) => right.applications - left.applications
                    )
                    .slice(0, 5)

                setSummary(summaryData)
                setHiringStats(hiringData)
                setMonthlyTrendData(trendPoints)
                setStatusDistribution(
                    statusItems.map((item) => ({
                        name: getApplicationStatusLabel(item.status),
                        value: item.count || 0,
                    }))
                )
                setRecruitmentByUnit(
                    departmentItems.map((item) => ({
                        name: item.departmentName,
                        applications: item.totalApplications || 0,
                    }))
                )
                setTopPositions(topPositionItems)
            } catch {
                setSummary(null)
                setHiringStats(null)
                setMonthlyTrendData([])
                setStatusDistribution([])
                setRecruitmentByUnit([])
                setTopPositions([])
            } finally {
                setLoading(false)
            }
        }

        void loadReport()
    }, [])

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

    const maxApplications = topPositions[0]?.applications || 1

    return (
        <div className={styles.page}>
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">
                    Báo cáo và thống kê
                </span>
                <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    align="start"
                    wrap
                >
                    <div>
                        <Typography.Title level={2}>
                            Quản lý báo cáo và thống kê
                        </Typography.Title>
                        <Typography.Paragraph style={{ maxWidth: 720 }}>
                            Phân tích hiệu quả tuyển dụng, hồ sơ ứng viên và tốc
                            độ xử lý theo từng giai đoạn từ dữ liệu backend.
                        </Typography.Paragraph>
                    </div>
                    <Space>
                        <Button size="large" icon={<CalendarOutlined />}>
                            Chọn khoảng thời gian
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            icon={<DownloadOutlined />}
                        >
                            Xuất báo cáo
                        </Button>
                    </Space>
                </Space>
            </section>

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
                            Xu hướng tuyển dụng theo tháng
                        </span>
                    }
                >
                    <div className={styles.chart}>
                        {loading || !chartsReady ? (
                            <Skeleton active paragraph={{ rows: 8 }} />
                        ) : monthlyTrendData.length ? (
                            <Line
                                data={monthlyTrendData}
                                xField="month"
                                yField="value"
                                colorField="type"
                                seriesField="type"
                                smooth
                            />
                        ) : (
                            <Empty description="Không có dữ liệu theo tháng" />
                        )}
                    </div>
                </Card>

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
                        ) : statusDistribution.length ? (
                            <Pie
                                data={statusDistribution}
                                angleField="value"
                                colorField="name"
                                label={{
                                    text: 'name',
                                    position: 'outside',
                                }}
                                legend={{ color: { position: 'right' } }}
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
                        ) : recruitmentByUnit.length ? (
                            <Column
                                data={recruitmentByUnit}
                                xField="name"
                                yField="applications"
                                color="#0B3D2E"
                                label={{
                                    position: 'top',
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
                                <div
                                    key={item.position}
                                    className={styles.rankItem}
                                >
                                    <div className={styles.rankBadge}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className={styles.tableMainText}>
                                            {item.position}
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

            <Card
                variant="borderless"
                className={styles.sectionCard}
                title={
                    <span className={styles.sectionTitle}>Xuất báo cáo</span>
                }
            >
                <div className={styles.actionTiles}>
                    {reportExportOptions.map((option) => (
                        <div key={option.key} className={styles.actionTile}>
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
