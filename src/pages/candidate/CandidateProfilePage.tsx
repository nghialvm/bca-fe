import { Card, Space } from 'antd'

import AdminPageHeader from '@/pages/admin/AdminPageHeader'
import styles from '@/pages/admin/AdminUi.module.css'

import { candidateProfile } from './candidateData'

const CandidateProfilePage = () => {
    return (
        <div className={styles.page}>
            <AdminPageHeader
                title="Hồ sơ cá nhân"
                subtitle="Thông tin hồ sơ và năng lực của ứng viên được hiển thị trong candidate portal."
            />
            <Card variant="borderless" className={styles.sectionCard}>
                <Space direction="vertical" size={16}>
                    {candidateProfile.map((item) => (
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

export default CandidateProfilePage
