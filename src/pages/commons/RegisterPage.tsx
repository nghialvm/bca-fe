import { FC, useEffect, useState } from 'react'

import { Button, Form, Input, Typography, notification } from 'antd'

import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { PATHS } from '@/routers/path'
import AuthService from '@/services/auth'
import { getDefaultPathByRole, getSiteRole } from '@/utils/role'

import styles from '../styles/LoginPage.module.css'

const { Paragraph, Title } = Typography

type RegisterFormValues = {
    userName: string
    emailAddress: string
    password: string
    confirmPassword: string
}

const getErrorDescription = (error: unknown, fallback: string) => {
    if (typeof error !== 'object' || error === null) {
        return fallback
    }

    const responseData = (
        error as {
            response?: {
                data?: {
                    message?: string
                    error?: {
                        message?: string
                        details?: string
                    }
                }
            }
        }
    ).response?.data

    return (
        responseData?.error?.message ||
        responseData?.error?.details ||
        responseData?.message ||
        fallback
    )
}

const RegisterPage: FC = () => {
    const navigate = useNavigate()
    const [registerLoading, setRegisterLoading] = useState(false)
    const isAuthenticated = useSelector(
        (state: any) => state.auth.isAuthenticated
    )
    const user = useSelector((state: any) => state.auth.user)

    useEffect(() => {
        if (isAuthenticated) {
            navigate(getDefaultPathByRole(getSiteRole(user)), { replace: true })
        }
    }, [isAuthenticated, navigate, user])

    const onRegisterFinish = async (values: RegisterFormValues) => {
        setRegisterLoading(true)
        try {
            await AuthService.register({
                userName: values.userName.trim(),
                emailAddress: values.emailAddress.trim(),
                password: values.password,
                appName: 'bca',
            })

            notification.success({
                message: 'Đăng ký tài khoản thành công',
                description:
                    'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập để tiếp tục.',
            })

            navigate(PATHS.LOGIN, { replace: true })
        } catch (error) {
            notification.error({
                message: 'Đăng ký tài khoản thất bại',
                description: getErrorDescription(
                    error,
                    'Không thể tạo tài khoản. Vui lòng kiểm tra lại thông tin và thử lại.'
                ),
            })
        } finally {
            setRegisterLoading(false)
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
                        Đăng ký
                    </Title>
                    <Paragraph style={{ marginBottom: 24, color: '#4b5563' }}>
                        Tạo tài khoản mới để sử dụng hệ thống tuyển dụng BCA.
                    </Paragraph>

                    <Form
                        autoComplete="off"
                        onFinish={onRegisterFinish}
                        className={styles.form}
                    >
                        <div className={styles.fieldLabel}>Tên đăng nhập</div>
                        <Form.Item
                            name="userName"
                            className={styles.formItem}
                            rules={[
                                {
                                    required: true,
                                    whitespace: true,
                                    message: 'Vui lòng nhập tên đăng nhập',
                                },
                            ]}
                        >
                            <Input
                                className={styles.input}
                                prefix={
                                    <UserOutlined className={styles.inputIcon} />
                                }
                                placeholder="Nhập tên đăng nhập"
                                size="large"
                            />
                        </Form.Item>

                        <div className={styles.fieldLabel}>Email</div>
                        <Form.Item
                            name="emailAddress"
                            className={styles.formItem}
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập email',
                                },
                                {
                                    type: 'email',
                                    message: 'Email không đúng định dạng',
                                },
                            ]}
                        >
                            <Input
                                className={styles.input}
                                prefix={
                                    <MailOutlined className={styles.inputIcon} />
                                }
                                placeholder="Nhập địa chỉ email"
                                size="large"
                            />
                        </Form.Item>

                        <div className={styles.fieldLabel}>Mật khẩu</div>
                        <Form.Item
                            name="password"
                            className={styles.formItem}
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mật khẩu',
                                },
                                {
                                    min: 6,
                                    message: 'Mật khẩu phải có ít nhất 6 ký tự',
                                },
                            ]}
                        >
                            <Input.Password
                                className={styles.input}
                                prefix={
                                    <LockOutlined className={styles.inputIcon} />
                                }
                                placeholder="Nhập mật khẩu"
                                size="large"
                            />
                        </Form.Item>

                        <div className={styles.fieldLabel}>Xác nhận mật khẩu</div>
                        <Form.Item
                            name="confirmPassword"
                            className={styles.formItem}
                            dependencies={['password']}
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng xác nhận mật khẩu',
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (
                                            !value ||
                                            getFieldValue('password') === value
                                        ) {
                                            return Promise.resolve()
                                        }

                                        return Promise.reject(
                                            new Error(
                                                'Mật khẩu xác nhận không khớp'
                                            )
                                        )
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                className={styles.input}
                                prefix={
                                    <LockOutlined className={styles.inputIcon} />
                                }
                                placeholder="Nhập lại mật khẩu"
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
                                loading={registerLoading}
                            >
                                Đăng ký tài khoản
                            </Button>
                        </Form.Item>

                        <Button
                            className={styles.usbButton}
                            htmlType="button"
                            block
                            size="large"
                            onClick={() => navigate(PATHS.LOGIN)}
                        >
                            Quay lại đăng nhập
                        </Button>
                    </Form>
                </div>
            </section>
        </div>
    )
}

export default RegisterPage
