import { Button, Card, Space, Table, Tag } from 'antd'

import { EyeOutlined, PlusOutlined } from '@ant-design/icons'

import AdminPageHeader from '@/pages/admin/AdminPageHeader'
import styles from '@/pages/admin/AdminUi.module.css'

import { employerJobs } from './employerData'

const EmployerManageJobPage = () => {
    return (
        <div className={styles.page}>
            <AdminPageHeader
                title="Tin tuyển dụng"
                subtitle="Quản lý danh sách tin tuyển dụng, trạng thái phê duyệt và lượng hồ sơ theo từng vị trí."
                extra={
                    <Button type="primary" size="large" icon={<PlusOutlined />}>
                        Tạo tin mới
                    </Button>
                }
            />
            <Card variant="borderless" className={styles.sectionCard}>
                <Table
                    rowKey="key"
                    dataSource={employerJobs}
                    pagination={false}
                    columns={[
                        {
                            title: 'Vị trí',
                            dataIndex: 'title',
                            render: (
                                value: string,
                                record: (typeof employerJobs)[0]
                            ) => (
                                <div className={styles.tableNameCell}>
                                    <span className={styles.tableMainText}>
                                        {value}
                                    </span>
                                    <span className={styles.tableSubText}>
                                        {record.department}
                                    </span>
                                </div>
                            ),
                        },
                        { title: 'Hồ sơ', dataIndex: 'applications' },
                        {
                            title: 'Trạng thái',
                            dataIndex: 'status',
                            render: (value: string) => (
                                <Tag
                                    color={
                                        value === 'Đã đóng'
                                            ? 'default'
                                            : 'processing'
                                    }
                                >
                                    {value}
                                </Tag>
                            ),
                        },
                        { title: 'Hạn nộp', dataIndex: 'deadline' },
                        {
                            title: 'Thao tác',
                            render: () => (
                                <Space>
                                    <Button icon={<EyeOutlined />}>Xem</Button>
                                </Space>
                            ),
                        },
                    ]}
                />
            </Card>
        </div>
    )
}

export default EmployerManageJobPage
