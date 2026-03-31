import { useMemo, useState } from 'react'

import {
    Button,
    Card,
    Col,
    Descriptions,
    Empty,
    Input,
    Modal,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag,
    Typography,
} from 'antd'

import {
    CheckCircleOutlined,
    SearchOutlined,
    SolutionOutlined,
    TeamOutlined,
    UserSwitchOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

import { useEmployerWorkspace } from '@/hooks/useEmployerWorkspace'
import type {
    ApplicationDto,
    CandidateDto,
    CandidateResponseDto,
    OfferDto,
} from '@/services/admin'
import {
    formatCount,
    formatDisplayDate,
    formatDisplayDateTime,
    getApplicationStatusColor,
    getApplicationStatusLabel,
} from '@/utils/admin'
import { getOfferStatusColor, getOfferStatusLabel } from '@/utils/employer'

const { Paragraph, Text, Title } = Typography

type EmployerEmployeeRow = {
    id: string
    applicationId: string
    applicationCode: string
    employeeId: string
    candidateName: string
    email: string
    phone: string
    department: string
    position: string
    currentPosition: string
    applicationStatus: string | number
    offerStatus?: string | number
    startDate?: string | null
    acceptedTime?: string | null
    offerSentTime?: string | null
    candidate?: CandidateDto
    application: ApplicationDto
    offer?: OfferDto
    latestResponse?: CandidateResponseDto
}

const normalizeValue = (value: unknown) =>
    String(value ?? '')
        .trim()
        .replace(/[\s_-]+/g, '')
        .toLowerCase()

const isManagedEmployeeStatus = (status: unknown) =>
    ['9', 'offeraccepted', '11', 'hired'].includes(normalizeValue(status))

const isOfferAcceptedResponse = (responseType: unknown) =>
    ['4', 'offeraccepted'].includes(normalizeValue(responseType))

const isHiredStatus = (status: unknown) =>
    ['11', 'hired'].includes(normalizeValue(status))

const getTextValue = (value?: string | null) => value?.trim() || '-'

const EmployerManageEmployeePage = () => {
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<'all' | 'offeraccepted' | 'hired'>(
        'all'
    )
    const [department, setDepartment] = useState<string>('all')
    const [selectedEmployee, setSelectedEmployee] =
        useState<EmployerEmployeeRow | null>(null)
    const { applicationRows, offers, candidateResponses, loading } =
        useEmployerWorkspace()

    const offerByApplicationId = useMemo(() => {
        const map = new Map<string, OfferDto>()

        offers.forEach((offer) => {
            if (!map.has(offer.applicationId)) {
                map.set(offer.applicationId, offer)
            }
        })

        return map
    }, [offers])

    const latestResponseByApplicationId = useMemo(() => {
        const map = new Map<string, CandidateResponseDto>()

        candidateResponses.forEach((response) => {
            if (!map.has(response.applicationId)) {
                map.set(response.applicationId, response)
            }
        })

        return map
    }, [candidateResponses])

    const employeeRows = useMemo<EmployerEmployeeRow[]>(
        () =>
            applicationRows
                .filter((row) =>
                    isManagedEmployeeStatus(row.application.status)
                )
                .map((row) => {
                    const offer = offerByApplicationId.get(row.application.id)
                    const latestResponse = latestResponseByApplicationId.get(
                        row.application.id
                    )
                    const acceptedTime = isOfferAcceptedResponse(
                        latestResponse?.responseType
                    )
                        ? latestResponse?.responseTime
                        : null

                    return {
                        id: `${row.application.id}-${row.candidate?.id || 'employee'}`,
                        applicationId: row.application.id,
                        applicationCode: row.application.applicationCode,
                        employeeId: row.candidate?.employeeId?.trim() || '-',
                        candidateName: row.candidate?.fullName || 'Ứng viên',
                        email: row.candidate?.email || '-',
                        phone: row.candidate?.phoneNumber || '-',
                        department: row.department?.name || '-',
                        position:
                            row.recruitmentRequest?.title ||
                            row.jobPosition?.name ||
                            '-',
                        currentPosition: row.candidate?.currentPosition || '-',
                        applicationStatus: row.application.status,
                        offerStatus: offer?.status,
                        startDate: offer?.startDate ?? null,
                        acceptedTime,
                        offerSentTime: offer?.sentTime ?? null,
                        candidate: row.candidate,
                        application: row.application,
                        offer,
                        latestResponse,
                    }
                })
                .sort((left, right) => {
                    const leftTime = dayjs(
                        left.acceptedTime ||
                            left.startDate ||
                            left.offerSentTime ||
                            left.application.appliedTime
                    ).valueOf()
                    const rightTime = dayjs(
                        right.acceptedTime ||
                            right.startDate ||
                            right.offerSentTime ||
                            right.application.appliedTime
                    ).valueOf()

                    return rightTime - leftTime
                }),
        [applicationRows, latestResponseByApplicationId, offerByApplicationId]
    )

    const departmentOptions = useMemo(
        () => [
            { label: 'Tất cả đơn vị', value: 'all' },
            ...Array.from(
                new Set(
                    employeeRows
                        .map((employee) => employee.department)
                        .filter((item) => item && item !== '-')
                )
            ).map((item) => ({
                label: item,
                value: item,
            })),
        ],
        [employeeRows]
    )

    const filteredEmployees = useMemo(
        () =>
            employeeRows.filter((employee) => {
                const normalized = search.trim().toLowerCase()
                const matchesSearch =
                    !normalized ||
                    employee.candidateName.toLowerCase().includes(normalized) ||
                    employee.email.toLowerCase().includes(normalized) ||
                    employee.position.toLowerCase().includes(normalized) ||
                    employee.applicationCode
                        .toLowerCase()
                        .includes(normalized) ||
                    employee.employeeId.toLowerCase().includes(normalized)
                const matchesStatus =
                    status === 'all' ||
                    (status === 'hired'
                        ? isHiredStatus(employee.applicationStatus)
                        : !isHiredStatus(employee.applicationStatus))
                const matchesDepartment =
                    department === 'all' || employee.department === department

                return matchesSearch && matchesStatus && matchesDepartment
            }),
        [department, employeeRows, search, status]
    )

    const stats = useMemo(
        () => ({
            total: employeeRows.length,
            accepted: employeeRows.filter(
                (employee) => !isHiredStatus(employee.applicationStatus)
            ).length,
            hired: employeeRows.filter((employee) =>
                isHiredStatus(employee.applicationStatus)
            ).length,
            startingSoon: employeeRows.filter((employee) => {
                if (!employee.startDate) {
                    return false
                }

                const startDate = dayjs(employee.startDate)
                return (
                    startDate.isValid() &&
                    startDate.isAfter(dayjs().startOf('day')) &&
                    startDate.diff(dayjs(), 'day') <= 30
                )
            }).length,
        }),
        [employeeRows]
    )

    const columns: ColumnsType<EmployerEmployeeRow> = [
        {
            title: 'Nhân sự',
            key: 'candidateName',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{record.candidateName}</Text>
                    <Text type="secondary">{record.email}</Text>
                    <Text type="secondary">{record.phone}</Text>
                </Space>
            ),
        },
        {
            title: 'Mã nhân viên',
            dataIndex: 'employeeId',
            key: 'employeeId',
            width: 140,
            render: (value: string) =>
                value !== '-' ? <Tag color="blue">{value}</Tag> : '-',
        },
        {
            title: 'Vị trí / Đơn vị',
            key: 'position',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text>{record.position}</Text>
                    <Text type="secondary">{record.department}</Text>
                </Space>
            ),
        },
        {
            title: 'Trạng thái hồ sơ',
            dataIndex: 'applicationStatus',
            key: 'applicationStatus',
            width: 150,
            render: (value: string | number) => (
                <Tag color={getApplicationStatusColor(value)}>
                    {getApplicationStatusLabel(value)}
                </Tag>
            ),
        },
        {
            title: 'Offer',
            dataIndex: 'offerStatus',
            key: 'offerStatus',
            width: 140,
            render: (value?: string | number) =>
                value ? (
                    <Tag color={getOfferStatusColor(value)}>
                        {getOfferStatusLabel(value)}
                    </Tag>
                ) : (
                    '-'
                ),
        },
        {
            title: 'Mốc chính',
            key: 'timeline',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text type="secondary">
                        Nhận offer: {formatDisplayDateTime(record.acceptedTime)}
                    </Text>
                    <Text type="secondary">
                        Bắt đầu: {formatDisplayDate(record.startDate)}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            align: 'right',
            render: (_, record) => (
                <Button onClick={() => setSelectedEmployee(record)}>
                    Xem chi tiết
                </Button>
            ),
        },
    ]

    return (
        <div className="portal-page">
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Quản lý nhân viên</span>
                <Title level={2}>
                    Danh sách nhân sự đã qua giai đoạn tuyển dụng
                </Title>
            </section>

            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} xl={6}>
                    <Card className="portal-section-card portal-stat-card">
                        <Space direction="vertical" size={16}>
                            <div className="portal-stat-card__icon">
                                <TeamOutlined />
                            </div>
                            <Statistic
                                title="Tổng nhân sự"
                                value={stats.total}
                                formatter={(value) =>
                                    formatCount(Number(value))
                                }
                            />
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} sm={12} xl={6}>
                    <Card className="portal-section-card portal-stat-card">
                        <Space direction="vertical" size={16}>
                            <div className="portal-stat-card__icon">
                                <SolutionOutlined />
                            </div>
                            <Statistic
                                title="Đã nhận offer"
                                value={stats.accepted}
                                formatter={(value) =>
                                    formatCount(Number(value))
                                }
                            />
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} sm={12} xl={6}>
                    <Card className="portal-section-card portal-stat-card">
                        <Space direction="vertical" size={16}>
                            <div className="portal-stat-card__icon">
                                <CheckCircleOutlined />
                            </div>
                            <Statistic
                                title="Đã tuyển"
                                value={stats.hired}
                                formatter={(value) =>
                                    formatCount(Number(value))
                                }
                            />
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} sm={12} xl={6}>
                    <Card className="portal-section-card portal-stat-card">
                        <Space direction="vertical" size={16}>
                            <div className="portal-stat-card__icon">
                                <UserSwitchOutlined />
                            </div>
                            <Statistic
                                title="Bắt đầu trong 30 ngày"
                                value={stats.startingSoon}
                                formatter={(value) =>
                                    formatCount(Number(value))
                                }
                            />
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Card className="portal-section-card">
                <Row gutter={[16, 16]} align="bottom">
                    <Col xs={24} md={10}>
                        <Text strong>Tìm kiếm</Text>
                        <Input
                            allowClear
                            size="large"
                            prefix={<SearchOutlined />}
                            placeholder="Tên, email, mã hồ sơ, mã nhân viên..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </Col>
                    <Col xs={24} md={7}>
                        <Text strong>Trạng thái</Text>
                        <Select
                            size="large"
                            value={status}
                            onChange={setStatus}
                            style={{ width: '100%' }}
                            options={[
                                { label: 'Tất cả trạng thái', value: 'all' },
                                {
                                    label: 'Đã nhận offer',
                                    value: 'offeraccepted',
                                },
                                { label: 'Đã tuyển', value: 'hired' },
                            ]}
                        />
                    </Col>
                    <Col xs={24} md={7}>
                        <Text strong>Đơn vị</Text>
                        <Select
                            size="large"
                            value={department}
                            onChange={setDepartment}
                            style={{ width: '100%' }}
                            options={departmentOptions}
                        />
                    </Col>
                </Row>
            </Card>

            <Card className="portal-section-card">
                {filteredEmployees.length ? (
                    <Table
                        rowKey="id"
                        loading={loading}
                        columns={columns}
                        dataSource={filteredEmployees}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: false,
                        }}
                        scroll={{ x: 980 }}
                    />
                ) : (
                    <Empty
                        description="Chưa có nhân sự nào phù hợp với bộ lọc hiện tại"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}
            </Card>

            <Modal
                title="Chi tiết nhân sự"
                open={Boolean(selectedEmployee)}
                onCancel={() => setSelectedEmployee(null)}
                footer={null}
                width={820}
                destroyOnHidden
            >
                {selectedEmployee ? (
                    <Space
                        direction="vertical"
                        size={16}
                        style={{ width: '100%' }}
                    >
                        <Card size="small">
                            <Space direction="vertical" size={4}>
                                <Text strong>
                                    {selectedEmployee.candidateName}
                                </Text>
                                <Text type="secondary">
                                    {selectedEmployee.position} -{' '}
                                    {selectedEmployee.department}
                                </Text>
                                <Space wrap>
                                    <Tag
                                        color={getApplicationStatusColor(
                                            selectedEmployee.applicationStatus
                                        )}
                                    >
                                        {getApplicationStatusLabel(
                                            selectedEmployee.applicationStatus
                                        )}
                                    </Tag>
                                    {selectedEmployee.offerStatus ? (
                                        <Tag
                                            color={getOfferStatusColor(
                                                selectedEmployee.offerStatus
                                            )}
                                        >
                                            {getOfferStatusLabel(
                                                selectedEmployee.offerStatus
                                            )}
                                        </Tag>
                                    ) : null}
                                    {selectedEmployee.employeeId !== '-' ? (
                                        <Tag color="blue">
                                            Mã NV: {selectedEmployee.employeeId}
                                        </Tag>
                                    ) : null}
                                </Space>
                            </Space>
                        </Card>

                        <Descriptions size="small" column={2} bordered>
                            <Descriptions.Item label="Mã hồ sơ">
                                {selectedEmployee.applicationCode}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mã nhân viên">
                                {selectedEmployee.employeeId}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {selectedEmployee.email}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {selectedEmployee.phone}
                            </Descriptions.Item>
                            <Descriptions.Item label="Vị trí hiện tại">
                                {selectedEmployee.currentPosition}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày nộp hồ sơ">
                                {formatDisplayDateTime(
                                    selectedEmployee.application.appliedTime
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày gửi offer">
                                {formatDisplayDateTime(
                                    selectedEmployee.offerSentTime
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày chấp nhận offer">
                                {formatDisplayDateTime(
                                    selectedEmployee.acceptedTime
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày bắt đầu dự kiến">
                                {formatDisplayDate(selectedEmployee.startDate)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa điểm làm việc">
                                {getTextValue(
                                    selectedEmployee.offer?.workLocation
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phúc lợi" span={2}>
                                {getTextValue(selectedEmployee.offer?.benefit)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú offer" span={2}>
                                {getTextValue(selectedEmployee.offer?.note)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú hồ sơ" span={2}>
                                {getTextValue(
                                    selectedEmployee.application.note
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label="Phản hồi gần nhất"
                                span={2}
                            >
                                {getTextValue(
                                    selectedEmployee.latestResponse
                                        ?.responseContent
                                )}
                            </Descriptions.Item>
                        </Descriptions>
                    </Space>
                ) : null}
            </Modal>
        </div>
    )
}

export default EmployerManageEmployeePage
