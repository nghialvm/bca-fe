import {
    Avatar,
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Empty,
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
import dayjs from 'dayjs'

import { useCandidateWorkspace } from '@/hooks/useCandidateWorkspace'
import { getCandidateProfileStrengths } from '@/utils/candidate'

const { Paragraph, Text, Title } = Typography

const getInitials = (fullName?: string | null) => {
    if (!fullName) return 'UV'

    return fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((item) => item[0]?.toUpperCase() || '')
        .join('')
}

const CandidateProfilePage = () => {
    const { profile, loading } = useCandidateWorkspace()
    const strengths = getCandidateProfileStrengths(profile)

    return (
        <div className="portal-page">
            <section className="portal-hero">
                <span className="portal-hero__eyebrow">Hồ sơ cá nhân</span>
                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} lg={16}>
                        <Title level={2}>Thông tin cá nhân và năng lực hồ sơ</Title>
                        <Paragraph style={{ maxWidth: 720 }}>
                            Trang hồ sơ đã kết nối trực tiếp với candidate portal API,
                            hiển thị thông tin liên hệ, học vấn, kinh nghiệm và các
                            điểm nhấn chính của ứng viên hiện tại.
                        </Paragraph>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Card className="portal-section-card" loading={loading}>
                            {profile ? (
                                <Space align="start" size={16}>
                                    <Avatar
                                        size={72}
                                        style={{
                                            backgroundColor: '#0B3D2E',
                                            fontWeight: 700,
                                        }}
                                    >
                                        {getInitials(profile.fullName)}
                                    </Avatar>
                                    <div>
                                        <Title level={4} style={{ marginBottom: 4 }}>
                                            {profile.fullName}
                                        </Title>
                                        <Text className="portal-muted">
                                            {profile.currentPosition || 'Ứng viên'}
                                        </Text>
                                        <div style={{ marginTop: 16 }}>
                                            <Button
                                                type="primary"
                                                icon={<EditOutlined />}
                                                disabled
                                            >
                                                Chỉnh sửa hồ sơ
                                            </Button>
                                        </div>
                                    </div>
                                </Space>
                            ) : (
                                <Empty description="Chưa tìm thấy hồ sơ ứng viên" />
                            )}
                        </Card>
                    </Col>
                </Row>
            </section>

            <Row gutter={[24, 24]}>
                <Col xs={24} xl={15}>
                    <Card
                        title="Thông tin chi tiết"
                        className="portal-section-card"
                        loading={loading}
                    >
                        {profile ? (
                            <Descriptions column={1} size="middle">
                                <Descriptions.Item
                                    label={
                                        <Space>
                                            <MailOutlined />
                                            Email
                                        </Space>
                                    }
                                >
                                    {profile.email || '-'}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={
                                        <Space>
                                            <PhoneOutlined />
                                            Số điện thoại
                                        </Space>
                                    }
                                >
                                    {profile.phoneNumber || '-'}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={
                                        <Space>
                                            <FileTextOutlined />
                                            Số CCCD
                                        </Space>
                                    }
                                >
                                    {profile.identityNumber || '-'}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={
                                        <Space>
                                            <UserOutlined />
                                            Ngày sinh
                                        </Space>
                                    }
                                >
                                    {profile.dateOfBirth
                                        ? dayjs(profile.dateOfBirth).format(
                                              'DD/MM/YYYY'
                                          )
                                        : '-'}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={
                                        <Space>
                                            <EnvironmentOutlined />
                                            Địa chỉ
                                        </Space>
                                    }
                                >
                                    {profile.address || '-'}
                                </Descriptions.Item>
                            </Descriptions>
                        ) : (
                            <Empty description="Không có dữ liệu hồ sơ" />
                        )}
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
                            loading={loading}
                        >
                            <Text strong>Học vấn</Text>
                            <Paragraph className="portal-muted">
                                {profile
                                    ? [
                                          profile.highestEducation,
                                          profile.universityName,
                                          profile.major,
                                      ]
                                          .filter(Boolean)
                                          .join(' - ') || 'Chưa cập nhật học vấn'
                                    : '-'}
                            </Paragraph>
                            <Divider />
                            <Text strong>Kinh nghiệm</Text>
                            <Paragraph className="portal-muted">
                                {profile
                                    ? [
                                          profile.currentPosition,
                                          profile.currentCompany,
                                          profile.yearsOfExperience
                                              ? `${profile.yearsOfExperience} năm kinh nghiệm`
                                              : null,
                                      ]
                                          .filter(Boolean)
                                          .join(' - ') ||
                                      'Chưa cập nhật kinh nghiệm làm việc'
                                    : '-'}
                            </Paragraph>
                        </Card>

                        <Card
                            title="Năng lực nổi bật"
                            className="portal-section-card"
                            loading={loading}
                        >
                            {strengths.length ? (
                                <div className="portal-chip-row">
                                    {strengths.map((skill) => (
                                        <Tag key={skill} className="portal-tag-soft">
                                            {skill}
                                        </Tag>
                                    ))}
                                </div>
                            ) : (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="Chưa có điểm nhấn hồ sơ"
                                />
                            )}
                        </Card>
                    </Space>
                </Col>
            </Row>
        </div>
    )
}

export default CandidateProfilePage
