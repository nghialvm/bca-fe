import { useEffect, useMemo, useState } from 'react'

import {
    Button,
    Card,
    Col,
    Empty,
    Progress,
    Row,
    Skeleton,
    Space,
    Statistic,
    Table,
    Typography,
    notification,
} from 'antd'

import { Column, Line } from '@ant-design/charts'
import {
    CalendarOutlined,
    DownloadOutlined,
    RiseOutlined,
    TeamOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

import { useEmployerWorkspace } from '@/hooks/useEmployerWorkspace'
import { formatCount, formatPercent } from '@/utils/admin'
import {
    buildApplicationStageStats,
    isApplicationHired,
    isRecruitmentRequestPublished,
} from '@/utils/employer'

import styles from '../styles/AdminUi.module.css'

const { Paragraph, Title } = Typography

type PerformanceRow = {
    key: string
    title: string
    department: string
    applicants: number
    interviewed: number
    hired: number
    rate: number
}

const EmployerReportPage = () => {
    const [chartsReady, setChartsReady] = useState(false)
    const { applicationRows, currentDepartment, interviews, loading, recruitmentRequests } =
        useEmployerWorkspace()

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

    const totalApplications = applicationRows.length
    const hiredApplications = applicationRows.filter((item) =>
        isApplicationHired(item.application.status)
    ).length
    const hiringSuccessRate = totalApplications
        ? Number(((hiredApplications / totalApplications) * 100).toFixed(1))
        : 0
    const scheduledInterviews = interviews.filter((item) =>
        ['1', '2', '3', '5', 'pending', 'confirmed', 'rescheduled', 'completed'].includes(
            String(item.status).toLowerCase()
        )
    ).length
    const activeJobs = recruitmentRequests.filter((item) =>
        isRecruitmentRequestPublished(item.status)
    ).length

    const monthlyTrend = useMemo(() => {
        const grouped = applicationRows.reduce(
            (accumulator, row) => {
                const monthKey = dayjs(row.application.appliedTime).format('MM/YYYY')

                if (!accumulator[monthKey]) {
                    accumulator[monthKey] = {
                        month: monthKey,
                        applications: 0,
                        hired: 0,
                    }
                }

                accumulator[monthKey].applications += 1
                if (isApplicationHired(row.application.status)) {
                    accumulator[monthKey].hired += 1
                }

                return accumulator
            },
            {} as Record<string, { month: string; applications: number; hired: number }>
        )

        return Object.values(grouped).sort((left, right) =>
            dayjs(`01/${left.month}`, 'DD/MM/YYYY').valueOf() -
            dayjs(`01/${right.month}`, 'DD/MM/YYYY').valueOf()
        )
    }, [applicationRows])

    const conversionRates = buildApplicationStageStats(
        applicationRows.map((item) => item.application.status)
    ).map((item) => ({
        stage: item.type,
        count: item.value,
    }))

    const jobPerformance = useMemo(
        () =>
            recruitmentRequests.map((job) => {
                const applicants = applicationRows.filter(
                    (row) => row.application.recruitmentRequestId === job.id
                )
                const hired = applicants.filter((row) =>
                    isApplicationHired(row.application.status)
                )

                return {
                    name: job.title,
                    applications: applicants.length,
                    hired: hired.length,
                }
            }),
        [applicationRows, recruitmentRequests]
    )

    const performanceRows: PerformanceRow[] = useMemo(
        () =>
            recruitmentRequests.map((job) => {
                const applicants = applicationRows.filter(
                    (row) => row.application.recruitmentRequestId === job.id
                )
                const interviewed = applicants.filter((row) =>
                    ['4', '5', '6', '7'].includes(String(row.application.status))
                )
                const hired = applicants.filter((row) =>
                    isApplicationHired(row.application.status)
                )

                return {
                    key: job.id,
                    title: job.title,
                    department: currentDepartment?.name || 'Đơn vị tuyển dụng',
                    applicants: applicants.length,
                    interviewed: interviewed.length,
                    hired: hired.length,
                    rate: applicants.length
                        ? Math.round((hired.length / applicants.length) * 100)
                        : 0,
                }
            }),
        [applicationRows, currentDepartment?.name, recruitmentRequests]
    )

    const performanceColumns: ColumnsType<PerformanceRow> = [
        {
            title: 'Vị trí',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Đơn vị',
            dataIndex: 'department',
            key: 'department',
        },
        {
            title: 'Ứng tuyển',
            dataIndex: 'applicants',
            key: 'applicants',
            align: 'right',
            render: (value: number) => formatCount(value),
        },
        {
            title: 'Phỏng vấn',
            dataIndex: 'interviewed',
            key: 'interviewed',
            align: 'right',
            render: (value: number) => formatCount(value),
        },
        {
            title: 'Đã tuyển',
            dataIndex: 'hired',
            key: 'hired',
            align: 'right',
            render: (value: number) => formatCount(value),
        },
        {
            title: 'Tỷ lệ',
            dataIndex: 'rate',
            key: 'rate',
            align: 'right',
            render: (value: number) => `${value}%`,
        },
    ]

    return (
        <div className="portal-page">
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Báo cáo</span>
                <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    align="start"
                    wrap
                >
                    <div>
                        <Title level={2}>Báo cáo và thống kê tuyển dụng</Title>
                        <Paragraph style={{ maxWidth: 760 }}>
                            Báo cáo employer đã được chuyển sang dùng dữ liệu API
                            thực tế, giúp theo dõi xu hướng ứng tuyển, tỷ lệ
                            tuyển dụng và hiệu suất từng vị trí của đơn vị.
                        </Paragraph>
                    </div>
                    <Button
                        size="large"
                        icon={<DownloadOutlined />}
                        type="primary"
                        onClick={() => {
                            notification.info({
                                message: 'Xuất báo cáo',
                                description:
                                    'Tính năng xuất file sẽ được bổ sung ở bước tiếp theo.',
                            })
                        }}
                    >
                        Xuất báo cáo
                    </Button>
                </Space>
            </section>

            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} xl={6}>
                    <Card className="portal-section-card portal-stat-card">
                        <Statistic
                            title="Tổng ứng viên"
                            value={totalApplications}
                            prefix={<TeamOutlined />}
                            formatter={(value) => formatCount(Number(value))}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} xl={6}>
                    <Card className="portal-section-card portal-stat-card">
                        <Statistic
                            title="Tỷ lệ tuyển dụng"
                            value={hiringSuccessRate}
                            suffix="%"
                            prefix={<RiseOutlined />}
                            formatter={(value) => formatPercent(Number(value)).replace('%', '')}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} xl={6}>
                    <Card className="portal-section-card portal-stat-card">
                        <Statistic
                            title="Lịch phỏng vấn"
                            value={scheduledInterviews}
                            prefix={<CalendarOutlined />}
                            formatter={(value) => formatCount(Number(value))}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} xl={6}>
                    <Card className="portal-section-card portal-stat-card">
                        <Statistic
                            title="Vị trí đang mở"
                            value={activeJobs}
                            formatter={(value) => formatCount(Number(value))}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} xl={12}>
                    <Card
                        title="Xu hướng theo tháng"
                        className="portal-section-card"
                    >
                        <div className={styles.chart}>
                            {loading ? (
                                <Skeleton active paragraph={{ rows: 8 }} />
                            ) : monthlyTrend.length && chartsReady ? (
                                <Line
                                    height={320}
                                    data={monthlyTrend}
                                    xField="month"
                                    yField="applications"
                                    color="#0B3D2E"
                                    point={{ size: 4 }}
                                />
                            ) : (
                                <Empty description="Chưa có dữ liệu xu hướng theo tháng" />
                            )}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} xl={12}>
                    <Card
                        title="Hiệu suất theo vị trí"
                        className="portal-section-card"
                    >
                        <div className={styles.chart}>
                            {loading ? (
                                <Skeleton active paragraph={{ rows: 8 }} />
                            ) : jobPerformance.length && chartsReady ? (
                                <Column
                                    height={320}
                                    data={jobPerformance}
                                    xField="name"
                                    yField="applications"
                                    color="#166534"
                                    label={{ position: 'top' }}
                                />
                            ) : (
                                <Empty description="Chưa có dữ liệu hiệu suất theo vị trí" />
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>

            <Card title="Phễu tuyển dụng" className="portal-section-card">
                {conversionRates.length ? (
                    <Space
                        direction="vertical"
                        size={20}
                        style={{ width: '100%' }}
                    >
                        {conversionRates.map((item, index) => {
                            const base = conversionRates[0]?.count || 1
                            const percent = Math.round((item.count / base) * 100)

                            return (
                                <div key={item.stage}>
                                    <div className="portal-split">
                                        <span>{item.stage}</span>
                                        <span>
                                            {formatCount(item.count)} ứng viên ({percent}
                                            %)
                                        </span>
                                    </div>
                                    <Progress
                                        percent={percent}
                                        showInfo={false}
                                        strokeColor={
                                            index === 0
                                                ? '#0B3D2E'
                                                : index === 1
                                                  ? '#166534'
                                                  : index === 2
                                                    ? '#B7791F'
                                                    : index === 3
                                                      ? '#2E7D60'
                                                      : '#10B981'
                                        }
                                    />
                                </div>
                            )
                        })}
                    </Space>
                ) : (
                    <Empty description="Chưa có dữ liệu phễu tuyển dụng" />
                )}
            </Card>

            <Card
                title="Tóm tắt hiệu suất theo vị trí"
                className="portal-section-card"
            >
                <Table
                    rowKey="key"
                    loading={loading}
                    columns={performanceColumns}
                    dataSource={performanceRows}
                    pagination={false}
                    locale={{
                        emptyText: 'Chưa có dữ liệu hiệu suất theo vị trí',
                    }}
                />
            </Card>
        </div>
    )
}

export default EmployerReportPage
