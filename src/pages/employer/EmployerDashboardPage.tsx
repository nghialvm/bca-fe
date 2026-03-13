import { useEffect, useState } from 'react'

import {
    Card,
    Col,
    List,
    Row,
    Skeleton,
    Space,
    Statistic,
    Tag,
    Typography,
} from 'antd'

import { Column, Pie } from '@ant-design/charts'
import {
    BarChartOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    TeamOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import {
    employerCandidates,
    employerInterviews,
    employerJobs,
} from '@/mock/employerData'

import styles from '../styles/AdminUi.module.css'

const { Paragraph, Text, Title } = Typography

const EmployerDashboardPage = () => {
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

    const stats = {
        activeJobs: employerJobs.filter((item) => item.status === 'active')
            .length,
        totalApplicants: employerCandidates.length,
        upcomingInterviews: employerInterviews.filter(
            (item) => item.status === 'scheduled'
        ).length,
        selectedCandidates: employerCandidates.filter(
            (item) => item.stage === 'selected'
        ).length,
    }

    const stageData = [
        {
            type: 'Hồ sơ mới',
            value: employerCandidates.filter(
                (item) => item.stage === 'application'
            ).length,
        },
        {
            type: 'Sàng lọc',
            value: employerCandidates.filter(
                (item) => item.stage === 'screening'
            ).length,
        },
        {
            type: 'Thi viết',
            value: employerCandidates.filter(
                (item) => item.stage === 'written-exam'
            ).length,
        },
        {
            type: 'Phỏng vấn',
            value: employerCandidates.filter(
                (item) => item.stage === 'interview'
            ).length,
        },
        {
            type: 'Đã chọn',
            value: employerCandidates.filter(
                (item) => item.stage === 'selected'
            ).length,
        },
    ]

    const jobApplicationData = employerJobs.map((job) => ({
        name: job.title,
        applicants: job.applicants,
    }))

    return (
        <div className="portal-page">
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">
                    Tổng quan tuyển dụng
                </span>
                <Title level={2}>
                    Tổng quan hệ thống tuyển dụng của đơn vị
                </Title>
                <Paragraph style={{ maxWidth: 760 }}>
                    Trang tổng quan employer đã được đồng bộ lại với back-office
                    mới: cùng layout, cùng thang màu và cùng hệ bề mặt card với
                    admin để thao tác quản trị nhất quán hơn.
                </Paragraph>
            </section>

            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} xl={6}>
                    <Card className="portal-section-card portal-stat-card">
                        <Space direction="vertical" size={16}>
                            <div className="portal-stat-card__icon">
                                <BarChartOutlined />
                            </div>
                            <Statistic
                                title="Tin đang mở"
                                value={stats.activeJobs}
                                suffix={
                                    <Text
                                        type="success"
                                        style={{ fontSize: 14 }}
                                    >
                                        +12%
                                    </Text>
                                }
                            />
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} sm={12} xl={6}>
                    <Card className="portal-section-card portal-stat-card">
                        <Space direction="vertical" size={16}>
                            <div className="portal-stat-card__icon">
                                <TeamOutlined />
                            </div>
                            <Statistic
                                title="Tổng ứng viên"
                                value={stats.totalApplicants}
                                suffix={
                                    <Text
                                        type="success"
                                        style={{ fontSize: 14 }}
                                    >
                                        +8%
                                    </Text>
                                }
                            />
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} sm={12} xl={6}>
                    <Card className="portal-section-card portal-stat-card">
                        <Space direction="vertical" size={16}>
                            <div className="portal-stat-card__icon">
                                <CalendarOutlined />
                            </div>
                            <Statistic
                                title="Lịch phỏng vấn"
                                value={stats.upcomingInterviews}
                                suffix={
                                    <Text className="portal-muted">
                                        Tuần này
                                    </Text>
                                }
                            />
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} sm={12} xl={6}>
                    <Card className="portal-section-card portal-stat-card">
                        <Space direction="vertical" size={16}>
                            <div className="portal-stat-card__icon">
                                <CheckCircleOutlined />
                            </div>
                            <Statistic
                                title="Ứng viên đã chọn"
                                value={stats.selectedCandidates}
                                suffix={
                                    <Text
                                        type="success"
                                        style={{ fontSize: 14 }}
                                    >
                                        +5%
                                    </Text>
                                }
                            />
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} xl={14}>
                    <Card
                        title="Ứng viên theo vị trí"
                        className="portal-section-card"
                    >
                        <div className={styles.chart}>
                            {chartsReady ? (
                                <Column
                                    height={320}
                                    data={jobApplicationData}
                                    xField="name"
                                    yField="applicants"
                                    color="#0B3D2E"
                                    label={{ position: 'top' }}
                                    axis={{
                                        x: {
                                            labelAutoRotate: false,
                                        },
                                    }}
                                />
                            ) : (
                                <Skeleton active paragraph={{ rows: 8 }} />
                            )}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} xl={10}>
                    <Card
                        title="Phân bổ theo giai đoạn"
                        className="portal-section-card"
                    >
                        <Pie
                            height={320}
                            data={stageData}
                            angleField="value"
                            colorField="type"
                            innerRadius={0.58}
                            label={{ text: 'type', position: 'outside' }}
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
                    </Card>
                </Col>
            </Row>

            <Card
                title="Lịch phỏng vấn sắp tới"
                className="portal-section-card"
            >
                <List
                    dataSource={employerInterviews.filter(
                        (item) => item.status === 'scheduled'
                    )}
                    renderItem={(item) => (
                        <List.Item>
                            <Space
                                style={{
                                    width: '100%',
                                    justifyContent: 'space-between',
                                }}
                                align="start"
                            >
                                <div>
                                    <Title
                                        level={5}
                                        style={{ marginBottom: 4 }}
                                    >
                                        {item.candidateName}
                                    </Title>
                                    <Text className="portal-muted">
                                        {item.position}
                                    </Text>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <Tag color="green">{item.type}</Tag>
                                    <div>
                                        <Text strong>
                                            {dayjs(item.date).format(
                                                'DD/MM/YYYY'
                                            )}{' '}
                                            - {item.time}
                                        </Text>
                                    </div>
                                    <Text className="portal-muted">
                                        {item.interviewer}
                                    </Text>
                                </div>
                            </Space>
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    )
}

export default EmployerDashboardPage
