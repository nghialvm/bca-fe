import { useMemo, useState } from 'react'

import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    FilterOutlined,
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons'
import {
    Button,
    Card,
    Input,
    Select,
    Space,
    Table,
    Tag,
    Typography,
    notification,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'

import CreateEmployerJobModal from '@/components/modals/CreateEmployerJobModal'
import DeleteEmployerJobModal from '@/components/modals/DeleteEmployerJobModal'
import type {
    EmployerJobFormValues,
    EmployerJobRecord,
} from '@/components/modals/employerJobModal.shared'
import {
    mapDepartmentOptions,
    mapEmployerJobFormToCreateDto,
    mapEmployerJobFormToUpdateDto,
    mapJobPositionOptions,
    mapRecruitmentRequestToEmployerJobRecord,
} from '@/components/modals/employerJobModal.shared'
import UpdateEmployerJobModal from '@/components/modals/UpdateEmployerJobModal'
import ViewEmployerJobModal from '@/components/modals/ViewEmployerJobModal'
import { useEmployerWorkspace } from '@/hooks/useEmployerWorkspace'
import AdminService from '@/services/admin'
import { formatCount, formatDisplayDate } from '@/utils/admin'

const { Paragraph, Title } = Typography

const EmployerManageJobPage = () => {
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<string | 'all'>('all')
    const [submitting, setSubmitting] = useState(false)
    const [createOpen, setCreateOpen] = useState(false)
    const [viewingJob, setViewingJob] = useState<EmployerJobRecord | null>(null)
    const [editingJob, setEditingJob] = useState<EmployerJobRecord | null>(null)
    const [deletingJob, setDeletingJob] = useState<EmployerJobRecord | null>(null)

    const {
        applicationRows,
        loading,
        recruitmentRequests,
        managedDepartments,
        jobPositions,
        currentDepartment,
        reload,
    } = useEmployerWorkspace()

    const rows = useMemo<EmployerJobRecord[]>(() => {
        const departmentById = new Map(
            managedDepartments.map((department) => [department.id, department])
        )
        const jobPositionById = new Map(
            jobPositions.map((jobPosition) => [jobPosition.id, jobPosition])
        )

        return recruitmentRequests.map((job) => {
            const applicants = applicationRows.filter(
                (row) => row.application.recruitmentRequestId === job.id
            ).length
            const department = departmentById.get(job.departmentId)
            const jobPosition = jobPositionById.get(job.jobPositionId)

            return mapRecruitmentRequestToEmployerJobRecord(
                job,
                department?.name || 'Đơn vị tuyển dụng',
                jobPosition?.name || 'Chưa gắn vị trí',
                applicants
            )
        })
    }, [applicationRows, jobPositions, managedDepartments, recruitmentRequests])

    const departmentOptions = useMemo(
        () => mapDepartmentOptions(managedDepartments),
        [managedDepartments]
    )

    const jobPositionOptions = useMemo(() => {
        const managedDepartmentIds = new Set(
            managedDepartments.map((department) => department.id)
        )

        return mapJobPositionOptions(
            jobPositions.filter((jobPosition) =>
                managedDepartmentIds.has(jobPosition.departmentId)
            )
        )
    }, [jobPositions, managedDepartments])

    const dataSource = useMemo(
        () =>
            rows.filter((job) => {
                const normalized = search.trim().toLowerCase()
                const matchesSearch =
                    !normalized ||
                    job.title.toLowerCase().includes(normalized) ||
                    job.requestCode.toLowerCase().includes(normalized) ||
                    job.departmentName.toLowerCase().includes(normalized) ||
                    job.jobPositionName.toLowerCase().includes(normalized)
                const matchesStatus =
                    status === 'all' || String(job.status) === String(status)

                return matchesSearch && matchesStatus
            }),
        [rows, search, status]
    )

    const handleCreateJob = async (values: EmployerJobFormValues) => {
        setSubmitting(true)
        try {
            await AdminService.createRecruitmentRequest(
                mapEmployerJobFormToCreateDto(values)
            )
            notification.success({
                message: 'Tạo tin tuyển dụng thành công',
                description:
                    'Tin tuyển dụng mới đã được lưu vào hệ thống tuyển dụng.',
            })
            setCreateOpen(false)
            await reload()
        } catch {
            notification.error({
                message: 'Không thể tạo tin tuyển dụng',
                description:
                    'Vui lòng kiểm tra lại thông tin hoặc quyền truy cập rồi thử lại.',
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleUpdateJob = async (values: EmployerJobFormValues) => {
        if (!editingJob) return

        setSubmitting(true)
        try {
            await AdminService.updateRecruitmentRequest(
                editingJob.id,
                mapEmployerJobFormToUpdateDto(values)
            )
            notification.success({
                message: 'Cập nhật tin tuyển dụng thành công',
                description:
                    'Thông tin tin tuyển dụng đã được cập nhật trên hệ thống.',
            })
            setEditingJob(null)
            await reload()
        } catch {
            notification.error({
                message: 'Không thể cập nhật tin tuyển dụng',
                description:
                    'Vui lòng thử lại sau hoặc kiểm tra quyền thao tác của tài khoản.',
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteJob = async () => {
        if (!deletingJob) return

        setSubmitting(true)
        try {
            await AdminService.deleteRecruitmentRequest(deletingJob.id)
            notification.success({
                message: 'Xóa tin tuyển dụng thành công',
                description:
                    'Tin tuyển dụng đã được gỡ khỏi danh sách quản lý của đơn vị.',
            })
            setDeletingJob(null)
            await reload()
        } catch {
            notification.error({
                message: 'Không thể xóa tin tuyển dụng',
                description:
                    'Backend có thể đang chặn thao tác này vì dữ liệu đã phát sinh liên quan.',
            })
        } finally {
            setSubmitting(false)
        }
    }

    const columns: ColumnsType<EmployerJobRecord> = [
        {
            title: 'Vị trí',
            dataIndex: 'title',
            key: 'title',
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{record.title}</div>
                    <div className="portal-muted">
                        {record.requestCode} • {record.jobPositionName}
                    </div>
                </div>
            ),
        },
        {
            title: 'Đơn vị',
            dataIndex: 'departmentName',
            key: 'departmentName',
        },
        {
            title: 'Địa điểm',
            dataIndex: 'workLocation',
            key: 'workLocation',
        },
        {
            title: 'Chỉ tiêu',
            dataIndex: 'headcount',
            key: 'headcount',
            align: 'right',
            render: (value: number) => formatCount(value),
        },
        {
            title: 'Ứng viên',
            dataIndex: 'applicants',
            key: 'applicants',
            align: 'right',
            render: (value: number) => formatCount(value),
        },
        {
            title: 'Mức lương',
            dataIndex: 'salaryText',
            key: 'salaryText',
        },
        {
            title: 'Hạn nộp',
            dataIndex: 'applicationDeadline',
            key: 'applicationDeadline',
            render: (value: string) => formatDisplayDate(value),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'statusLabel',
            key: 'statusLabel',
            render: (_: string, record) => (
                <Tag color={record.statusColor}>{record.statusLabel}</Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => setViewingJob(record)}>
                        Xem
                    </Button>
                    <Button icon={<EditOutlined />} onClick={() => setEditingJob(record)}>
                        Sửa
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => setDeletingJob(record)}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ]

    const statusOptions = useMemo(
        () => [
            { label: 'Tất cả trạng thái', value: 'all' },
            ...Array.from(
                new Map(
                    rows.map((row) => [
                        String(row.status),
                        {
                            label: row.statusLabel,
                            value: String(row.status),
                        },
                    ])
                ).values()
            ),
        ],
        [rows]
    )

    return (
        <div className="portal-page">
            <section className="portal-hero portal-hero--light">
                <span className="portal-hero__eyebrow">Tin tuyển dụng</span>
                <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    align="start"
                    wrap
                >
                    <div>
                        <Title level={2}>Quản lý tin tuyển dụng</Title>
                        <Paragraph style={{ maxWidth: 720 }}>
                            Danh sách tin tuyển dụng của đơn vị được lấy trực tiếp từ
                            API tuyển dụng, hỗ trợ tạo mới, cập nhật, xem chi tiết và
                            xóa ngay trên giao diện quản lý employer.
                        </Paragraph>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        disabled={!managedDepartments.length}
                        onClick={() => setCreateOpen(true)}
                    >
                        Tạo tin mới
                    </Button>
                </Space>
            </section>

            <Card className="portal-section-card">
                <Space wrap size="middle" style={{ width: '100%' }}>
                    <Input
                        allowClear
                        size="large"
                        prefix={<SearchOutlined />}
                        placeholder="Tìm theo tên vị trí, mã phiếu hoặc đơn vị..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        style={{ width: 320, height: 40 }}
                    />
                    <Select
                        size="large"
                        value={status}
                        onChange={setStatus}
                        style={{ width: 240 }}
                        options={statusOptions}
                    />
                    <Button
                        style={{ height: 40 }}
                        size="large"
                        icon={<FilterOutlined />}
                    >
                        Lọc
                    </Button>
                </Space>
            </Card>

            <Card className="portal-section-card">
                <Table
                    rowKey="id"
                    loading={loading}
                    columns={columns}
                    dataSource={dataSource}
                    pagination={{ pageSize: 8 }}
                    locale={{
                        emptyText: managedDepartments.length
                            ? 'Chưa có tin tuyển dụng phù hợp'
                            : 'Tài khoản này chưa được gán đơn vị để quản lý tin tuyển dụng',
                    }}
                />
            </Card>

            <CreateEmployerJobModal
                open={createOpen}
                defaultDepartmentId={currentDepartment?.id}
                departmentOptions={departmentOptions}
                jobPositionOptions={jobPositionOptions}
                submitting={submitting}
                onCancel={() => setCreateOpen(false)}
                onSubmit={handleCreateJob}
            />

            <ViewEmployerJobModal
                open={Boolean(viewingJob)}
                job={viewingJob}
                onCancel={() => setViewingJob(null)}
            />

            <UpdateEmployerJobModal
                open={Boolean(editingJob)}
                job={editingJob}
                departmentOptions={departmentOptions}
                jobPositionOptions={jobPositionOptions}
                submitting={submitting}
                onCancel={() => setEditingJob(null)}
                onSubmit={handleUpdateJob}
            />

            <DeleteEmployerJobModal
                open={Boolean(deletingJob)}
                job={deletingJob}
                submitting={submitting}
                onCancel={() => setDeletingJob(null)}
                onConfirm={handleDeleteJob}
            />
        </div>
    )
}

export default EmployerManageJobPage
