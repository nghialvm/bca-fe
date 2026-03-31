import { FC, useMemo, useState } from 'react'

import { Alert, Button, Form, Input, Typography, notification } from 'antd'

import { LockOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { PATHS } from '@/routers/path'
import AuthService from '@/services/auth'

import styles from '../styles/LoginPage.module.css'

const { Paragraph, Title } = Typography

type ResetPasswordFormValues = {
    newPassword: string
    confirmPassword: string
}

const ResetPasswordPage: FC = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [loading, setLoading] = useState(false)

    const userId = searchParams.get('userId') || ''
    const token = searchParams.get('token') || ''
    const hasValidToken = useMemo(
        () => Boolean(userId.trim() && token.trim()),
        [token, userId]
    )

    const handleSubmit = async (values: ResetPasswordFormValues) => {
        if (!hasValidToken) {
            notification.error({
                message: 'Liên kết không hợp lệ',
                description:
                    'Liên kết đặt lại mật khẩu đã thiếu thông tin hoặc không còn hiệu lực.',
            })
            return
        }

        setLoading(true)
        try {
            await AuthService.resetPassword({
                userId,
                token,
                newPassword: values.newPassword,
            })

            notification.success({
                message: 'Đặt lại mật khẩu thành công',
                description: 'Bạn có thể đăng nhập bằng mật khẩu mới.',
            })
            navigate(PATHS.LOGIN, { replace: true })
        } catch (error: any) {
            notification.error({
                message: 'Không thể đặt lại mật khẩu',
                description:
                    error?.response?.data?.error?.message ||
                    'Liên kết có thể đã hết hạn. Vui lòng gửi yêu cầu mới.',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.loginPage}>
            <section className={styles.heroSection}>
                <div className={styles.heroContent}></div>
            </section>

            <section className={styles.formSection}>
                <div className={styles.loginCard}>
                    <Title level={1} className={styles.title}>
                        Đặt lại mật khẩu
                    </Title>
                    <Paragraph style={{ marginBottom: 28, color: '#4b5563' }}>
                        Tạo mật khẩu mới để tiếp tục sử dụng tài khoản của bạn.
                    </Paragraph>

                    {!hasValidToken ? (
                        <>
                            <Alert
                                type="error"
                                showIcon
                                message="Liên kết đặt lại mật khẩu không hợp lệ"
                                description="Vui lòng quay lại màn hình quên mật khẩu để gửi yêu cầu mới."
                                style={{ marginBottom: 20 }}
                            />
                            <Button
                                type="primary"
                                className={styles.submitButton}
                                block
                                size="large"
                                onClick={() => navigate(PATHS.FORGOT_PASSWORD)}
                            >
                                Gửi yêu cầu mới
                            </Button>
                        </>
                    ) : (
                        <Form<ResetPasswordFormValues>
                            layout="vertical"
                            autoComplete="off"
                            onFinish={handleSubmit}
                        >
                            <div className={styles.fieldLabel}>
                                Mật khẩu mới
                            </div>
                            <Form.Item
                                name="newPassword"
                                className={styles.formItem}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập mật khẩu mới.',
                                    },
                                    {
                                        min: 6,
                                        message:
                                            'Mật khẩu cần có ít nhất 6 ký tự.',
                                    },
                                ]}
                            >
                                <Input.Password
                                    className={styles.input}
                                    prefix={
                                        <LockOutlined
                                            className={styles.inputIcon}
                                        />
                                    }
                                    placeholder="Nhập mật khẩu mới"
                                    size="large"
                                />
                            </Form.Item>

                            <div className={styles.fieldLabel}>
                                Xác nhận mật khẩu mới
                            </div>
                            <Form.Item
                                name="confirmPassword"
                                className={styles.formItem}
                                dependencies={['newPassword']}
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Vui lòng xác nhận mật khẩu mới.',
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (
                                                !value ||
                                                getFieldValue('newPassword') ===
                                                    value
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
                                    className={styles.input}
                                    prefix={
                                        <LockOutlined
                                            className={styles.inputIcon}
                                        />
                                    }
                                    placeholder="Nhập lại mật khẩu mới"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item className={styles.actionItem}>
                                <Button
                                    className={styles.submitButton}
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    size="large"
                                    loading={loading}
                                >
                                    Cập nhật mật khẩu
                                </Button>
                            </Form.Item>

                            <Button
                                block
                                size="large"
                                onClick={() => navigate(PATHS.LOGIN)}
                            >
                                Quay lại đăng nhập
                            </Button>
                        </Form>
                    )}
                </div>
            </section>
        </div>
    )
}

export default ResetPasswordPage
