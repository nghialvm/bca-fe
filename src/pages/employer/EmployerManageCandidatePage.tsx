import { Card, Table, Tag } from 'antd'

import AdminPageHeader from '@/pages/admin/AdminPageHeader'
import styles from '@/pages/admin/AdminUi.module.css'

import { employerCandidates } from './employerData'

const EmployerManageCandidatePage = () => {
    return (
        <div className={styles.page}>
            <AdminPageHeader
                title="Ứng viên"
                subtitle="Theo dõi danh sách ứng viên, giai đoạn xử lý và tình trạng phản hồi hồ sơ."
            />
            <Card variant="borderless" className={styles.sectionCard}>
                <Table
                    rowKey="key"
                    dataSource={employerCandidates}
                    pagination={false}
                    columns={[
                        { title: 'Ứng viên', dataIndex: 'name' },
                        { title: 'Vị trí', dataIndex: 'position' },
                        { title: 'Giai đoạn', dataIndex: 'stage' },
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

export default EmployerManageCandidatePage
