import { useMemo, useState } from 'react'

import { Button, Card, Space, Table } from 'antd'

import {
    CheckOutlined,
    CloseOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SafetyCertificateOutlined,
    SafetyOutlined,
} from '@ant-design/icons'

import AdminPageHeader from './AdminPageHeader'
import styles from './AdminUi.module.css'
import { permissionMatrix, roleSummaries } from './adminData'

const roleFieldMap = {
    1: 'admin',
    2: 'manager',
    3: 'recruiter',
    4: 'viewer',
} as const

const AdminManagePermissionPage = () => {
    const [selectedRoleId, setSelectedRoleId] = useState(1)

    const selectedRole = useMemo(
        () => roleSummaries.find((role) => role.id === selectedRoleId),
        [selectedRoleId]
    )
    const selectedField =
        roleFieldMap[selectedRoleId as keyof typeof roleFieldMap]

    const permissionRows = permissionMatrix.flatMap((group) => [
        {
            key: `module-${group.module}`,
            rowType: 'module',
            label: group.module,
        },
        ...group.actions.map((action) => ({
            key: `${group.module}-${action.name}`,
            rowType: 'action',
            ...action,
        })),
    ])

    return (
        <div className={styles.page}>
            <AdminPageHeader
                title="Vai trò & quyền hạn"
                subtitle="Thiết lập mô hình phân quyền và kiểm soát truy cập cho từng nhóm người dùng."
                extra={
                    <Button type="primary" size="large" icon={<PlusOutlined />}>
                        Thêm vai trò
                    </Button>
                }
            />

            <div className={styles.roleLayout}>
                <div className={styles.roleList}>
                    {roleSummaries.map((role) => (
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
                                        {role.name}
                                    </span>
                                </Space>
                                <Space size="small">
                                    <Button icon={<EditOutlined />} />
                                    <Button danger icon={<DeleteOutlined />} />
                                </Space>
                            </div>
                            <div className={styles.roleMeta}>
                                {role.description}
                            </div>
                            <div className={styles.roleMeta}>
                                {role.users} người dùng đang được gán
                            </div>
                        </div>
                    ))}
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
                    <div className={styles.sectionHint}>
                        {selectedRole?.name} đang được chọn để rà soát và cập
                        nhật quyền. Cột tương ứng được làm nổi bật để dễ kiểm
                        tra.
                    </div>
                    <div style={{ marginTop: 16, marginBottom: 20 }}>
                        <Space wrap>
                            <span className={styles.summaryPill}>
                                <SafetyOutlined />
                                {selectedRole?.name}
                            </span>
                            <span className={styles.summaryPill}>
                                {selectedRole?.users} người dùng đang gán
                            </span>
                        </Space>
                    </div>
                    <Table
                        rowKey="key"
                        pagination={false}
                        dataSource={permissionRows}
                        rowClassName={(record: any) =>
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
                                width: 280,
                                render: (_: string, record: any) => (
                                    <span
                                        className={
                                            record.rowType === 'module'
                                                ? styles.tableMainText
                                                : styles.permissionAction
                                        }
                                    >
                                        {record.rowType === 'module'
                                            ? record.label
                                            : record.name}
                                    </span>
                                ),
                            },
                            ...roleSummaries.map((role) => {
                                const field =
                                    roleFieldMap[
                                        role.id as keyof typeof roleFieldMap
                                    ]

                                return {
                                    title: role.name,
                                    key: role.name,
                                    align: 'center' as const,
                                    render: (record: any) =>
                                        record.rowType === 'module' ? null : (
                                            <div
                                                className={`${styles.permissionCell} ${
                                                    selectedField === field
                                                        ? styles.permissionCellActive
                                                        : ''
                                                }`}
                                            >
                                                {record[field] ? (
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
                                }
                            }),
                        ]}
                    />
                    <div style={{ marginTop: 20, textAlign: 'right' }}>
                        <Space>
                            <Button size="large">Hủy</Button>
                            <Button type="primary" size="large">
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
