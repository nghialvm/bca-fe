import { Card, Tag } from 'antd'

import AdminPageHeader from '@/pages/admin/AdminPageHeader'
import styles from '@/pages/admin/AdminUi.module.css'

import { employerMessages } from './employerData'

const EmployerManageCommunicationPage = () => {
    return (
        <div className={styles.page}>
            <AdminPageHeader
                title="Trao đổi"
                subtitle="Không gian trao đổi với ứng viên, gom nhóm hội thoại và trạng thái phản hồi vào một site riêng."
            />
            <div className={styles.cardGrid}>
                {employerMessages.map((item) => (
                    <Card
                        key={item.key}
                        variant="borderless"
                        className={styles.infoCard}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: 12,
                            }}
                        >
                            <div className={styles.tableMainText}>
                                {item.title}
                            </div>
                            <Tag
                                color={
                                    item.status === 'Chưa đọc'
                                        ? 'error'
                                        : 'success'
                                }
                            >
                                {item.status}
                            </Tag>
                        </div>
                        <div className={styles.sectionHint}>
                            Ứng viên: {item.target}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default EmployerManageCommunicationPage
