import { FC, useEffect, useState } from 'react'

import { Button, Checkbox, Form, Input, Typography, notification } from 'antd'

import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { PATHS } from '@/routers/path'
import { initializeAntiforgeryToken } from '@/services/http'
import { getCurrentUserAction, loginAction } from '@/stores/auth/authAction'
import { getDefaultPathByRole, getSiteRole } from '@/utils/role'

import styles from '../styles/LoginPage.module.css'

const { Title } = Typography

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

    const onLoginFinish = async (values: any) => {
        setLoginLoading(true)
        try {
            const loginResponse: any = await dispatch(
                loginAction({
                    userNameOrEmailAddress: values.username,
                    password: values.password,
                    rememberMe: values.remember,
                })
            )
            if (loginAction.fulfilled.match(loginResponse) && loginResponse.payload?.result === 1) {
                await initializeAntiforgeryToken(true)
                const userResponse: any = await dispatch(getCurrentUserAction())
                const currentUser = userResponse.payload

                if (
                    getCurrentUserAction.fulfilled.match(userResponse) &&
                    currentUser
                ) {
                    notification.success({
                        message: 'Đăng nhập thành công',
                        description: 'Chào mừng bạn quay trở lại hệ thống.',
                    })
                    navigate(getDefaultPathByRole(getSiteRole(currentUser)), {
                        replace: true,
                    })
                } else {
                    notification.error({
                        message: 'Đăng nhập thất bại',
                        description:
                            'Đã xác thực nhưng không tải được thông tin người dùng.',
                    })
                }
            }
            else if (loginAction.fulfilled.match(loginResponse) && loginResponse.payload?.result === 2) {
                notification.error({
                    message: 'Đăng nhập thất bại',
                    description:
                        'Tên đăng nhập hoặc mật khẩu không chính xác.',
                })
            }
            else if (loginAction.rejected.match(loginResponse)) {
                notification.error({
                    message: 'Đăng nhập thất bại',
                    description: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
                })
            }
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

                    <Form
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

                        <div className={styles.fieldLabel}>Mật khẩu</div>
                        <Form.Item
                            name="password"
                            className={styles.formItem}
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mật khẩu',
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

                        <Form.Item
                            name="remember"
                            valuePropName="checked"
                            className={styles.rememberItem}
                            label={null}
                        >
                            <Checkbox className={styles.rememberCheckbox}>
                                Nhớ mật khẩu đăng nhập
                            </Checkbox>
                        </Form.Item>

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

                        <Button
                            className={styles.usbButton}
                            htmlType="button"
                            block
                            size="large"
                            onClick={() => navigate(PATHS.REGISTER)}
                        >
                            Đăng ký
                        </Button>
                    </Form>
                </div>
            </section>
        </div>
    )
}

export default LoginPage
