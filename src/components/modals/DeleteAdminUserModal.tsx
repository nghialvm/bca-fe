import { Alert, Modal, Space, Tag, Typography } from 'antd'

import { getUserStatusColor, getUserStatusLabel } from '@/utils/admin'

import type { AdminUserRecord } from './adminUserModal.shared'

type DeleteAdminUserModalProps = {
    open: boolean
    user: AdminUserRecord | null
    submitting?: boolean
    onCancel: () => void
    onConfirm: () => Promise<void> | void
}

const DeleteAdminUserModal = ({
    open,
    user,
    submitting,
    onCancel,
    onConfirm,
}: DeleteAdminUserModalProps) => {
    return (
        <Modal
            destroyOnClose
            title="Xóa người dùng"
            open={open}
            okText="Xóa"
            okButtonProps={{ danger: true }}
            cancelText="Hủy"
            confirmLoading={submitting}
            onCancel={onCancel}
            onOk={() => void onConfirm()}
        >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Alert
                    type="warning"
                    showIcon
                    message="Thao tác này sẽ xóa tài khoản khỏi hệ thống."
                />
                <div>
                    <Typography.Text strong>
                        {user?.displayName || '-'}
                    </Typography.Text>
                    <div>
                        <Typography.Text type="secondary">
                            {user?.email || '-'}
                        </Typography.Text>
                    </div>
                </div>
                <Space wrap>
                    {user?.roleNames.length ? (
                        user.roleNames.map((roleName) => (
                            <Tag key={roleName}>{roleName}</Tag>
                        ))
                    ) : (
                        <Tag>Chưa gán vai trò</Tag>
                    )}
                    <Tag color={getUserStatusColor(user?.isActive)}>
                        {getUserStatusLabel(user?.isActive)}
                    </Tag>
                </Space>
            </Space>
        </Modal>
    )
}

export default DeleteAdminUserModal
