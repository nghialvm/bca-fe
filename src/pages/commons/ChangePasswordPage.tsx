import { FC, useState } from 'react'

import {
    Button,
    Card,
    Form,
    Input,
    Space,
    Typography,
    notification,
} from 'antd'

import { LockOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { PATHS } from '@/routers/path'
import AuthService from '@/services/auth'
import {
    getDefaultPathByRole,
    getProfilePathByRole,
    getSiteRole,
} from '@/utils/role'

const { Paragraph, Title } = Typography

type ChangePasswordFormValues = {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

const PASSWORD_POLICY = {
    minLength: 6,
    minUniqueChars: 1,
    specialCharacters: '!@#$%',
}

const hasNonWhitespaceText = (value?: string) =>
    typeof value === 'string' && value.trim().length > 0

const hasUppercaseCharacter = (value: string) => /[A-Z]/.test(value)

const hasLowercaseCharacter = (value: string) => /[a-z]/.test(value)

const hasDigitCharacter = (value: string) => /[0-9]/.test(value)

const hasSpecialCharacter = (value: string) =>
    /[!@#$%]/.test(value)

const countUniqueCharacters = (value: string) => new Set(value).size

const getPasswordPolicyError = (value?: string) => {
    if (!value) {
        return null
    }

    if (!hasNonWhitespaceText(value)) {
        return 'Mật khẩu mới không được chỉ gồm khoảng trắng.'
    }

    if (value.length < PASSWORD_POLICY.minLength) {
        return `Mật khẩu mới phải có ít nhất ${PASSWORD_POLICY.minLength} ký tự.`
    }

    if (!hasUppercaseCharacter(value)) {
        return 'Mật khẩu mới phải có ít nhất 1 chữ hoa (A-Z).'
    }

    if (!hasLowercaseCharacter(value)) {
        return 'Mật khẩu mới phải có ít nhất 1 chữ thường (a-z).'
    }

    if (!hasDigitCharacter(value)) {
        return 'Mật khẩu mới phải có ít nhất 1 chữ số (0-9).'
    }

    if (!hasSpecialCharacter(value)) {
        return `Mật khẩu mới phải có ít nhất 1 ký tự đặc biệt (${PASSWORD_POLICY.specialCharacters
            .split('')
            .join(' ')}).`
    }

    if (countUniqueCharacters(value) < PASSWORD_POLICY.minUniqueChars) {
        return `Mật khẩu mới phải có ít nhất ${PASSWORD_POLICY.minUniqueChars} ký tự khác nhau.`
    }

    return null
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
                description: 'Mật khẩu mới đã được lưu.',
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
                    Đổi mật khẩu để bảo mật tài khoản của bạn.
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
                        validateFirst
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập mật khẩu hiện tại.',
                            },
                            {
                                validator(_, value) {
                                    if (!value || hasNonWhitespaceText(value)) {
                                        return Promise.resolve()
                                    }

                                    return Promise.reject(
                                        new Error(
                                            'Mật khẩu hiện tại không được chỉ gồm khoảng trắng.'
                                        )
                                    )
                                },
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
                        dependencies={['currentPassword']}
                        validateFirst
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập mật khẩu mới.',
                            },
                            {
                                validator(_, value) {
                                    const errorMessage =
                                        getPasswordPolicyError(value)

                                    if (!errorMessage) {
                                        return Promise.resolve()
                                    }

                                    return Promise.reject(
                                        new Error(errorMessage)
                                    )
                                },
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (
                                        !value ||
                                        !getFieldValue('currentPassword') ||
                                        getFieldValue('currentPassword') !== value
                                    ) {
                                        return Promise.resolve()
                                    }

                                    return Promise.reject(
                                        new Error(
                                            'Mật khẩu mới không được trùng với mật khẩu hiện tại.'
                                        )
                                    )
                                },
                            }),
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
                        validateFirst
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng xác nhận mật khẩu mới.',
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (
                                        !value ||
                                        getFieldValue('newPassword') === value
                                    ) {
                                        return Promise.resolve()
                                    }

                                    return Promise.reject(
                                        new Error(
                                            'Mật khẩu xác nhận không khớp.'
                                        )
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
