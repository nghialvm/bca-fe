import { Alert, Modal, Space, Tag, Typography } from 'antd'

import type { EmployerJobRecord } from './employerJobModal.shared'

type DeleteEmployerJobModalProps = {
    open: boolean
    job: EmployerJobRecord | null
    submitting?: boolean
    onCancel: () => void
    onConfirm: () => Promise<void> | void
}

const DeleteEmployerJobModal = ({
    open,
    job,
    submitting,
    onCancel,
    onConfirm,
}: DeleteEmployerJobModalProps) => {
    return (
        <Modal
            destroyOnClose
            title="Xóa tin tuyển dụng"
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
                    message="Thao tác này sẽ xóa tin tuyển dụng khỏi hệ thống nếu backend cho phép."
                />

                <div>
                    <Typography.Text strong>{job?.title || '-'}</Typography.Text>
                    <div>
                        <Typography.Text type="secondary">
                            {job?.requestCode || '-'}
                        </Typography.Text>
                    </div>
                </div>

                <Space wrap>
                    <Tag>{job?.departmentName || '-'}</Tag>
                    <Tag>{job?.jobPositionName || '-'}</Tag>
                    <Tag color={job?.statusColor}>{job?.statusLabel || '-'}</Tag>
                    <Tag color="processing">
                        {job?.applicants ?? 0} ứng viên
                    </Tag>
                </Space>
            </Space>
        </Modal>
    )
}

export default DeleteEmployerJobModal
