import { Button, Card, Space, Tag } from 'antd'

import {
    CalendarOutlined,
    CopyOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    FileAddOutlined,
    FileTextOutlined,
    PlusOutlined,
    ProfileOutlined,
} from '@ant-design/icons'

import AdminPageHeader from './AdminPageHeader'
import styles from './AdminUi.module.css'
import { cvFieldTypes, cvTemplates } from './adminData'

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
            <AdminPageHeader
                title="Quản lý mẫu hồ sơ"
                subtitle="Tạo mẫu hồ sơ chuẩn cho từng nhóm vị trí và quản lý danh sách trường thông tin bắt buộc."
                extra={
                    <Button type="primary" size="large" icon={<PlusOutlined />}>
                        Tạo mẫu mới
                    </Button>
                }
            />

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
                    Chọn các loại trường dữ liệu để cấu hình nhanh mẫu hồ sơ
                    tuyển dụng.
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

            <div className={styles.cardGrid}>
                {cvTemplates.map((template) => (
                    <Card
                        key={template.key}
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
                                {template.name}
                            </div>
                            <Tag
                                color={
                                    template.status === 'Đang sử dụng'
                                        ? 'success'
                                        : 'default'
                                }
                                className={styles.statusTag}
                            >
                                {template.status}
                            </Tag>
                        </div>
                        <div className={styles.sectionHint}>
                            {template.description}
                        </div>
                        <div className={styles.detailList}>
                            <div className={styles.detailItem}>
                                <span>Số trường:</span>
                                <strong>{template.fields}</strong>
                            </div>
                            <div className={styles.detailItem}>
                                <span>Đơn vị áp dụng:</span>
                                <strong>{template.usedBy}</strong>
                            </div>
                            <div className={styles.detailItem}>
                                <span>Cập nhật:</span>
                                <strong>{template.lastModified}</strong>
                            </div>
                        </div>
                        <Space style={{ marginTop: 18 }} wrap>
                            <Button icon={<EyeOutlined />}>Xem</Button>
                            <Button icon={<EditOutlined />}>Sửa</Button>
                            <Button icon={<CopyOutlined />}>Nhân bản</Button>
                            <Button danger icon={<DeleteOutlined />}>
                                Xóa
                            </Button>
                        </Space>
                    </Card>
                ))}
            </div>

            <Card
                variant="borderless"
                className={styles.sectionCard}
                title={
                    <span className={styles.sectionTitle}>
                        Trình tạo mẫu hồ sơ
                    </span>
                }
            >
                <div className={styles.sectionHint}>
                    Kéo thả trường dữ liệu để xây dựng một mẫu hồ sơ theo từng
                    vị trí tuyển dụng.
                </div>
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
                            Chọn "Tạo mẫu mới" để bắt đầu cấu hình
                        </div>
                        <div className={styles.sectionHint}>
                            Hỗ trợ sắp xếp trường dữ liệu, gắn điều kiện bắt
                            buộc và cấu hình nhóm thông tin.
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default AdminManageCvTemplatePage
