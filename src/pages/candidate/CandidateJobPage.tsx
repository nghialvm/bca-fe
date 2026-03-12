import { Card, Table, Tag } from 'antd'

import AdminPageHeader from '@/pages/admin/AdminPageHeader'
import styles from '@/pages/admin/AdminUi.module.css'

import { candidateJobs } from './candidateData'

const CandidateJobPage = () => {
    return (
        <div className={styles.page}>
            <AdminPageHeader
                title="Việc phù hợp"
                subtitle="Danh sách cơ hội phù hợp với hồ sơ của ứng viên, tách riêng khỏi employer/admin site."
            />
            <Card variant="borderless" className={styles.sectionCard}>
                <Table
                    rowKey="key"
                    dataSource={candidateJobs}
                    pagination={false}
                    columns={[
                        { title: 'Vị trí', dataIndex: 'title' },
                        { title: 'Đơn vị', dataIndex: 'unit' },
                        { title: 'Mức lương', dataIndex: 'salary' },
                        {
                            title: 'Trạng thái',
                            dataIndex: 'status',
                            render: (value: string) => (
                                <Tag color="processing">{value}</Tag>
                            ),
                        },
                    ]}
                />
            </Card>
        </div>
    )
}

export default CandidateJobPage
