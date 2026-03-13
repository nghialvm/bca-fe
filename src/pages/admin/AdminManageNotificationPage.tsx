import { useState } from 'react'

import {
    Button,
    Card,
    Form,
    Input,
    Modal,
    Radio,
    Space,
    Statistic,
    Table,
    Tag,
    Typography,
} from 'antd'

import {
    BellOutlined,
    EditOutlined,
    EyeOutlined,
    PlusOutlined,
    SendOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons'

import { notificationRecipientOptions, notifications } from '@/mock/adminData'

import styles from '../styles/AdminUi.module.css'

const AdminManageNotificationPage = () => {
    const [open, setOpen] = useState(false)
    const [form] = Form.useForm()

    return (
        <div className={styles.page}>
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Thông báo</span>
                <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    align="start"
                    wrap
                >
                    <div>
                        <Typography.Title level={2}>
                            Quản lý thông báo hệ thống
                        </Typography.Title>
                        <Typography.Paragraph style={{ maxWidth: 720 }}>
                            Tạo, lên lịch và theo dõi thông báo gửi tới đơn vị,
                            ứng viên và người dùng nội bộ.
                        </Typography.Paragraph>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => setOpen(true)}
                    >
                        Tạo thông báo
                    </Button>
                </Space>
            </section>

            <div className={styles.metricGrid}>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <SendOutlined />
                    </div>
                    <Statistic value={245} title="Đã gửi" />
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <EditOutlined />
                    </div>
                    <Statistic value={12} title="Nháp" />
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <TeamOutlined />
                    </div>
                    <Statistic value="3.4K" title="Người nhận" />
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <EyeOutlined />
                    </div>
                    <Statistic value="89%" title="Tỷ lệ đọc" />
                </div>
            </div>

            <Card variant="borderless" className={styles.sectionCard}>
                <Table
                    rowKey="key"
                    dataSource={notifications}
                    pagination={false}
                    columns={[
                        {
                            title: 'Tiêu đề',
                            dataIndex: 'title',
                            key: 'title',
                            render: (
                                _: string,
                                record: (typeof notifications)[0]
                            ) => (
                                <div className={styles.tableNameCell}>
                                    <span className={styles.tableMainText}>
                                        {record.title}
                                    </span>
                                    <span className={styles.tableSubText}>
                                        {record.content}
                                    </span>
                                </div>
                            ),
                        },
                        {
                            title: 'Người nhận',
                            dataIndex: 'recipients',
                            key: 'recipients',
                            render: (
                                _: string,
                                record: (typeof notifications)[0]
                            ) => (
                                <div className={styles.tableNameCell}>
                                    <span className={styles.tableMainText}>
                                        {record.recipients}
                                    </span>
                                    <span className={styles.tableSubText}>
                                        {record.recipientCount} người
                                    </span>
                                </div>
                            ),
                        },
                        {
                            title: 'Trạng thái',
                            dataIndex: 'status',
                            key: 'status',
                            render: (value: string) => (
                                <Tag
                                    color={
                                        value === 'Đã gửi'
                                            ? 'success'
                                            : value === 'Nháp'
                                              ? 'default'
                                              : 'processing'
                                    }
                                    className={styles.statusTag}
                                >
                                    {value}
                                </Tag>
                            ),
                        },
                        {
                            title: 'Thời gian',
                            dataIndex: 'sentDate',
                            key: 'sentDate',
                        },
                        {
                            title: 'Người tạo',
                            dataIndex: 'createdBy',
                            key: 'createdBy',
                        },
                        {
                            title: 'Thao tác',
                            key: 'actions',
                            render: (
                                _: unknown,
                                record: (typeof notifications)[0]
                            ) => (
                                <Space size="small">
                                    <Button icon={<EyeOutlined />} />
                                    {record.status === 'Nháp' ? (
                                        <>
                                            <Button icon={<EditOutlined />} />
                                            <Button
                                                type="primary"
                                                icon={<SendOutlined />}
                                            />
                                        </>
                                    ) : null}
                                </Space>
                            ),
                        },
                    ]}
                />
            </Card>

            <Modal
                open={open}
                title="Tạo thông báo mới"
                okText="Gửi ngay"
                cancelText="Hủy"
                width={760}
                onCancel={() => setOpen(false)}
                onOk={() => {
                    form.validateFields().then(() => {
                        setOpen(false)
                        form.resetFields()
                    })
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Tiêu đề"
                        name="title"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập tiêu đề',
                            },
                        ]}
                    >
                        <Input
                            size="large"
                            placeholder="Nhập tiêu đề thông báo"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Nội dung"
                        name="content"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập nội dung',
                            },
                        ]}
                    >
                        <Input.TextArea
                            rows={5}
                            placeholder="Nhập nội dung thông báo"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Nhóm người nhận"
                        name="recipientGroup"
                        initialValue="all-candidates"
                    >
                        <Radio.Group className={styles.recipientGrid}>
                            {notificationRecipientOptions.map((option) => (
                                <Radio.Button
                                    key={option.key}
                                    value={option.key}
                                    className={styles.recipientOption}
                                >
                                    <Space>
                                        {option.key === 'all-units' ? (
                                            <TeamOutlined />
                                        ) : option.key === 'all-users' ? (
                                            <UserOutlined />
                                        ) : (
                                            <BellOutlined />
                                        )}
                                        {option.label}
                                    </Space>
                                </Radio.Button>
                            ))}
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default AdminManageNotificationPage
