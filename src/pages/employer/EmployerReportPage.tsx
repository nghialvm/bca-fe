import { useEffect, useState } from 'react'

import {
    Button,
    Card,
    Col,
    Progress,
    Row,
    Skeleton,
    Space,
    Statistic,
    Table,
    Typography,
} from 'antd'

import { Column, Line } from '@ant-design/charts'
import {
    ClockCircleOutlined,
    DownloadOutlined,
    RiseOutlined,
    TeamOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

import { employerCandidates, employerJobs } from '@/mock/employerData'

import styles from '../styles/AdminUi.module.css'

const { Paragraph, Text, Title } = Typography

type PerformanceRow = {
    key: string
    title: string
    department: string
    applicants: number
    interviewed: number
    hired: number
    rate: number
}

const performanceColumns: ColumnsType<PerformanceRow> = [
    {
        title: 'Vị trí',
        dataIndex: 'title',
        key: 'title',
    },
    {
        title: 'Phòng ban',
        dataIndex: 'department',
        key: 'department',
    },
    {
        title: 'Ứng tuyển',
        dataIndex: 'applicants',
        key: 'applicants',
        align: 'right',
    },
    {
        title: 'Phỏng vấn',
        dataIndex: 'interviewed',
        key: 'interviewed',
        align: 'right',
    },
    {
        title: 'Đã tuyển',
        dataIndex: 'hired',
        key: 'hired',
        align: 'right',
    },
    {
        title: 'Tỷ lệ',
        dataIndex: 'rate',
        key: 'rate',
        align: 'right',
        render: (value: number) => `${value}%`,
    },
]

const EmployerReportPage = () => {
    const [chartsReady, setChartsReady] = useState(false)

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

    const totalApplications = employerCandidates.length
    const selectedCandidates = employerCandidates.filter(
        (item) => item.stage === 'selected'
    ).length
    const hiringSuccessRate = Number(
        ((selectedCandidates / totalApplications) * 100).toFixed(1)
    )
    const avgTimeToHire = 18

    const monthlyTrend = [
        { month: 'T10', applications: 45, hired: 5 },
        { month: 'T11', applications: 52, hired: 7 },
        { month: 'T12', applications: 48, hired: 6 },
        { month: 'T1', applications: 60, hired: 8 },
        { month: 'T2', applications: 65, hired: 9 },
        { month: 'T3', applications: 72, hired: 10 },
    ]

    const conversionRates = [
        {
            stage: 'Hồ sơ mới',
            count: employerCandidates.filter(
                (item) => item.stage === 'application'
            ).length,
        },
        {
            stage: 'Sàng lọc',
            count: employerCandidates.filter(
                (item) => item.stage === 'screening'
            ).length,
        },
        {
            stage: 'Thi viết',
            count: employerCandidates.filter(
                (item) => item.stage === 'written-exam'
            ).length,
        },
        {
            stage: 'Phỏng vấn',
            count: employerCandidates.filter(
                (item) => item.stage === 'interview'
            ).length,
        },
        {
            stage: 'Đã chọn',
            count: employerCandidates.filter(
                (item) => item.stage === 'selected'
            ).length,
        },
    ]

    const jobPerformance = employerJobs.map((job) => ({
        name: job.title,
        applications: job.applicants,
        qualified: Math.floor(job.applicants * 0.4),
    }))

    const performanceRows: PerformanceRow[] = employerJobs.map((job) => {
        const applicants = employerCandidates.filter(
            (candidate) => candidate.jobId === job.id
        )
        const interviewed = applicants.filter(
            (candidate) =>
                candidate.stage === 'interview' ||
                candidate.stage === 'selected'
        )
        const hired = applicants.filter(
            (candidate) => candidate.stage === 'selected'
        )

        return {
            key: job.id,
            title: job.title,
            department: job.department,
            applicants: applicants.length,
            interviewed: interviewed.length,
            hired: hired.length,
            rate: applicants.length
                ? Math.round((hired.length / applicants.length) * 100)
                : 0,
        }
    })

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
                            Các biểu đồ và KPI được chuẩn hóa lại theo cùng hệ
                            màu, layout và bề mặt với toàn bộ khu vực
                            back-office để employer và admin có trải nghiệm báo
                            cáo nhất quán.
                        </Paragraph>
                    </div>
                    <Button
                        size="large"
                        icon={<DownloadOutlined />}
                        type="primary"
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
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} xl={6}>
                    <Card className="portal-section-card portal-stat-card">
                        <Statistic
                            title="Thời gian TB để tuyển"
                            value={avgTimeToHire}
                            suffix="ngày"
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} xl={6}>
                    <Card className="portal-section-card portal-stat-card">
                        <Statistic
                            title="Vị trí đang mở"
                            value={
                                employerJobs.filter(
                                    (item) => item.status === 'active'
                                ).length
                            }
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
                            {chartsReady ? (
                                <Line
                                    height={320}
                                    data={monthlyTrend}
                                    xField="month"
                                    yField="applications"
                                    color="#0B3D2E"
                                    point={{ size: 4 }}
                                />
                            ) : (
                                <Skeleton active paragraph={{ rows: 8 }} />
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
                            {chartsReady ? (
                                <Column
                                    height={320}
                                    data={jobPerformance}
                                    xField="name"
                                    yField="applications"
                                    color="#166534"
                                    label={{ position: 'top' }}
                                />
                            ) : (
                                <Skeleton active paragraph={{ rows: 8 }} />
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>

            <Card title="Phễu tuyển dụng" className="portal-section-card">
                <Space direction="vertical" size={20} style={{ width: '100%' }}>
                    {conversionRates.map((item, index) => {
                        const base = conversionRates[0]?.count || 1
                        const percent = Math.round((item.count / base) * 100)

                        return (
                            <div key={item.stage}>
                                <div className="portal-split">
                                    <Text strong>{item.stage}</Text>
                                    <Text className="portal-muted">
                                        {item.count} ứng viên ({percent}%)
                                    </Text>
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
            </Card>

            <Card
                title="Tóm tắt hiệu suất theo vị trí"
                className="portal-section-card"
            >
                <Table
                    rowKey="key"
                    columns={performanceColumns}
                    dataSource={performanceRows}
                    pagination={false}
                />
            </Card>
        </div>
    )
}

export default EmployerReportPage
