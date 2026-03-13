import {
    Avatar,
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Row,
    Space,
    Tag,
    Typography,
} from 'antd'

import {
    EditOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    MailOutlined,
    PhoneOutlined,
    UserOutlined,
} from '@ant-design/icons'

import { candidateProfile } from '@/mock/candidateData'

const { Paragraph, Text, Title } = Typography

const CandidateProfilePage = () => {
    return (
        <div className="portal-page">
            <section className="portal-hero">
                <span className="portal-hero__eyebrow">Hồ sơ cá nhân</span>
                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} lg={16}>
                        <Title level={2}>
                            Thông tin cá nhân và năng lực hồ sơ
                        </Title>
                        <Paragraph style={{ maxWidth: 720 }}>
                            Trang hồ sơ được làm lại theo cấu trúc rõ ràng hơn,
                            nhấn vào thông tin cốt lõi, kinh nghiệm và thế mạnh
                            nổi bật để đồng nhất với phong cách candidate mới.
                        </Paragraph>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Card className="portal-section-card">
                            <Space align="start" size={16}>
                                <Avatar
                                    size={72}
                                    style={{
                                        backgroundColor: '#0B3D2E',
                                        fontWeight: 700,
                                    }}
                                >
                                    {candidateProfile.fullName
                                        .split(' ')
                                        .slice(0, 2)
                                        .map((item) => item[0])
                                        .join('')}
                                </Avatar>
                                <div>
                                    <Title
                                        level={4}
                                        style={{ marginBottom: 4 }}
                                    >
                                        {candidateProfile.fullName}
                                    </Title>
                                    <Text className="portal-muted">
                                        {candidateProfile.role}
                                    </Text>
                                    <div style={{ marginTop: 16 }}>
                                        <Button
                                            type="primary"
                                            icon={<EditOutlined />}
                                        >
                                            Chỉnh sửa hồ sơ
                                        </Button>
                                    </div>
                                </div>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </section>

            <Row gutter={[24, 24]}>
                <Col xs={24} xl={15}>
                    <Card
                        title="Thông tin chi tiết"
                        className="portal-section-card"
                    >
                        <Descriptions column={1} size="middle">
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <MailOutlined />
                                        Email
                                    </Space>
                                }
                            >
                                {candidateProfile.email}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <PhoneOutlined />
                                        Số điện thoại
                                    </Space>
                                }
                            >
                                {candidateProfile.phone}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <FileTextOutlined />
                                        Số CCCD
                                    </Space>
                                }
                            >
                                {candidateProfile.idNumber}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <UserOutlined />
                                        Ngày sinh
                                    </Space>
                                }
                            >
                                {candidateProfile.dateOfBirth}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <EnvironmentOutlined />
                                        Địa chỉ
                                    </Space>
                                }
                            >
                                {candidateProfile.address}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                <Col xs={24} xl={9}>
                    <Space
                        direction="vertical"
                        size={24}
                        style={{ width: '100%' }}
                    >
                        <Card
                            title="Học vấn và kinh nghiệm"
                            className="portal-section-card"
                        >
                            <Text strong>Học vấn</Text>
                            <Paragraph className="portal-muted">
                                {candidateProfile.education}
                            </Paragraph>
                            <Divider />
                            <Text strong>Kinh nghiệm</Text>
                            <Paragraph className="portal-muted">
                                {candidateProfile.experience}
                            </Paragraph>
                        </Card>

                        <Card
                            title="Năng lực nổi bật"
                            className="portal-section-card"
                        >
                            <div className="portal-chip-row">
                                {candidateProfile.strengths.map((skill) => (
                                    <Tag
                                        key={skill}
                                        className="portal-tag-soft"
                                    >
                                        {skill}
                                    </Tag>
                                ))}
                            </div>
                        </Card>
                    </Space>
                </Col>
            </Row>
        </div>
    )
}

export default CandidateProfilePage
