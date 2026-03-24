import { Descriptions, Modal, Space, Tag, Typography } from 'antd'

import type { AdminOrganizationRecord } from './adminOrganizationModal.shared'

type ViewAdminOrganizationModalProps = {
    open: boolean
    organization: AdminOrganizationRecord | null
    onCancel: () => void
}

const ViewAdminOrganizationModal = ({
    open,
    organization,
    onCancel,
}: ViewAdminOrganizationModalProps) => {
    return (
        <Modal
            destroyOnClose
            title="Chi tiết đơn vị"
            open={open}
            footer={null}
            onCancel={onCancel}
        >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <div>
                    <Typography.Title level={4} style={{ marginBottom: 4 }}>
                        {organization?.name || '-'}
                    </Typography.Title>
                    <Typography.Text type="secondary">
                        {organization?.code || '-'}
                    </Typography.Text>
                </div>

                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Mã đơn vị">
                        {organization?.code || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên đơn vị">
                        {organization?.name || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Người quản lý">
                        {organization?.managerName || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email quản lý">
                        {organization?.managerEmail || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                        {organization?.managerPhone || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả">
                        {organization?.description || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag
                            color={
                                organization?.isActive ? 'success' : 'warning'
                            }
                        >
                            {organization?.statusLabel || '-'}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Đầu mối quản lý">
                        {organization?.users ?? 0}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tin tuyển dụng hoạt động">
                        {organization?.activeRecruitments ?? 0}
                    </Descriptions.Item>
                </Descriptions>
            </Space>
        </Modal>
    )
}

export default ViewAdminOrganizationModal
