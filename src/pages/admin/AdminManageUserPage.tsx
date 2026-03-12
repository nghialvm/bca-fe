import { useMemo, useState } from 'react'

import { Button, Card, Input, Select, Space, Table, Tag } from 'antd'

import {
    EditOutlined,
    EyeOutlined,
    FilterOutlined,
    PlusOutlined,
    SearchOutlined,
    StopOutlined,
} from '@ant-design/icons'

import AdminPageHeader from './AdminPageHeader'
import styles from './AdminUi.module.css'
import { adminUsers } from './adminData'

const AdminManageUserPage = () => {
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState<string | undefined>()
    const [statusFilter, setStatusFilter] = useState<string | undefined>()

    const filteredUsers = useMemo(() => {
        return adminUsers.filter((user) => {
            const keyword = search.trim().toLowerCase()
            const matchesKeyword =
                !keyword ||
                user.name.toLowerCase().includes(keyword) ||
                user.email.toLowerCase().includes(keyword)
            const matchesRole = !roleFilter || user.role === roleFilter
            const matchesStatus = !statusFilter || user.status === statusFilter

            return matchesKeyword && matchesRole && matchesStatus
        })
    }, [roleFilter, search, statusFilter])

    return (
        <div className={styles.page}>
            <AdminPageHeader
                title="Quản lý người dùng"
                subtitle="Quản lý tài khoản, trạng thái hoạt động và phân quyền người dùng trong toàn hệ thống."
                extra={
                    <Button type="primary" size="large" icon={<PlusOutlined />}>
                        Thêm người dùng
                    </Button>
                }
            />

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
                        options={[
                            { value: 'Quản trị viên', label: 'Quản trị viên' },
                            {
                                value: 'Quản lý đơn vị',
                                label: 'Quản lý đơn vị',
                            },
                            {
                                value: 'Nhân viên tuyển dụng',
                                label: 'Nhân viên tuyển dụng',
                            },
                        ]}
                        onChange={(value) => setRoleFilter(value)}
                    />
                    <Select
                        allowClear
                        size="large"
                        placeholder="Tất cả trạng thái"
                        style={{ minWidth: 220 }}
                        options={[
                            { value: 'Hoạt động', label: 'Hoạt động' },
                            { value: 'Tạm khóa', label: 'Tạm khóa' },
                        ]}
                        onChange={(value) => setStatusFilter(value)}
                    />
                    <Button size="large" icon={<FilterOutlined />}>
                        Lọc nâng cao
                    </Button>
                </div>
            </Card>

            <Card variant="borderless" className={styles.sectionCard}>
                <Table
                    rowKey="key"
                    dataSource={filteredUsers}
                    pagination={{ pageSize: 5 }}
                    columns={[
                        {
                            title: 'Người dùng',
                            dataIndex: 'name',
                            key: 'name',
                            render: (
                                _: string,
                                record: (typeof adminUsers)[0]
                            ) => (
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
                            dataIndex: 'status',
                            key: 'status',
                            render: (value: string) => (
                                <Tag
                                    color={
                                        value === 'Hoạt động'
                                            ? 'success'
                                            : 'warning'
                                    }
                                    className={styles.statusTag}
                                >
                                    {value}
                                </Tag>
                            ),
                        },
                        {
                            title: 'Đăng nhập cuối',
                            dataIndex: 'lastLogin',
                            key: 'lastLogin',
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
