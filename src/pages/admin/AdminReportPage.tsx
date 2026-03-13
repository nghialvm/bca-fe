import { useEffect, useState } from 'react'

import { Button, Card, Skeleton, Space, Typography } from 'antd'

import { Column, Line, Pie } from '@ant-design/charts'
import {
    CalendarOutlined,
    DownloadOutlined,
    FileTextOutlined,
    RiseOutlined,
    TeamOutlined,
} from '@ant-design/icons'

import AdminStatCard from '@/components/cards/AdminStatCard'
import {
    monthlyTrend,
    recruitmentByUnit,
    reportExportOptions,
    reportMetrics,
    statusDistribution,
    topPositions,
} from '@/mock/adminData'

import styles from '../styles/AdminUi.module.css'

const metricIcons = [
    <FileTextOutlined />,
    <TeamOutlined />,
    <RiseOutlined />,
    <CalendarOutlined />,
]
const metricColors = ['#0B3D2E', '#166534', '#2E7D60', '#B7791F']

const monthlyTrendData = monthlyTrend.flatMap((item) => [
    { month: item.month, type: 'Tin tuyển dụng', value: item.recruitments },
    { month: item.month, type: 'Ứng viên', value: item.candidates },
])

const AdminReportPage = () => {
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

    return (
        <div className={styles.page}>
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Báo cáo & thống kê</span>
                <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    align="start"
                    wrap
                >
                    <div>
                        <Typography.Title level={2}>
                            Quản lý báo cáo & thống kê
                        </Typography.Title>
                        <Typography.Paragraph style={{ maxWidth: 720 }}>
                            Phân tích hiệu quả tuyển dụng, hồ sơ ứng viên và tốc
                            độ xử lý theo từng giai đoạn.
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
                        {chartsReady ? (
                            <Line
                                data={monthlyTrendData}
                                xField="month"
                                yField="value"
                                colorField="type"
                                seriesField="type"
                                smooth
                            />
                        ) : (
                            <Skeleton active paragraph={{ rows: 8 }} />
                        )}
                    </div>
                </Card>

                <Card
                    variant="borderless"
                    className={styles.sectionCard}
                    title={
                        <span className={styles.sectionTitle}>
                            Phân bổ trạng thái hồ sơ
                        </span>
                    }
                >
                    <div className={styles.chart}>
                        <Pie
                            data={statusDistribution}
                            angleField="value"
                            colorField="name"
                            // scale={{
                            //     color: {
                            //         range: [
                            //             '#0B3D2E',
                            //             '#166534',
                            //             '#B7791F',
                            //             '#2E7D60',
                            //         ],
                            //     },
                            // }}
                            label={{
                                text: 'name',
                                position: 'outside',
                            }}
                            legend={{ color: { position: 'right' } }}
                        />
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
                        {chartsReady ? (
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
                            <Skeleton active paragraph={{ rows: 6 }} />
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
                        {topPositions.map((item, index) => (
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
                                                width: `${(item.applications / 234) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className={styles.tableMainText}>
                                    {item.applications}
                                </div>
                            </div>
                        ))}
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
