import { useEffect, useMemo, useState } from 'react'

import {
    Button,
    Card,
    Empty,
    Input,
    Select,
    Space,
    Table,
    Tag,
    Typography,
    notification,
} from 'antd'

import {
    EditOutlined,
    EyeOutlined,
    FilterOutlined,
    PlusOutlined,
    SearchOutlined,
    StopOutlined,
} from '@ant-design/icons'

import AdminService, {
    IdentityRoleDto,
    IdentityUserDto,
} from '@/services/admin'
import {
    formatCount,
    formatDisplayDateTime,
    getDisplayName,
    getUserStatusColor,
    getUserStatusLabel,
} from '@/utils/admin'

import styles from '../styles/AdminUi.module.css'

type UserRow = {
    id: string
    key: string
    name: string
    email: string
    role: string
    unit: string
    isActive: boolean
    creationTime: string
}

const AdminManageUserPage = () => {
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState<string | undefined>()
    const [statusFilter, setStatusFilter] = useState<string | undefined>()
    const [loading, setLoading] = useState(false)
    const [roles, setRoles] = useState<IdentityRoleDto[]>([])
    const [rows, setRows] = useState<UserRow[]>([])

    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true)
            try {
                const [userResponse, roleResponse] = await Promise.all([
                    AdminService.getIdentityUsers({
                        Sorting: 'userName asc',
                        MaxResultCount: 1000,
                    }),
                    AdminService.getIdentityRoles({
                        Sorting: 'name asc',
                        MaxResultCount: 1000,
                    }),
                ])

                const users = (userResponse?.items || []) as IdentityUserDto[]
                const availableRoles = (roleResponse?.items ||
                    []) as IdentityRoleDto[]

                const userRoles = await Promise.all(
                    users.map(async (user) => {
                        try {
                            const roleResult =
                                await AdminService.getIdentityUserRoles(user.id)
                            const items = Array.isArray(roleResult?.items)
                                ? roleResult.items
                                : Array.isArray(roleResult)
                                  ? roleResult
                                  : []

                            return {
                                userId: user.id,
                                roles: items as IdentityRoleDto[],
                            }
                        } catch {
                            return {
                                userId: user.id,
                                roles: [] as IdentityRoleDto[],
                            }
                        }
                    })
                )

                const rolesByUserId = new Map(
                    userRoles.map((item) => [item.userId, item.roles])
                )

                setRoles(availableRoles)
                setRows(
                    users.map((user) => {
                        const assignedRoles = rolesByUserId.get(user.id) || []

                        return {
                            id: user.id,
                            key: user.id,
                            name: getDisplayName(user),
                            email: user.email || '-',
                            role: assignedRoles[0]?.name || 'Chưa gán vai trò',
                            unit: '-',
                            isActive: Boolean(user.isActive),
                            creationTime: formatDisplayDateTime(
                                user.creationTime
                            ),
                        }
                    })
                )
            } catch {
                notification.error({
                    message: 'Không tải được danh sách người dùng',
                    description:
                        'Kiểm tra identity/users, identity/roles và user roles API.',
                })
            } finally {
                setLoading(false)
            }
        }

        void loadUsers()
    }, [])

    const roleOptions = useMemo(() => {
        const uniqueRoles = new Set(
            roles.map((role) => role.name).filter(Boolean) as string[]
        )

        rows.forEach((row) => {
            if (row.role) uniqueRoles.add(row.role)
        })

        return Array.from(uniqueRoles).map((role) => ({
            value: role,
            label: role,
        }))
    }, [roles, rows])

    const filteredUsers = useMemo(() => {
        return rows.filter((user) => {
            const keyword = search.trim().toLowerCase()
            const matchesKeyword =
                !keyword ||
                user.name.toLowerCase().includes(keyword) ||
                user.email.toLowerCase().includes(keyword)
            const matchesRole = !roleFilter || user.role === roleFilter
            const matchesStatus =
                !statusFilter ||
                (statusFilter === 'active' && user.isActive) ||
                (statusFilter === 'inactive' && !user.isActive)

            return matchesKeyword && matchesRole && matchesStatus
        })
    }, [roleFilter, rows, search, statusFilter])

    return (
        <div className={styles.page}>
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Người dùng</span>
                <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    align="start"
                    wrap
                >
                    <div>
                        <Typography.Title level={2}>
                            Quản lý danh sách người dùng
                        </Typography.Title>
                        <Typography.Paragraph style={{ maxWidth: 720 }}>
                            Đồng bộ tài khoản, vai trò và trạng thái hoạt động
                            từ hệ thống Identity để quản trị tập trung.
                        </Typography.Paragraph>
                    </div>
                    <Button type="primary" size="large" icon={<PlusOutlined />}>
                        Thêm người dùng
                    </Button>
                </Space>
            </section>

            <div className={styles.metricGrid}>
                <div className={styles.metricBox}>
                    <div className={styles.metricValue}>
                        {formatCount(rows.length)}
                    </div>
                    <div className={styles.metricLabel}>Tổng người dùng</div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricValue}>
                        {formatCount(
                            rows.filter((item) => item.isActive).length
                        )}
                    </div>
                    <div className={styles.metricLabel}>Đang hoạt động</div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricValue}>
                        {formatCount(
                            rows.filter((item) => !item.isActive).length
                        )}
                    </div>
                    <div className={styles.metricLabel}>Tạm khóa</div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricValue}>
                        {formatCount(roleOptions.length)}
                    </div>
                    <div className={styles.metricLabel}>Số nhóm vai trò</div>
                </div>
            </div>

            <Card variant="borderless" className={styles.filterCard}>
                <div className={styles.filterRow}>
                    <Input
                        allowClear
                        size="large"
                        prefix={<SearchOutlined />}
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        value={search}
                        className={styles.flexGrow}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <Select
                        allowClear
                        size="large"
                        placeholder="Tất cả vai trò"
                        style={{ minWidth: 220 }}
                        options={roleOptions}
                        onChange={(value) => setRoleFilter(value)}
                    />
                    <Select
                        allowClear
                        size="large"
                        placeholder="Tất cả trạng thái"
                        style={{ minWidth: 220 }}
                        options={[
                            { value: 'active', label: 'Hoạt động' },
                            { value: 'inactive', label: 'Tạm khóa' },
                        ]}
                        onChange={(value) => setStatusFilter(value)}
                    />
                    <Button
                        style={{ height: 40 }}
                        size="large"
                        icon={<FilterOutlined />}
                    >
                        Lọc nâng cao
                    </Button>
                </div>
            </Card>

            <Card variant="borderless" className={styles.sectionCard}>
                <Table
                    rowKey="key"
                    loading={loading}
                    dataSource={filteredUsers}
                    pagination={{ pageSize: 10 }}
                    locale={{
                        emptyText: (
                            <Empty description="Không có người dùng phù hợp" />
                        ),
                    }}
                    columns={[
                        {
                            title: 'Người dùng',
                            dataIndex: 'name',
                            key: 'name',
                            render: (_: string, record: UserRow) => (
                                <div className={styles.tableNameCell}>
                                    <span className={styles.tableMainText}>
                                        {record.name}
                                    </span>
                                    <span className={styles.tableSubText}>
                                        {record.email}
                                    </span>
                                </div>
                            ),
                        },
                        {
                            title: 'Vai trò',
                            dataIndex: 'role',
                            key: 'role',
                        },
                        {
                            title: 'Đơn vị',
                            dataIndex: 'unit',
                            key: 'unit',
                        },
                        {
                            title: 'Trạng thái',
                            dataIndex: 'isActive',
                            key: 'status',
                            render: (value: boolean) => (
                                <Tag
                                    color={getUserStatusColor(value)}
                                    className={styles.statusTag}
                                >
                                    {getUserStatusLabel(value)}
                                </Tag>
                            ),
                        },
                        {
                            title: 'Ngày tạo',
                            dataIndex: 'creationTime',
                            key: 'creationTime',
                        },
                        {
                            title: 'Thao tác',
                            key: 'actions',
                            render: () => (
                                <Space size="small">
                                    <Button icon={<EyeOutlined />} />
                                    <Button icon={<EditOutlined />} />
                                    <Button danger icon={<StopOutlined />} />
                                </Space>
                            ),
                        },
                    ]}
                />
            </Card>
        </div>
    )
}

export default AdminManageUserPage
