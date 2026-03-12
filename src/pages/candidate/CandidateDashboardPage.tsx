import { Card } from 'antd'

import {
    CalendarOutlined,
    FileSearchOutlined,
    FileTextOutlined,
    NotificationOutlined,
} from '@ant-design/icons'

import AdminPageHeader from '@/pages/admin/AdminPageHeader'
import AdminStatCard from '@/pages/admin/AdminStatCard'
import styles from '@/pages/admin/AdminUi.module.css'

import { candidateApplications, candidateStats } from './candidateData'

const icons = [
    <FileSearchOutlined />,
    <FileTextOutlined />,
    <CalendarOutlined />,
    <NotificationOutlined />,
]

const CandidateDashboardPage = () => {
    return (
        <div className={styles.page}>
            <AdminPageHeader
                title="Candidate Dashboard"
                subtitle="Trang riêng cho ứng viên, tập trung vào cơ hội phù hợp, hồ sơ đã nộp và cập nhật mới."
            />
            <div className={styles.statsGrid}>
                {candidateStats.map((item, index) => (
                    <AdminStatCard
                        key={item.key}
                        label={item.label}
                        value={item.value}
                        icon={icons[index]}
                    />
                ))}
            </div>
            <Card variant="borderless" className={styles.sectionCard}>
                <div className={styles.sectionTitle}>
                    Cập nhật hồ sơ gần đây
                </div>
                <div className={styles.detailList}>
                    {candidateApplications.map((item) => (
                        <div key={item.key} className={styles.detailItem}>
                            <div>
                                <div className={styles.tableMainText}>
                                    {item.title}
                                </div>
                                <div className={styles.tableSubText}>
                                    {item.unit} - {item.status} -{' '}
                                    {item.updatedAt}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}

export default CandidateDashboardPage
