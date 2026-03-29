import { useEffect, useMemo, useState } from 'react'

import { Avatar, Button, Card, Empty, Skeleton, Space, Typography } from 'antd'

import {
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    SafetyCertificateOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { User } from '@/interfaces/user/user.interface'
import { PATHS } from '@/routers/path'
import AdminService, {
    ApplicationDto,
    GetPermissionListResultDto,
    IdentityRoleDto,
    IdentityUserDto,
    RecruitmentDashboardSummary,
    RecruitmentRequestDto,
} from '@/services/admin'
import {
    formatCount,
    formatDisplayDateTime,
    getDisplayName,
    getRecruitmentRequestStatusLabel,
} from '@/utils/admin'
import { formatRoleNames, getRoleDisplayName } from '@/utils/role'

import styles from '../styles/AdminUi.module.css'

type RootState = {
    auth: {
        user?: User | null
    }
}

type ActivityItem = {
    title: string
    time: string
    description: string
}

const roleProviderName = 'R'

const AdminProfilePage = () => {
    const navigate = useNavigate()
    const user = useSelector((store: RootState) => store.auth.user)
    const [loading, setLoading] = useState(false)
    const [identityUser, setIdentityUser] = useState<IdentityUserDto | null>(
        null
    )
    const [roles, setRoles] = useState<IdentityRoleDto[]>([])
    const [summary, setSummary] = useState<RecruitmentDashboardSummary | null>(
        null
    )
    const [grantedPermissions, setGrantedPermissions] = useState<string[]>([])
    const [activities, setActivities] = useState<ActivityItem[]>([])

    useEffect(() => {
        const loadProfileData = async () => {
            if (!user?.id) return

            setLoading(true)
            try {
                const [identityResponse, roleResponse, summaryResponse] =
                    await Promise.all([
                        AdminService.getIdentityUser(user.id),
                        AdminService.getIdentityUserRoles(user.id),
                        AdminService.getDashboardSummary(),
                    ])

                const currentRoles = Array.isArray(roleResponse?.items)
                    ? (roleResponse.items as IdentityRoleDto[])
                    : Array.isArray(roleResponse)
                      ? (roleResponse as IdentityRoleDto[])
                      : []

                const permissionResponses = await Promise.all(
                    currentRoles.map(async (role) => {
                        try {
                            return (await AdminService.getPermissions(
                                roleProviderName,
                                role.name
                            )) as GetPermissionListResultDto
                        } catch {
                            return { groups: [] } as GetPermissionListResultDto
                        }
                    })
                )

                const [recruitmentResponse, applicationResponse] =
                    await Promise.all([
                        AdminService.getRecruitmentRequests({
                            Sorting: 'creationTime desc',
                            MaxResultCount: 5,
                        }),
                        AdminService.getApplications({
                            Sorting: 'appliedTime desc',
                            MaxResultCount: 5,
                        }),
                    ])

                const grantedPermissionNames = Array.from(
                    new Set(
                        permissionResponses.flatMap((result) =>
                            result.groups.flatMap((group) =>
                                group.permissions
                                    .filter(
                                        (permission) => permission.isGranted
                                    )
                                    .map(
                                        (permission) =>
                                            permission.displayName ||
                                            permission.name
                                    )
                            )
                        )
                    )
                ).slice(0, 6)

                const recruitments = (recruitmentResponse?.items ||
                    []) as RecruitmentRequestDto[]
                const applications = (applicationResponse?.items ||
                    []) as ApplicationDto[]

                setIdentityUser(identityResponse as IdentityUserDto)
                setRoles(currentRoles)
                setSummary(summaryResponse as RecruitmentDashboardSummary)
                setGrantedPermissions(grantedPermissionNames)
                setActivities([
                    ...recruitments.slice(0, 2).map((item) => ({
                        title: `Cập nhật tin tuyển dụng ${item.title}`,
                        time: formatDisplayDateTime(item.creationTime),
                        description: `Trạng thái hiện tại: ${getRecruitmentRequestStatusLabel(item.status)}`,
                    })),
                    ...applications.slice(0, 2).map((item) => ({
                        title: `Hồ sơ moi ${item.applicationCode}`,
                        time: formatDisplayDateTime(item.appliedTime),
                        description: `Ứng tuyển vào yêu cầu ${item.recruitmentRequestId}`,
                    })),
                ])
            } finally {
                setLoading(false)
            }
        }

        void loadProfileData()
    }, [user?.id])

    const displayName =
        user?.full_name ||
        getDisplayName(identityUser || user || undefined) ||
        user?.userName ||
        user?.email ||
        'Admin H05'

    const roleLabel = useMemo(() => {
        if (roles.length) {
            return formatRoleNames(roles.map((role) => role.name)).join(', ')
        }

        if (Array.isArray(user?.roles)) {
            return formatRoleNames(user.roles).join(', ')
        }

        return (
            getRoleDisplayName(user?.role) ||
            getRoleDisplayName(user?.roles) ||
            'Quản trị viên'
        )
    }, [roles, user?.roles])

    const profileHighlights = [
        { label: 'Vai trò', value: roleLabel || 'Admin' },
        {
            label: 'Tài khoản',
            value: identityUser?.userName || user?.userName || '-',
        },
        { label: 'Email', value: identityUser?.email || user?.email || '-' },
        {
            label: 'Ngày tạo',
            value: formatDisplayDateTime(identityUser?.creationTime),
        },
    ]

    const profileSummary = [
        {
            label: 'Role đang gán',
            value: formatCount(roles.length || (roleLabel ? 1 : 0)),
        },
        {
            label: 'Quyền đang được cấp',
            value: formatCount(grantedPermissions.length),
        },
        {
            label: 'Tin đang mở',
            value: formatCount(summary?.totalPublishedRecruitmentRequests),
        },
        {
            label: 'Hồ sơ trong hệ thống',
            value: formatCount(summary?.totalApplications),
        },
    ]

    return (
        <div className={styles.page}>
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Hồ sơ</span>
                <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    align="start"
                    wrap
                >
                    <div>
                        <Typography.Title level={2}>
                            Tổng quan hồ sơ quản trị viên
                        </Typography.Title>
                        <Typography.Paragraph style={{ maxWidth: 720 }}>
                            Thông tin người dùng hiện tại, quyền truy cập và một
                            số chỉ số vận hành backend liên quan đến tài khoản
                            admin.
                        </Typography.Paragraph>
                    </div>
                    <Space>
                        <Button
                            size="large"
                            onClick={() => navigate(PATHS.CHANGE_PASSWORD)}
                        >
                            Đổi mật khẩu
                        </Button>
                        <Button type="primary" size="large">
                            Cập nhật hồ sơ
                        </Button>
                    </Space>
                </Space>
            </section>

            <div className={styles.profileGrid}>
                <Card variant="borderless" className={styles.profileHero}>
                    <Space
                        direction="vertical"
                        size={20}
                        style={{ width: '100%' }}
                    >
                        <Avatar
                            size={84}
                            icon={<UserOutlined />}
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.18)',
                                border: '1px solid rgba(255,255,255,0.24)',
                            }}
                        />
                        <div>
                            <div
                                style={{
                                    fontSize: 28,
                                    fontWeight: 700,
                                    color: '#ffffff',
                                }}
                            >
                                {displayName}
                            </div>
                            <div
                                style={{
                                    marginTop: 6,
                                    color: 'rgba(232, 240, 255, 0.76)',
                                }}
                            >
                                {roleLabel || 'Quản trị viên hệ thống'}
                            </div>
                        </div>
                        <div className={styles.profileMetaList}>
                            {loading && !identityUser ? (
                                <Skeleton active paragraph={{ rows: 4 }} />
                            ) : (
                                profileHighlights.map((item) => (
                                    <div key={item.label}>
                                        <div className={styles.profileLabel}>
                                            {item.label}
                                        </div>
                                        <div className={styles.profileValue}>
                                            {item.value}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Space>
                </Card>

                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <Card
                        variant="borderless"
                        className={styles.sectionCard}
                        title={
                            <span className={styles.sectionTitle}>
                                Tổng quan hoạt động
                            </span>
                        }
                    >
                        <div className={styles.summaryGrid}>
                            {profileSummary.map((item) => (
                                <div
                                    key={item.label}
                                    className={styles.metricBox}
                                >
                                    <div className={styles.metricIcon}>
                                        <SafetyCertificateOutlined />
                                    </div>
                                    <div>
                                        <div className={styles.metricValue}>
                                            {item.value}
                                        </div>
                                        <div className={styles.metricLabel}>
                                            {item.label}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card
                        variant="borderless"
                        className={styles.sectionCard}
                        title={
                            <span className={styles.sectionTitle}>
                                Quyền truy cập chính
                            </span>
                        }
                    >
                        {grantedPermissions.length ? (
                            <Space wrap>
                                {grantedPermissions.map((permission) => (
                                    <span
                                        key={permission}
                                        className={styles.summaryPill}
                                    >
                                        <LockOutlined />
                                        {permission}
                                    </span>
                                ))}
                            </Space>
                        ) : (
                            <Empty description="Không có permission được hiển thị" />
                        )}

                        <div className={styles.detailList}>
                            <div className={styles.detailItem}>
                                <MailOutlined className={styles.detailIcon} />
                                <span>
                                    {identityUser?.email || user?.email || '-'}
                                </span>
                            </div>
                            <div className={styles.detailItem}>
                                <PhoneOutlined className={styles.detailIcon} />
                                <span>
                                    {identityUser?.phoneNumber ||
                                        'Chưa cập nhật'}
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card
                        variant="borderless"
                        className={styles.sectionCard}
                        title={
                            <span className={styles.sectionTitle}>
                                Hoạt động gần đây
                            </span>
                        }
                    >
                        {loading ? (
                            <Skeleton active paragraph={{ rows: 5 }} />
                        ) : activities.length ? (
                            <div className={styles.timelineList}>
                                {activities.map((activity) => (
                                    <div
                                        key={`${activity.title}-${activity.time}`}
                                        className={styles.timelineItem}
                                    >
                                        <div className={styles.timelineDot} />
                                        <div>
                                            <div
                                                className={styles.tableMainText}
                                            >
                                                {activity.title}
                                            </div>
                                            <div
                                                className={styles.tableSubText}
                                            >
                                                {activity.time}
                                            </div>
                                            <div
                                                className={styles.sectionHint}
                                                style={{ marginTop: 4 }}
                                            >
                                                {activity.description}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Empty description="Không có hoạt động để hiển thị" />
                        )}
                    </Card>
                </Space>
            </div>
        </div>
    )
}

export default AdminProfilePage
