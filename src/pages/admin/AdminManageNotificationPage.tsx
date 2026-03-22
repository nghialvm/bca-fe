import { useEffect, useMemo, useState } from 'react'

import {
    Button,
    Card,
    Empty,
    Form,
    Input,
    Modal,
    Radio,
    Select,
    Space,
    Table,
    Typography,
    notification,
} from 'antd'

import {
    BellOutlined,
    MailOutlined,
    PlusOutlined,
    SendOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { useSelector } from 'react-redux'

import { User } from '@/interfaces/user/user.interface'
import AdminService, {
    CandidateDto,
    DepartmentDto,
    IdentityUserDto,
} from '@/services/admin'
import { formatCount, getDisplayName } from '@/utils/admin'

import styles from '../styles/AdminUi.module.css'

type RootState = {
    auth: {
        user?: User | null
    }
}

type RecipientOption = {
    label: string
    value: string
}

type RecipientGroupRow = {
    key: string
    group: string
    count: number
    sample: string
    source: string
}

const recipientGroupOptions = [
    { key: 'all-candidates', label: 'Tất cả ứng viên' },
    { key: 'all-units', label: 'Quản lý đơn vị' },
    { key: 'all-users', label: 'Tất cả người dùng' },
    { key: 'specific', label: 'Chọn cụ thể' },
]

const getUniqueEmails = (items: Array<string | undefined | null>) =>
    Array.from(
        new Set(
            items
                .map((item) => item?.trim().toLowerCase())
                .filter(Boolean) as string[]
        )
    )

const AdminManageNotificationPage = () => {
    const currentUser = useSelector((store: RootState) => store.auth.user)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [sending, setSending] = useState(false)
    const [form] = Form.useForm()
    const [candidateEmails, setCandidateEmails] = useState<string[]>([])
    const [userEmails, setUserEmails] = useState<string[]>([])
    const [unitManagerEmails, setUnitManagerEmails] = useState<string[]>([])
    const [recipientOptions, setRecipientOptions] = useState<RecipientOption[]>(
        []
    )

    useEffect(() => {
        const loadRecipients = async () => {
            setLoading(true)
            try {
                const [candidateResponse, userResponse, departmentResponse] =
                    await Promise.all([
                        AdminService.getCandidates({
                            Sorting: 'creationTime desc',
                            MaxResultCount: 1000,
                        }),
                        AdminService.getIdentityUsers({
                            Sorting: 'userName asc',
                            MaxResultCount: 1000,
                        }),
                        AdminService.getDepartments({
                            Sorting: 'name asc',
                            MaxResultCount: 1000,
                        }),
                    ])

                const candidates = (candidateResponse?.items ||
                    []) as CandidateDto[]
                const users = (userResponse?.items || []) as IdentityUserDto[]
                const departments = (departmentResponse?.items ||
                    []) as DepartmentDto[]
                const usersById = new Map(users.map((user) => [user.id, user]))

                const candidateEmailList = getUniqueEmails(
                    candidates.map((candidate) => candidate.email)
                )
                const userEmailList = getUniqueEmails(
                    users.map((user) => user.email)
                )
                const unitEmailList = getUniqueEmails(
                    departments.map((department) =>
                        department.managerUserId
                            ? usersById.get(department.managerUserId)?.email
                            : undefined
                    )
                )

                const allRecipients = [
                    ...candidates.map((candidate) => ({
                        label: `${candidate.fullName} (${candidate.email})`,
                        value: candidate.email,
                    })),
                    ...users
                        .filter((user) => user.email)
                        .map((user) => ({
                            label: `${getDisplayName(user)} (${user.email})`,
                            value: user.email as string,
                        })),
                ]

                setCandidateEmails(candidateEmailList)
                setUserEmails(userEmailList)
                setUnitManagerEmails(unitEmailList)
                setRecipientOptions(
                    Array.from(
                        new Map(
                            allRecipients.map((item) => [item.value, item])
                        ).values()
                    )
                )
            } catch {
                notification.error({
                    message: 'Không tải được danh sách người nhận',
                    description:
                        'Kiểm tra API candidate, identity users và departments.',
                })
            } finally {
                setLoading(false)
            }
        }

        void loadRecipients()
    }, [])

    const recipientGroupRows = useMemo<RecipientGroupRow[]>(
        () => [
            {
                key: 'candidates',
                group: 'Tất cả ứng viên',
                count: candidateEmails.length,
                sample: candidateEmails[0] || '-',
                source: 'app/candidate',
            },
            {
                key: 'units',
                group: 'Quản lý đơn vị',
                count: unitManagerEmails.length,
                sample: unitManagerEmails[0] || '-',
                source: 'app/department + identity/users',
            },
            {
                key: 'users',
                group: 'Tất cả người dùng',
                count: userEmails.length,
                sample: userEmails[0] || '-',
                source: 'identity/users',
            },
        ],
        [candidateEmails, unitManagerEmails, userEmails]
    )

    const totalRecipients = useMemo(
        () =>
            getUniqueEmails([
                ...candidateEmails,
                ...userEmails,
                ...unitManagerEmails,
            ]).length,
        [candidateEmails, unitManagerEmails, userEmails]
    )

    const getTargetRecipients = (
        group: string,
        specificRecipients: string[]
    ) => {
        if (group === 'all-candidates') return candidateEmails
        if (group === 'all-units') return unitManagerEmails
        if (group === 'all-users') return userEmails

        return getUniqueEmails(specificRecipients)
    }

    const handleSend = async () => {
        const values = await form.validateFields()
        const recipients = getTargetRecipients(
            values.recipientGroup,
            values.specificRecipients || []
        )

        if (!recipients.length) {
            notification.warning({
                message: 'Không có người nhận hợp lệ',
                description: 'Nhóm đã chọn hiện chưa có email sử dụng được.',
            })
            return
        }

        setSending(true)
        try {
            await Promise.all(
                recipients.map((email) =>
                    AdminService.sendEmail({
                        to: email,
                        subject: values.title,
                        body: values.content,
                        isBodyHtml: false,
                    })
                )
            )

            notification.success({
                message: 'Đã gửi thông báo',
                description: `Gửi thành công tới ${formatCount(recipients.length)} người nhận.`,
            })
            setOpen(false)
            form.resetFields()
        } catch {
            notification.error({
                message: 'Gửi thông báo thất bại',
                description:
                    'Email API trả lời lỗi hoặc danh sách người nhận có địa chỉ không hợp lệ.',
            })
        } finally {
            setSending(false)
        }
    }

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
                            Gửi thông báo hệ thống
                        </Typography.Title>
                        <Typography.Paragraph style={{ maxWidth: 720 }}>
                            Chọn nhóm người nhận từ backend và gửi thông báo qua
                            email service hiện có. Lịch sử gửi chỉ hiển thị được
                            khi backend bổ sung endpoint lưu notification.
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
                        <BellOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>
                            {formatCount(candidateEmails.length)}
                        </div>
                        <div className={styles.metricLabel}>
                            Ứng viên nhận được
                        </div>
                    </div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <UserOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>
                            {formatCount(userEmails.length)}
                        </div>
                        <div className={styles.metricLabel}>
                            Người dùng nội bộ
                        </div>
                    </div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <TeamOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>
                            {formatCount(unitManagerEmails.length)}
                        </div>
                        <div className={styles.metricLabel}>Quản lý đơn vị</div>
                    </div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <MailOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>
                            {formatCount(totalRecipients)}
                        </div>
                        <div className={styles.metricLabel}>
                            Tổng email hợp lệ
                        </div>
                    </div>
                </div>
            </div>

            <Card
                variant="borderless"
                className={styles.sectionCard}
                title={
                    <span className={styles.sectionTitle}>
                        Người nhận theo nhóm
                    </span>
                }
            >
                <div className={styles.sectionHint}>
                    Bảng này được đồng bộ từ candidate, identity users và
                    department manager.
                </div>
                <Table
                    rowKey="key"
                    loading={loading}
                    pagination={false}
                    locale={{
                        emptyText: (
                            <Empty description="Không có người nhận để hiển thị" />
                        ),
                    }}
                    dataSource={recipientGroupRows}
                    columns={[
                        {
                            title: 'Nhóm',
                            dataIndex: 'group',
                            key: 'group',
                            render: (value: string) => (
                                <span className={styles.tableMainText}>
                                    {value}
                                </span>
                            ),
                        },
                        {
                            title: 'Số lượng',
                            dataIndex: 'count',
                            key: 'count',
                            render: (value: number) => formatCount(value),
                        },
                        {
                            title: 'Email mẫu',
                            dataIndex: 'sample',
                            key: 'sample',
                        },
                        {
                            title: 'Nguồn dữ liệu',
                            dataIndex: 'source',
                            key: 'source',
                            render: (value: string) => (
                                <span className={styles.tableSubText}>
                                    {value}
                                </span>
                            ),
                        },
                    ]}
                />
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
                <div className={styles.detailList}>
                    <div className={styles.detailItem}>
                        <MailOutlined className={styles.detailIcon} />
                        <span>
                            API gửi email sử dụng endpoint `app/email/send`.
                        </span>
                    </div>
                    <div className={styles.detailItem}>
                        <BellOutlined className={styles.detailIcon} />
                        <span>
                            Chưa có API backend lưu lịch sử thông báo nên trang
                            này hiện tập trung vào compose và gửi thực tế.
                        </span>
                    </div>
                    <div className={styles.detailItem}>
                        <UserOutlined className={styles.detailIcon} />
                        <span>
                            Người tạo hiện tại:{' '}
                            {currentUser?.email || currentUser?.userName || '-'}
                            .
                        </span>
                    </div>
                </div>
            </Card>

            <Modal
                open={open}
                title="Tạo thông báo mới"
                okText="Gửi ngay"
                cancelText="Hủy"
                width={760}
                confirmLoading={sending}
                onCancel={() => setOpen(false)}
                onOk={() => void handleSend()}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        recipientGroup: 'all-candidates',
                    }}
                >
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

                    <Form.Item label="Nhóm người nhan" name="recipientGroup">
                        <Radio.Group className={styles.recipientGrid}>
                            {recipientGroupOptions.map((option) => (
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

                    <Form.Item
                        noStyle
                        shouldUpdate={(previous, next) =>
                            previous.recipientGroup !== next.recipientGroup
                        }
                    >
                        {({ getFieldValue }) =>
                            getFieldValue('recipientGroup') === 'specific' ? (
                                <Form.Item
                                    label="Người nhận cụ thể"
                                    name="specificRecipients"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Vui long chon it nhat mot người nhan',
                                        },
                                    ]}
                                >
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        showSearch
                                        size="large"
                                        placeholder="Chon email người nhan"
                                        options={recipientOptions}
                                    />
                                </Form.Item>
                            ) : null
                        }
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default AdminManageNotificationPage
