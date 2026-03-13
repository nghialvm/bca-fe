import { useState } from 'react'

import {
    Button,
    Card,
    Col,
    Form,
    Input,
    List,
    Row,
    Space,
    Tag,
    Typography,
} from 'antd'

import {
    MailOutlined,
    SaveOutlined,
    SearchOutlined,
    SendOutlined,
} from '@ant-design/icons'

import {
    MessageTemplate,
    messageTemplates,
    recentMessages,
} from '@/mock/employerData'

const { Paragraph, Text, Title } = Typography

const templateTypeLabel: Record<MessageTemplate['type'], string> = {
    invitation: 'Mời phỏng vấn',
    rejection: 'Từ chối',
    acceptance: 'Chấp nhận',
    reminder: 'Nhắc lịch',
}

const EmployerManageCommunicationPage = () => {
    const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate>(
        messageTemplates[0]
    )
    const [form] = Form.useForm()

    return (
        <div className="portal-page">
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Giao tiếp</span>
                <Title level={2}>Soạn và gửi thông điệp cho ứng viên</Title>
                <Paragraph style={{ maxWidth: 760 }}>
                    Module giao tiếp được thống nhất lại với layout back-office
                    chung, đồng thời giữ khu vực mẫu thư, trình soạn và lịch sử
                    gửi tách bạch để thao tác nhanh hơn.
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
                                    onClick={() => {
                                        setSelectedTemplate(template)
                                        form.setFieldsValue({
                                            subject: template.subject,
                                            content: template.content,
                                        })
                                    }}
                                >
                                    <Card
                                        size="small"
                                        hoverable
                                        className="portal-section-card"
                                        style={{
                                            width: '100%',
                                            borderColor:
                                                selectedTemplate.id ===
                                                template.id
                                                    ? '#0B3D2E'
                                                    : undefined,
                                        }}
                                    >
                                        <Text strong>{template.title}</Text>
                                        <div style={{ marginTop: 8 }}>
                                            <Tag color="green">
                                                {
                                                    templateTypeLabel[
                                                        template.type
                                                    ]
                                                }
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
                                recipients: '',
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
                                        message: 'Nhập danh sách người nhận',
                                    },
                                ]}
                            >
                                <Input
                                    size="large"
                                    prefix={<SearchOutlined />}
                                    placeholder="Tìm ứng viên, nhập email hoặc tên..."
                                />
                            </Form.Item>
                            <Form.Item
                                label="Tiêu đề"
                                name="subject"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Nhập tiêu đề email',
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
                                        message: 'Nhập nội dung email',
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
                                        '[Địa chỉ]',
                                        '[Tên người phỏng vấn]',
                                    ].map((variable) => (
                                        <Tag key={variable}>{variable}</Tag>
                                    ))}
                                </div>
                            </Card>
                            <Space wrap>
                                <Button type="primary" icon={<SendOutlined />}>
                                    Gửi email
                                </Button>
                                <Button icon={<SaveOutlined />}>
                                    Lưu nháp
                                </Button>
                            </Space>
                        </Form>
                    </Card>

                    <Card
                        title="Email đã gửi gần đây"
                        className="portal-section-card"
                    >
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
                                                    {item.sentAt}
                                                </Text>
                                            </div>
                                        </div>
                                    </Space>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default EmployerManageCommunicationPage
