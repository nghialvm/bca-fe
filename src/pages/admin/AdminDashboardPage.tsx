import { useEffect, useState } from 'react'

import { Avatar, Card, Skeleton, Space, Table, Tag, Typography } from 'antd'

import { Column, Line } from '@ant-design/charts'
import {
    BarChartOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons'

import AdminStatCard from '@/components/cards/AdminStatCard'
import {
    activityTrend,
    dashboardStats,
    recentApplications,
    recruitmentStatus,
} from '@/mock/adminData'

import styles from '../styles/AdminUi.module.css'

const { Paragraph, Title } = Typography

const accentColors = ['#0B3D2E', '#166534', '#2E7D60', '#B7791F']
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
    const [chartsReady, setChartsReady] = useState(false)

    useEffect(() => {
        const frameId = window.requestAnimationFrame(() => {
            setChartsReady(true)
        })

        return () => {
            window.cancelAnimationFrame(frameId)
        }
    }, [])

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
                            Theo dõi toàn cảnh vận hành tuyển dụng trên toàn
                            quốc dành cho quản trị viên H05.
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
                        {chartsReady ? (
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
                            <Skeleton active paragraph={{ rows: 8 }} />
                        )}
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
                        {chartsReady ? (
                            <Column
                                data={recruitmentStatus}
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
                            <Skeleton active paragraph={{ rows: 8 }} />
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
