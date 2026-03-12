import { Card, Space, Statistic, Table, Tag } from 'antd'

import {
    CalendarOutlined,
    FileTextOutlined,
    MessageOutlined,
    TeamOutlined,
} from '@ant-design/icons'

import AdminPageHeader from '@/pages/admin/AdminPageHeader'
import styles from '@/pages/admin/AdminUi.module.css'

import { employerJobs, employerStats } from './employerData'

const icons = [
    <FileTextOutlined />,
    <TeamOutlined />,
    <CalendarOutlined />,
    <MessageOutlined />,
]

const EmployerDashboardPage = () => {
    return (
        <div className={styles.page}>
            <AdminPageHeader
                title="Employer Dashboard"
                subtitle="Không gian làm việc dành riêng cho đơn vị tuyển dụng, tập trung vào chiến dịch, ứng viên và lịch phỏng vấn."
            />

            <div className={styles.statsGrid}>
                {employerStats.map((item, index) => (
                    <Card
                        key={item.key}
                        variant="borderless"
                        className={styles.statCard}
                    >
                        <div className={styles.statBody}>
                            <div>
                                <div className={styles.statLabel}>
                                    {item.label}
                                </div>
                                <div className={styles.statValue}>
                                    {item.value}
                                </div>
                            </div>
                            <div className={styles.statIcon}>
                                {icons[index]}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card variant="borderless" className={styles.sectionCard}>
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <span className={styles.sectionTitle}>
                        Tin tuyển dụng gần đây
                    </span>
                    <Table
                        rowKey="key"
                        pagination={false}
                        dataSource={employerJobs}
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
                                    <Tag color="processing">{value}</Tag>
                                ),
                            },
                            { title: 'Hạn nộp', dataIndex: 'deadline' },
                        ]}
                    />
                </Space>
            </Card>
        </div>
    )
}

export default EmployerDashboardPage
