import { Button, Card, Space } from 'antd'

import { Column, Line, Pie } from '@ant-design/charts'
import {
    CalendarOutlined,
    DownloadOutlined,
    FileTextOutlined,
    RiseOutlined,
    TeamOutlined,
} from '@ant-design/icons'

import AdminPageHeader from './AdminPageHeader'
import AdminStatCard from './AdminStatCard'
import styles from './AdminUi.module.css'
import {
    monthlyTrend,
    recruitmentByUnit,
    reportExportOptions,
    reportMetrics,
    statusDistribution,
    topPositions,
} from './adminData'

const metricIcons = [
    <FileTextOutlined />,
    <TeamOutlined />,
    <RiseOutlined />,
    <CalendarOutlined />,
]
const metricColors = ['#2f54eb', '#389e0d', '#722ed1', '#d48806']

const monthlyTrendData = monthlyTrend.flatMap((item) => [
    { month: item.month, type: 'Tin tuyển dụng', value: item.recruitments },
    { month: item.month, type: 'Ứng viên', value: item.candidates },
])

const AdminReportPage = () => {
    return (
        <div className={styles.page}>
            <AdminPageHeader
                title="Báo cáo & thống kê"
                subtitle="Phân tích hiệu quả tuyển dụng, hồ sơ ứng viên và tốc độ xử lý theo từng giai đoạn."
                extra={
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
                }
            />

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
                        <Line
                            data={monthlyTrendData}
                            xField="month"
                            yField="value"
                            colorField="type"
                            seriesField="type"
                            smooth
                        />
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
                        <Column
                            data={recruitmentByUnit}
                            xField="name"
                            yField="applications"
                            colorField="name"
                            label={{
                                position: 'top',
                            }}
                        />
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
