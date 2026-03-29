import { useEffect, useState } from 'react'

import {
    Avatar,
    Button,
    Card,
    Col,
    DatePicker,
    Descriptions,
    Divider,
    Empty,
    Form,
    Input,
    InputNumber,
    Modal,
    Row,
    Select,
    Space,
    Tag,
    Typography,
} from 'antd'

import {
    EditOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    UserOutlined,
} from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { useNavigate } from 'react-router-dom'

import { PATHS } from '@/routers/path'
import { useCandidateWorkspace } from '@/hooks/useCandidateWorkspace'
import { getCandidateProfileStrengths } from '@/utils/candidate'

const { Paragraph, Text, Title } = Typography

type ProfileFormValues = {
    fullName: string
    email: string
    phoneNumber: string
    identityNumber: string
    dateOfBirth?: Dayjs
    gender?: number
    address: string
    currentCompany?: string
    currentPosition: string
    yearsOfExperience: number
    highestEducation: string
    universityName?: string
    major?: string
}

const genderOptions = [
    { label: 'Nữ', value: 0 },
    { label: 'Nam', value: 1 },
    { label: 'Khác', value: 2 },
]

const getInitials = (fullName?: string | null) => {
    if (!fullName) return 'UV'

    return fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((item) => item[0]?.toUpperCase() || '')
        .join('')
}

const normalizeGender = (value: unknown) => {
    const key = String(value ?? '')
        .trim()
        .replace(/[\s_-]+/g, '')
        .toLowerCase()

    if (['0', 'female', 'nu', 'nữ'].includes(key)) return 0
    if (['1', 'male', 'nam'].includes(key)) return 1
    if (['2', 'other', 'khac', 'khác'].includes(key)) return 2

    return 1
}

const CandidateProfilePage = () => {
    const navigate = useNavigate()
    const { profile, loading, savingProfile, updateProfile } =
        useCandidateWorkspace()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [form] = Form.useForm<ProfileFormValues>()
    const strengths = getCandidateProfileStrengths(profile)

    useEffect(() => {
        if (!profile || !isEditModalOpen) {
            return
        }

        form.setFieldsValue({
            fullName: profile.fullName || '',
            email: profile.email || '',
            phoneNumber: profile.phoneNumber || '',
            identityNumber: profile.identityNumber || '',
            dateOfBirth: profile.dateOfBirth
                ? dayjs(profile.dateOfBirth)
                : undefined,
            gender: normalizeGender(profile.gender),
            address: profile.address || '',
            currentCompany: profile.currentCompany || '',
            currentPosition: profile.currentPosition || '',
            yearsOfExperience: profile.yearsOfExperience ?? 0,
            highestEducation: profile.highestEducation || '',
            universityName: profile.universityName || '',
            major: profile.major || '',
        })
    }, [form, isEditModalOpen, profile])

    const openEditModal = () => {
        if (!profile) {
            return
        }

        setIsEditModalOpen(true)
    }

    const closeEditModal = () => {
        setIsEditModalOpen(false)
        form.resetFields()
    }

    const handleSubmitProfile = async () => {
        if (!profile) {
            return
        }

        try {
            const values = await form.validateFields()

            const updated = await updateProfile({
                candidateCode: profile.candidateCode,
                candidateType: Number(profile.candidateType ?? 2),
                employeeId: profile.employeeId ?? null,
                fullName: values.fullName.trim(),
                dateOfBirth: values.dateOfBirth?.toISOString() || null,
                gender: Number(values.gender ?? normalizeGender(profile.gender)),
                phoneNumber: values.phoneNumber.trim(),
                email: values.email.trim(),
                address: values.address.trim(),
                identityNumber: values.identityNumber.trim(),
                currentCompany: values.currentCompany?.trim() || '',
                currentPosition: values.currentPosition.trim(),
                yearsOfExperience: values.yearsOfExperience ?? 0,
                highestEducation: values.highestEducation.trim(),
                universityName: values.universityName?.trim() || '',
                major: values.major?.trim() || '',
                status: Number(profile.status ?? 1),
                source: profile.source?.trim() || 'Candidate',
                note: profile.note?.trim() || '',
            })

            if (updated) {
                closeEditModal()
            }
        } catch (error) {
            if (
                typeof error === 'object' &&
                error !== null &&
                'errorFields' in error
            ) {
                return
            }
        }
    }

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
                            Cập nhật thông tin cá nhân, học vấn và kinh nghiệm
                            để hồ sơ của bạn luôn đầy đủ và rõ ràng với nhà tuyển dụng.
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
                                            <Space wrap>
                                                <Button
                                                    type="primary"
                                                    icon={<EditOutlined />}
                                                    onClick={openEditModal}
                                                >
                                                    Chỉnh sửa hồ sơ
                                                </Button>
                                                <Button
                                                    icon={<LockOutlined />}
                                                    onClick={() =>
                                                        navigate(PATHS.CHANGE_PASSWORD)
                                                    }
                                                >
                                                    Đổi mật khẩu
                                                </Button>
                                            </Space>
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
                                          .join(' - ') ||
                                      'Chưa cập nhật học vấn'
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

            <Modal
                title="Chỉnh sửa hồ sơ ứng viên"
                open={isEditModalOpen}
                onCancel={closeEditModal}
                onOk={() => void handleSubmitProfile()}
                okText="Lưu thay đổi"
                cancelText="Hủy"
                confirmLoading={savingProfile}
                width={760}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Họ và tên"
                        name="fullName"
                        rules={[
                            {
                                required: true,
                                message: 'Nhập họ và tên của bạn.',
                            },
                        ]}
                    >
                        <Input placeholder="Nhập họ và tên" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Nhập email.',
                                    },
                                    {
                                        type: 'email',
                                        message: 'Email không hợp lệ.',
                                    },
                                ]}
                            >
                                <Input placeholder="Nhập email" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Số điện thoại"
                                name="phoneNumber"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Nhập số điện thoại.',
                                    },
                                ]}
                            >
                                <Input placeholder="Nhập số điện thoại" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Số CCCD"
                                name="identityNumber"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Nhập số CCCD.',
                                    },
                                ]}
                            >
                                <Input placeholder="Nhập số CCCD" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Ngày sinh" name="dateOfBirth">
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Giới tính" name="gender">
                                <Select
                                    options={genderOptions}
                                    placeholder="Chọn giới tính"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Số năm kinh nghiệm"
                                name="yearsOfExperience"
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    placeholder="Ví dụ: 3"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Địa chỉ"
                        name="address"
                        rules={[
                            {
                                required: true,
                                message: 'Nhập địa chỉ của bạn.',
                            },
                        ]}
                    >
                        <Input placeholder="Nhập địa chỉ" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Công ty hiện tại" name="currentCompany">
                                <Input placeholder="Nhập công ty hiện tại" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Vị trí hiện tại"
                                name="currentPosition"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Nhập vị trí hiện tại.',
                                    },
                                ]}
                            >
                                <Input placeholder="Nhập vị trí hiện tại" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Học vấn cao nhất"
                                name="highestEducation"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Nhập học vấn cao nhất.',
                                    },
                                ]}
                            >
                                <Input placeholder="Ví dụ: Đại học" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Trường học" name="universityName">
                                <Input placeholder="Nhập tên trường" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Chuyên ngành" name="major">
                        <Input placeholder="Nhập chuyên ngành" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default CandidateProfilePage
