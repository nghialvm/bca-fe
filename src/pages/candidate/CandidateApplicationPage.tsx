import { Card, Table, Tag } from 'antd'

import AdminPageHeader from '@/pages/admin/AdminPageHeader'
import styles from '@/pages/admin/AdminUi.module.css'

import { candidateApplications } from './candidateData'

const CandidateApplicationPage = () => {
    return (
        <div className={styles.page}>
            <AdminPageHeader
                title="Hồ sơ ứng tuyển"
                subtitle="Theo dõi trạng thái từng hồ sơ ứng tuyển trong site dành riêng cho candidate."
            />
            <Card variant="borderless" className={styles.sectionCard}>
                <Table
                    rowKey="key"
                    dataSource={candidateApplications}
                    pagination={false}
                    columns={[
                        { title: 'Vị trí', dataIndex: 'title' },
                        { title: 'Đơn vị', dataIndex: 'unit' },
                        {
                            title: 'Trạng thái',
                            dataIndex: 'status',
                            render: (value: string) => (
                                <Tag color="processing">{value}</Tag>
                            ),
                        },
                        { title: 'Cập nhật', dataIndex: 'updatedAt' },
                    ]}
                />
            </Card>
        </div>
    )
}

export default CandidateApplicationPage
