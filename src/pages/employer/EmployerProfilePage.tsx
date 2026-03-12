import { Card, Space } from 'antd'

import AdminPageHeader from '@/pages/admin/AdminPageHeader'
import styles from '@/pages/admin/AdminUi.module.css'

import { employerProfile } from './employerData'

const EmployerProfilePage = () => {
    return (
        <div className={styles.page}>
            <AdminPageHeader
                title="Employer Profile"
                subtitle="Thông tin định danh của đơn vị tuyển dụng và đầu mối phụ trách trong site employer."
            />
            <Card variant="borderless" className={styles.sectionCard}>
                <Space direction="vertical" size={16}>
                    {employerProfile.map((item) => (
                        <div key={item.label}>
                            <div className={styles.tableSubText}>
                                {item.label}
                            </div>
                            <div className={styles.tableMainText}>
                                {item.value}
                            </div>
                        </div>
                    ))}
                </Space>
            </Card>
        </div>
    )
}

export default EmployerProfilePage
