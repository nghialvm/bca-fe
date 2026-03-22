import { FC, useEffect, useState } from 'react'

import { Button, Checkbox, Form, Input, Typography, notification } from 'antd'

import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

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
            if (loginAction.fulfilled.match(loginResponse)) {
                const userResponse: any = await dispatch(getCurrentUserAction())
                const user = userResponse.payload
                if (
                    getCurrentUserAction.fulfilled.match(userResponse) &&
                    user
                ) {
                    notification.success({
                        message: 'Login successfully!',
                        description: 'Welcome back',
                    })
                    navigate(getDefaultPathByRole(getSiteRole(user)), {
                        replace: true,
                    })
                } else {
                    notification.error({
                        message: 'Login failed!',
                        description: 'Authenticated but could not load profile',
                    })
                }
            } else if (loginAction.rejected.match(loginResponse)) {
                notification.error({
                    message: 'Login failed!',
                    description: 'Incorrect username or password',
                })
            }
        } catch (e: any) {
            notification.error({
                message: 'Login failed!',
                description: 'Incorrect username or password',
            })
        } finally {
            setLoginLoading(false)
        }
    }

    const onLoginWithUsbToken = () => {
        notification.info({
            message: 'USB Token',
            description:
                'Chức năng đăng nhập bằng USB Token đang được cập nhật.',
        })
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
                                    <UserOutlined
                                        className={styles.inputIcon}
                                    />
                                }
                                placeholder="Nhập tên"
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
                                    <LockOutlined
                                        className={styles.inputIcon}
                                    />
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
                            onClick={onLoginWithUsbToken}
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
