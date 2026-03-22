import { useEffect, useMemo, useState } from 'react'

import {
    Avatar,
    Card,
    Empty,
    Skeleton,
    Space,
    Table,
    Tag,
    Typography,
} from 'antd'

import { Column, Line } from '@ant-design/charts'
import {
    BarChartOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import AdminStatCard from '@/components/cards/AdminStatCard'
import AdminService, {
    ApplicationDto,
    ApplicationStatusCount,
    CandidateDto,
    DepartmentDto,
    RecruitmentDashboardSummary,
    RecruitmentRequestDto,
    RecruitmentTrendItem,
} from '@/services/admin'
import {
    formatCount,
    formatDisplayDate,
    getApplicationStatusColor,
    getApplicationStatusLabel,
} from '@/utils/admin'

import styles from '../styles/AdminUi.module.css'

const { Paragraph, Title } = Typography

const accentColors = ['#0B3D2E', '#166534', '#2E7D60', '#B7791F']
const statIcons = [
    <FileTextOutlined />,
    <TeamOutlined />,
    <BarChartOutlined />,
    <ClockCircleOutlined />,
]

type ActivityPoint = {
    month: string
    type: string
    value: number
}

type StatusPoint = {
    name: string
    value: number
}

type RecentApplicationRow = {
    id: string
    key: string
    candidate: string
    position: string
    unit: string
    status: string | number
    date: string
}

const getMonthLabel = (value?: string | null) => {
    if (!value) return '-'

    const parsed = dayjs(value)
    if (parsed.isValid()) {
        return parsed.format('MM/YYYY')
    }

    return value
}

const AdminDashboardPage = () => {
    const [chartsReady, setChartsReady] = useState(false)
    const [loading, setLoading] = useState(false)
    const [summary, setSummary] = useState<RecruitmentDashboardSummary | null>(
        null
    )
    const [activityData, setActivityData] = useState<ActivityPoint[]>([])
    const [statusData, setStatusData] = useState<StatusPoint[]>([])
    const [recentApplications, setRecentApplications] = useState<
        RecentApplicationRow[]
    >([])

    useEffect(() => {
        const frameId = window.requestAnimationFrame(() => {
            setChartsReady(true)
        })

        return () => {
            window.cancelAnimationFrame(frameId)
        }
    }, [])

    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true)
            try {
                const [
                    summaryResponse,
                    trendResponse,
                    statusResponse,
                    recruitmentResponse,
                    applicationResponse,
                    candidateResponse,
                    departmentResponse,
                ] = await Promise.all([
                    AdminService.getDashboardSummary(),
                    AdminService.getRecruitmentTrend(),
                    AdminService.getApplicationStatusStatistics(),
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
                ])

                const summaryData =
                    summaryResponse as RecruitmentDashboardSummary
                const trendItems = (trendResponse ||
                    []) as RecruitmentTrendItem[]
                const statusItems = (statusResponse ||
                    []) as ApplicationStatusCount[]
                const recruitments = (recruitmentResponse?.items ||
                    []) as RecruitmentRequestDto[]
                const applications = (applicationResponse?.items ||
                    []) as ApplicationDto[]
                const candidates = (candidateResponse?.items ||
                    []) as CandidateDto[]
                const departments = (departmentResponse?.items ||
                    []) as DepartmentDto[]

                const postingsByMonth = recruitments.reduce(
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
                        type: 'Hồ sơ',
                        value: item.totalApplications || 0,
                    },
                    {
                        month: getMonthLabel(item.period),
                        type: 'Tin tuyển dụng',
                        value: postingsByMonth[getMonthLabel(item.period)] || 0,
                    },
                ])

                const candidatesById = new Map(
                    candidates.map((item) => [item.id, item.fullName])
                )
                const departmentsById = new Map(
                    departments.map((item) => [item.id, item.name])
                )
                const recruitmentById = new Map(
                    recruitments.map((item) => [item.id, item])
                )

                setSummary(summaryData)
                setActivityData(trendPoints)
                setStatusData(
                    statusItems.map((item) => ({
                        name: getApplicationStatusLabel(item.status),
                        value: item.count || 0,
                    }))
                )
                setRecentApplications(
                    applications.slice(0, 6).map((item) => {
                        const recruitment = recruitmentById.get(
                            item.recruitmentRequestId
                        )

                        return {
                            id: item.id,
                            key: item.id,
                            candidate:
                                candidatesById.get(item.candidateId) ||
                                'Chưa cập nhật ứng viên',
                            position: recruitment?.title || '-',
                            unit:
                                departmentsById.get(
                                    recruitment?.departmentId || ''
                                ) || '-',
                            status: item.status,
                            date: formatDisplayDate(item.appliedTime),
                        }
                    })
                )
            } catch {
                setSummary(null)
                setActivityData([])
                setStatusData([])
                setRecentApplications([])
            } finally {
                setLoading(false)
            }
        }

        void loadDashboard()
    }, [])

    const dashboardStats = useMemo(
        () => [
            {
                key: 'requests',
                label: 'Tổng tin tuyển dụng',
                value: formatCount(summary?.totalRecruitmentRequests),
                change: `Đang đăng ${formatCount(
                    summary?.totalPublishedRecruitmentRequests
                )}`,
            },
            {
                key: 'candidates',
                label: 'Tổng ứng viên',
                value: formatCount(summary?.totalCandidates),
                change: `${formatCount(summary?.totalApplications)} hồ sơ`,
            },
            {
                key: 'offers',
                label: 'Tổng offer',
                value: formatCount(summary?.totalOffers),
                change: `${formatCount(summary?.totalOfferAccepted)} đã nhận`,
            },
            {
                key: 'hires',
                label: 'Đã tuyển',
                value: formatCount(summary?.totalHiredEmployees),
                change: `${summary?.hiringRate || 0}% tỷ lệ tuyển`,
            },
        ],
        [summary]
    )

    return (
        <div className={styles.page}>
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Tổng quan hệ thống</span>
                <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    align="start"
                    wrap
                >
                    <div>
                        <Title level={2}>Tổng quan hệ thống tuyển dụng</Title>
                        <Paragraph style={{ maxWidth: 720 }}>
                            Theo dõi toàn cảnh vận hành tuyển dụng trên toàn hệ
                            thống cho quản trị viên.
                        </Paragraph>
                    </div>
                </Space>
            </section>

            <div className={styles.statsGrid}>
                {dashboardStats.map((item, index) => (
                    <AdminStatCard
                        key={item.key}
                        label={item.label}
                        value={item.value}
                        change={item.change}
                        icon={statIcons[index]}
                        accentColor={accentColors[index]}
                    />
                ))}
            </div>

            <div className={styles.chartGrid}>
                <Card
                    variant="borderless"
                    className={styles.sectionCard}
                    title={
                        <span className={styles.sectionTitle}>
                            Hoạt động hệ thống
                        </span>
                    }
                >
                    <div className={styles.sectionHint}>
                        Theo dõi số lượng hồ sơ và tin tuyển dụng theo tháng.
                    </div>
                    <div className={styles.chart}>
                        {loading || !chartsReady ? (
                            <Skeleton active paragraph={{ rows: 8 }} />
                        ) : activityData.length ? (
                            <Line
                                data={activityData}
                                xField="month"
                                yField="value"
                                colorField="type"
                                seriesField="type"
                                smooth
                                point={{
                                    size: 4,
                                    shape: 'circle',
                                }}
                                axis={{
                                    y: {
                                        labelFormatter: '~s',
                                    },
                                }}
                            />
                        ) : (
                            <Empty description="Không có dữ liệu xu hướng" />
                        )}
                    </div>
                </Card>

                <Card
                    variant="borderless"
                    className={styles.sectionCard}
                    title={
                        <span className={styles.sectionTitle}>
                            Trạng thái hồ sơ
                        </span>
                    }
                >
                    <div className={styles.sectionHint}>
                        Phân bố hồ sơ theo các bước xử lý hiện tại.
                    </div>
                    <div className={styles.chart}>
                        {loading || !chartsReady ? (
                            <Skeleton active paragraph={{ rows: 8 }} />
                        ) : statusData.length ? (
                            <Column
                                data={statusData}
                                xField="name"
                                yField="value"
                                color="#0B3D2E"
                                label={{
                                    position: 'top',
                                }}
                                axis={{
                                    x: {
                                        labelAutoHide: true,
                                        labelAutoRotate: false,
                                    },
                                }}
                            />
                        ) : (
                            <Empty description="Không có dữ liệu trạng thái" />
                        )}
                    </div>
                </Card>
            </div>

            <Card
                variant="borderless"
                className={styles.sectionCard}
                title={
                    <span className={styles.sectionTitle}>Hồ sơ mới nhất</span>
                }
            >
                <div className={styles.sectionHint}>
                    Danh sách hồ sơ cần quản trị viên theo dõi nhanh.
                </div>
                <Table
                    rowKey="key"
                    loading={loading}
                    pagination={false}
                    locale={{
                        emptyText: (
                            <Empty description="Không có hồ sơ ứng tuyển" />
                        ),
                    }}
                    dataSource={recentApplications}
                    columns={[
                        {
                            title: 'Ứng viên',
                            dataIndex: 'candidate',
                            key: 'candidate',
                            render: (value: string) => (
                                <Space size={12}>
                                    <Avatar
                                        icon={<UserOutlined />}
                                        style={{
                                            backgroundColor: '#edf7f1',
                                            color: '#0B3D2E',
                                        }}
                                    />
                                    <span className={styles.tableMainText}>
                                        {value}
                                    </span>
                                </Space>
                            ),
                        },
                        {
                            title: 'Vị trí',
                            dataIndex: 'position',
                            key: 'position',
                        },
                        {
                            title: 'Đơn vị',
                            dataIndex: 'unit',
                            key: 'unit',
                        },
                        {
                            title: 'Trạng thái',
                            dataIndex: 'status',
                            key: 'status',
                            render: (value: string | number) => (
                                <Tag
                                    color={getApplicationStatusColor(value)}
                                    className={styles.statusTag}
                                >
                                    {getApplicationStatusLabel(value)}
                                </Tag>
                            ),
                        },
                        {
                            title: 'Ngày nộp',
                            dataIndex: 'date',
                            key: 'date',
                        },
                    ]}
                />
            </Card>
        </div>
    )
}

export default AdminDashboardPage
