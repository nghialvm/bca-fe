import { FC, useEffect, useState } from 'react'

import { Button, Checkbox, Form, Input, Space, Typography, notification } from 'antd'

import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

import { PATHS } from '@/routers/path'
import { initializeAntiforgeryToken } from '@/services/http'
import { getCurrentUserAction, loginAction } from '@/stores/auth/authAction'
import { getDefaultPathByRole, getSiteRole } from '@/utils/role'

import styles from '../styles/LoginPage.module.css'

const { Paragraph, Title } = Typography

type LoginFormValues = {
    username: string
    password: string
    remember: boolean
}

const LoginPage: FC = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [loginLoading, setLoginLoading] = useState(false)
    const isAuthenticated = useSelector(
        (state: any) => state.auth.isAuthenticated
    )
    const user = useSelector((state: any) => state.auth.user)

    useEffect(() => {
        if (isAuthenticated) {
            navigate(getDefaultPathByRole(getSiteRole(user)), { replace: true })
        }
    }, [isAuthenticated, navigate, user])

    const onLoginFinish = async (values: LoginFormValues) => {
        setLoginLoading(true)
        try {
            const loginResponse: any = await dispatch(
                loginAction({
                    userNameOrEmailAddress: values.username,
                    password: values.password,
                    rememberMe: values.remember,
                })
            )

            if (
                loginAction.fulfilled.match(loginResponse) &&
                loginResponse.payload?.result === 1
            ) {
                await initializeAntiforgeryToken(true)
                const userResponse: any = await dispatch(getCurrentUserAction())
                const currentUser = userResponse.payload

                if (
                    getCurrentUserAction.fulfilled.match(userResponse) &&
                    currentUser
                ) {
                    notification.success({
                        message: 'Đăng nhập thành công',
                        description: 'Chào mừng bạn quay lại hệ thống.',
                    })
                    navigate(getDefaultPathByRole(getSiteRole(currentUser)), {
                        replace: true,
                    })
                    return
                }

                notification.error({
                    message: 'Đăng nhập thất bại',
                    description: 'Không thể tải thông tin tài khoản.',
                })
                return
            }

            notification.error({
                message: 'Đăng nhập thất bại',
                description: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
            })
        } catch {
            notification.error({
                message: 'Đăng nhập thất bại',
                description: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
            })
        } finally {
            setLoginLoading(false)
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
                        Đăng nhập
                    </Title>
                    <Paragraph style={{ marginBottom: 28, color: '#4b5563' }}>
                        Sử dụng tài khoản của bạn để truy cập hệ thống tuyển dụng.
                    </Paragraph>

                    <Form<LoginFormValues>
                        autoComplete="off"
                        onFinish={onLoginFinish}
                        className={styles.form}
                        initialValues={{ remember: false }}
                    >
                        <div className={styles.fieldLabel}>Tên đăng nhập</div>
                        <Form.Item
                            name="username"
                            className={styles.formItem}
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tên đăng nhập.',
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

                        <div className={styles.fieldLabel}>Mật khẩu</div>
                        <Form.Item
                            name="password"
                            className={styles.formItem}
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mật khẩu.',
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

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 12,
                                marginBottom: 28,
                                flexWrap: 'wrap',
                            }}
                        >
                            <Form.Item
                                name="remember"
                                valuePropName="checked"
                                className={styles.rememberItem}
                                label={null}
                                style={{ marginBottom: 0 }}
                            >
                                <Checkbox className={styles.rememberCheckbox}>
                                    Ghi nhớ đăng nhập
                                </Checkbox>
                            </Form.Item>

                            <Link to={PATHS.FORGOT_PASSWORD}>
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <Form.Item className={styles.actionItem}>
                            <Button
                                className={styles.submitButton}
                                type="primary"
                                htmlType="submit"
                                block
                                size="large"
                                loading={loginLoading}
                            >
                                Đăng nhập
                            </Button>
                        </Form.Item>

                        <Space
                            direction="vertical"
                            size={12}
                            style={{ width: '100%' }}
                        >
                            <Button
                                className={styles.usbButton}
                                htmlType="button"
                                block
                                size="large"
                                onClick={() => navigate(PATHS.REGISTER)}
                            >
                                Đăng ký
                            </Button>
                        </Space>
                    </Form>
                </div>
            </section>
        </div>
    )
}

export default LoginPage
