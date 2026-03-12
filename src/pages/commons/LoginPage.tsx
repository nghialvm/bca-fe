import { FC, useEffect, useState } from 'react'

import { Button, Card, Flex, Form, Input, Typography, notification } from 'antd'

import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { loginAction } from '@/stores/auth/authAction'
import { getDefaultPathByRole, getSiteRole } from '@/utils/role'

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
                    email: values.email,
                    password: values.password,
                    twoFactorCode: '',
                    twoFactorRecoveryCode: '',
                })
            )
            if (loginResponse.type === '/auth/login/fulfilled') {
                notification.success({
                    message: 'Login successfully!',
                    description: 'Welcome back',
                })
                navigate(
                    getDefaultPathByRole(
                        getSiteRole(loginResponse.payload.user)
                    ),
                    { replace: true }
                )
            } else if (loginResponse.type === '/auth/login/rejected') {
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

    return (
        <Flex style={{ height: '60%' }} justify="center" align="center">
            <Card
                variant="borderless"
                style={{
                    width: '100%',
                    maxWidth: 400,
                    maxHeight: 600,
                }}
            >
                <Flex vertical gap={24} align="center">
                    <Flex
                        justify="center"
                        align="center"
                        gap={4}
                        style={{
                            flexDirection: 'column',
                        }}
                    >
                        <Title level={3}>Sign in to BCA</Title>
                    </Flex>

                    <Form onFinish={onLoginFinish} style={{ width: '100%' }}>
                        <Form.Item
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter your username',
                                },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="Username"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter your password',
                                },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Password"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                size="large"
                                loading={loginLoading}
                            >
                                Sign In
                            </Button>
                        </Form.Item>
                    </Form>
                </Flex>
            </Card>
        </Flex>
    )
}

export default LoginPage
