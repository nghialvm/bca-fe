import { Card } from 'antd'

import {
    CalendarOutlined,
    FileTextOutlined,
    MessageOutlined,
    TeamOutlined,
} from '@ant-design/icons'

import AdminPageHeader from '@/pages/admin/AdminPageHeader'
import AdminStatCard from '@/pages/admin/AdminStatCard'
import styles from '@/pages/admin/AdminUi.module.css'

import { employerStats } from './employerData'

const icons = [
    <FileTextOutlined />,
    <TeamOutlined />,
    <CalendarOutlined />,
    <MessageOutlined />,
]

const EmployerReportPage = () => {
    return (
        <div className={styles.page}>
            <AdminPageHeader
                title="Báo cáo đơn vị"
                subtitle="Báo cáo dành riêng cho employer, tách khỏi admin để chỉ tập trung dữ liệu của đơn vị mình."
            />
            <div className={styles.statsGrid}>
                {employerStats.map((item, index) => (
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
                    Tóm tắt hiệu quả tuyển dụng
                </div>
                <div className={styles.sectionHint}>
                    Tỷ lệ phản hồi hồ sơ, số lịch phỏng vấn và tiến độ xử lý sẽ
                    được hiển thị tại đây theo từng kỳ.
                </div>
            </Card>
        </div>
    )
}

export default EmployerReportPage
