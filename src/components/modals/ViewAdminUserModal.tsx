import { Descriptions, Modal, Space, Tag, Typography } from 'antd'

import { getUserStatusColor, getUserStatusLabel } from '@/utils/admin'

import type { AdminUserRecord } from './adminUserModal.shared'

type ViewAdminUserModalProps = {
    open: boolean
    user: AdminUserRecord | null
    onCancel: () => void
}

const ViewAdminUserModal = ({
    open,
    user,
    onCancel,
}: ViewAdminUserModalProps) => {
    return (
        <Modal
            destroyOnClose
            title="Chi tiết người dùng"
            open={open}
            footer={null}
            onCancel={onCancel}
        >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <div>
                    <Typography.Title level={4} style={{ marginBottom: 4 }}>
                        {user?.displayName || '-'}
                    </Typography.Title>
                    <Typography.Text type="secondary">
                        {user?.email || '-'}
                    </Typography.Text>
                </div>

                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Tên đăng nhập">
                        {user?.userName || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Họ và tên">
                        {user?.displayName || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                        {user?.phoneNumber || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Vai trò">
                        {user?.roleNames.length ? (
                            <Space wrap>
                                {user.roleNames.map((roleName) => (
                                    <Tag key={roleName}>{roleName}</Tag>
                                ))}
                            </Space>
                        ) : (
                            <Typography.Text type="secondary">
                                Chưa gán vai trò
                            </Typography.Text>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={getUserStatusColor(user?.isActive)}>
                            {getUserStatusLabel(user?.isActive)}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Đơn vị">
                        {user?.unit || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                        {user?.creationTimeText || '-'}
                    </Descriptions.Item>
                </Descriptions>
            </Space>
        </Modal>
    )
}

export default ViewAdminUserModal
