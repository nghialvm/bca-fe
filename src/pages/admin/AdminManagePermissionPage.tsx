import { useEffect, useMemo, useState } from 'react'

import {
    Button,
    Card,
    Checkbox,
    Empty,
    Skeleton,
    Space,
    Table,
    Typography,
    notification,
} from 'antd'

import {
    CheckOutlined,
    CloseOutlined,
    SafetyCertificateOutlined,
    SafetyOutlined,
} from '@ant-design/icons'

import AdminService, {
    GetPermissionListResultDto,
    IdentityRoleDto,
    PermissionGrantInfoDto,
    PermissionGroupDto,
} from '@/services/admin'
import { formatCount } from '@/utils/admin'
import { getRoleDisplayName } from '@/utils/role'

import styles from '../styles/AdminUi.module.css'

type RoleSummary = {
    id: string
    name: string
    description: string
    users: number
}

type PermissionMatrixRow = {
    key: string
    rowType: 'module' | 'action'
    label: string
    subLabel?: string
    groupName?: string
    permissionName?: string
    displayName?: string
    grants: Record<string, boolean>
}

const ROLE_PROVIDER_NAME = 'R'

const formatRoleDescription = (role: IdentityRoleDto) => {
    if (role.isStatic) {
        return 'Vai trò hệ thống được quản lý bởi Identity module.'
    }

    if (role.isDefault) {
        return 'Vai trò mặc định được gán cho người dùng mới phù hợp.'
    }

    return 'Vai trò được đồng bộ từ Identity và Permission Management.'
}

const formatPermissionLabel = (permission: PermissionGrantInfoDto) => {
    if (permission.displayName?.trim()) {
        return permission.displayName
    }

    const lastSegment = permission.name.split('.').pop()
    if (!lastSegment) {
        return permission.name
    }

    return lastSegment
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/^\w/, (character) => character.toUpperCase())
}

const formatGroupLabel = (group: PermissionGroupDto) => {
    if (group.displayName?.trim()) {
        return group.displayName
    }

    const lastSegment = group.name.split('.').pop()
    return lastSegment || group.name
}

const renderDisplayWithName = (displayLabel: string, name?: string) => {
    const normalizedDisplay = displayLabel?.trim()
    const normalizedName = name?.trim()
    const shouldShowName = Boolean(
        normalizedName && normalizedName !== normalizedDisplay
    )

    return (
        <span className={styles.tableNameCell}>
            <span className={styles.tableMainText}>{displayLabel}</span>
            {shouldShowName ? (
                <span className={styles.tableSubText}>{normalizedName}</span>
            ) : null}
        </span>
    )
}

const AdminManagePermissionPage = () => {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [selectedRoleId, setSelectedRoleId] = useState<string>()
    const [roles, setRoles] = useState<RoleSummary[]>([])
    const [permissionDataByRole, setPermissionDataByRole] = useState<
        Record<string, GetPermissionListResultDto>
    >({})

    const loadPermissionMatrix = async () => {
        setLoading(true)
        try {
            const [roleResponse, userResponse] = await Promise.all([
                AdminService.getIdentityRoles({
                    Sorting: 'name asc',
                    MaxResultCount: 1000,
                }),
                AdminService.getIdentityUsers({
                    Sorting: 'userName asc',
                    MaxResultCount: 1000,
                }),
            ])

            const fetchedRoles = (roleResponse?.items ||
                []) as IdentityRoleDto[]
            const users = userResponse?.items || []

            const userRoles = await Promise.all(
                users.map(async (user: { id: string }) => {
                    try {
                        const result = await AdminService.getIdentityUserRoles(
                            user.id
                        )
                        const items = Array.isArray(result?.items)
                            ? result.items
                            : Array.isArray(result)
                              ? result
                              : []

                        return items as IdentityRoleDto[]
                    } catch {
                        return [] as IdentityRoleDto[]
                    }
                })
            )

            const userCountByRole = userRoles.flat().reduce(
                (accumulator, role) => {
                    accumulator[role.name] = (accumulator[role.name] || 0) + 1

                    return accumulator
                },
                {} as Record<string, number>
            )

            const permissionsByRoleEntries = await Promise.all(
                fetchedRoles.map(async (role) => {
                    try {
                        const result = (await AdminService.getPermissions(
                            ROLE_PROVIDER_NAME,
                            role.name
                        )) as GetPermissionListResultDto

                        return [role.name, result] as const
                    } catch {
                        return [
                            role.name,
                            {
                                groups: [],
                            } as GetPermissionListResultDto,
                        ] as const
                    }
                })
            )

            setRoles(
                fetchedRoles.map((role) => ({
                    id: role.id,
                    name: role.name,
                    description: formatRoleDescription(role),
                    users: userCountByRole[role.name] || 0,
                }))
            )
            setPermissionDataByRole(
                Object.fromEntries(permissionsByRoleEntries)
            )
            setSelectedRoleId(
                (currentValue) => currentValue || fetchedRoles[0]?.id
            )
        } catch {
            notification.error({
                message: 'Không tải được ma trận phân quyền',
                description:
                    'Kiểm tra identity roles và permission-management API.',
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadPermissionMatrix()
    }, [])

    const selectedRole = useMemo(
        () => roles.find((role) => role.id === selectedRoleId),
        [roles, selectedRoleId]
    )

    const permissionRows = useMemo(() => {
        const groupOrder: string[] = []
        const groupLabelByName: Record<string, string> = {}
        const actionMap = new Map<
            string,
            {
                key: string
                groupName: string
                permissionName: string
                displayName: string
                grants: Record<string, boolean>
            }
        >()

        roles.forEach((role) => {
            const groups = permissionDataByRole[role.name]?.groups || []

            groups.forEach((group) => {
                if (!groupOrder.includes(group.name)) {
                    groupOrder.push(group.name)
                    groupLabelByName[group.name] = formatGroupLabel(group)
                }

                group.permissions.forEach((permission) => {
                    const key = `${group.name}::${permission.name}`
                    const existing = actionMap.get(key)

                    if (existing) {
                        existing.grants[role.name] = Boolean(
                            permission.isGranted
                        )
                        return
                    }

                    actionMap.set(key, {
                        key,
                        groupName: group.name,
                        permissionName: permission.name,
                        displayName: formatPermissionLabel(permission),
                        grants: {
                            [role.name]: Boolean(permission.isGranted),
                        },
                    })
                })
            })
        })

        return groupOrder.flatMap((groupName) => {
            const actions = Array.from(actionMap.values())
                .filter((item) => item.groupName === groupName)
                .sort((left, right) =>
                    left.displayName.localeCompare(right.displayName)
                )

            return [
                {
                    key: `module-${groupName}`,
                    rowType: 'module' as const,
                    label: groupLabelByName[groupName] || groupName,
                    subLabel: groupName,
                    grants: {},
                },
                ...actions.map(
                    (action): PermissionMatrixRow => ({
                        key: action.key,
                        rowType: 'action',
                        label: action.displayName,
                        subLabel: action.permissionName,
                        groupName,
                        permissionName: action.permissionName,
                        displayName: action.displayName,
                        grants: action.grants,
                    })
                ),
            ]
        })
    }, [permissionDataByRole, roles])

    const selectedRolePermissionCount = useMemo(() => {
        if (!selectedRole) return 0

        return permissionRows.filter(
            (row) => row.rowType === 'action' && row.grants[selectedRole.name]
        ).length
    }, [permissionRows, selectedRole])

    const handleTogglePermission = (
        roleName: string,
        permissionName: string,
        checked: boolean
    ) => {
        setPermissionDataByRole((currentValue) => {
            const target = currentValue[roleName]
            if (!target) return currentValue

            return {
                ...currentValue,
                [roleName]: {
                    ...target,
                    groups: target.groups.map((group) => ({
                        ...group,
                        permissions: group.permissions.map((permission) =>
                            permission.name === permissionName
                                ? {
                                      ...permission,
                                      isGranted: checked,
                                  }
                                : permission
                        ),
                    })),
                },
            }
        })
    }

    const handleSave = async () => {
        if (!selectedRole) return

        const permissions =
            permissionDataByRole[selectedRole.name]?.groups.flatMap((group) =>
                group.permissions.map((permission) => ({
                    name: permission.name,
                    isGranted: Boolean(permission.isGranted),
                }))
            ) || []

        setSaving(true)
        try {
            await AdminService.updatePermissions(
                ROLE_PROVIDER_NAME,
                selectedRole.name,
                {
                    permissions,
                }
            )

            notification.success({
                message: 'Đã lưu cập nhật phân quyền',
                description: selectedRole.name,
            })
        } catch {
            notification.error({
                message: 'Không lưu được phân quyền',
                description:
                    'Backend từ chối cập nhật hoặc role hiện tại không đủ quyền.',
            })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className={styles.page}>
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">
                    Vai trò và quyền hạn
                </span>
                <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    align="start"
                    wrap
                >
                    <div>
                        <Typography.Title level={2}>
                            Quản lý vai trò và quyền hạn
                        </Typography.Title>
                    </div>
                </Space>
            </section>

            <div className={styles.roleLayout}>
                <div className={styles.roleList}>
                    {loading && !roles.length ? (
                        <Card
                            variant="borderless"
                            className={styles.sectionCard}
                        >
                            <Skeleton active paragraph={{ rows: 8 }} />
                        </Card>
                    ) : (
                        roles.map((role) => (
                            <div
                                key={role.id}
                                className={`${styles.roleCard} ${
                                    selectedRoleId === role.id
                                        ? styles.roleCardActive
                                        : ''
                                }`}
                                onClick={() => setSelectedRoleId(role.id)}
                            >
                                <div className={styles.roleActions}>
                                    <Space>
                                        <SafetyCertificateOutlined
                                            style={{
                                                fontSize: 20,
                                                color:
                                                    selectedRoleId === role.id
                                                        ? '#2f54eb'
                                                        : '#5f6f86',
                                            }}
                                        />
                                        <span className={styles.tableMainText}>
                                            {getRoleDisplayName(role.name) ||
                                                role.name}
                                        </span>
                                    </Space>
                                </div>
                                <div className={styles.roleMeta}>
                                    {formatCount(role.users)} người dùng đang
                                    gán
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <Card
                    variant="borderless"
                    className={styles.sectionCard}
                    title={
                        <span className={styles.sectionTitle}>
                            Ma trận phân quyền
                        </span>
                    }
                >
                    <div style={{ marginTop: 16, marginBottom: 20 }}>
                        <Space wrap>
                            <span className={styles.summaryPill}>
                                <SafetyOutlined />
                                {getRoleDisplayName(selectedRole?.name) ||
                                    selectedRole?.name ||
                                    '-'}
                                {selectedRole?.name
                                    ? ` (${selectedRole.name})`
                                    : ''}
                            </span>
                            <span className={styles.summaryPill}>
                                {formatCount(selectedRole?.users)} người dùng
                            </span>
                            <span className={styles.summaryPill}>
                                {formatCount(selectedRolePermissionCount)} quyền
                                đang được cấp
                            </span>
                        </Space>
                    </div>

                    {loading && !permissionRows.length ? (
                        <Skeleton active paragraph={{ rows: 12 }} />
                    ) : permissionRows.length ? (
                        <Table
                            rowKey="key"
                            pagination={false}
                            dataSource={permissionRows}
                            rowClassName={(record) =>
                                record.rowType === 'module'
                                    ? styles.permissionModuleRow
                                    : ''
                            }
                            scroll={{ x: 920 }}
                            columns={[
                                {
                                    title: 'Module / Quyền',
                                    dataIndex: 'label',
                                    key: 'label',
                                    width: 320,
                                    render: (
                                        _: string,
                                        record: PermissionMatrixRow
                                    ) => (
                                        <div
                                            className={
                                                record.rowType === 'module'
                                                    ? ''
                                                    : styles.permissionAction
                                            }
                                        >
                                            {renderDisplayWithName(
                                                record.label,
                                                record.subLabel
                                            )}
                                        </div>
                                    ),
                                },
                                ...roles.map((role) => ({
                                    title: renderDisplayWithName(
                                        getRoleDisplayName(role.name) ||
                                            role.name,
                                        role.name
                                    ),
                                    key: role.name,
                                    align: 'center' as const,
                                    render: (record: PermissionMatrixRow) =>
                                        record.rowType === 'module' ? null : (
                                            <div
                                                className={`${styles.permissionCell} ${
                                                    selectedRole?.name ===
                                                    role.name
                                                        ? styles.permissionCellActive
                                                        : ''
                                                }`}
                                            >
                                                {selectedRole?.name ===
                                                role.name ? (
                                                    <Checkbox
                                                        checked={Boolean(
                                                            record.grants[
                                                                role.name
                                                            ]
                                                        )}
                                                        onChange={(event) =>
                                                            handleTogglePermission(
                                                                role.name,
                                                                record.permissionName ||
                                                                    '',
                                                                event.target
                                                                    .checked
                                                            )
                                                        }
                                                    />
                                                ) : record.grants[role.name] ? (
                                                    <CheckOutlined
                                                        style={{
                                                            color: '#389e0d',
                                                        }}
                                                    />
                                                ) : (
                                                    <CloseOutlined
                                                        style={{
                                                            color: '#bfbfbf',
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        ),
                                })),
                            ]}
                        />
                    ) : (
                        <Empty description="Không có dữ liệu phân quyền" />
                    )}

                    <div style={{ marginTop: 20, textAlign: 'right' }}>
                        <Space>
                            <Button
                                size="large"
                                disabled={!selectedRole}
                                onClick={() => void loadPermissionMatrix()}
                            >
                                Làm mới giao diện
                            </Button>
                            <Button
                                type="primary"
                                size="large"
                                loading={saving}
                                disabled={!selectedRole}
                                onClick={() => void handleSave()}
                            >
                                Lưu thay đổi
                            </Button>
                        </Space>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default AdminManagePermissionPage
