import React from 'react'

import { Menu } from 'antd'

import {
    AuditOutlined,
    BellOutlined,
    FileSearchOutlined,
    FileTextOutlined,
    HomeOutlined,
    IdcardOutlined,
    NotificationOutlined,
    ProfileOutlined,
    SafetyOutlined,
    ShopOutlined,
    SolutionOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

import { SITE_ROLES } from '@/constants/role'
import { PATHS } from '@/routers/path'
import { getSiteRole } from '@/utils/role'

import styles from './styles/NavBar.module.css'

interface NavBarProps {
    collapsed: boolean
    onNavigate?: () => void
}

const NavBar: React.FC<NavBarProps> = ({ collapsed, onNavigate }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const user = useSelector((state: any) => state.auth.user)
    const siteRole = getSiteRole(user)

    const openKeys =
        siteRole === SITE_ROLES.ADMIN
            ? ['admin']
            : siteRole === SITE_ROLES.EMPLOYER
              ? ['employer']
              : ['candidate']

    const adminItems = [
        {
            key: PATHS.ADMIN_DASHBOARD,
            icon: <HomeOutlined />,
            label: 'Tổng quan',
        },
        {
            key: PATHS.ADMIN_MANAGE_USERS,
            icon: <TeamOutlined />,
            label: 'Quản lý người dùng',
        },
        {
            key: PATHS.ADMIN_MANAGE_PERMISSIONS,
            icon: <SolutionOutlined />,
            label: 'Vai trò & quyền hạn',
        },
        {
            key: PATHS.ADMIN_MANAGE_ORGANIZATIONS,
            icon: <ShopOutlined />,
            label: 'Quản lý đơn vị',
        },
        {
            key: PATHS.ADMIN_MANAGE_JOBS,
            icon: <IdcardOutlined />,
            label: 'Quản lý tuyển dụng',
        },
        {
            key: PATHS.ADMIN_MANAGE_JOB_POSITIONS,
            icon: <ProfileOutlined />,
            label: 'Vị trí công việc',
        },
        {
            key: PATHS.ADMIN_MANAGE_CV_TEMPLATES,
            icon: <FileTextOutlined />,
            label: 'Mẫu hồ sơ',
        },
        {
            key: PATHS.ADMIN_MANAGE_NOTIFICATIONS,
            icon: <NotificationOutlined />,
            label: 'Thông báo hệ thống',
        },
        {
            key: PATHS.ADMIN_MANAGE_LOGS,
            icon: <AuditOutlined />,
            label: 'Nhật ký hệ thống',
        },
        {
            key: PATHS.ADMIN_REPORT,
            icon: <BellOutlined />,
            label: 'Báo cáo & thống kê',
        },
    ]

    const employerItems = [
        {
            key: PATHS.EMPLOYER_DASHBOARD,
            icon: <HomeOutlined />,
            label: 'Tổng quan',
        },
        {
            key: PATHS.EMPLOYER_MANAGE_JOBS,
            icon: <IdcardOutlined />,
            label: 'Tin tuyển dụng',
        },
        {
            key: PATHS.EMPLOYER_MANAGE_CANDIDATES,
            icon: <TeamOutlined />,
            label: 'Ứng viên',
        },
        {
            key: PATHS.EMPLOYER_MANAGE_INTERVIEWS,
            icon: <SolutionOutlined />,
            label: 'Lịch phỏng vấn',
        },
        {
            key: PATHS.EMPLOYER_MANAGE_COMMUNICATIONS,
            icon: <NotificationOutlined />,
            label: 'Trao đổi',
        },
        {
            key: PATHS.EMPLOYER_REPORT,
            icon: <FileTextOutlined />,
            label: 'Báo cáo',
        },
    ]

    const candidateItems = [
        {
            key: PATHS.CANDIDATE_DASHBOARD,
            icon: <HomeOutlined />,
            label: 'Tổng quan',
        },
        {
            key: 'candidate',
            icon: <ProfileOutlined />,
            label: collapsed ? undefined : 'Ứng viên',
            children: [
                {
                    key: PATHS.CANDIDATE_JOBS,
                    icon: <FileSearchOutlined />,
                    label: 'Việc làm phù hợp',
                },
                {
                    key: PATHS.CANDIDATE_APPLICATIONS,
                    icon: <FileTextOutlined />,
                    label: 'Hồ sơ ứng tuyển',
                },
                {
                    key: PATHS.CANDIDATE_PROFILE,
                    icon: <UserOutlined />,
                    label: 'Hồ sơ cá nhân',
                },
            ],
        },
    ]

    const items =
        siteRole === SITE_ROLES.ADMIN
            ? adminItems
            : siteRole === SITE_ROLES.EMPLOYER
              ? employerItems
              : candidateItems

    return (
        <aside className={styles.sidebar}>
            <div
                className={`${styles.brand} ${
                    collapsed ? styles.brandCollapsed : ''
                }`}
            >
                <div className={styles.brandMark}>
                    <img src="/logo.png" alt="Logo" />
                </div>
                {!collapsed ? (
                    <div className={styles.brandText}>
                        <p className={styles.brandTitle}>Bộ Công an</p>
                        <div className={styles.brandSubtitle}>
                            {siteRole === SITE_ROLES.ADMIN
                                ? 'Không gian quản trị H05'
                                : siteRole === SITE_ROLES.EMPLOYER
                                  ? 'Không gian nhà tuyển dụng'
                                  : 'Không gian ứng viên'}
                        </div>
                    </div>
                ) : null}
            </div>

            <div className={styles.menuWrap}>
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    defaultOpenKeys={openKeys}
                    inlineCollapsed={collapsed}
                    className={styles.menu}
                    onClick={({ key }) => {
                        navigate(key)
                        onNavigate?.()
                    }}
                    // @ts-ignore
                    items={items}
                />
            </div>

            <div
                className={`${styles.footer} ${
                    collapsed ? styles.footerCollapsed : ''
                }`}
            >
                {!collapsed ? (
                    <>
                        <div className={styles.footerTitle}>Cổng truy cập</div>
                        <div>
                            {siteRole === SITE_ROLES.ADMIN
                                ? 'Back-office quản trị'
                                : siteRole === SITE_ROLES.EMPLOYER
                                  ? 'Back-office tuyển dụng'
                                  : 'Cổng ứng viên'}
                        </div>
                    </>
                ) : (
                    <div>v1.0</div>
                )}
            </div>
        </aside>
    )
}

export default NavBar
