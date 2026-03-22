import { Button, Card, Empty, Space, Typography } from 'antd'

import {
    CalendarOutlined,
    FileAddOutlined,
    FileTextOutlined,
    PlusOutlined,
    ProfileOutlined,
} from '@ant-design/icons'

import styles from '../styles/AdminUi.module.css'

const cvFieldTypes = [
    { key: 'text', label: 'Văn bản' },
    { key: 'number', label: 'Số' },
    { key: 'date', label: 'Ngày tháng' },
    { key: 'select', label: 'Lựa chọn' },
    { key: 'file', label: 'Tải tệp' },
    { key: 'checkbox', label: 'Checkbox' },
]

const fieldIcons = {
    text: <FileTextOutlined />,
    number: <ProfileOutlined />,
    date: <CalendarOutlined />,
    select: <FileAddOutlined />,
    file: <FileTextOutlined />,
    checkbox: <ProfileOutlined />,
}

const AdminManageCvTemplatePage = () => {
    return (
        <div className={styles.page}>
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Mẫu hồ sơ</span>
                <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    align="start"
                    wrap
                >
                    <div>
                        <Typography.Title level={2}>
                            Quản lý mẫu hồ sơ
                        </Typography.Title>
                        <Typography.Paragraph style={{ maxWidth: 720 }}>
                            Frontend đã bỏ danh sách template mock. Hiện repo
                            chưa có endpoint text template hoặc CV template được
                            xác nhận để nối vào trang admin này.
                        </Typography.Paragraph>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        disabled
                        icon={<PlusOutlined />}
                    >
                        Tạo mẫu mới
                    </Button>
                </Space>
            </section>

            <Card
                variant="borderless"
                className={styles.sectionCard}
                title={
                    <span className={styles.sectionTitle}>
                        Bộ trường dữ liệu
                    </span>
                }
            >
                <div className={styles.sectionHint}>
                    Đây là palette giao diện có thể tái sử dụng khi backend
                    expose API template. Hiện chưa ghi/xuất dữ liệu thực.
                </div>
                <div className={styles.fieldGrid} style={{ marginTop: 20 }}>
                    {cvFieldTypes.map((field) => (
                        <div key={field.key} className={styles.fieldTile}>
                            <div className={styles.fieldIcon}>
                                {
                                    fieldIcons[
                                        field.key as keyof typeof fieldIcons
                                    ]
                                }
                            </div>
                            <span>{field.label}</span>
                        </div>
                    ))}
                </div>
            </Card>

            <Card
                variant="borderless"
                className={styles.sectionCard}
                title={
                    <span className={styles.sectionTitle}>
                        Trạng thái backend
                    </span>
                }
            >
                <Empty description="Chưa có API cv template/text template sẵn sàng cho frontend" />
                <div className={styles.sectionHint} style={{ marginTop: 12 }}>
                    Khi backend expose contract rõ ràng, có thể nối tiếp danh
                    sach template, preview, clone va builder.
                </div>
            </Card>

            <Card
                variant="borderless"
                className={styles.sectionCard}
                title={
                    <span className={styles.sectionTitle}>
                        Trình tạo mẫu hồ sơ
                    </span>
                }
            >
                <div className={styles.builder} style={{ marginTop: 20 }}>
                    <div>
                        <PlusOutlined
                            style={{
                                fontSize: 32,
                                color: '#2f54eb',
                                marginBottom: 12,
                            }}
                        />
                        <div className={styles.tableMainText}>
                            Chờ backend expose template management API
                        </div>
                        <div className={styles.sectionHint}>
                            Sau khi có contract, builder này sẽ được nối với
                            thao tác tạo/sửa/nhân bản mẫu hồ sơ thực tế.
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default AdminManageCvTemplatePage
