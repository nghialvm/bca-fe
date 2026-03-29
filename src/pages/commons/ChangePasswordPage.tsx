import { FC, useState } from 'react'

import { Button, Card, Form, Input, Space, Typography, notification } from 'antd'

import { LockOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { PATHS } from '@/routers/path'
import AuthService from '@/services/auth'
import { getDefaultPathByRole, getProfilePathByRole, getSiteRole } from '@/utils/role'

const { Paragraph, Title } = Typography

type ChangePasswordFormValues = {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

const ChangePasswordPage: FC = () => {
    const navigate = useNavigate()
    const user = useSelector((state: any) => state.auth.user)
    const [loading, setLoading] = useState(false)
    const siteRole = getSiteRole(user)
    const fallbackPath = siteRole
        ? getProfilePathByRole(siteRole)
        : getDefaultPathByRole(siteRole)

    const handleSubmit = async (values: ChangePasswordFormValues) => {
        setLoading(true)
        try {
            await AuthService.changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            })

            notification.success({
                message: 'Đổi mật khẩu thành công',
                description: 'Mật khẩu của bạn đã được cập nhật.',
            })
            navigate(fallbackPath || PATHS.HOME, { replace: true })
        } catch (error: any) {
            notification.error({
                message: 'Không thể đổi mật khẩu',
                description:
                    error?.response?.data?.error?.message ||
                    'Vui lòng kiểm tra lại mật khẩu hiện tại và thử lại.',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="portal-page">
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Bảo mật tài khoản</span>
                <Title level={2}>Đổi mật khẩu</Title>
                <Paragraph style={{ maxWidth: 720 }}>
                    Cập nhật mật khẩu định kỳ để bảo vệ tài khoản của bạn trên hệ thống tuyển dụng.
                </Paragraph>
            </section>

            <Card className="portal-section-card" style={{ maxWidth: 720 }}>
                <Form<ChangePasswordFormValues>
                    layout="vertical"
                    autoComplete="off"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        label="Mật khẩu hiện tại"
                        name="currentPassword"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập mật khẩu hiện tại.',
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập mật khẩu hiện tại"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập mật khẩu mới.',
                            },
                            {
                                min: 6,
                                message: 'Mật khẩu cần có ít nhất 6 ký tự.',
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập mật khẩu mới"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng xác nhận mật khẩu mới.',
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve()
                                    }

                                    return Promise.reject(
                                        new Error('Mật khẩu xác nhận không khớp.')
                                    )
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập lại mật khẩu mới"
                            size="large"
                        />
                    </Form.Item>

                    <Space size={12}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={loading}
                        >
                            Lưu mật khẩu mới
                        </Button>
                        <Button
                            size="large"
                            onClick={() => navigate(fallbackPath || PATHS.HOME)}
                        >
                            Quay lại
                        </Button>
                    </Space>
                </Form>
            </Card>
        </div>
    )
}

export default ChangePasswordPage
