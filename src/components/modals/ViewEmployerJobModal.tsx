import { Descriptions, Modal, Space, Tag, Typography } from 'antd'

import type { EmployerJobRecord } from './employerJobModal.shared'
import { getEmployerJobSummaryItems } from './employerJobModal.shared'

type ViewEmployerJobModalProps = {
    open: boolean
    job: EmployerJobRecord | null
    onCancel: () => void
}

const ViewEmployerJobModal = ({
    open,
    job,
    onCancel,
}: ViewEmployerJobModalProps) => {
    return (
        <Modal
            destroyOnClose
            title="Chi tiết tin tuyển dụng"
            open={open}
            width={760}
            footer={null}
            onCancel={onCancel}
        >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <div>
                    <Typography.Title level={4} style={{ marginBottom: 4 }}>
                        {job?.title || '-'}
                    </Typography.Title>
                    <Space wrap>
                        <Typography.Text type="secondary">
                            {job?.requestCode || '-'}
                        </Typography.Text>
                        <Tag color={job?.statusColor}>
                            {job?.statusLabel || '-'}
                        </Tag>
                    </Space>
                </div>

                <Descriptions bordered column={1} size="small">
                    {getEmployerJobSummaryItems(job).map((item) => (
                        <Descriptions.Item key={item.key} label={item.label}>
                            {item.value}
                        </Descriptions.Item>
                    ))}
                    {job?.rejectReason ? (
                        <Descriptions.Item label="Lý do từ chối">
                            {job.rejectReason}
                        </Descriptions.Item>
                    ) : null}
                    <Descriptions.Item label="Mô tả công việc">
                        {job?.description || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Yêu cầu ứng viên">
                        {job?.requirement || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Quyền lợi">
                        {job?.benefit || '-'}
                    </Descriptions.Item>
                </Descriptions>
            </Space>
        </Modal>
    )
}

export default ViewEmployerJobModal
