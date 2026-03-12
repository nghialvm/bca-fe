import { ReactNode } from 'react'

import styles from './AdminUi.module.css'

interface AdminPageHeaderProps {
    title: string
    subtitle: string
    extra?: ReactNode
}

const AdminPageHeader = ({ title, subtitle, extra }: AdminPageHeaderProps) => {
    return (
        <div className={styles.pageHeader}>
            <div>
                <h1 className={styles.pageTitle}>{title}</h1>
                <div className={styles.pageSubtitle}>{subtitle}</div>
            </div>
            {extra}
        </div>
    )
}

export default AdminPageHeader
