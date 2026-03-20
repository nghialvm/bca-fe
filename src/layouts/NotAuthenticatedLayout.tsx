import React from 'react'

import { Layout } from 'antd'

import { Outlet } from 'react-router-dom'

const { Content } = Layout

const NotAuthenticatedLayout: React.FC = () => {
    return (
        <Layout
            style={{
                minHeight: '100vh',
                background: 'transparent',
            }}
        >
            <Content
                style={{
                    width: '100%',
                    minHeight: '100vh',
                    background: 'transparent',
                }}
            >
                <Outlet />
            </Content>
        </Layout>
    )
}

export default NotAuthenticatedLayout
