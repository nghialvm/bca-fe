import {
    Alert,
    Card,
    Col,
    List,
    Progress,
    Row,
    Space,
    Tag,
    Timeline,
    Typography,
} from 'antd'

import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    FileProtectOutlined,
    FileTextOutlined,
    InfoCircleOutlined,
    SolutionOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import {
    CandidateApplicationStatus,
    candidateApplications,
} from '@/mock/candidateData'

const { Paragraph, Text, Title } = Typography

const statusMeta: Record<
    CandidateApplicationStatus,
    { color: string; label: string; percent: number }
> = {
    pending: {
        color: 'default',
        label: 'Tiếp nhận',
        percent: 25,
    },
    reviewing: {
        color: 'processing',
        label: 'Đang xét duyệt',
        percent: 50,
    },
    interview: {
        color: 'warning',
        label: 'Mời phỏng vấn',
        percent: 80,
    },
    accepted: {
        color: 'success',
        label: 'Đã trúng tuyển',
        percent: 100,
    },
    rejected: {
        color: 'error',
        label: 'Không đạt',
        percent: 100,
    },
    supplement: {
        color: 'gold',
        label: 'Cần bổ sung',
        percent: 60,
    },
}

const CandidateApplicationPage = () => {
    return (
        <div className="portal-page">
            <section className="portal-hero">
                <span className="portal-hero__eyebrow">Theo dõi hồ sơ</span>
                <Title level={2}>
                    Theo dõi từng hồ sơ ứng tuyển theo thời gian
                </Title>
                <Paragraph style={{ maxWidth: 760 }}>
                    Bố cục trang ưu tiên khả năng theo dõi trạng thái nhanh, gần
                    hơn với design candidate qua cách dùng thẻ trạng thái, thanh
                    tiến độ và timeline xử lý ngay trên cùng một màn hình.
                </Paragraph>
            </section>

            <Alert
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                message="Lưu ý"
                description="Hồ sơ cần bổ sung sẽ được ưu tiên hiển thị ở đầu danh sách. Bạn nên cập nhật trước ngày hẹn trong thông báo để không ảnh hưởng kết quả."
            />

            <Row gutter={[24, 24]}>
                <Col xs={24} xl={16}>
                    <Card
                        title="Danh sách hồ sơ"
                        className="portal-section-card"
                    >
                        <List
                            dataSource={candidateApplications}
                            renderItem={(item) => {
                                const meta = statusMeta[item.status]

                                return (
                                    <List.Item>
                                        <div style={{ width: '100%' }}>
                                            <div className="portal-split">
                                                <div>
                                                    <Title
                                                        level={5}
                                                        style={{
                                                            marginBottom: 4,
                                                        }}
                                                    >
                                                        {item.title}
                                                    </Title>
                                                    <Text className="portal-muted">
                                                        {item.department}
                                                    </Text>
                                                </div>
                                                <Tag color={meta.color}>
                                                    {meta.label}
                                                </Tag>
                                            </div>

                                            <Space
                                                wrap
                                                size="large"
                                                style={{ marginTop: 16 }}
                                            >
                                                <Text>
                                                    <FileTextOutlined /> Mã hồ
                                                    sơ: {item.id}
                                                </Text>
                                                <Text>
                                                    <CalendarOutlined /> Nộp:{' '}
                                                    {dayjs(
                                                        item.submittedDate
                                                    ).format('DD/MM/YYYY')}
                                                </Text>
                                            </Space>

                                            <Paragraph
                                                className="portal-muted"
                                                style={{ marginTop: 12 }}
                                            >
                                                {item.note}
                                            </Paragraph>

                                            <Progress
                                                percent={meta.percent}
                                                strokeColor="#0B3D2E"
                                                showInfo={false}
                                            />
                                        </div>
                                    </List.Item>
                                )
                            }}
                        />
                    </Card>
                </Col>

                <Col xs={24} xl={8}>
                    <Space
                        direction="vertical"
                        size={24}
                        style={{ width: '100%' }}
                    >
                        <Card
                            title="Trạng thái xử lý"
                            className="portal-section-card"
                        >
                            <Timeline
                                items={[
                                    {
                                        color: '#0B3D2E',
                                        dot: <ClockCircleOutlined />,
                                        children:
                                            'Tiếp nhận và đối chiếu hồ sơ',
                                    },
                                    {
                                        color: '#2E7D60',
                                        dot: <FileProtectOutlined />,
                                        children:
                                            'Đánh giá chuyên môn và xét duyệt',
                                    },
                                    {
                                        color: '#B7791F',
                                        dot: <SolutionOutlined />,
                                        children:
                                            'Phỏng vấn, sát hạch, thông báo bổ sung',
                                    },
                                    {
                                        color: '#166534',
                                        dot: <CheckCircleOutlined />,
                                        children:
                                            'Thông báo kết quả và hướng dẫn tiếp theo',
                                    },
                                ]}
                            />
                        </Card>

                        <Card
                            title="Việc cần làm"
                            className="portal-section-card"
                        >
                            <List
                                dataSource={candidateApplications.filter(
                                    (item) =>
                                        item.status === 'supplement' ||
                                        item.status === 'interview'
                                )}
                                renderItem={(item) => (
                                    <List.Item>
                                        <div>
                                            <Text strong>{item.title}</Text>
                                            <Paragraph
                                                className="portal-muted"
                                                style={{ margin: '6px 0 0' }}
                                            >
                                                {item.note}
                                            </Paragraph>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Space>
                </Col>
            </Row>
        </div>
    )
}

export default CandidateApplicationPage
