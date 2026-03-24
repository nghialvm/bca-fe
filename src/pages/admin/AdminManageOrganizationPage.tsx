import { useEffect, useMemo, useState } from 'react'

import {
    Button,
    Card,
    Empty,
    Input,
    Select,
    Skeleton,
    Space,
    Tag,
    Typography,
    notification,
} from 'antd'

import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    FileTextOutlined,
    IdcardOutlined,
    MailOutlined,
    PhoneOutlined,
    PlusOutlined,
    SearchOutlined,
    ShopOutlined,
    TeamOutlined,
} from '@ant-design/icons'

import CreateAdminOrganizationModal from '@/components/modals/CreateAdminOrganizationModal'
import DeleteAdminOrganizationModal from '@/components/modals/DeleteAdminOrganizationModal'
import UpdateAdminOrganizationModal from '@/components/modals/UpdateAdminOrganizationModal'
import ViewAdminOrganizationModal from '@/components/modals/ViewAdminOrganizationModal'
import {
    type AdminOrganizationFormValues,
    type AdminOrganizationRecord,
    mapDepartmentToAdminOrganizationRecord,
    mapIdentityUsersToOrganizationManagerOptions,
} from '@/components/modals/adminOrganizationModal.shared'
import AdminService, {
    DepartmentDto,
    IdentityUserDto,
    RecruitmentRequestDto,
} from '@/services/admin'
import { formatCount, isRecruitmentRequestActive } from '@/utils/admin'

import styles from '../styles/AdminUi.module.css'

const AdminManageOrganizationPage = () => {
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<string | undefined>()
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [organizations, setOrganizations] = useState<AdminOrganizationRecord[]>(
        []
    )
    const [managerUsers, setManagerUsers] = useState<IdentityUserDto[]>([])
    const [createOpen, setCreateOpen] = useState(false)
    const [viewingOrganization, setViewingOrganization] =
        useState<AdminOrganizationRecord | null>(null)
    const [editingOrganization, setEditingOrganization] =
        useState<AdminOrganizationRecord | null>(null)
    const [deletingOrganization, setDeletingOrganization] =
        useState<AdminOrganizationRecord | null>(null)

    const loadOrganizations = async () => {
        setLoading(true)
        try {
            const [departmentResponse, userResponse, recruitmentResponse] =
                await Promise.all([
                    AdminService.getDepartments({
                        Sorting: 'name asc',
                        MaxResultCount: 1000,
                    }),
                    AdminService.getIdentityUsers({
                        Sorting: 'userName asc',
                        MaxResultCount: 1000,
                    }),
                    AdminService.getRecruitmentRequests({
                        Sorting: 'creationTime desc',
                        MaxResultCount: 1000,
                    }),
                ])

            const departments = (departmentResponse?.items ||
                []) as DepartmentDto[]
            const users = (userResponse?.items || []) as IdentityUserDto[]
            const recruitments = (recruitmentResponse?.items ||
                []) as RecruitmentRequestDto[]

            const usersById = new Map(users.map((item) => [item.id, item]))
            const recruitmentCountByDepartment = recruitments.reduce(
                (accumulator, item) => {
                    if (isRecruitmentRequestActive(item.status)) {
                        accumulator[item.departmentId] =
                            (accumulator[item.departmentId] || 0) + 1
                    }

                    return accumulator
                },
                {} as Record<string, number>
            )

            setManagerUsers(users)
            setOrganizations(
                departments.map((department) =>
                    mapDepartmentToAdminOrganizationRecord(
                        department,
                        department.managerUserId
                            ? usersById.get(department.managerUserId)
                            : undefined,
                        recruitmentCountByDepartment[department.id] || 0
                    )
                )
            )
        } catch {
            notification.error({
                message: 'Không tải được danh sách đơn vị',
                description: 'Kiểm tra quyền truy cập hoặc trạng thái API backend.',
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadOrganizations()
    }, [])

    const managerOptions = useMemo(
        () => mapIdentityUsersToOrganizationManagerOptions(managerUsers),
        [managerUsers]
    )

    const filteredOrganizations = useMemo(() => {
        return organizations.filter((organization) => {
            const keyword = search.trim().toLowerCase()
            const matchesKeyword =
                !keyword ||
                organization.name.toLowerCase().includes(keyword) ||
                organization.code.toLowerCase().includes(keyword)

            return matchesKeyword && (!status || organization.statusLabel === status)
        })
    }, [organizations, search, status])

    const totalUsers = organizations.reduce((sum, item) => sum + item.users, 0)
    const totalRecruitments = organizations.reduce(
        (sum, item) => sum + item.activeRecruitments,
        0
    )

    const normalizeOrganizationPayload = (
        values: AdminOrganizationFormValues
    ) => ({
        code: values.code.trim(),
        name: values.name.trim(),
        managerUserId: values.managerUserId || null,
        description: values.description.trim(),
        isActive: values.isActive,
    })

    const handleCreateOrganization = async (
        values: AdminOrganizationFormValues
    ) => {
        setSubmitting(true)
        try {
            await AdminService.createDepartment(
                normalizeOrganizationPayload(values)
            )
            notification.success({
                message: 'Đã tạo đơn vị',
                description: values.name.trim(),
            })
            setCreateOpen(false)
            await loadOrganizations()
        } catch {
            notification.error({
                message: 'Tạo đơn vị thất bại',
                description:
                    'Backend từ chối dữ liệu hoặc bạn chưa có quyền tạo đơn vị.',
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleUpdateOrganization = async (
        values: AdminOrganizationFormValues
    ) => {
        if (!editingOrganization) return

        setSubmitting(true)
        try {
            await AdminService.updateDepartment(
                editingOrganization.id,
                normalizeOrganizationPayload(values)
            )
            notification.success({
                message: 'Đã cập nhật đơn vị',
                description: values.name.trim(),
            })
            setEditingOrganization(null)
            await loadOrganizations()
        } catch {
            notification.error({
                message: 'Cập nhật đơn vị thất bại',
                description:
                    'Backend từ chối dữ liệu hoặc bạn chưa có quyền cập nhật đơn vị.',
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteOrganization = async () => {
        if (!deletingOrganization) return

        setSubmitting(true)
        try {
            await AdminService.deleteDepartment(deletingOrganization.id)
            notification.success({
                message: 'Đã xóa đơn vị',
                description: deletingOrganization.name,
            })
            setDeletingOrganization(null)
            await loadOrganizations()
        } catch {
            notification.error({
                message: 'Xóa đơn vị thất bại',
                description:
                    'Đơn vị có thể đang được tham chiếu bởi dữ liệu khác hoặc bạn chưa có quyền xóa.',
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className={styles.page}>
            <section className="portal-hero portal-hero--light">
                <span className={styles.portalEyebrow}>Đơn vị</span>
                <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    align="start"
                    wrap
                >
                    <div>
                        <Typography.Title level={2}>
                            Quản lý danh sách đơn vị
                        </Typography.Title>
                        <Typography.Paragraph style={{ maxWidth: 720 }}>
                            Đồng bộ danh mục phòng ban từ backend, đồng thời cho
                            phép admin thêm, cập nhật và xóa đơn vị ngay trên
                            giao diện quản trị.
                        </Typography.Paragraph>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => setCreateOpen(true)}
                    >
                        Thêm đơn vị
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
                        placeholder="Tìm kiếm đơn vị theo tên hoặc mã..."
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <Select
                        allowClear
                        size="large"
                        placeholder="Tất cả trạng thái"
                        style={{ minWidth: 220 }}
                        options={[
                            { value: 'Hoạt động', label: 'Hoạt động' },
                            { value: 'Tạm dừng', label: 'Tạm dừng' },
                        ]}
                        onChange={(value) => setStatus(value)}
                    />
                </div>
            </Card>

            <div className={styles.metricGrid}>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <ShopOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>
                            {formatCount(organizations.length)}
                        </div>
                        <div className={styles.metricLabel}>Tổng đơn vị</div>
                    </div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <TeamOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>
                            {formatCount(totalUsers)}
                        </div>
                        <div className={styles.metricLabel}>Đầu mối quản lý</div>
                    </div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <ShopOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>
                            {formatCount(totalRecruitments)}
                        </div>
                        <div className={styles.metricLabel}>
                            Tin tuyển dụng đang hoạt động
                        </div>
                    </div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <ShopOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>
                            {formatCount(
                                organizations.filter((item) => item.isActive)
                                    .length
                            )}
                        </div>
                        <div className={styles.metricLabel}>Đơn vị hoạt động</div>
                    </div>
                </div>
            </div>

            {loading ? (
                <Card variant="borderless" className={styles.sectionCard}>
                    <Skeleton active paragraph={{ rows: 10 }} />
                </Card>
            ) : filteredOrganizations.length ? (
                <div className={styles.cardGrid}>
                    {filteredOrganizations.map((organization) => (
                        <Card
                            key={organization.key}
                            variant="borderless"
                            className={styles.infoCard}
                        >
                            <div className={styles.cardContent}>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        gap: 12,
                                    }}
                                >
                                    <div className={styles.metricIcon}>
                                        <ShopOutlined />
                                    </div>
                                    <Tag
                                        color={
                                            organization.isActive
                                                ? 'success'
                                                : 'warning'
                                        }
                                        className={styles.statusTag}
                                    >
                                        {organization.statusLabel}
                                    </Tag>
                                </div>

                                <div style={{ marginTop: 18 }}>
                                    <div className={styles.tableMainText}>
                                        {organization.name}
                                    </div>
                                    <div className={styles.tableSubText}>
                                        {organization.code}
                                    </div>
                                </div>

                                <div className={styles.detailList}>
                                    <div className={styles.detailItem}>
                                        <IdcardOutlined
                                            className={styles.detailIcon}
                                        />
                                        <span>{organization.managerName}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <FileTextOutlined
                                            className={styles.detailIcon}
                                        />
                                        <span>{organization.description}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <PhoneOutlined
                                            className={styles.detailIcon}
                                        />
                                        <span>{organization.managerPhone}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <MailOutlined
                                            className={styles.detailIcon}
                                        />
                                        <span
                                            style={{ overflowWrap: 'anywhere' }}
                                        >
                                            {organization.managerEmail}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.splitStats}>
                                    <div>
                                        <div className={styles.splitValue}>
                                            {formatCount(organization.users)}
                                        </div>
                                        <div className={styles.splitLabel}>
                                            Đầu mối
                                        </div>
                                    </div>
                                    <div>
                                        <div className={styles.splitValue}>
                                            {formatCount(
                                                organization.activeRecruitments
                                            )}
                                        </div>
                                        <div className={styles.splitLabel}>
                                            Tin tuyển dụng
                                        </div>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 8,
                                        marginTop: 'auto',
                                    }}
                                >
                                    <Button
                                        icon={<EyeOutlined />}
                                        onClick={() =>
                                            setViewingOrganization(organization)
                                        }
                                    >
                                        Xem
                                    </Button>
                                    <Button
                                        icon={<EditOutlined />}
                                        onClick={() =>
                                            setEditingOrganization(organization)
                                        }
                                    >
                                        Sửa
                                    </Button>
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() =>
                                            setDeletingOrganization(organization)
                                        }
                                    >
                                        Xóa
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card variant="borderless" className={styles.sectionCard}>
                    <Empty description="Không có đơn vị phù hợp bộ lọc hiện tại" />
                </Card>
            )}

            <CreateAdminOrganizationModal
                open={createOpen}
                managerOptions={managerOptions}
                submitting={submitting}
                onCancel={() => {
                    if (!submitting) setCreateOpen(false)
                }}
                onSubmit={handleCreateOrganization}
            />

            <ViewAdminOrganizationModal
                open={Boolean(viewingOrganization)}
                organization={viewingOrganization}
                onCancel={() => setViewingOrganization(null)}
            />

            <UpdateAdminOrganizationModal
                open={Boolean(editingOrganization)}
                organization={editingOrganization}
                managerOptions={managerOptions}
                submitting={submitting}
                onCancel={() => {
                    if (!submitting) setEditingOrganization(null)
                }}
                onSubmit={handleUpdateOrganization}
            />

            <DeleteAdminOrganizationModal
                open={Boolean(deletingOrganization)}
                organization={deletingOrganization}
                submitting={submitting}
                onCancel={() => {
                    if (!submitting) setDeletingOrganization(null)
                }}
                onConfirm={handleDeleteOrganization}
            />
        </div>
    )
}

export default AdminManageOrganizationPage
