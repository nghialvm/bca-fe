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
    Tag,
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
import {
    formatCount,
    formatDisplayDateTime,
    getDisplayName,
} from '@/utils/admin'

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

type NotificationFormValues = {
    title: string
    content: string
    recipientGroup: string
    specificRecipients?: string[]
}

type SendHistoryItem = {
    id: string
    key: string
    sentAt: string
    title: string
    groupLabel: string
    recipientCount: number
    successCount: number
    failedCount: number
    sender: string
    status: 'success' | 'partial' | 'failed'
}

const recipientGroupOptions = [
    { key: 'all-candidates', label: 'Tất cả ứng viên' },
    { key: 'all-units', label: 'Quản lý đơn vị' },
    { key: 'all-users', label: 'Tất cả người dùng' },
    { key: 'specific', label: 'Chọn cụ thể' },
]

const notificationHistoryStorageKey = 'admin.notification.history.v1'

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
    const [form] = Form.useForm<NotificationFormValues>()
    const [candidateEmails, setCandidateEmails] = useState<string[]>([])
    const [userEmails, setUserEmails] = useState<string[]>([])
    const [unitManagerEmails, setUnitManagerEmails] = useState<string[]>([])
    const [recipientOptions, setRecipientOptions] = useState<RecipientOption[]>(
        []
    )
    const [history, setHistory] = useState<SendHistoryItem[]>([])

    const watchedRecipientGroup = Form.useWatch('recipientGroup', form)
    const watchedSpecificRecipients = Form.useWatch('specificRecipients', form)
    const watchedTitle = Form.useWatch('title', form)
    const watchedContent = Form.useWatch('content', form)

    useEffect(() => {
        try {
            const storedValue = window.localStorage.getItem(
                notificationHistoryStorageKey
            )
            if (!storedValue) return

            const parsed = JSON.parse(storedValue) as SendHistoryItem[]
            setHistory(Array.isArray(parsed) ? parsed : [])
        } catch {
            setHistory([])
        }
    }, [])

    useEffect(() => {
        window.localStorage.setItem(
            notificationHistoryStorageKey,
            JSON.stringify(history)
        )
    }, [history])

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
        specificRecipients: string[] = []
    ) => {
        if (group === 'all-candidates') return candidateEmails
        if (group === 'all-units') return unitManagerEmails
        if (group === 'all-users') return userEmails

        return getUniqueEmails(specificRecipients)
    }

    const previewRecipients = useMemo(
        () =>
            getTargetRecipients(
                watchedRecipientGroup || 'all-candidates',
                watchedSpecificRecipients || []
            ),
        [
            candidateEmails,
            unitManagerEmails,
            userEmails,
            watchedRecipientGroup,
            watchedSpecificRecipients,
        ]
    )

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
            const settledResults = await Promise.allSettled(
                recipients.map((email) =>
                    AdminService.sendEmail({
                        to: email,
                        subject: values.title,
                        body: values.content,
                        isBodyHtml: false,
                    })
                )
            )

            const successCount = settledResults.filter(
                (item) => item.status === 'fulfilled'
            ).length
            const failedCount = recipients.length - successCount
            const groupLabel =
                recipientGroupOptions.find(
                    (item) => item.key === values.recipientGroup
                )?.label || 'Tùy chọn khác'
            const historyItem: SendHistoryItem = {
                id: `${Date.now()}`,
                key: `${Date.now()}`,
                sentAt: new Date().toISOString(),
                title: values.title,
                groupLabel,
                recipientCount: recipients.length,
                successCount,
                failedCount,
                sender: currentUser?.email || currentUser?.userName || '-',
                status:
                    failedCount === 0
                        ? 'success'
                        : successCount > 0
                          ? 'partial'
                          : 'failed',
            }

            setHistory((currentValue) =>
                [historyItem, ...currentValue].slice(0, 20)
            )

            if (failedCount === 0) {
                notification.success({
                    message: 'Đã gửi thông báo',
                    description: `Gửi thành công tới ${formatCount(successCount)} người nhận.`,
                })
                setOpen(false)
                form.resetFields()
                return
            }

            if (successCount > 0) {
                notification.warning({
                    message: 'Gửi thông báo một phần',
                    description: `Thành công ${formatCount(successCount)}, thất bại ${formatCount(failedCount)}.`,
                })
                setOpen(false)
                form.resetFields()
                return
            }

            notification.error({
                message: 'Gửi thông báo thất bại',
                description:
                    'Email API trả lời lỗi hoặc danh sách người nhận có địa chỉ không hợp lệ.',
            })
        } finally {
            setSending(false)
        }
    }

    const historyMetrics = useMemo(() => {
        const successCount = history.filter(
            (item) => item.status === 'success'
        ).length
        const partialCount = history.filter(
            (item) => item.status === 'partial'
        ).length
        const failedCount = history.filter(
            (item) => item.status === 'failed'
        ).length

        return {
            successCount,
            partialCount,
            failedCount,
        }
    }, [history])

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
                            {formatCount(history.length)}
                        </div>
                        <div className={styles.metricLabel}>
                            Lượt gửi đã lưu
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.chartGrid}>
                <Card
                    variant="borderless"
                    className={styles.sectionCard}
                    title={
                        <span className={styles.sectionTitle}>
                            Người nhận theo nhóm
                        </span>
                    }
                >
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
                                align: 'center',
                                key: 'count',
                                render: (value: number) => formatCount(value),
                            },
                            {
                                title: 'Email mẫu',
                                dataIndex: 'sample',
                                key: 'sample',
                                align: 'center',
                            },
                        ]}
                    />
                </Card>

                <Card
                    variant="borderless"
                    className={styles.sectionCard}
                    title={
                        <span className={styles.sectionTitle}>
                            Xem trước thông báo
                        </span>
                    }
                >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        <span className={styles.summaryPill}>
                            Nhóm:{' '}
                            {recipientGroupOptions.find(
                                (item) => item.key === watchedRecipientGroup
                            )?.label || 'Tất cả ứng viên'}
                        </span>
                        <span className={styles.summaryPill}>
                            Người nhận: {formatCount(previewRecipients.length)}
                        </span>
                        <span className={styles.summaryPill}>
                            Gửi thành công:{' '}
                            {formatCount(historyMetrics.successCount)}
                        </span>
                        <span className={styles.summaryPill}>
                            Gửi một phần:{' '}
                            {formatCount(historyMetrics.partialCount)}
                        </span>
                    </div>

                    <div className={styles.detailList}>
                        <div className={styles.detailItem}>
                            <MailOutlined className={styles.detailIcon} />
                            <span>
                                Tiêu đề:{' '}
                                {watchedTitle?.trim() || 'Chưa nhập tiêu đề'}
                            </span>
                        </div>
                        <div className={styles.detailItem}>
                            <BellOutlined className={styles.detailIcon} />
                            <span>
                                Nội dung:{' '}
                                {watchedContent?.trim() || 'Chưa nhập nội dung'}
                            </span>
                        </div>
                        <div className={styles.detailItem}>
                            <UserOutlined className={styles.detailIcon} />
                            <span>
                                Mẫu người nhận:{' '}
                                {previewRecipients.slice(0, 5).join(', ') ||
                                    '-'}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            <Card
                variant="borderless"
                className={styles.sectionCard}
                title={
                    <span className={styles.sectionTitle}>
                        Lịch sử gửi trên giao diện admin
                    </span>
                }
                extra={
                    <Button
                        type="link"
                        danger
                        onClick={() => setHistory([])}
                        disabled={!history.length}
                    >
                        Xóa lịch sử
                    </Button>
                }
            >
                <Table
                    rowKey="key"
                    pagination={{ pageSize: 5 }}
                    locale={{
                        emptyText: (
                            <Empty description="Chưa có lịch sử gửi nào trên giao diện" />
                        ),
                    }}
                    dataSource={history}
                    columns={[
                        {
                            title: 'Thời gian',
                            dataIndex: 'sentAt',
                            key: 'sentAt',
                            render: (value: string) =>
                                formatDisplayDateTime(value),
                        },
                        {
                            title: 'Tiêu đề',
                            dataIndex: 'title',
                            key: 'title',
                            render: (value: string) => (
                                <span className={styles.tableMainText}>
                                    {value}
                                </span>
                            ),
                        },
                        {
                            title: 'Nhóm',
                            dataIndex: 'groupLabel',
                            key: 'groupLabel',
                        },
                        {
                            title: 'Kết quả',
                            key: 'result',
                            render: (_: unknown, record: SendHistoryItem) => (
                                <span className={styles.tableSubText}>
                                    {formatCount(record.successCount)}/
                                    {formatCount(record.recipientCount)} thành
                                    công
                                </span>
                            ),
                        },
                        {
                            title: 'Trạng thái',
                            dataIndex: 'status',
                            key: 'status',
                            render: (value: SendHistoryItem['status']) => (
                                <Tag
                                    color={
                                        value === 'success'
                                            ? 'success'
                                            : value === 'partial'
                                              ? 'warning'
                                              : 'error'
                                    }
                                >
                                    {value === 'success'
                                        ? 'Thành công'
                                        : value === 'partial'
                                          ? 'Một phần'
                                          : 'Thất bại'}
                                </Tag>
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

                    <Form.Item label="Nhóm người nhận" name="recipientGroup">
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
                                                'Vui lòng chọn ít nhất một người nhận',
                                        },
                                    ]}
                                >
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        showSearch
                                        size="large"
                                        placeholder="Chọn email người nhận"
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
