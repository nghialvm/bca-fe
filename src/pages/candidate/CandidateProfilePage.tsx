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
                <span className="portal-hero__eyebrow">Ho so ca nhan</span>
                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} lg={16}>
                        <Title level={2}>Thong tin ca nhan va nang luc ho so</Title>
                        <Paragraph style={{ maxWidth: 720 }}>
                            Trang ho so da ket noi truc tiep voi candidate portal API,
                            hien thi thong tin contact, hoc van, kinh nghiem va cac diem
                            nhan chinh cua ung vien hien tai.
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
                                            {profile.currentPosition || 'Ung vien'}
                                        </Text>
                                        <div style={{ marginTop: 16 }}>
                                            <Button
                                                type="primary"
                                                icon={<EditOutlined />}
                                                disabled
                                            >
                                                Chinh sua ho so
                                            </Button>
                                        </div>
                                    </div>
                                </Space>
                            ) : (
                                <Empty description="Chua tim thay ho so candidate" />
                            )}
                        </Card>
                    </Col>
                </Row>
            </section>

            <Row gutter={[24, 24]}>
                <Col xs={24} xl={15}>
                    <Card
                        title="Thong tin chi tiet"
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
                                            So dien thoai
                                        </Space>
                                    }
                                >
                                    {profile.phoneNumber || '-'}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={
                                        <Space>
                                            <FileTextOutlined />
                                            So CCCD
                                        </Space>
                                    }
                                >
                                    {profile.identityNumber || '-'}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={
                                        <Space>
                                            <UserOutlined />
                                            Ngay sinh
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
                                            Dia chi
                                        </Space>
                                    }
                                >
                                    {profile.address || '-'}
                                </Descriptions.Item>
                            </Descriptions>
                        ) : (
                            <Empty description="Khong co du lieu ho so" />
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
                            title="Hoc van va kinh nghiem"
                            className="portal-section-card"
                            loading={loading}
                        >
                            <Text strong>Hoc van</Text>
                            <Paragraph className="portal-muted">
                                {profile
                                    ? [
                                          profile.highestEducation,
                                          profile.universityName,
                                          profile.major,
                                      ]
                                          .filter(Boolean)
                                          .join(' - ') || 'Chua cap nhat hoc van'
                                    : '-'}
                            </Paragraph>
                            <Divider />
                            <Text strong>Kinh nghiem</Text>
                            <Paragraph className="portal-muted">
                                {profile
                                    ? [
                                          profile.currentPosition,
                                          profile.currentCompany,
                                          profile.yearsOfExperience
                                              ? `${profile.yearsOfExperience} nam kinh nghiem`
                                              : null,
                                      ]
                                          .filter(Boolean)
                                          .join(' - ') ||
                                      'Chua cap nhat kinh nghiem lam viec'
                                    : '-'}
                            </Paragraph>
                        </Card>

                        <Card
                            title="Nang luc noi bat"
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
                                    description="Chua co diem nhan ho so"
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
