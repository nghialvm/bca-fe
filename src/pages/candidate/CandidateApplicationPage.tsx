import { useState } from 'react'

import {
    Alert,
    Button,
    Card,
    Col,
    Descriptions,
    Empty,
    List,
    Modal,
    Progress,
    Row,
    Space,
    Tag,
    Timeline,
    Typography,
    notification,
} from 'antd'

import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    FileProtectOutlined,
    FileTextOutlined,
    InfoCircleOutlined,
    SolutionOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import { useCandidateWorkspace } from '@/hooks/useCandidateWorkspace'
import CandidateService from '@/services/candidate'
import {
    formatDisplayDate,
    formatDisplayDateTime,
    getApplicationStatusColor,
    getApplicationStatusLabel,
} from '@/utils/admin'
import {
    getCandidateApplicationProgress,
    isCandidateActionRequired,
} from '@/utils/candidate'
import { getOfferStatusColor, getOfferStatusLabel } from '@/utils/employer'

const { Paragraph, Text, Title } = Typography

const OFFER_ACCEPTED = 4
const OFFER_DECLINED = 5

const normalizeValue = (value: unknown) =>
    String(value ?? '')
        .trim()
        .replace(/[\s_-]+/g, '')
        .toLowerCase()

const hasPendingOfferDecision = (status: unknown) =>
    ['8', 'offered'].includes(normalizeValue(status))

const getOfferResponseLabel = (value: unknown) => {
    const key = normalizeValue(value)

    if (['4', 'offeraccepted'].includes(key)) return 'Đã chấp nhận'
    if (['5', 'offerdeclined'].includes(key)) return 'Đã từ chối'

    return 'Đã phản hồi'
}

const getOfferResponseColor = (value: unknown) => {
    const key = normalizeValue(value)

    if (['4', 'offeraccepted'].includes(key)) return 'success'
    if (['5', 'offerdeclined'].includes(key)) return 'error'

    return 'default'
}

const getErrorMessage = (error: unknown) => {
    if (typeof error !== 'object' || error === null) {
        return 'Vui lòng thử lại sau.'
    }

    const responseData = (
        error as {
            response?: {
                data?: {
                    message?: string
                    error?: {
                        message?: string
                        details?: string
                    }
                }
            }
            message?: string
        }
    ).response?.data

    return (
        responseData?.error?.message ||
        responseData?.error?.details ||
        responseData?.message ||
        (error as { message?: string }).message ||
        'Vui lòng thử lại sau.'
    )
}

const formatSalary = (value?: number | null) => {
    if (!value) {
        return 'Thỏa thuận'
    }

    return `${new Intl.NumberFormat('vi-VN').format(value)} VND`
}

const CandidateApplicationPage = () => {
    const { applications, loading, reload } = useCandidateWorkspace()
    const [selectedOfferApplicationId, setSelectedOfferApplicationId] =
        useState<string | null>(null)
    const [respondingApplicationId, setRespondingApplicationId] = useState<
        string | null
    >(null)

    const actionItems = applications.filter((item) =>
        isCandidateActionRequired(item.status)
    )

    const selectedOfferApplication =
        applications.find((item) => item.id === selectedOfferApplicationId) ||
        null

    const closeOfferModal = () => setSelectedOfferApplicationId(null)

    const canRespondToOffer = (application: (typeof applications)[number]) => {
        if (!application.offer || application.latestOfferResponse) {
            return false
        }

        const offerStatus = normalizeValue(application.offer.status)

        return !['3', 'accepted', '4', 'declined', '5', 'expired'].includes(
            offerStatus
        )
    }

    const handleOfferDecision = (
        application: (typeof applications)[number],
        responseType: number
    ) => {
        if (!application.offer?.id) {
            return
        }

        const isAccepted = responseType === OFFER_ACCEPTED
        const actionLabel = isAccepted ? 'chấp nhận' : 'từ chối'

        Modal.confirm({
            title: isAccepted ? 'Chấp nhận offer' : 'Từ chối offer',
            okText: isAccepted ? 'Chấp nhận' : 'Từ chối',
            cancelText: 'Hủy',
            content: (
                <Space direction="vertical" size={8}>
                    <Text strong>{application.title}</Text>
                    <Text type="secondary">{application.departmentName}</Text>
                    <Text>
                        Mức lương: {formatSalary(application.offer.salary)}
                    </Text>
                    <Text>
                        Hành động này sẽ ghi nhận phản hồi {actionLabel} offer
                        của bạn trên hệ thống.
                    </Text>
                </Space>
            ),
            onOk: async () => {
                try {
                    setRespondingApplicationId(application.id)

                    await CandidateService.respondToOffer({
                        applicationId: application.id,
                        offerId: application.offer!.id,
                        responseType,
                        responseContent: isAccepted
                            ? 'Ứng viên đã chấp nhận offer trên hệ thống.'
                            : 'Ứng viên đã từ chối offer trên hệ thống.',
                    })

                    notification.success({
                        message: isAccepted
                            ? 'Đã chấp nhận offer'
                            : 'Đã từ chối offer',
                        description: `Phản hồi của bạn cho hồ sơ ${application.applicationCode} đã được ghi nhận.`,
                    })

                    closeOfferModal()
                    await reload()
                } catch (error) {
                    notification.error({
                        message: `Không thể ${actionLabel} offer`,
                        description: getErrorMessage(error),
                    })
                    throw error
                } finally {
                    setRespondingApplicationId(null)
                }
            },
        })
    }

    return (
        <div className="portal-page">
            <section className="portal-hero">
                <span className="portal-hero__eyebrow">Theo dõi hồ sơ</span>
                <Title level={2}>Theo dõi từng hồ sơ ứng tuyển theo thời gian</Title>
                <Paragraph style={{ maxWidth: 760 }}>
                    Xem lại từng hồ sơ đã nộp, theo dõi tiến độ xử lý và phản hồi
                    offer ngay trên cùng một màn hình.
                </Paragraph>
            </section>

            <Alert
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                message="Lưu ý"
                description="Các hồ sơ đang ở vòng phỏng vấn hoặc đã gửi offer sẽ được ưu tiên hiển thị trong mục việc cần làm để bạn thao tác nhanh hơn."
            />

            <Row gutter={[24, 24]}>
                <Col xs={24} xl={16}>
                    <Card title="Danh sách hồ sơ" className="portal-section-card">
                        {applications.length ? (
                            <List
                                loading={loading}
                                dataSource={applications}
                                renderItem={(item) => {
                                    const label = getApplicationStatusLabel(
                                        item.status
                                    )
                                    const color = getApplicationStatusColor(
                                        item.status
                                    )

                                    return (
                                        <List.Item>
                                            <div style={{ width: '100%' }}>
                                                <div className="portal-split">
                                                    <div>
                                                        <Title
                                                            level={5}
                                                            style={{
                                                                marginBottom: 4,
                                                            }}
                                                        >
                                                            {item.title}
                                                        </Title>
                                                        <Text className="portal-muted">
                                                            {item.departmentName}
                                                        </Text>
                                                    </div>
                                                    <Tag color={color}>{label}</Tag>
                                                </div>

                                                <Space
                                                    wrap
                                                    size="large"
                                                    style={{ marginTop: 16 }}
                                                >
                                                    <Text>
                                                        <FileTextOutlined /> Mã hồ
                                                        sơ: {item.applicationCode}
                                                    </Text>
                                                    <Text>
                                                        <CalendarOutlined /> Nộp:{' '}
                                                        {dayjs(
                                                            item.appliedTime
                                                        ).format('DD/MM/YYYY')}
                                                    </Text>
                                                </Space>

                                                <Paragraph
                                                    className="portal-muted"
                                                    style={{ marginTop: 12 }}
                                                >
                                                    {item.note ||
                                                        `${item.jobPositionName || 'Vị trí'}${
                                                            item.workLocation
                                                                ? ` tại ${item.workLocation}`
                                                                : ''
                                                        }.`}
                                                </Paragraph>

                                                <Progress
                                                    percent={getCandidateApplicationProgress(
                                                        item.status
                                                    )}
                                                    strokeColor="#0B3D2E"
                                                    showInfo={false}
                                                />

                                                {item.offer ? (
                                                    <Space
                                                        wrap
                                                        align="center"
                                                        style={{ marginTop: 16 }}
                                                    >
                                                        <Text strong>
                                                            Hồ sơ này đã có offer
                                                        </Text>
                                                        {item.latestOfferResponse ? (
                                                            <Tag
                                                                color={getOfferResponseColor(
                                                                    item
                                                                        .latestOfferResponse
                                                                        .responseType
                                                                )}
                                                            >
                                                                {getOfferResponseLabel(
                                                                    item
                                                                        .latestOfferResponse
                                                                        .responseType
                                                                )}
                                                            </Tag>
                                                        ) : null}
                                                        <Button
                                                            onClick={() =>
                                                                setSelectedOfferApplicationId(
                                                                    item.id
                                                                )
                                                            }
                                                        >
                                                            Xem offer
                                                        </Button>
                                                    </Space>
                                                ) : null}
                                            </div>
                                        </List.Item>
                                    )
                                }}
                            />
                        ) : (
                            <Empty description="Bạn chưa nộp hồ sơ ứng tuyển nào" />
                        )}
                    </Card>
                </Col>

                <Col xs={24} xl={8}>
                    <Space
                        direction="vertical"
                        size={24}
                        style={{ width: '100%' }}
                    >
                        <Card
                            title="Trạng thái xử lý"
                            className="portal-section-card"
                        >
                            <Timeline
                                items={[
                                    {
                                        color: '#0B3D2E',
                                        dot: <ClockCircleOutlined />,
                                        children:
                                            'Tiếp nhận và đối chiếu hồ sơ',
                                    },
                                    {
                                        color: '#2E7D60',
                                        dot: <FileProtectOutlined />,
                                        children:
                                            'Sàng lọc và đánh giá chuyên môn',
                                    },
                                    {
                                        color: '#B7791F',
                                        dot: <SolutionOutlined />,
                                        children: 'Phỏng vấn và xử lý offer',
                                    },
                                    {
                                        color: '#166534',
                                        dot: <CheckCircleOutlined />,
                                        children:
                                            'Thông báo kết quả và hướng dẫn tiếp theo',
                                    },
                                ]}
                            />
                        </Card>

                        <Card
                            title="Việc cần làm"
                            className="portal-section-card"
                        >
                            {actionItems.length ? (
                                <List
                                    loading={loading}
                                    dataSource={actionItems}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <div>
                                                <Text strong>{item.title}</Text>
                                                <Paragraph
                                                    className="portal-muted"
                                                    style={{ margin: '6px 0 0' }}
                                                >
                                                    {item.offer &&
                                                    canRespondToOffer(item)
                                                        ? 'Bạn đang có offer chờ phản hồi trong mục hồ sơ đã nộp.'
                                                        : item.note ||
                                                          `${getApplicationStatusLabel(item.status)} - theo dõi email và thông báo hệ thống.`}
                                                </Paragraph>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="Hiện không có tác vụ cần xử lý ngay"
                                />
                            )}
                        </Card>
                    </Space>
                </Col>
            </Row>

            <Modal
                title="Thông tin offer"
                open={Boolean(selectedOfferApplication)}
                onCancel={closeOfferModal}
                footer={null}
                width={760}
                destroyOnHidden
            >
                {selectedOfferApplication?.offer ? (
                    <Space
                        direction="vertical"
                        size={16}
                        style={{ width: '100%' }}
                    >
                        <Card size="small">
                            <Space direction="vertical" size={4}>
                                <Text strong>{selectedOfferApplication.title}</Text>
                                <Text type="secondary">
                                    {selectedOfferApplication.departmentName}
                                </Text>
                                <Space wrap>
                                    <Tag
                                        color={getApplicationStatusColor(
                                            selectedOfferApplication.status
                                        )}
                                    >
                                        {getApplicationStatusLabel(
                                            selectedOfferApplication.status
                                        )}
                                    </Tag>
                                    <Tag
                                        color={getOfferStatusColor(
                                            selectedOfferApplication.offer.status
                                        )}
                                    >
                                        {getOfferStatusLabel(
                                            selectedOfferApplication.offer.status
                                        )}
                                    </Tag>
                                    {selectedOfferApplication.latestOfferResponse ? (
                                        <Tag
                                            color={getOfferResponseColor(
                                                selectedOfferApplication
                                                    .latestOfferResponse
                                                    .responseType
                                            )}
                                        >
                                            {getOfferResponseLabel(
                                                selectedOfferApplication
                                                    .latestOfferResponse
                                                    .responseType
                                            )}
                                        </Tag>
                                    ) : null}
                                </Space>
                            </Space>
                        </Card>

                        <Descriptions size="small" column={1} bordered>
                            <Descriptions.Item label="Mã hồ sơ">
                                {selectedOfferApplication.applicationCode}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mức lương">
                                {formatSalary(
                                    selectedOfferApplication.offer.salary
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày bắt đầu">
                                {formatDisplayDate(
                                    selectedOfferApplication.offer.startDate
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thử việc">
                                {selectedOfferApplication.offer
                                    .probationMonths !== null &&
                                selectedOfferApplication.offer
                                    .probationMonths !== undefined
                                    ? `${selectedOfferApplication.offer.probationMonths} tháng`
                                    : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa điểm làm việc">
                                {selectedOfferApplication.offer.workLocation ||
                                    '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phúc lợi">
                                {selectedOfferApplication.offer.benefit || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú offer">
                                {selectedOfferApplication.offer.note || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời điểm gửi">
                                {formatDisplayDateTime(
                                    selectedOfferApplication.offer.sentTime
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Hạn phản hồi">
                                {formatDisplayDateTime(
                                    selectedOfferApplication.offer.expiredTime
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phản hồi gần nhất">
                                {selectedOfferApplication.latestOfferResponse ? (
                                    <Space direction="vertical" size={4}>
                                        <Tag
                                            color={getOfferResponseColor(
                                                selectedOfferApplication
                                                    .latestOfferResponse
                                                    .responseType
                                            )}
                                        >
                                            {getOfferResponseLabel(
                                                selectedOfferApplication
                                                    .latestOfferResponse
                                                    .responseType
                                            )}
                                        </Tag>
                                        <Text type="secondary">
                                            {formatDisplayDateTime(
                                                selectedOfferApplication
                                                    .latestOfferResponse
                                                    .responseTime
                                            )}
                                        </Text>
                                        <Text>
                                            {selectedOfferApplication
                                                .latestOfferResponse
                                                .responseContent || '-'}
                                        </Text>
                                    </Space>
                                ) : (
                                    'Chưa phản hồi'
                                )}
                            </Descriptions.Item>
                        </Descriptions>

                        <Space wrap style={{ justifyContent: 'flex-end' }}>
                            <Button onClick={closeOfferModal}>Đóng</Button>
                            {canRespondToOffer(selectedOfferApplication) ? (
                                <>
                                    <Button
                                        danger
                                        loading={
                                            respondingApplicationId ===
                                            selectedOfferApplication.id
                                        }
                                        onClick={() =>
                                            handleOfferDecision(
                                                selectedOfferApplication,
                                                OFFER_DECLINED
                                            )
                                        }
                                    >
                                        Từ chối offer
                                    </Button>
                                    <Button
                                        type="primary"
                                        loading={
                                            respondingApplicationId ===
                                            selectedOfferApplication.id
                                        }
                                        onClick={() =>
                                            handleOfferDecision(
                                                selectedOfferApplication,
                                                OFFER_ACCEPTED
                                            )
                                        }
                                    >
                                        Chấp nhận offer
                                    </Button>
                                </>
                            ) : null}
                        </Space>
                    </Space>
                ) : null}
            </Modal>
        </div>
    )
}

export default CandidateApplicationPage
