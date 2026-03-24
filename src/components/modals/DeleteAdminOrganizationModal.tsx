import { Alert, Modal, Space, Tag, Typography } from 'antd'

import type { AdminOrganizationRecord } from './adminOrganizationModal.shared'

type DeleteAdminOrganizationModalProps = {
    open: boolean
    organization: AdminOrganizationRecord | null
    submitting?: boolean
    onCancel: () => void
    onConfirm: () => Promise<void> | void
}

const DeleteAdminOrganizationModal = ({
    open,
    organization,
    submitting,
    onCancel,
    onConfirm,
}: DeleteAdminOrganizationModalProps) => {
    return (
        <Modal
            destroyOnClose
            title="Xóa đơn vị"
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
                    message="Thao tác này sẽ xóa đơn vị khỏi hệ thống nếu backend cho phép."
                />

                <div>
                    <Typography.Text strong>
                        {organization?.name || '-'}
                    </Typography.Text>
                    <div>
                        <Typography.Text type="secondary">
                            {organization?.code || '-'}
                        </Typography.Text>
                    </div>
                </div>

                <Space wrap>
                    <Tag>{organization?.managerName || 'Chưa gán quản lý'}</Tag>
                    <Tag color={organization?.isActive ? 'success' : 'warning'}>
                        {organization?.statusLabel || '-'}
                    </Tag>
                </Space>
            </Space>
        </Modal>
    )
}

export default DeleteAdminOrganizationModal
