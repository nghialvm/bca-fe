import { useMemo, useState } from 'react'

import {
    Avatar,
    Badge,
    Button,
    ConfigProvider,
    Drawer,
    Dropdown,
    Grid,
    Layout,
    Menu,
    Space,
    Typography,
    notification,
} from 'antd'
import type { MenuProps, ThemeConfig } from 'antd'

import {
    BellOutlined,
    LockOutlined,
    LogoutOutlined,
    MenuOutlined,
    SettingOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

import HeaderComponent from '@/components/commons/HeaderComponent'
import NavBar from '@/components/commons/NavBar'
import { SITE_ROLES, SiteRole } from '@/constants/role'
import { User } from '@/interfaces/user/user.interface'
import { PATHS } from '@/routers/path'
import { logoutAction } from '@/stores/auth/authAction'
import {
    formatRoleNames,
    getProfilePathByRole,
    getRoleDisplayName,
    getSiteRole,
} from '@/utils/role'

import styles from './MainLayout.module.css'

const { Header, Sider, Content, Footer } = Layout
const { Text, Title } = Typography

const portalTheme: ThemeConfig = {
    token: {
        colorPrimary: '#0B3D2E',
        colorInfo: '#0B3D2E',
        colorSuccess: '#166534',
        colorWarning: '#B7791F',
        colorBgLayout: '#f4f7f3',
        colorLink: '#0B3D2E',
        colorTextBase: '#102117',
        borderRadius: 18,
        fontFamily:
            '"Segoe UI", "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    },
    components: {
        Layout: {
            bodyBg: '#f4f7f3',
            siderBg: '#09271d',
            headerBg: 'rgba(244, 247, 243, 0.94)',
        },
        Button: {
            borderRadius: 14,
            controlHeightLG: 48,
            primaryShadow: '0 16px 28px rgba(11, 61, 46, 0.18)',
        },
        Card: {
            borderRadiusLG: 24,
            headerBg: 'transparent',
        },
        Input: {
            activeBorderColor: '#0B3D2E',
            hoverBorderColor: '#0B3D2E',
        },
        Select: {
            activeBorderColor: '#0B3D2E',
            hoverBorderColor: '#0B3D2E',
        },
        Menu: {
            itemSelectedBg: 'rgba(11, 61, 46, 0.12)',
            itemSelectedColor: '#0B3D2E',
            itemHoverColor: '#0B3D2E',
            itemActiveBg: 'rgba(11, 61, 46, 0.08)',
        },
        Table: {
            headerBg: '#edf4f0',
            headerColor: '#102117',
            rowHoverBg: '#f5faf7',
        },
        Tabs: {
            itemSelectedColor: '#0B3D2E',
            itemHoverColor: '#0B3D2E',
            inkBarColor: '#0B3D2E',
        },
    },
}

type RootState = {
    auth: {
        user?: User | null
    }
}

const getUserInitials = (displayName?: string) => {
    if (!displayName) {
        return 'BC'
    }

    return displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('')
}

const getCandidateMenuItems = (): MenuProps['items'] => [
    {
        key: PATHS.CANDIDATE_DASHBOARD,
        label: <Link to={PATHS.CANDIDATE_DASHBOARD}>Tổng quan</Link>,
    },
    {
        key: PATHS.CANDIDATE_JOBS,
        label: <Link to={PATHS.CANDIDATE_JOBS}>Việc làm phù hợp</Link>,
    },
    {
        key: PATHS.CANDIDATE_APPLICATIONS,
        label: <Link to={PATHS.CANDIDATE_APPLICATIONS}>Hồ sơ đã nộp</Link>,
    },
    {
        key: PATHS.CANDIDATE_PROFILE,
        label: <Link to={PATHS.CANDIDATE_PROFILE}>Thông tin cá nhân</Link>,
    },
]

const useProfileMenu = (role: SiteRole) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const profilePath = getProfilePathByRole(role)

    const handleLogout = async () => {
        await dispatch(logoutAction() as any)
        notification.success({
            message: 'Đăng xuất thành công',
            description: 'Phiên làm việc đã được kết thúc.',
        })
        navigate(PATHS.LOGIN, { replace: true })
    }

    return useMemo<MenuProps['items']>(
        () => [
            {
                key: 'profile',
                icon: <UserOutlined />,
                label: <Link to={profilePath}>Thông tin tài khoản</Link>,
            },
            {
                key: 'change-password',
                icon: <LockOutlined />,
                label: <Link to={PATHS.CHANGE_PASSWORD}>Đổi mật khẩu</Link>,
            },
            {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: (
                    <span onClick={() => void handleLogout()}>Đăng xuất</span>
                ),
            },
        ],
        [dispatch, navigate, profilePath]
    )
}

const BackofficeShell = () => {
    const [collapsed, setCollapsed] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const screens = Grid.useBreakpoint()
    const isMobile = !screens.lg

    const contentLayoutClassName = [
        styles.adminContentLayout,
        isMobile
            ? styles.adminContentMobile
            : collapsed
              ? styles.adminContentCollapsed
              : styles.adminContentExpanded,
    ].join(' ')

    return (
        <Layout className={styles.adminShell}>
            {!isMobile ? (
                <Sider
                    collapsible
                    collapsed={collapsed}
                    trigger={null}
                    width={280}
                    collapsedWidth={96}
                    className={styles.adminDesktopSider}
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
                    className={styles.adminDrawer}
                >
                    <NavBar
                        collapsed={false}
                        onNavigate={() => setMobileMenuOpen(false)}
                    />
                </Drawer>
            )}

            <Layout className={contentLayoutClassName}>
                <Header className={styles.adminHeader}>
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
                <Content className={styles.adminContent}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    )
}

const CandidateShell = () => {
    const user = useSelector((state: RootState) => state.auth.user)
    const location = useLocation()
    const screens = Grid.useBreakpoint()
    const [drawerOpen, setDrawerOpen] = useState(false)
    const profileItems = useProfileMenu(SITE_ROLES.CANDIDATE)
    const menuItems = useMemo(() => getCandidateMenuItems(), [])
    const selectedKey =
        [...(menuItems || [])]
            .sort(
                (left, right) =>
                    String(right?.key || '').length -
                    String(left?.key || '').length
            )
            .find((item) =>
                location.pathname.startsWith(String(item?.key || ''))
            )?.key || PATHS.CANDIDATE_DASHBOARD
    const displayName =
        user?.full_name || user?.userName || user?.email || 'Ứng viên hệ thống'
    const roleLabel =
        formatRoleNames([user?.role])[0] ||
        getRoleDisplayName(SITE_ROLES.CANDIDATE) ||
        'Ứng viên'

    return (
        <Layout className={styles.candidateShell}>
            <div className={styles.candidateTopBand}>
                <div className={styles.candidateTopBandInner}>
                    <Space size={12}>
                        <div className={styles.candidateBrandSeal}>
                            <img src="/logo.png" alt="Logo" />
                        </div>
                        <div>
                            <Text className={styles.candidateTopTitle}>
                                BỘ CÔNG AN
                            </Text>
                            <Text className={styles.candidateTopSubtitle}>
                                Cổng thông tin tuyển dụng
                            </Text>
                        </div>
                    </Space>
                    <Space size={16}>
                        <Badge>
                            <BellOutlined
                                className={styles.candidateBandIcon}
                            />
                        </Badge>
                        <Text className={styles.candidateBandText}>
                            Hỗ trợ 24/7
                        </Text>
                    </Space>
                </div>
            </div>

            <Header className={styles.candidateHeader}>
                <div className={styles.candidateHeaderInner}>
                    <Link
                        to={PATHS.CANDIDATE_DASHBOARD}
                        className={styles.candidateBrandLink}
                    >
                        <div className={styles.candidateBrandMark}>
                            <img src="/logo.png" alt="Logo" />
                        </div>
                        <div>
                            <Title level={5} className={styles.headerTitle}>
                                Tuyển dụng Bộ Công an
                            </Title>
                            <Text className={styles.headerSubtitle}>
                                Không gian ứng viên
                            </Text>
                        </div>
                    </Link>

                    {screens.md ? (
                        <Menu
                            mode="horizontal"
                            selectedKeys={[String(selectedKey)]}
                            items={menuItems}
                            className={styles.candidateMenu}
                        />
                    ) : (
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            onClick={() => setDrawerOpen(true)}
                            className={styles.mobileMenuButton}
                        />
                    )}

                    <Dropdown
                        menu={{ items: profileItems }}
                        trigger={['click']}
                    >
                        <Button type="text" className={styles.profileTrigger}>
                            <Space size={12}>
                                <Avatar className={styles.profileAvatar}>
                                    {getUserInitials(displayName)}
                                </Avatar>
                                {screens.lg ? (
                                    <div className={styles.profileMeta}>
                                        <Text className={styles.profileName}>
                                            {displayName}
                                        </Text>
                                        <Text className={styles.profileRole}>
                                            {roleLabel}
                                        </Text>
                                    </div>
                                ) : null}
                            </Space>
                        </Button>
                    </Dropdown>
                </div>
            </Header>

            <Content className={styles.candidateContent}>
                <div className={styles.candidateContentInner}>
                    <Outlet />
                </div>
            </Content>

            <Footer className={styles.candidateFooter}>
                <div className={styles.candidateFooterInner}>
                    <div>
                        <Title level={5} className={styles.footerTitle}>
                            Cổng tuyển dụng Bộ Công an
                        </Title>
                        <Text className={styles.footerText}>
                            Kênh thông tin tuyển dụng chính thức cho các vị trí
                            công chức, chuyên viên và nhân sự chuyên môn.
                        </Text>
                    </div>
                    <div className={styles.footerMeta}>
                        <Text className={styles.footerText}>
                            44 Yết Kiêu, Hoàn Kiếm, Hà Nội
                        </Text>
                        <Text className={styles.footerText}>
                            tuyendung@bca.gov.vn
                        </Text>
                        <Text className={styles.footerText}>024 3826 3333</Text>
                    </div>
                </div>
            </Footer>

            <Drawer
                open={drawerOpen}
                placement="right"
                width={280}
                onClose={() => setDrawerOpen(false)}
                className={styles.candidateDrawer}
            >
                <Menu
                    mode="inline"
                    selectedKeys={[String(selectedKey)]}
                    items={menuItems}
                    onClick={() => setDrawerOpen(false)}
                />
            </Drawer>
        </Layout>
    )
}

const MainLayout = () => {
    const user = useSelector((state: RootState) => state.auth.user)
    const siteRole = getSiteRole(user || null)

    return (
        <ConfigProvider theme={portalTheme}>
            {siteRole === SITE_ROLES.CANDIDATE ? (
                <CandidateShell />
            ) : (
                <BackofficeShell />
            )}
        </ConfigProvider>
    )
}

export default MainLayout
