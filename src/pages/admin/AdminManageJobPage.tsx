import { CSSProperties, useEffect, useMemo, useState } from 'react'

import {
    Button,
    Card,
    Empty,
    Input,
    Modal,
    Select,
    Space,
    Table,
    Tag,
    Typography,
    notification,
} from 'antd'

import {
    CheckCircleOutlined,
    EyeOutlined,
    FileDoneOutlined,
    FilterOutlined,
    SearchOutlined,
    StopOutlined,
} from '@ant-design/icons'

import ViewEmployerJobModal from '@/components/modals/ViewEmployerJobModal'
import type { EmployerJobRecord } from '@/components/modals/employerJobModal.shared'
import { mapRecruitmentRequestToEmployerJobRecord } from '@/components/modals/employerJobModal.shared'
import AdminService, {
    ApplicationDto,
    DepartmentDto,
    JobPositionDto,
    RecruitmentRequestDto,
} from '@/services/admin'
import {
    formatCount,
    formatDisplayDate,
    isRecruitmentRequestPending,
} from '@/utils/admin'

import styles from '../styles/AdminUi.module.css'

const statColors = ['#2f54eb', '#d48806', '#389e0d', '#cf1322']

const getPagedItems = <T,>(response: unknown) =>
    (((response as { items?: T[] })?.items || []) as T[])

const normalizeStatus = (value: string | number) =>
    String(value).trim().replace(/[\s_-]+/g, '').toLowerCase()

const isApprovedOrPublished = (value: string | number) =>
    ['2', 'approved', '4', 'published'].includes(normalizeStatus(value))

const matchesStatusFilter = (value: string | number, filterValue?: string) => {
    if (!filterValue) return true

    const normalized = normalizeStatus(value)

    if (filterValue === 'pending') {
        return ['1', 'pendingapproval'].includes(normalized)
    }

    if (filterValue === 'approved') {
        return ['2', 'approved'].includes(normalized)
    }

    if (filterValue === 'published') {
        return ['4', 'published'].includes(normalized)
    }

    if (filterValue === 'rejected') {
        return ['3', 'rejected'].includes(normalized)
    }

    if (filterValue === 'closed') {
        return ['5', 'closed'].includes(normalized)
    }

    return true
}

const AdminManageJobPage = () => {
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<string | undefined>()
    const [loading, setLoading] = useState(false)
    const [actionLoadingId, setActionLoadingId] = useState<string>()
    const [rows, setRows] = useState<EmployerJobRecord[]>([])
    const [viewingRow, setViewingRow] = useState<EmployerJobRecord | null>(null)
    const [rejectingRow, setRejectingRow] = useState<EmployerJobRecord | null>(
        null
    )
    const [rejectReason, setRejectReason] = useState('')

    const loadRecruitments = async () => {
        setLoading(true)
        try {
            const [
                recruitmentResponse,
                departmentResponse,
                jobPositionResponse,
                applicationResponse,
            ] = await Promise.all([
                AdminService.getRecruitmentRequests({
                    Sorting: 'creationTime desc',
                    MaxResultCount: 1000,
                }),
                AdminService.getDepartments({
                    Sorting: 'name asc',
                    MaxResultCount: 1000,
                }),
                AdminService.getJobPositions({
                    Sorting: 'name asc',
                    MaxResultCount: 1000,
                }),
                AdminService.getApplications({
                    Sorting: 'appliedTime desc',
                    MaxResultCount: 1000,
                }),
            ])

            const recruitments =
                getPagedItems<RecruitmentRequestDto>(recruitmentResponse)
            const departments = getPagedItems<DepartmentDto>(departmentResponse)
            const jobPositions =
                getPagedItems<JobPositionDto>(jobPositionResponse)
            const applications =
                getPagedItems<ApplicationDto>(applicationResponse)

            const departmentsById = new Map(
                departments.map((item) => [item.id, item.name])
            )
            const jobPositionsById = new Map(
                jobPositions.map((item) => [item.id, item.name])
            )
            const applicationCountByRequest = applications.reduce(
                (accumulator, item) => {
                    accumulator[item.recruitmentRequestId] =
                        (accumulator[item.recruitmentRequestId] || 0) + 1

                    return accumulator
                },
                {} as Record<string, number>
            )

            setRows(
                recruitments.map((item) =>
                    mapRecruitmentRequestToEmployerJobRecord(
                        item,
                        departmentsById.get(item.departmentId) ||
                            'Chưa cập nhật đơn vị',
                        jobPositionsById.get(item.jobPositionId) ||
                            'Chưa gắn vị trí',
                        applicationCountByRequest[item.id] || 0
                    )
                )
            )
        } catch {
            notification.error({
                message: 'Không tải được danh sách tin tuyển dụng',
                description:
                    'Kiểm tra API recruitment request, department, job position và application.',
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadRecruitments()
    }, [])

    const filteredRecruitments = useMemo(() => {
        return rows.filter((recruitment) => {
            const keyword = search.trim().toLowerCase()
            const matchesKeyword =
                !keyword ||
                recruitment.title.toLowerCase().includes(keyword) ||
                recruitment.departmentName.toLowerCase().includes(keyword) ||
                recruitment.jobPositionName.toLowerCase().includes(keyword) ||
                recruitment.requestCode.toLowerCase().includes(keyword)

            return (
                matchesKeyword &&
                matchesStatusFilter(recruitment.status, status)
            )
        })
    }, [rows, search, status])

    const stats = useMemo(
        () => [
            {
                key: 'total',
                label: 'Tổng tin tuyển dụng',
                value: formatCount(rows.length),
            },
            {
                key: 'pending',
                label: 'Chờ duyệt',
                value: formatCount(
                    rows.filter((item) =>
                        isRecruitmentRequestPending(item.status)
                    ).length
                ),
            },
            {
                key: 'approved',
                label: 'Đang hoạt động',
                value: formatCount(
                    rows.filter((item) => isApprovedOrPublished(item.status))
                        .length
                ),
            },
            {
                key: 'applications',
                label: 'Tổng hồ sơ',
                value: formatCount(
                    rows.reduce((sum, item) => sum + item.applicants, 0)
                ),
            },
        ],
        [rows]
    )

    const handleApprove = async (record: EmployerJobRecord) => {
        setActionLoadingId(record.id)
        try {
            await AdminService.approveRecruitmentRequest(record.id)
            await AdminService.publishRecruitmentRequest(record.id)
            notification.success({
                message: 'Đã duyệt và đăng tuyển tin tuyển dụng',
                description: record.title,
            })
            await loadRecruitments()
        } catch (error) {
            notification.error({
                message: 'Phê duyệt thất bại',
                description:
                    (error as { response?: { data?: { error?: { message?: string } } }; message?: string })
                        ?.response?.data?.error?.message ||
                    (error as { message?: string })?.message ||
                    'Backend không chấp nhận yêu cầu phê duyệt hoặc publish.',
            })
        } finally {
            setActionLoadingId(undefined)
        }
    }

    const handleReject = async () => {
        if (!rejectingRow) return

        const reason = rejectReason.trim()
        if (!reason) {
            notification.warning({
                message: 'Cần nhập lý do từ chối',
            })
            return
        }

        setActionLoadingId(rejectingRow.id)
        try {
            await AdminService.rejectRecruitmentRequest(rejectingRow.id, reason)
            notification.success({
                message: 'Đã từ chối tin tuyển dụng',
                description: rejectingRow.title,
            })
            setRejectingRow(null)
            setRejectReason('')
            await loadRecruitments()
        } catch {
            notification.error({
                message: 'Từ chối thất bại',
                description: 'Backend không chấp nhận yêu cầu từ chối.',
            })
        } finally {
            setActionLoadingId(undefined)
        }
    }

    return (
        <div className={styles.page}>
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Tin tuyển dụng</span>
                <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    align="start"
                    wrap
                >
                    <div>
                        <Typography.Title level={2}>
                            Quản lý tin tuyển dụng
                        </Typography.Title>
                    </div>
                </Space>
            </section>

            <div className={styles.statsGrid}>
                {stats.map((item, index) => (
                    <Card
                        key={item.key}
                        variant="borderless"
                        className={styles.statCard}
                        style={
                            {
                                '--accent-color': statColors[index],
                            } as CSSProperties
                        }
                    >
                        <div className={styles.statBody}>
                            <div>
                                <div className={styles.statLabel}>
                                    {item.label}
                                </div>
                                <div className={styles.statValue}>
                                    {item.value}
                                </div>
                            </div>
                            <div className={styles.statIcon}>
                                <FileDoneOutlined />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card variant="borderless" className={styles.filterCard}>
                <div className={styles.filterRow}>
                    <Input
                        allowClear
                        size="large"
                        prefix={<SearchOutlined />}
                        value={search}
                        className={styles.flexGrow}
                        placeholder="Tìm kiếm tin tuyển dụng hoặc đơn vị..."
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <Select
                        allowClear
                        size="large"
                        placeholder="Tất cả trạng thái"
                        style={{ minWidth: 220 }}
                        options={[
                            { value: 'pending', label: 'Chờ duyệt' },
                            { value: 'approved', label: 'Đã duyệt' },
                            { value: 'published', label: 'Đang tuyển' },
                            { value: 'rejected', label: 'Từ chối' },
                            { value: 'closed', label: 'Đã đóng' },
                        ]}
                        onChange={(value) => setStatus(value)}
                    />
                    <Button size="large" icon={<FilterOutlined />}>
                        Lọc nâng cao
                    </Button>
                </div>
            </Card>

            <Card variant="borderless" className={styles.sectionCard}>
                <Table
                    rowKey="key"
                    loading={loading}
                    locale={{
                        emptyText: (
                            <Empty description="Không có tin tuyển dụng phù hợp" />
                        ),
                    }}
                    dataSource={filteredRecruitments}
                    pagination={{ pageSize: 5 }}
                    columns={[
                        {
                            title: 'Tin tuyển dụng',
                            dataIndex: 'title',
                            key: 'title',
                            render: (_: string, record: EmployerJobRecord) => (
                                <div className={styles.tableNameCell}>
                                    <span className={styles.tableMainText}>
                                        {record.title}
                                    </span>
                                    <span className={styles.tableSubText}>
                                        {record.requestCode} •{' '}
                                        {record.jobPositionName}
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
                            title: 'Số lượng',
                            dataIndex: 'headcount',
                            key: 'headcount',
                            render: (value: number) =>
                                `${formatCount(value)} người`,
                        },
                        {
                            title: 'Hồ sơ',
                            dataIndex: 'applicants',
                            key: 'applicants',
                            render: (value: number) => (
                                <span className={styles.tableMainText}>
                                    {formatCount(value)} hồ sơ
                                </span>
                            ),
                        },
                        {
                            title: 'Hạn nộp',
                            dataIndex: 'applicationDeadline',
                            key: 'applicationDeadline',
                            render: (value?: string | null) =>
                                formatDisplayDate(value),
                        },
                        {
                            title: 'Trạng thái',
                            dataIndex: 'statusLabel',
                            key: 'status',
                            render: (_: string, record: EmployerJobRecord) => (
                                <Tag
                                    color={record.statusColor}
                                    className={styles.statusTag}
                                >
                                    {record.statusLabel}
                                </Tag>
                            ),
                        },
                        {
                            title: 'Thao tác',
                            key: 'actions',
                            render: (_: unknown, record: EmployerJobRecord) => (
                                <Space size="small">
                                    <Button
                                        icon={<EyeOutlined />}
                                        onClick={() => setViewingRow(record)}
                                    />
                                    {isRecruitmentRequestPending(
                                        record.status
                                    ) ? (
                                        <>
                                            <Button
                                                type="primary"
                                                icon={<CheckCircleOutlined />}
                                                loading={
                                                    actionLoadingId ===
                                                    record.id
                                                }
                                                onClick={() =>
                                                    void handleApprove(record)
                                                }
                                            />
                                            <Button
                                                danger
                                                icon={<StopOutlined />}
                                                loading={
                                                    actionLoadingId ===
                                                    record.id
                                                }
                                                onClick={() => {
                                                    setRejectingRow(record)
                                                    setRejectReason('')
                                                }}
                                            />
                                        </>
                                    ) : null}
                                </Space>
                            ),
                        },
                    ]}
                />
            </Card>

            <ViewEmployerJobModal
                open={Boolean(viewingRow)}
                job={viewingRow}
                onCancel={() => setViewingRow(null)}
            />

            <Modal
                title="Từ chối tin tuyển dụng"
                open={Boolean(rejectingRow)}
                okText="Xác nhận"
                cancelText="Hủy"
                confirmLoading={actionLoadingId === rejectingRow?.id}
                onCancel={() => {
                    if (!actionLoadingId) {
                        setRejectingRow(null)
                        setRejectReason('')
                    }
                }}
                onOk={() => void handleReject()}
            >
                <Typography.Paragraph>
                    {rejectingRow?.title || 'Tin tuyển dụng'}
                </Typography.Paragraph>
                <Input.TextArea
                    rows={4}
                    placeholder="Nhập lý do từ chối"
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.target.value)}
                />
            </Modal>
        </div>
    )
}

export default AdminManageJobPage
