import React from 'react'

import { Layout } from 'antd'

import { Outlet } from 'react-router-dom'

const { Content } = Layout

const NotAuthenticatedLayout: React.FC = () => {
    return (
        <Layout
            style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Content
                style={{
                    width: '100%',
                    padding: '24px',
                    borderRadius: '8px',
                }}
            >
                <Outlet />
            </Content>
        </Layout>
    )
}

export default NotAuthenticatedLayout
