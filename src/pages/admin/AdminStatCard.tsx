import { CSSProperties, ReactNode } from 'react'

import { Card } from 'antd'

import styles from './AdminUi.module.css'

interface AdminStatCardProps {
    label: string
    value: string
    change?: string
    icon: ReactNode
    accentColor?: string
}

const AdminStatCard = ({
    label,
    value,
    change,
    icon,
    accentColor = '#2f54eb',
}: AdminStatCardProps) => {
    return (
        <Card
            variant="borderless"
            className={styles.statCard}
            style={
                {
                    '--accent-color': accentColor,
                } as CSSProperties
            }
        >
            <div className={styles.statBody}>
                <div>
                    <div className={styles.statLabel}>{label}</div>
                    <div className={styles.statValue}>{value}</div>
                    {change ? (
                        <div className={styles.statChange}>{change}</div>
                    ) : null}
                </div>
                <div className={styles.statIcon}>{icon}</div>
            </div>
        </Card>
    )
}

export default AdminStatCard
