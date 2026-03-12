import { Card } from 'antd'

import AdminPageHeader from '@/pages/admin/AdminPageHeader'
import styles from '@/pages/admin/AdminUi.module.css'

import { employerInterviews } from './employerData'

const EmployerManageInterviewPage = () => {
    return (
        <div className={styles.page}>
            <AdminPageHeader
                title="Lịch phỏng vấn"
                subtitle="Lịch phỏng vấn của đơn vị được tách riêng để hội đồng và bộ phận tuyển dụng dễ theo dõi."
            />
            <div className={styles.cardGrid}>
                {employerInterviews.map((item) => (
                    <Card
                        key={item.key}
                        variant="borderless"
                        className={styles.infoCard}
                    >
                        <div className={styles.tableMainText}>
                            {item.candidate}
                        </div>
                        <div className={styles.tableSubText}>
                            {item.position}
                        </div>
                        <div className={styles.detailList}>
                            <div className={styles.detailItem}>
                                <span>{item.time}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span>{item.interviewer}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default EmployerManageInterviewPage
