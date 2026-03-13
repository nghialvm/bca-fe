import { Avatar, Button, Card, Space, Typography } from 'antd'

import {
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    SafetyCertificateOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { useSelector } from 'react-redux'

import {
    profileActivities,
    profileHighlights,
    profilePermissions,
    profileSummary,
} from '@/mock/adminData'

import styles from '../styles/AdminUi.module.css'

const AdminProfilePage = () => {
    const user = useSelector((store: any) => store.auth.user)
    const displayName = user?.full_name || 'Admin H05'

    return (
        <div className={styles.page}>
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Hồ sơ</span>
                <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    align="start"
                    wrap
                >
                    <div>
                        <Typography.Title level={2}>
                            Tổng quan hồ sơ quản trị viên
                        </Typography.Title>
                        <Typography.Paragraph style={{ maxWidth: 720 }}>
                            Thông tin cá nhân, quyền truy cập và lịch sử hoạt
                            động của quản trị viên hệ thống.
                        </Typography.Paragraph>
                    </div>
                    <Space>
                        <Button size="large">Đổi mật khẩu</Button>
                        <Button type="primary" size="large">
                            Cập nhật hồ sơ
                        </Button>
                    </Space>
                </Space>
            </section>

            <div className={styles.profileGrid}>
                <Card variant="borderless" className={styles.profileHero}>
                    <Space
                        direction="vertical"
                        size={20}
                        style={{ width: '100%' }}
                    >
                        <Avatar
                            size={84}
                            icon={<UserOutlined />}
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.18)',
                                border: '1px solid rgba(255,255,255,0.24)',
                            }}
                        />
                        <div>
                            <div
                                style={{
                                    fontSize: 28,
                                    fontWeight: 700,
                                    color: '#ffffff',
                                }}
                            >
                                {displayName}
                            </div>
                            <div
                                style={{
                                    marginTop: 6,
                                    color: 'rgba(232, 240, 255, 0.76)',
                                }}
                            >
                                Quản trị viên hệ thống H05
                            </div>
                        </div>
                        <div className={styles.profileMetaList}>
                            {profileHighlights.map((item) => (
                                <div key={item.label}>
                                    <div className={styles.profileLabel}>
                                        {item.label}
                                    </div>
                                    <div className={styles.profileValue}>
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Space>
                </Card>

                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <Card
                        variant="borderless"
                        className={styles.sectionCard}
                        title={
                            <span className={styles.sectionTitle}>
                                Tổng quan hoạt động
                            </span>
                        }
                    >
                        <div className={styles.summaryGrid}>
                            {profileSummary.map((item) => (
                                <div
                                    key={item.label}
                                    className={styles.metricBox}
                                >
                                    <div className={styles.metricIcon}>
                                        <SafetyCertificateOutlined />
                                    </div>
                                    <div>
                                        <div className={styles.metricValue}>
                                            {item.value}
                                        </div>
                                        <div className={styles.metricLabel}>
                                            {item.label}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card
                        variant="borderless"
                        className={styles.sectionCard}
                        title={
                            <span className={styles.sectionTitle}>
                                Quyền truy cập chính
                            </span>
                        }
                    >
                        <Space wrap>
                            {profilePermissions.map((permission) => (
                                <span
                                    key={permission}
                                    className={styles.summaryPill}
                                >
                                    <LockOutlined />
                                    {permission}
                                </span>
                            ))}
                        </Space>
                        <div className={styles.detailList}>
                            <div className={styles.detailItem}>
                                <MailOutlined className={styles.detailIcon} />
                                <span>admin.h05@congannha.gov.vn</span>
                            </div>
                            <div className={styles.detailItem}>
                                <PhoneOutlined className={styles.detailIcon} />
                                <span>024.3999.8899</span>
                            </div>
                        </div>
                    </Card>

                    <Card
                        variant="borderless"
                        className={styles.sectionCard}
                        title={
                            <span className={styles.sectionTitle}>
                                Hoạt động gần đây
                            </span>
                        }
                    >
                        <div className={styles.timelineList}>
                            {profileActivities.map((activity) => (
                                <div
                                    key={`${activity.title}-${activity.time}`}
                                    className={styles.timelineItem}
                                >
                                    <div className={styles.timelineDot} />
                                    <div>
                                        <div className={styles.tableMainText}>
                                            {activity.title}
                                        </div>
                                        <div className={styles.tableSubText}>
                                            {activity.time}
                                        </div>
                                        <div
                                            className={styles.sectionHint}
                                            style={{ marginTop: 4 }}
                                        >
                                            {activity.description}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Space>
            </div>
        </div>
    )
}

export default AdminProfilePage
