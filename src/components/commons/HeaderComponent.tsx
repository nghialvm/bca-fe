import { Avatar, Button, Dropdown, Input, notification } from 'antd'

import {
    LockOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuOutlined,
    MenuUnfoldOutlined,
    SearchOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

import { PATHS } from '@/routers/path'
import { logoutAction } from '@/stores/auth/authAction'
import {
    getProfilePathByRole,
    getRoleDisplayName,
    getSiteRole,
} from '@/utils/role'

import styles from './styles/HeaderComponent.module.css'

interface HeaderComponentProps {
    collapsed: boolean
    isMobile: boolean
    onToggleSidebar: () => void
}

const HeaderComponent = ({
    collapsed,
    isMobile,
    onToggleSidebar,
}: HeaderComponentProps) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const isAuthenticated = useSelector(
        (store: any) => store.auth.isAuthenticated
    )
    const user = useSelector((store: any) => store.auth.user)
    const siteRole = getSiteRole(user)
    const displayName =
        user?.full_name || user?.userName || user?.email || 'Người dùng'
    const profilePath = getProfilePathByRole(siteRole)
    const roleLabel = getRoleDisplayName(siteRole) || 'Người dùng'

    const handleLogout = async () => {
        await dispatch(logoutAction() as any)
        notification.success({
            message: 'Đăng xuất thành công',
            description: 'Bạn đã đăng xuất khỏi hệ thống.',
        })
        navigate(PATHS.LOGIN, { replace: true })
    }

    const items = [
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
            label: <div onClick={() => void handleLogout()}>Đăng xuất</div>,
        },
    ]

    return (
        <div className={styles.header}>
            <div className={styles.leftSection}>
                <Button
                    type="text"
                    icon={
                        isMobile ? (
                            <MenuOutlined />
                        ) : collapsed ? (
                            <MenuUnfoldOutlined />
                        ) : (
                            <MenuFoldOutlined />
                        )
                    }
                    onClick={onToggleSidebar}
                    className={styles.toggleButton}
                />
            </div>

            {isAuthenticated ? (
                <div className={styles.rightSection}>
                    <Dropdown menu={{ items }} trigger={['click']}>
                        <div className={styles.profile}>
                            <Avatar
                                icon={<UserOutlined />}
                                style={{ backgroundColor: '#0B3D2E' }}
                            />
                            <div className={styles.profileMeta}>
                                <span className={styles.profileName}>
                                    {displayName}
                                </span>
                                <span className={styles.profileRole}>
                                    {roleLabel}
                                </span>
                            </div>
                        </div>
                    </Dropdown>
                </div>
            ) : (
                <Button onClick={() => navigate(PATHS.LOGIN)} type="primary">
                    Đăng nhập
                </Button>
            )}
        </div>
    )
}

export default HeaderComponent
