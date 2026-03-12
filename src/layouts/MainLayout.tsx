import React, { useState } from 'react'

import { Drawer, Grid, Layout } from 'antd'

import { Outlet } from 'react-router-dom'

import HeaderComponent from '@/components/commons/HeaderComponent'
import NavBar from '@/components/commons/NavBar'

import styles from './MainLayout.module.css'

const { Header, Sider, Content } = Layout

const MainLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const screens = Grid.useBreakpoint()
    const isMobile = !screens.lg

    const contentLayoutClassName = [
        styles.contentLayout,
        isMobile
            ? styles.contentMobile
            : collapsed
              ? styles.contentCollapsed
              : styles.contentExpanded,
    ].join(' ')

    return (
        <Layout className={styles.shell}>
            {!isMobile ? (
                <Sider
                    collapsible
                    collapsed={collapsed}
                    trigger={null}
                    width={280}
                    collapsedWidth={96}
                    className={styles.desktopSider}
                >
                    <NavBar collapsed={collapsed} />
                </Sider>
            ) : (
                <Drawer
                    open={mobileMenuOpen}
                    placement="left"
                    onClose={() => setMobileMenuOpen(false)}
                    width={280}
                    closable={false}
                    className={styles.drawer}
                >
                    <NavBar
                        collapsed={false}
                        onNavigate={() => setMobileMenuOpen(false)}
                    />
                </Drawer>
            )}

            <Layout className={contentLayoutClassName}>
                <Header className={styles.header}>
                    <HeaderComponent
                        collapsed={collapsed}
                        isMobile={isMobile}
                        onToggleSidebar={() => {
                            if (isMobile) {
                                setMobileMenuOpen((open) => !open)
                                return
                            }

                            setCollapsed((current) => !current)
                        }}
                    />
                </Header>
                <Content className={styles.content}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    )
}

export default MainLayout
