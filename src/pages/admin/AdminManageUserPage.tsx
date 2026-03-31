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
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    FilterOutlined,
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons'

import CreateAdminUserModal from '@/components/modals/CreateAdminUserModal'
import DeleteAdminUserModal from '@/components/modals/DeleteAdminUserModal'
import UpdateAdminUserModal from '@/components/modals/UpdateAdminUserModal'
import ViewAdminUserModal from '@/components/modals/ViewAdminUserModal'
import {
    type AdminUserFormValues,
    type AdminUserRecord,
    mapIdentityUserToAdminUserRecord,
} from '@/components/modals/adminUserModal.shared'
import AdminService, {
    type IdentityRoleDto,
    type IdentityUserCreateDto,
    type IdentityUserDto,
    type IdentityUserUpdateDto,
} from '@/services/admin'
import {
    formatCount,
    getUserStatusColor,
    getUserStatusLabel,
} from '@/utils/admin'
import { getRoleDisplayName } from '@/utils/role'

import styles from '../styles/AdminUi.module.css'

const extractRoleItems = (result: unknown): IdentityRoleDto[] => {
    if (
        typeof result === 'object' &&
        result !== null &&
        Array.isArray((result as { items?: unknown[] }).items)
    ) {
        return (result as { items: IdentityRoleDto[] }).items
    }

    if (Array.isArray(result)) {
        return result as IdentityRoleDto[]
    }

    return []
}

const getErrorDescription = (error: unknown, fallback: string) => {
    if (typeof error !== 'object' || error === null) {
        return fallback
    }

    const responseData = (
        error as {
            response?: {
                data?: {
                    message?: string
                    error?: {
                        message?: string
                        details?: string
                    }
                }
            }
        }
    ).response?.data

    return (
        responseData?.error?.message ||
        responseData?.error?.details ||
        responseData?.message ||
        fallback
    )
}

const buildCreatePayload = (
    values: AdminUserFormValues
): IdentityUserCreateDto => ({
    userName: values.userName.trim(),
    name: values.name.trim() || undefined,
    surname: values.surname.trim() || undefined,
    password: values.password?.trim() || '',
    email: values.email.trim(),
    phoneNumber: values.phoneNumber?.trim() || undefined,
    roleNames: values.roleNames,
    isActive: values.isActive,
    lockoutEnabled: true,
})

const buildUpdatePayload = (
    values: AdminUserFormValues
): IdentityUserUpdateDto => ({
    userName: values.userName.trim(),
    name: values.name.trim() || undefined,
    surname: values.surname.trim() || undefined,
    email: values.email.trim(),
    phoneNumber: values.phoneNumber?.trim() || undefined,
    roleNames: values.roleNames,
    isActive: values.isActive,
    lockoutEnabled: true,
})

const AdminManageUserPage = () => {
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState<string | undefined>()
    const [statusFilter, setStatusFilter] = useState<string | undefined>()
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [roles, setRoles] = useState<IdentityRoleDto[]>([])
    const [rows, setRows] = useState<AdminUserRecord[]>([])
    const [createOpen, setCreateOpen] = useState(false)
    const [viewingUser, setViewingUser] = useState<AdminUserRecord | null>(null)
    const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null)
    const [deletingUser, setDeletingUser] = useState<AdminUserRecord | null>(
        null
    )

    const loadUsers = async () => {
        setLoading(true)
        try {
            const [userResponse, roleResponse]: [any, any] = await Promise.all([
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

                        return {
                            userId: user.id,
                            roles: extractRoleItems(roleResult),
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
                users.map((user) =>
                    mapIdentityUserToAdminUserRecord(
                        user,
                        rolesByUserId.get(user.id) || []
                    )
                )
            )
        } catch (error) {
            notification.error({
                message: 'Không tải được danh sách người dùng',
                description: getErrorDescription(
                    error,
                    'Kiểm tra identity/users, identity/roles và user roles API.'
                ),
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadUsers()
    }, [])

    const roleOptions = useMemo(() => {
        const uniqueRoles = new Set(
            roles.map((role) => role.name).filter(Boolean) as string[]
        )

        rows.forEach((row) => {
            row.roleNames.forEach((roleName) => uniqueRoles.add(roleName))
        })

        return Array.from(uniqueRoles).map((role) => ({
            value: role,
            label: getRoleDisplayName(role) || role,
        }))
    }, [roles, rows])

    const filteredUsers = useMemo(() => {
        return rows.filter((user) => {
            const keyword = search.trim().toLowerCase()
            const matchesKeyword =
                !keyword ||
                user.displayName.toLowerCase().includes(keyword) ||
                user.email.toLowerCase().includes(keyword) ||
                user.userName.toLowerCase().includes(keyword)
            const matchesRole =
                !roleFilter || user.roleNames.includes(roleFilter)
            const matchesStatus =
                !statusFilter ||
                (statusFilter === 'active' && user.isActive) ||
                (statusFilter === 'inactive' && !user.isActive)

            return matchesKeyword && matchesRole && matchesStatus
        })
    }, [roleFilter, rows, search, statusFilter])

    const handleCreateUser = async (values: AdminUserFormValues) => {
        setSubmitting(true)
        try {
            await AdminService.createIdentityUser(buildCreatePayload(values))
            notification.success({
                message: 'Đã tạo người dùng mới',
                description: values.email.trim(),
            })
            setCreateOpen(false)
            await loadUsers()
        } catch (error) {
            notification.error({
                message: 'Không thể tạo người dùng',
                description: getErrorDescription(
                    error,
                    'Backend đã từ chối yêu cầu tạo người dùng.'
                ),
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleUpdateUser = async (values: AdminUserFormValues) => {
        if (!editingUser) return

        setSubmitting(true)
        try {
            await AdminService.updateIdentityUser(
                editingUser.id,
                buildUpdatePayload(values)
            )
            notification.success({
                message: 'Đã cập nhật người dùng',
                description: values.email.trim(),
            })
            setEditingUser(null)
            await loadUsers()
        } catch (error) {
            notification.error({
                message: 'Không thể cập nhật người dùng',
                description: getErrorDescription(
                    error,
                    'Backend đã từ chối yêu cầu cập nhật người dùng.'
                ),
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteUser = async () => {
        if (!deletingUser) return

        setSubmitting(true)
        try {
            await AdminService.deleteIdentityUser(deletingUser.id)
            notification.success({
                message: 'Đã xóa người dùng',
                description: deletingUser.email,
            })
            setDeletingUser(null)
            await loadUsers()
        } catch (error) {
            notification.error({
                message: 'Không thể xóa người dùng',
                description: getErrorDescription(
                    error,
                    'Backend đã từ chối yêu cầu xóa người dùng.'
                ),
            })
        } finally {
            setSubmitting(false)
        }
    }

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
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => setCreateOpen(true)}
                    >
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
                        placeholder="Tìm kiếm theo tên, email hoặc tên đăng nhập..."
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
                        value={roleFilter}
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
                        value={statusFilter}
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
                            dataIndex: 'displayName',
                            key: 'name',
                            render: (_: string, record: AdminUserRecord) => (
                                <div className={styles.tableNameCell}>
                                    <span className={styles.tableMainText}>
                                        {record.displayName}
                                    </span>
                                    <span className={styles.tableSubText}>
                                        {record.userName}
                                    </span>
                                </div>
                            ),
                        },
                        {
                            title: 'Email',
                            dataIndex: 'email',
                            key: 'email',
                        },
                        {
                            title: 'Vai trò',
                            dataIndex: 'roleLabel',
                            key: 'role',
                            render: (_: string, record: AdminUserRecord) =>
                                record.roleNames.length ? (
                                    <Space wrap size={[4, 4]}>
                                        {record.roleNames.map((roleName) => (
                                            <Tag key={roleName}>
                                                {getRoleDisplayName(roleName)}
                                            </Tag>
                                        ))}
                                    </Space>
                                ) : (
                                    <Typography.Text type="secondary">
                                        Chưa gán vai trò
                                    </Typography.Text>
                                ),
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
                            dataIndex: 'creationTimeText',
                            key: 'creationTime',
                        },
                        {
                            title: 'Thao tác',
                            key: 'actions',
                            render: (_: unknown, record: AdminUserRecord) => (
                                <Space size="small">
                                    <Button
                                        icon={<EyeOutlined />}
                                        onClick={() => setViewingUser(record)}
                                    />
                                    <Button
                                        icon={<EditOutlined />}
                                        onClick={() => setEditingUser(record)}
                                    />
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => setDeletingUser(record)}
                                    />
                                </Space>
                            ),
                        },
                    ]}
                />
            </Card>

            <CreateAdminUserModal
                open={createOpen}
                roles={roles}
                submitting={submitting}
                onCancel={() => {
                    if (!submitting) setCreateOpen(false)
                }}
                onSubmit={handleCreateUser}
            />

            <ViewAdminUserModal
                open={Boolean(viewingUser)}
                user={viewingUser}
                onCancel={() => setViewingUser(null)}
            />

            <UpdateAdminUserModal
                open={Boolean(editingUser)}
                user={editingUser}
                roles={roles}
                submitting={submitting}
                onCancel={() => {
                    if (!submitting) setEditingUser(null)
                }}
                onSubmit={handleUpdateUser}
            />

            <DeleteAdminUserModal
                open={Boolean(deletingUser)}
                user={deletingUser}
                submitting={submitting}
                onCancel={() => {
                    if (!submitting) setDeletingUser(null)
                }}
                onConfirm={handleDeleteUser}
            />
        </div>
    )
}

export default AdminManageUserPage
