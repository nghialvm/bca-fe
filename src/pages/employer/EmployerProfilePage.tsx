import {
    Card,
    Col,
    Descriptions,
    Empty,
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

import { useEmployerWorkspace } from '@/hooks/useEmployerWorkspace'
import { formatCount } from '@/utils/admin'
import { isRecruitmentRequestPublished } from '@/utils/employer'

const { Paragraph, Text, Title } = Typography

const EmployerProfilePage = () => {
    const { applicationRows, currentDepartment, managerUser, recruitmentRequests } =
        useEmployerWorkspace()

    const activeJobs = recruitmentRequests.filter((item) =>
        isRecruitmentRequestPublished(item.status)
    ).length

    if (!currentDepartment) {
        return (
            <div className="portal-page">
                <section className="portal-hero portal-hero--light">
                    <span className="portal-hero__eyebrow">Thông tin đơn vị</span>
                    <Title level={2}>Thông tin đơn vị tuyển dụng</Title>
                    <Paragraph style={{ maxWidth: 760 }}>
                        Chưa xác định được đơn vị employer mà tài khoản hiện tại
                        đang quản lý.
                    </Paragraph>
                </section>

                <Card className="portal-section-card">
                    <Empty description="Không tìm thấy đơn vị được phân công cho tài khoản này" />
                </Card>
            </div>
        )
    }

    return (
        <div className="portal-page">
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Thông tin đơn vị</span>
                <Title level={2}>Thông tin đơn vị tuyển dụng</Title>
                <Paragraph style={{ maxWidth: 760 }}>
                    Trang hồ sơ employer hiện được đồng bộ từ dữ liệu đơn vị,
                    người quản lý và các chỉ số tuyển dụng thực tế của hệ thống.
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
                                {currentDepartment.name}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <UserOutlined />
                                        Đầu mối phụ trách
                                    </Space>
                                }
                            >
                                {managerUser?.name || managerUser?.userName || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <MailOutlined />
                                        Email
                                    </Space>
                                }
                            >
                                {managerUser?.email || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <PhoneOutlined />
                                        Số điện thoại
                                    </Space>
                                }
                            >
                                {managerUser?.phoneNumber || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <EnvironmentOutlined />
                                        Mã đơn vị
                                    </Space>
                                }
                            >
                                {currentDepartment.code}
                            </Descriptions.Item>
                        </Descriptions>
                        <Paragraph
                            className="portal-muted"
                            style={{ marginTop: 8 }}
                        >
                            {currentDepartment.description ||
                                'Chưa cập nhật mô tả đơn vị.'}
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
                                value={activeJobs}
                                formatter={(value) => formatCount(Number(value))}
                            />
                            <div style={{ marginTop: 16 }}>
                                <Tag color="green">Đang hoạt động tốt</Tag>
                            </div>
                        </Card>
                        <Card className="portal-section-card">
                            <Statistic
                                title="Ứng viên đang xử lý"
                                value={applicationRows.length}
                                formatter={(value) => formatCount(Number(value))}
                            />
                            <Text className="portal-muted">
                                Bao gồm toàn bộ hồ sơ thuộc các đợt tuyển dụng của
                                đơn vị.
                            </Text>
                        </Card>
                    </Space>
                </Col>
            </Row>
        </div>
    )
}

export default EmployerProfilePage
