import {
    Card,
    Col,
    Descriptions,
    Row,
    Space,
    Statistic,
    Tag,
    Typography,
} from 'antd'

import {
    EnvironmentOutlined,
    MailOutlined,
    PhoneOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons'

import {
    employerCandidates,
    employerJobs,
    employerProfile,
} from '@/mock/employerData'

const { Paragraph, Text, Title } = Typography

const EmployerProfilePage = () => {
    return (
        <div className="portal-page">
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Thông tin đơn vị</span>
                <Title level={2}>Thông tin đơn vị tuyển dụng</Title>
                <Paragraph style={{ maxWidth: 760 }}>
                    Trang hồ sơ employer được chuẩn hóa để cùng một cấu trúc
                    trình bày với toàn bộ hệ back-office: rõ thông tin đầu mối,
                    mô tả đơn vị và các chỉ số vận hành cốt lõi.
                </Paragraph>
            </section>

            <Row gutter={[24, 24]}>
                <Col xs={24} xl={15}>
                    <Card
                        title="Thông tin chung"
                        className="portal-section-card"
                    >
                        <Descriptions column={1}>
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <TeamOutlined />
                                        Đơn vị
                                    </Space>
                                }
                            >
                                {employerProfile.organization}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <UserOutlined />
                                        Đầu mối phụ trách
                                    </Space>
                                }
                            >
                                {employerProfile.contactPerson}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <MailOutlined />
                                        Email
                                    </Space>
                                }
                            >
                                {employerProfile.email}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <PhoneOutlined />
                                        Số điện thoại
                                    </Space>
                                }
                            >
                                {employerProfile.phone}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <EnvironmentOutlined />
                                        Địa chỉ
                                    </Space>
                                }
                            >
                                {employerProfile.address}
                            </Descriptions.Item>
                        </Descriptions>
                        <Paragraph
                            className="portal-muted"
                            style={{ marginTop: 8 }}
                        >
                            {employerProfile.description}
                        </Paragraph>
                    </Card>
                </Col>

                <Col xs={24} xl={9}>
                    <Space
                        direction="vertical"
                        size={24}
                        style={{ width: '100%' }}
                    >
                        <Card className="portal-section-card">
                            <Statistic
                                title="Tin đang mở"
                                value={
                                    employerJobs.filter(
                                        (item) => item.status === 'active'
                                    ).length
                                }
                            />
                            <div style={{ marginTop: 16 }}>
                                <Tag color="green">Đang hoạt động tốt</Tag>
                            </div>
                        </Card>
                        <Card className="portal-section-card">
                            <Statistic
                                title="Ứng viên đang xử lý"
                                value={employerCandidates.length}
                            />
                            <Text className="portal-muted">
                                Bao gồm các giai đoạn hồ sơ mới, sàng lọc, thi
                                viết và phỏng vấn.
                            </Text>
                        </Card>
                    </Space>
                </Col>
            </Row>
        </div>
    )
}

export default EmployerProfilePage
