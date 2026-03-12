import { Avatar, Card, Space, Table, Tag } from 'antd'

import { Column, Line } from '@ant-design/charts'
import {
    BarChartOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons'

import AdminPageHeader from './AdminPageHeader'
import AdminStatCard from './AdminStatCard'
import styles from './AdminUi.module.css'
import {
    activityTrend,
    dashboardStats,
    recentApplications,
    recruitmentStatus,
} from './adminData'

const accentColors = ['#2f54eb', '#389e0d', '#722ed1', '#d48806']
const statIcons = [
    <FileTextOutlined />,
    <TeamOutlined />,
    <BarChartOutlined />,
    <ClockCircleOutlined />,
]

const activityData = activityTrend.flatMap((item) => [
    {
        month: item.month,
        type: 'Hồ sơ',
        value: item.applications,
    },
    {
        month: item.month,
        type: 'Tin tuyển dụng',
        value: item.postings,
    },
])

const AdminDashboardPage = () => {
    return (
        <div className={styles.page}>
            <AdminPageHeader
                title="Dashboard"
                subtitle="Tổng quan hệ thống tuyển dụng toàn quốc dành cho quản trị viên H05."
            />

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
                    </div>
                </Card>

                <Card
                    variant="borderless"
                    className={styles.sectionCard}
                    title={
                        <span className={styles.sectionTitle}>
                            Trạng thái tuyển dụng
                        </span>
                    }
                >
                    <div className={styles.sectionHint}>
                        Phân bổ trạng thái phê duyệt các chiến dịch và hồ sơ.
                    </div>
                    <div className={styles.chart}>
                        <Column
                            data={recruitmentStatus}
                            xField="name"
                            yField="value"
                            color="#2f54eb"
                            label={{
                                position: 'top',
                            }}
                        />
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
                    Danh sách hồ sơ cần quản trị viên theo dõi và kiểm tra
                    nhanh.
                </div>
                <Table
                    rowKey="key"
                    pagination={false}
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
                                            backgroundColor: '#e6f4ff',
                                            color: '#1677ff',
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
                            render: (value: string) => (
                                <Tag
                                    color={
                                        value === 'Đã duyệt'
                                            ? 'success'
                                            : value === 'Chờ duyệt'
                                              ? 'processing'
                                              : 'warning'
                                    }
                                    className={styles.statusTag}
                                >
                                    {value}
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
