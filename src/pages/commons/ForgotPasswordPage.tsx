import { FC, useState } from 'react'

import { Button, Form, Input, Typography, notification } from 'antd'

import { MailOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'

import { PATHS } from '@/routers/path'
import AuthService from '@/services/auth'

import styles from '../styles/LoginPage.module.css'

const { Paragraph, Title } = Typography

type ForgotPasswordFormValues = {
    email: string
}

const ForgotPasswordPage: FC = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (values: ForgotPasswordFormValues) => {
        setLoading(true)
        try {
            await AuthService.forgotPassword({
                email: values.email.trim(),
            })

            notification.success({
                message: 'Đã ghi nhận yêu cầu',
                description:
                    'Nếu email hợp lệ, bạn sẽ nhận được liên kết đặt lại mật khẩu.',
            })
            navigate(PATHS.LOGIN, { replace: true })
        } catch (error: any) {
            notification.error({
                message: 'Không thể gửi yêu cầu',
                description:
                    error?.response?.data?.error?.message ||
                    'Vui lòng kiểm tra lại email và thử lại.',
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
                        Quên mật khẩu
                    </Title>
                    <Paragraph style={{ marginBottom: 28, color: '#4b5563' }}>
                        Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu.
                    </Paragraph>

                    <Form<ForgotPasswordFormValues>
                        layout="vertical"
                        autoComplete="off"
                        onFinish={handleSubmit}
                    >
                        <div className={styles.fieldLabel}>Email</div>
                        <Form.Item
                            name="email"
                            className={styles.formItem}
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập email.',
                                },
                                {
                                    type: 'email',
                                    message: 'Email không hợp lệ.',
                                },
                            ]}
                        >
                            <Input
                                className={styles.input}
                                prefix={
                                    <MailOutlined
                                        className={styles.inputIcon}
                                    />
                                }
                                placeholder="Nhập email đã đăng ký"
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
                                Gửi liên kết đặt lại
                            </Button>
                        </Form.Item>

                        <Button
                            block
                            size="large"
                            onClick={() => navigate(PATHS.LOGIN)}
                        >
                            Quay lại đăng nhập
                        </Button>

                        <Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
                            Chưa có tài khoản?{' '}
                            <Link to={PATHS.REGISTER}>Đăng ký ngay</Link>
                        </Paragraph>
                    </Form>
                </div>
            </section>
        </div>
    )
}

export default ForgotPasswordPage
