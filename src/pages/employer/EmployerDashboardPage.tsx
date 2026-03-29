import { useEffect, useMemo, useState } from 'react'

import {
    Card,
    Col,
    Empty,
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

import { useEmployerWorkspace } from '@/hooks/useEmployerWorkspace'
import { formatCount } from '@/utils/admin'
import {
    buildApplicationStageStats,
    getInterviewStatusLabel,
    getInterviewTypeLabel,
    isApplicationSelected,
    isRecruitmentRequestPublished,
} from '@/utils/employer'

import styles from '../styles/AdminUi.module.css'

const { Paragraph, Text, Title } = Typography

const EmployerDashboardPage = () => {
    const [chartsReady, setChartsReady] = useState(false)
    const { applicationRows, interviews, loading, recruitmentRequests } =
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

    const jobApplicantCount = useMemo(() => {
        return applicationRows.reduce(
            (accumulator, row) => {
                const key = row.recruitmentRequest?.id
                if (!key) return accumulator

                const title =
                    row.recruitmentRequest?.title ||
                    row.jobPosition?.name ||
                    row.recruitmentRequest?.requestCode ||
                    'Tin tuyển dụng'

                accumulator[key] = {
                    name: title,
                    applicants: (accumulator[key]?.applicants || 0) + 1,
                }

                return accumulator
            },
            {} as Record<string, { name: string; applicants: number }>
        )
    }, [applicationRows])

    const upcomingInterviews = useMemo(
        () =>
            interviews
                .filter((item) =>
                    ['1', '2', '3', 'pending', 'confirmed', 'rescheduled'].includes(
                        String(item.status).toLowerCase()
                    )
                )
                .sort(
                    (left, right) =>
                        dayjs(left.scheduledTime).valueOf() -
                        dayjs(right.scheduledTime).valueOf()
                ),
        [interviews]
    )

    const stats = {
        activeJobs: recruitmentRequests.filter((item) =>
            isRecruitmentRequestPublished(item.status)
        ).length,
        totalApplicants: applicationRows.length,
        upcomingInterviews: upcomingInterviews.length,
        selectedCandidates: applicationRows.filter((item) =>
            isApplicationSelected(item.application.status)
        ).length,
    }

    const stageData = buildApplicationStageStats(
        applicationRows.map((item) => item.application.status)
    )
    const jobApplicationData = Object.values(jobApplicantCount)

    return (
        <div className="portal-page">
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">
                    Tổng quan tuyển dụng
                </span>
                <Title level={2}>Bức tranh tuyển dụng của đơn vị</Title>
                <Paragraph style={{ maxWidth: 760 }}>
                    Theo dõi nhanh các vị trí đang mở, số lượng hồ sơ, lịch
                    phỏng vấn sắp tới và tiến độ tuyển dụng của đơn vị.
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
                                formatter={(value) => formatCount(Number(value))}
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
                                formatter={(value) => formatCount(Number(value))}
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
                                formatter={(value) => formatCount(Number(value))}
                                suffix={<Text className="portal-muted">Sắp tới</Text>}
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
                                formatter={(value) => formatCount(Number(value))}
                            />
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} xl={12}>
                    <Card
                        title="Ứng viên theo vị trí"
                        className="portal-section-card"
                    >
                        <div className={styles.chart}>
                            {loading ? (
                                <Skeleton active paragraph={{ rows: 8 }} />
                            ) : jobApplicationData.length && chartsReady ? (
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
                                    meta={{
                                        name: { alias: 'Vị trí' },
                                        applicants: { alias: 'Số ứng viên' },
                                    }}
                                    tooltip={{ title: 'name' }}
                                />
                            ) : (
                                <Empty description="Chưa có dữ liệu ứng viên theo vị trí" />
                            )}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} xl={12}>
                    <Card
                        title="Phân bố theo giai đoạn"
                        className="portal-section-card"
                    >
                        {loading ? (
                            <Skeleton active paragraph={{ rows: 8 }} />
                        ) : stageData.some((item) => item.value > 0) ? (
                            <Pie
                                height={320}
                                data={stageData}
                                angleField="value"
                                colorField="type"
                                label={{ text: 'type' }}
                                legend={{ color: { position: 'right' } }}
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
                                meta={{
                                    type: { alias: 'Giai đoạn' },
                                    value: { alias: 'Số lượng' },
                                }}
                                tooltip={{ title: 'type' }}
                            />
                        ) : (
                            <Empty description="Chưa có dữ liệu giai đoạn tuyển dụng" />
                        )}
                    </Card>
                </Col>
            </Row>

            <Card
                title="Lịch phỏng vấn sắp tới"
                className="portal-section-card"
            >
                {loading ? (
                    <Skeleton active paragraph={{ rows: 6 }} />
                ) : upcomingInterviews.length ? (
                    <List
                        dataSource={upcomingInterviews}
                        renderItem={(item) => {
                            const applicationRow = applicationRows.find(
                                (row) => row.application.id === item.applicationId
                            )

                            return (
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
                                                {applicationRow?.candidate?.fullName ||
                                                    'Ứng viên'}
                                            </Title>
                                            <Text className="portal-muted">
                                                {applicationRow?.recruitmentRequest
                                                    ?.title || '-'}
                                            </Text>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <Tag color="green">
                                                {getInterviewTypeLabel(
                                                    item.interviewType
                                                )}
                                            </Tag>
                                            <Tag color="blue">
                                                {getInterviewStatusLabel(
                                                    item.status
                                                )}
                                            </Tag>
                                            <div>
                                                <Text strong>
                                                    {dayjs(
                                                        item.scheduledTime
                                                    ).format('DD/MM/YYYY HH:mm')}
                                                </Text>
                                            </div>
                                            <Text className="portal-muted">
                                                {item.contactPerson ||
                                                    'Chưa cập nhật người phỏng vấn'}
                                            </Text>
                                        </div>
                                    </Space>
                                </List.Item>
                            )
                        }}
                    />
                ) : (
                    <Empty description="Chưa có lịch phỏng vấn sắp tới" />
                )}
            </Card>
        </div>
    )
}

export default EmployerDashboardPage
