import { useEffect, useMemo, useState } from 'react'

import {
    Button,
    Card,
    Descriptions,
    Empty,
    Form,
    Input,
    Modal,
    Select,
    Space,
    Switch,
    Table,
    Tag,
    Typography,
    notification,
} from 'antd'

import {
    CheckCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    FileDoneOutlined,
    IdcardOutlined,
    PlusOutlined,
    SearchOutlined,
    ShopOutlined,
} from '@ant-design/icons'

import AdminService, {
    DepartmentDto,
    JobPositionCreateDto,
    JobPositionDto,
    JobPositionUpdateDto,
    RecruitmentRequestDto,
} from '@/services/admin'
import { formatCount, isRecruitmentRequestActive } from '@/utils/admin'

import styles from '../styles/AdminUi.module.css'

type JobPositionRecord = {
    key: string
    id: string
    code: string
    name: string
    departmentId: string
    departmentName: string
    description: string
    isActive: boolean
    statusLabel: string
    activeRecruitments: number
}

type JobPositionFormValues = {
    code: string
    name: string
    departmentId: string
    description?: string
    isActive: boolean
}

const getPagedItems = <T,>(response: unknown) =>
    ((response as { items?: T[] })?.items || []) as T[]

const getErrorMessage = (error: unknown, fallback: string) =>
    (error as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message || fallback

const defaultFormValues: JobPositionFormValues = {
    code: '',
    name: '',
    departmentId: '',
    description: '',
    isActive: true,
}

const AdminManageJobPositionPage = () => {
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<string | undefined>()
    const [departmentId, setDepartmentId] = useState<string | undefined>()
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [rows, setRows] = useState<JobPositionRecord[]>([])
    const [departments, setDepartments] = useState<DepartmentDto[]>([])
    const [formOpen, setFormOpen] = useState(false)
    const [editingRow, setEditingRow] = useState<JobPositionRecord | null>(null)
    const [viewingRow, setViewingRow] = useState<JobPositionRecord | null>(null)
    const [deletingRow, setDeletingRow] = useState<JobPositionRecord | null>(
        null
    )
    const [form] = Form.useForm<JobPositionFormValues>()

    const loadData = async () => {
        setLoading(true)
        try {
            const [
                jobPositionResponse,
                departmentResponse,
                recruitmentResponse,
            ] = await Promise.all([
                AdminService.getJobPositions({
                    Sorting: 'name asc',
                    MaxResultCount: 1000,
                }),
                AdminService.getDepartments({
                    Sorting: 'name asc',
                    MaxResultCount: 1000,
                }),
                AdminService.getRecruitmentRequests({
                    Sorting: 'creationTime desc',
                    MaxResultCount: 1000,
                }),
            ])

            const jobPositions =
                getPagedItems<JobPositionDto>(jobPositionResponse)
            const departmentItems =
                getPagedItems<DepartmentDto>(departmentResponse)
            const recruitments =
                getPagedItems<RecruitmentRequestDto>(recruitmentResponse)

            const departmentsById = new Map(
                departmentItems.map((item) => [item.id, item.name])
            )
            const activeRecruitmentCountByPosition = recruitments.reduce(
                (accumulator, item) => {
                    if (isRecruitmentRequestActive(item.status)) {
                        accumulator[item.jobPositionId] =
                            (accumulator[item.jobPositionId] || 0) + 1
                    }

                    return accumulator
                },
                {} as Record<string, number>
            )

            setDepartments(departmentItems)
            setRows(
                jobPositions.map((item) => ({
                    key: item.id,
                    id: item.id,
                    code: item.code,
                    name: item.name,
                    departmentId: item.departmentId,
                    departmentName:
                        departmentsById.get(item.departmentId) ||
                        'Chưa cập nhật đơn vị',
                    description: item.description?.trim() || '',
                    isActive: item.isActive,
                    statusLabel: item.isActive ? 'Hoạt động' : 'Tạm dừng',
                    activeRecruitments:
                        activeRecruitmentCountByPosition[item.id] || 0,
                }))
            )
        } catch (error) {
            notification.error({
                message: 'Không tải được danh sách vị trí công việc',
                description: getErrorMessage(
                    error,
                    'Kiểm tra API job-position, department và recruitment-request.'
                ),
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadData()
    }, [])

    const departmentOptions = useMemo(
        () =>
            departments.map((item) => ({
                value: item.id,
                label: item.name,
            })),
        [departments]
    )

    const filteredRows = useMemo(() => {
        const keyword = search.trim().toLowerCase()

        return rows.filter((item) => {
            const matchesKeyword =
                !keyword ||
                item.name.toLowerCase().includes(keyword) ||
                item.code.toLowerCase().includes(keyword) ||
                item.departmentName.toLowerCase().includes(keyword) ||
                item.description.toLowerCase().includes(keyword)

            const matchesStatus =
                !status ||
                (status === 'active' && item.isActive) ||
                (status === 'inactive' && !item.isActive)

            const matchesDepartment =
                !departmentId || item.departmentId === departmentId

            return matchesKeyword && matchesStatus && matchesDepartment
        })
    }, [departmentId, rows, search, status])

    const stats = useMemo(
        () => ({
            total: rows.length,
            active: rows.filter((item) => item.isActive).length,
            inactive: rows.filter((item) => !item.isActive).length,
            activeRecruitments: rows.reduce(
                (sum, item) => sum + item.activeRecruitments,
                0
            ),
            departments: new Set(rows.map((item) => item.departmentId)).size,
        }),
        [rows]
    )

    const normalizePayload = (
        values: JobPositionFormValues
    ): JobPositionCreateDto | JobPositionUpdateDto => ({
        code: values.code.trim(),
        name: values.name.trim(),
        departmentId: values.departmentId,
        description: values.description?.trim() || '',
        isActive: values.isActive,
    })

    const openCreateModal = () => {
        setEditingRow(null)
        form.setFieldsValue(defaultFormValues)
        setFormOpen(true)
    }

    const openEditModal = (record: JobPositionRecord) => {
        setEditingRow(record)
        form.setFieldsValue({
            code: record.code,
            name: record.name,
            departmentId: record.departmentId,
            description: record.description,
            isActive: record.isActive,
        })
        setFormOpen(true)
    }

    const handleCloseFormModal = () => {
        if (submitting) return

        setFormOpen(false)
        setEditingRow(null)
        form.resetFields()
    }

    const handleSubmit = async () => {
        const values = await form.validateFields()

        setSubmitting(true)
        try {
            if (editingRow) {
                await AdminService.updateJobPosition(
                    editingRow.id,
                    normalizePayload(values)
                )
                notification.success({
                    message: 'Đã cập nhật vị trí công việc',
                    description: values.name.trim(),
                })
            } else {
                await AdminService.createJobPosition(normalizePayload(values))
                notification.success({
                    message: 'Đã tạo vị trí công việc',
                    description: values.name.trim(),
                })
            }

            setFormOpen(false)
            setEditingRow(null)
            form.resetFields()
            await loadData()
        } catch (error) {
            notification.error({
                message: editingRow
                    ? 'Cập nhật vị trí công việc thất bại'
                    : 'Tạo vị trí công việc thất bại',
                description: getErrorMessage(
                    error,
                    'Backend từ chối dữ liệu hoặc bạn chưa có quyền thao tác.'
                ),
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingRow) return

        setSubmitting(true)
        try {
            await AdminService.deleteJobPosition(deletingRow.id)
            notification.success({
                message: 'Đã xóa vị trí công việc',
                description: deletingRow.name,
            })
            setDeletingRow(null)
            await loadData()
        } catch (error) {
            notification.error({
                message: 'Xóa vị trí công việc thất bại',
                description: getErrorMessage(
                    error,
                    'Vị trí công việc có thể đang được tham chiếu bởi dữ liệu khác.'
                ),
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className={styles.page}>
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Vị trí công việc</span>
                <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    align="start"
                    wrap
                >
                    <div>
                        <Typography.Title level={2}>
                            Quản lý danh sách vị trí công việc
                        </Typography.Title>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={openCreateModal}
                    >
                        Thêm vị trí
                    </Button>
                </Space>
            </section>

            <Card variant="borderless" className={styles.filterCard}>
                <div className={styles.filterRow}>
                    <Input
                        allowClear
                        size="large"
                        prefix={<SearchOutlined />}
                        value={search}
                        className={styles.flexGrow}
                        placeholder="Tìm theo tên vị trí, mã, đơn vị hoặc mô tả..."
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <Select
                        allowClear
                        size="large"
                        placeholder="Tất cả đơn vị"
                        style={{ minWidth: 240 }}
                        options={departmentOptions}
                        value={departmentId}
                        onChange={(value) => setDepartmentId(value)}
                    />
                    <Select
                        allowClear
                        size="large"
                        placeholder="Tất cả trạng thái"
                        style={{ minWidth: 220 }}
                        options={[
                            { value: 'active', label: 'Hoạt động' },
                            { value: 'inactive', label: 'Tạm dừng' },
                        ]}
                        value={status}
                        onChange={(value) => setStatus(value)}
                    />
                </div>
            </Card>

            <div className={styles.metricGrid}>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <IdcardOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>
                            {formatCount(stats.total)}
                        </div>
                        <div className={styles.metricLabel}>Tổng vị trí</div>
                    </div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <CheckCircleOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>
                            {formatCount(stats.active)}
                        </div>
                        <div className={styles.metricLabel}>
                            Vị trí hoạt động
                        </div>
                    </div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <FileDoneOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>
                            {formatCount(stats.activeRecruitments)}
                        </div>
                        <div className={styles.metricLabel}>
                            Tin tuyển dụng đang mở
                        </div>
                    </div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <ShopOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>
                            {formatCount(stats.departments)}
                        </div>
                        <div className={styles.metricLabel}>
                            Đơn vị có vị trí
                        </div>
                    </div>
                </div>
            </div>

            <Card variant="borderless" className={styles.sectionCard}>
                <Table
                    rowKey="id"
                    loading={loading}
                    dataSource={filteredRows}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1100 }}
                    locale={{
                        emptyText: (
                            <Empty description="Không có vị trí công việc phù hợp bộ lọc hiện tại" />
                        ),
                    }}
                    columns={[
                        {
                            title: 'Vị trí',
                            key: 'position',
                            render: (_: unknown, record: JobPositionRecord) => (
                                <div className={styles.tableNameCell}>
                                    <span className={styles.tableMainText}>
                                        {record.name}
                                    </span>
                                    <span className={styles.tableSubText}>
                                        {record.code}
                                    </span>
                                </div>
                            ),
                        },
                        {
                            title: 'Đơn vị',
                            dataIndex: 'departmentName',
                            key: 'departmentName',
                        },
                        {
                            title: 'Mô tả',
                            dataIndex: 'description',
                            key: 'description',
                            render: (value: string) => (
                                <Typography.Paragraph
                                    ellipsis={{
                                        rows: 2,
                                        tooltip: value || 'Không có mô tả',
                                    }}
                                    style={{ marginBottom: 0, maxWidth: 340 }}
                                >
                                    {value || 'Không có mô tả'}
                                </Typography.Paragraph>
                            ),
                        },
                        {
                            title: 'Tin đang mở',
                            dataIndex: 'activeRecruitments',
                            key: 'activeRecruitments',
                            align: 'center' as const,
                            render: (value: number) => formatCount(value),
                        },
                        {
                            title: 'Trạng thái',
                            key: 'status',
                            render: (_: unknown, record: JobPositionRecord) => (
                                <Tag
                                    color={
                                        record.isActive ? 'success' : 'warning'
                                    }
                                    className={styles.statusTag}
                                >
                                    {record.statusLabel}
                                </Tag>
                            ),
                        },
                        {
                            title: 'Thao tác',
                            key: 'actions',
                            render: (_: unknown, record: JobPositionRecord) => (
                                <Space size="small">
                                    <Button
                                        icon={<EyeOutlined />}
                                        onClick={() => setViewingRow(record)}
                                    />
                                    <Button
                                        icon={<EditOutlined />}
                                        onClick={() => openEditModal(record)}
                                    />
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => setDeletingRow(record)}
                                    />
                                </Space>
                            ),
                        },
                    ]}
                />
            </Card>

            <Modal
                open={formOpen}
                title={
                    editingRow
                        ? 'Cập nhật vị trí công việc'
                        : 'Thêm vị trí công việc'
                }
                okText={editingRow ? 'Lưu thay đổi' : 'Tạo vị trí'}
                cancelText="Hủy"
                confirmLoading={submitting}
                destroyOnHidden
                onCancel={handleCloseFormModal}
                onOk={() => void handleSubmit()}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={defaultFormValues}
                >
                    <Form.Item
                        label="Mã vị trí"
                        name="code"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập mã vị trí',
                            },
                        ]}
                    >
                        <Input maxLength={50} placeholder="VD: FE_DEV" />
                    </Form.Item>

                    <Form.Item
                        label="Tên vị trí"
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập tên vị trí',
                            },
                        ]}
                    >
                        <Input
                            maxLength={200}
                            placeholder="Frontend Developer"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Đơn vị"
                        name="departmentId"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng chọn đơn vị',
                            },
                        ]}
                    >
                        <Select
                            showSearch
                            optionFilterProp="label"
                            placeholder="Chọn đơn vị"
                            options={departmentOptions}
                        />
                    </Form.Item>

                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea
                            rows={4}
                            maxLength={1000}
                            placeholder="Mô tả ngắn cho vị trí công việc"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Kích hoạt"
                        name="isActive"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                open={Boolean(viewingRow)}
                title="Chi tiết vị trí công việc"
                footer={null}
                destroyOnHidden
                onCancel={() => setViewingRow(null)}
            >
                {viewingRow ? (
                    <Descriptions bordered size="small" column={1}>
                        <Descriptions.Item label="Tên vị trí">
                            {viewingRow.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mã vị trí">
                            {viewingRow.code}
                        </Descriptions.Item>
                        <Descriptions.Item label="Đơn vị">
                            {viewingRow.departmentName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag
                                color={
                                    viewingRow.isActive ? 'success' : 'warning'
                                }
                            >
                                {viewingRow.statusLabel}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tin đang mở">
                            {formatCount(viewingRow.activeRecruitments)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mô tả">
                            {viewingRow.description || 'Không có mô tả'}
                        </Descriptions.Item>
                    </Descriptions>
                ) : null}
            </Modal>

            <Modal
                open={Boolean(deletingRow)}
                title="Xóa vị trí công việc"
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true, loading: submitting }}
                destroyOnHidden
                onCancel={() => {
                    if (!submitting) setDeletingRow(null)
                }}
                onOk={() => void handleDelete()}
            >
                <Typography.Paragraph style={{ marginBottom: 0 }}>
                    Bạn chắc chắn muốn xóa vị trí{' '}
                    <strong>{deletingRow?.name}</strong>? Nếu vị trí này đang
                    được tham chiếu bởi tin tuyển dụng khác, backend có thể từ
                    chối thao tác này.
                </Typography.Paragraph>
            </Modal>
        </div>
    )
}

export default AdminManageJobPositionPage
