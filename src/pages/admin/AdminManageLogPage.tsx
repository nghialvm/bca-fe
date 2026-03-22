import { Button, Card, Empty, Space, Typography } from 'antd'

import {
    DownloadOutlined,
    InfoCircleOutlined,
    SafetyOutlined,
    WarningOutlined,
} from '@ant-design/icons'

import styles from '../styles/AdminUi.module.css'

const AdminManageLogPage = () => {
    return (
        <div className={styles.page}>
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Nhật ký</span>
                <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    align="start"
                    wrap
                >
                    <div>
                        <Typography.Title level={2}>
                            Quản lý nhật ký hệ thống
                        </Typography.Title>
                        <Typography.Paragraph style={{ maxWidth: 720 }}>
                            Module này đã bỏ dữ liệu mock. Hiện backend trong
                            repo chưa expose endpoint audit/security log rõ ràng
                            để frontend gọi và phân trang an toàn.
                        </Typography.Paragraph>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        disabled
                        icon={<DownloadOutlined />}
                    >
                        Xuất nhật ký
                    </Button>
                </Space>
            </section>

            <div className={styles.metricGrid}>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <InfoCircleOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>API</div>
                        <div className={styles.metricLabel}>
                            Audit log chưa sẵn sàng
                        </div>
                    </div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <WarningOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>ABP</div>
                        <div className={styles.metricLabel}>
                            Module đã có trong backend
                        </div>
                    </div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <SafetyOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>TODO</div>
                        <div className={styles.metricLabel}>
                            Cần xác nhận route và DTO
                        </div>
                    </div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <InfoCircleOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>0</div>
                        <div className={styles.metricLabel}>
                            Bản ghi mock còn lại
                        </div>
                    </div>
                </div>
            </div>

            <Card variant="borderless" className={styles.sectionCard}>
                <Empty description="Chờ backend expose endpoint audit logging hoặc identity security logs" />
                <div className={styles.sectionHint} style={{ marginTop: 12 }}>
                    Khi backend bổ sung route rõ ràng, có thể nối tiếp danh
                    sách log, bộ lọc severity, tìm kiếm và export.
                </div>
            </Card>
        </div>
    )
}

export default AdminManageLogPage
