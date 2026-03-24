import { useEffect, useMemo, useState } from 'react'

import {
    Button,
    Card,
    Col,
    Form,
    Input,
    List,
    Row,
    Select,
    Space,
    Tag,
    Typography,
    notification,
} from 'antd'

import {
    MailOutlined,
    SaveOutlined,
    SendOutlined,
} from '@ant-design/icons'

import { useEmployerWorkspace } from '@/hooks/useEmployerWorkspace'
import AdminService from '@/services/admin'
import { formatDisplayDateTime } from '@/utils/admin'

const { Paragraph, Text, Title } = Typography

type MessageTemplateType =
    | 'invitation'
    | 'rejection'
    | 'acceptance'
    | 'reminder'

type MessageTemplate = {
    id: string
    title: string
    subject: string
    type: MessageTemplateType
    content: string
}

type RecentMessage = {
    id: string
    title: string
    receiver: string
    sentAt: string
    tone: 'default' | 'success'
}

const messageTemplates: MessageTemplate[] = [
    {
        id: '1',
        title: 'Mời phỏng vấn',
        subject: 'Thư mời phỏng vấn - [Vị trí ứng tuyển]',
        type: 'invitation',
        content:
            'Kính gửi [Tên ứng viên],\n\nHồ sơ của bạn đã được chọn cho vòng phỏng vấn tiếp theo. Vui lòng xác nhận lịch hẹn trước thời hạn quy định.\n\nTrân trọng,\nBộ phận tuyển dụng',
    },
    {
        id: '2',
        title: 'Thông báo từ chối',
        subject: 'Thông báo kết quả tuyển dụng',
        type: 'rejection',
        content:
            'Kính gửi [Tên ứng viên],\n\nCảm ơn bạn đã tham gia ứng tuyển. Sau khi xem xét, chúng tôi xin phép chưa thể tiếp tục với hồ sơ ở đợt này.\n\nTrân trọng,\nBộ phận tuyển dụng',
    },
    {
        id: '3',
        title: 'Thư chấp nhận tuyển dụng',
        subject: 'Chúc mừng bạn đã trúng tuyển',
        type: 'acceptance',
        content:
            'Kính gửi [Tên ứng viên],\n\nChúc mừng bạn đã được lựa chọn cho vị trí [Vị trí ứng tuyển]. Vui lòng kiểm tra email này để nắm các bước tiếp theo.\n\nTrân trọng,\nBộ phận tuyển dụng',
    },
    {
        id: '4',
        title: 'Nhắc lịch phỏng vấn',
        subject: 'Nhắc nhở lịch phỏng vấn sắp tới',
        type: 'reminder',
        content:
            'Kính gửi [Tên ứng viên],\n\nĐây là thư nhắc lịch phỏng vấn của bạn vào [Ngày giờ] tại [Địa điểm]. Vui lòng có mặt đúng giờ.\n\nTrân trọng,\nBộ phận tuyển dụng',
    },
]

const templateTypeLabel: Record<MessageTemplateType, string> = {
    invitation: 'Mời phỏng vấn',
    rejection: 'Từ chối',
    acceptance: 'Chấp nhận',
    reminder: 'Nhắc lịch',
}

const buildMessageHistoryKey = (scopeKey?: string) =>
    `employer.communication.history.${scopeKey || 'default'}`

const EmployerManageCommunicationPage = () => {
    const { applicationRows, currentDepartment } = useEmployerWorkspace()
    const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate>(
        messageTemplates[0]
    )
    const [sending, setSending] = useState(false)
    const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([])
    const [form] = Form.useForm()

    const historyStorageKey = buildMessageHistoryKey(currentDepartment?.id)

    useEffect(() => {
        const stored = window.localStorage.getItem(historyStorageKey)
        if (!stored) {
            setRecentMessages([])
            return
        }

        try {
            const parsed = JSON.parse(stored) as RecentMessage[]
            setRecentMessages(parsed)
        } catch {
            setRecentMessages([])
        }
    }, [historyStorageKey])

    const recipientOptions = useMemo(
        () =>
            applicationRows
                .filter((row) => row.candidate?.email)
                .map((row) => ({
                    label: `${row.candidate?.fullName || 'Ứng viên'} (${row.candidate?.email})`,
                    value: row.candidate?.email as string,
                }))
                .filter(
                    (option, index, array) =>
                        array.findIndex((item) => item.value === option.value) ===
                        index
                ),
        [applicationRows]
    )

    const persistRecentMessages = (messages: RecentMessage[]) => {
        setRecentMessages(messages)
        window.localStorage.setItem(historyStorageKey, JSON.stringify(messages))
    }

    const handleSelectTemplate = (template: MessageTemplate) => {
        setSelectedTemplate(template)
        form.setFieldsValue({
            subject: template.subject,
            content: template.content,
        })
    }

    const handleSaveDraft = async () => {
        const values = await form.validateFields(['subject', 'content'])
        const nextMessages = [
            {
                id: crypto.randomUUID(),
                title: values.subject,
                receiver: 'Bản nháp',
                sentAt: new Date().toISOString(),
                tone: 'default' as const,
            },
            ...recentMessages,
        ].slice(0, 10)

        persistRecentMessages(nextMessages)
        notification.success({
            message: 'Đã lưu nháp',
            description: 'Nội dung email đã được lưu tạm trên trình duyệt.',
        })
    }

    const handleSendEmail = async () => {
        const values = await form.validateFields()
        const recipients = values.recipients as string[]

        setSending(true)
        try {
            await Promise.all(
                recipients.map((recipient) =>
                    AdminService.sendEmail({
                        to: recipient,
                        subject: values.subject,
                        body: values.content,
                        isBodyHtml: false,
                    })
                )
            )

            const nextMessages = [
                ...recipients.map((recipient) => ({
                    id: crypto.randomUUID(),
                    title: values.subject,
                    receiver: recipient,
                    sentAt: new Date().toISOString(),
                    tone: 'success' as const,
                })),
                ...recentMessages,
            ].slice(0, 10)

            persistRecentMessages(nextMessages)
            notification.success({
                message: 'Gửi email thành công',
                description: `Đã gửi ${recipients.length} email cho ứng viên.`,
            })
            form.setFieldValue('recipients', [])
        } catch {
            notification.error({
                message: 'Gửi email thất bại',
                description:
                    'Không thể gửi email cho ứng viên. Vui lòng kiểm tra cấu hình SMTP hoặc thử lại sau.',
            })
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="portal-page">
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Giao tiếp</span>
                <Title level={2}>Soạn và gửi thông điệp cho ứng viên</Title>
                <Paragraph style={{ maxWidth: 760 }}>
                    Danh sách người nhận được lấy từ API ứng viên của đơn vị.
                    Bạn có thể chọn nhiều ứng viên, dùng mẫu thư có sẵn và gửi
                    email trực tiếp qua hệ thống.
                </Paragraph>
            </section>

            <Row gutter={[24, 24]}>
                <Col xs={24} xl={7}>
                    <Card title="Mẫu email" className="portal-section-card">
                        <List
                            dataSource={messageTemplates}
                            renderItem={(template) => (
                                <List.Item
                                    style={{ paddingInline: 0 }}
                                    onClick={() => handleSelectTemplate(template)}
                                >
                                    <Card
                                        size="small"
                                        hoverable
                                        className="portal-section-card"
                                        style={{
                                            width: '100%',
                                            borderColor:
                                                selectedTemplate.id === template.id
                                                    ? '#0B3D2E'
                                                    : undefined,
                                        }}
                                    >
                                        <Text strong>{template.title}</Text>
                                        <div style={{ marginTop: 8 }}>
                                            <Tag color="green">
                                                {templateTypeLabel[template.type]}
                                            </Tag>
                                        </div>
                                    </Card>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                <Col xs={24} xl={17}>
                    <Card title="Soạn email" className="portal-section-card">
                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={{
                                recipients: [],
                                subject: selectedTemplate.subject,
                                content: selectedTemplate.content,
                            }}
                        >
                            <Form.Item
                                label="Người nhận"
                                name="recipients"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'Vui lòng chọn ít nhất một ứng viên nhận email',
                                    },
                                ]}
                            >
                                <Select
                                    mode="multiple"
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    size="large"
                                    placeholder="Chọn ứng viên theo email..."
                                    options={recipientOptions}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Tiêu đề"
                                name="subject"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập tiêu đề email',
                                    },
                                ]}
                            >
                                <Input size="large" />
                            </Form.Item>
                            <Form.Item
                                label="Nội dung"
                                name="content"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập nội dung email',
                                    },
                                ]}
                            >
                                <Input.TextArea rows={12} />
                            </Form.Item>
                            <Card size="small" style={{ marginBottom: 16 }}>
                                <Text strong>Biến có sẵn</Text>
                                <div
                                    className="portal-chip-row"
                                    style={{ marginTop: 12 }}
                                >
                                    {[
                                        '[Tên ứng viên]',
                                        '[Vị trí ứng tuyển]',
                                        '[Ngày giờ]',
                                        '[Địa điểm]',
                                        '[Tên người phỏng vấn]',
                                    ].map((variable) => (
                                        <Tag key={variable}>{variable}</Tag>
                                    ))}
                                </div>
                            </Card>
                            <Space wrap>
                                <Button
                                    type="primary"
                                    icon={<SendOutlined />}
                                    loading={sending}
                                    onClick={() => void handleSendEmail()}
                                >
                                    Gửi email
                                </Button>
                                <Button
                                    icon={<SaveOutlined />}
                                    onClick={() => void handleSaveDraft()}
                                >
                                    Lưu nháp
                                </Button>
                            </Space>
                        </Form>
                    </Card>

                    <Card
                        title="Email đã gửi gần đây"
                        className="portal-section-card"
                    >
                        {recentMessages.length ? (
                            <List
                                dataSource={recentMessages}
                                renderItem={(item) => (
                                    <List.Item>
                                        <Space align="start">
                                            <div className="portal-stat-card__icon">
                                                <MailOutlined />
                                            </div>
                                            <div>
                                                <Text strong>{item.title}</Text>
                                                <div>
                                                    <Text className="portal-muted">
                                                        {item.receiver}
                                                    </Text>
                                                </div>
                                                <div>
                                                    <Text className="portal-muted">
                                                        {formatDisplayDateTime(
                                                            item.sentAt
                                                        )}
                                                    </Text>
                                                </div>
                                            </div>
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Text className="portal-muted">
                                Chưa có lịch sử gửi email trong phạm vi đơn vị này.
                            </Text>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default EmployerManageCommunicationPage
