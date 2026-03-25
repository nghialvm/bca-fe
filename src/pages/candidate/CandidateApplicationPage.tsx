import {
    Alert,
    Card,
    Col,
    Empty,
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

import { useCandidateWorkspace } from '@/hooks/useCandidateWorkspace'
import { getApplicationStatusColor, getApplicationStatusLabel } from '@/utils/admin'
import {
    getCandidateApplicationProgress,
    isCandidateActionRequired,
} from '@/utils/candidate'

const { Paragraph, Text, Title } = Typography

const CandidateApplicationPage = () => {
    const { applications, loading } = useCandidateWorkspace()
    const actionItems = applications.filter((item) =>
        isCandidateActionRequired(item.status)
    )

    return (
        <div className="portal-page">
            <section className="portal-hero">
                <span className="portal-hero__eyebrow">Theo dõi hồ sơ</span>
                <Title level={2}>Theo dõi từng hồ sơ ứng tuyển theo thời gian</Title>
                <Paragraph style={{ maxWidth: 760 }}>
                    Danh sách bên dưới lấy trực tiếp từ candidate portal API và gồm
                    đầy đủ mã hồ sơ, trạng thái xử lý và thông tin vị trí tuyển dụng.
                </Paragraph>
            </section>

            <Alert
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                message="Lưu ý"
                description="Các hồ sơ đang ở vòng phỏng vấn hoặc đã gửi offer sẽ được ưu tiên hiển thị trong mục việc cần làm để bạn thao tác nhanh hơn."
            />

            <Row gutter={[24, 24]}>
                <Col xs={24} xl={16}>
                    <Card title="Danh sách hồ sơ" className="portal-section-card">
                        {applications.length ? (
                            <List
                                loading={loading}
                                dataSource={applications}
                                renderItem={(item) => {
                                    const label = getApplicationStatusLabel(
                                        item.status
                                    )
                                    const color = getApplicationStatusColor(
                                        item.status
                                    )

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
                                                            {item.departmentName}
                                                        </Text>
                                                    </div>
                                                    <Tag color={color}>{label}</Tag>
                                                </div>

                                                <Space
                                                    wrap
                                                    size="large"
                                                    style={{ marginTop: 16 }}
                                                >
                                                    <Text>
                                                        <FileTextOutlined /> Mã hồ sơ:{' '}
                                                        {item.applicationCode}
                                                    </Text>
                                                    <Text>
                                                        <CalendarOutlined /> Nộp:{' '}
                                                        {dayjs(item.appliedTime).format(
                                                            'DD/MM/YYYY'
                                                        )}
                                                    </Text>
                                                </Space>

                                                <Paragraph
                                                    className="portal-muted"
                                                    style={{ marginTop: 12 }}
                                                >
                                                    {item.note ||
                                                        `${item.jobPositionName || 'Vị trí'}${item.workLocation ? ` tại ${item.workLocation}` : ''}.`}
                                                </Paragraph>

                                                <Progress
                                                    percent={getCandidateApplicationProgress(
                                                        item.status
                                                    )}
                                                    strokeColor="#0B3D2E"
                                                    showInfo={false}
                                                />
                                            </div>
                                        </List.Item>
                                    )
                                }}
                            />
                        ) : (
                            <Empty description="Bạn chưa nộp hồ sơ ứng tuyển nào" />
                        )}
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
                                        children: 'Tiếp nhận và đối chiếu hồ sơ',
                                    },
                                    {
                                        color: '#2E7D60',
                                        dot: <FileProtectOutlined />,
                                        children: 'Sàng lọc và đánh giá chuyên môn',
                                    },
                                    {
                                        color: '#B7791F',
                                        dot: <SolutionOutlined />,
                                        children: 'Phỏng vấn và xử lý offer',
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
                            {actionItems.length ? (
                                <List
                                    loading={loading}
                                    dataSource={actionItems}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <div>
                                                <Text strong>{item.title}</Text>
                                                <Paragraph
                                                    className="portal-muted"
                                                    style={{ margin: '6px 0 0' }}
                                                >
                                                    {item.note ||
                                                        `${getApplicationStatusLabel(item.status)} - theo dõi email và thông báo hệ thống.`}
                                                </Paragraph>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="Hiện không có tác vụ cần xử lý ngay"
                                />
                            )}
                        </Card>
                    </Space>
                </Col>
            </Row>
        </div>
    )
}

export default CandidateApplicationPage
