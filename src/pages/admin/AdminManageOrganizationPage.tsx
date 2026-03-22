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
    EnvironmentOutlined,
    IdcardOutlined,
    MailOutlined,
    PhoneOutlined,
    PlusOutlined,
    SearchOutlined,
    ShopOutlined,
    TeamOutlined,
} from '@ant-design/icons'

import AdminService, {
    DepartmentDto,
    IdentityUserDto,
    RecruitmentRequestDto,
} from '@/services/admin'
import {
    formatCount,
    getDisplayName,
    isRecruitmentRequestActive,
} from '@/utils/admin'

import styles from '../styles/AdminUi.module.css'

type OrganizationViewModel = {
    id: string
    key: string
    name: string
    code: string
    address: string
    contact: string
    phone: string
    email: string
    users: number
    activeRecruitments: number
    status: string
}

const AdminManageOrganizationPage = () => {
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<string | undefined>()
    const [loading, setLoading] = useState(false)
    const [organizations, setOrganizations] = useState<OrganizationViewModel[]>(
        []
    )

    useEffect(() => {
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

                setOrganizations(
                    departments.map((department) => {
                        const manager = department.managerUserId
                            ? usersById.get(department.managerUserId)
                            : undefined

                        return {
                            id: department.id,
                            key: department.id,
                            name: department.name,
                            code: department.code,
                            address:
                                department.description?.trim() ||
                                'Chưa cập nhật mô tả đơn vị',
                            contact: getDisplayName(manager),
                            phone: manager?.phoneNumber || 'Chưa cập nhật',
                            email: manager?.email || 'Chưa cập nhật',
                            users: manager ? 1 : 0,
                            activeRecruitments:
                                recruitmentCountByDepartment[department.id] ||
                                0,
                            status: department.isActive
                                ? 'Hoạt động'
                                : 'Tạm dừng',
                        }
                    })
                )
            } catch (error) {
                notification.error({
                    message: 'Không tải được danh sách đơn vị',
                    description:
                        'Kiểm tra quyền truy cập hoặc trạng thái API backend.',
                })
            } finally {
                setLoading(false)
            }
        }

        void loadOrganizations()
    }, [])

    const filteredOrganizations = useMemo(() => {
        return organizations.filter((organization) => {
            const keyword = search.trim().toLowerCase()
            const matchesKeyword =
                !keyword ||
                organization.name.toLowerCase().includes(keyword) ||
                organization.code.toLowerCase().includes(keyword)

            return matchesKeyword && (!status || organization.status === status)
        })
    }, [organizations, search, status])

    const totalUsers = organizations.reduce((sum, item) => sum + item.users, 0)
    const totalRecruitments = organizations.reduce(
        (sum, item) => sum + item.activeRecruitments,
        0
    )

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
                            Đồng bộ danh mục phòng ban từ backend và hiển thị
                            đầu mối quản lý cùng số lượng đợt tuyển dụng đang
                            hoạt động theo từng đơn vị.
                        </Typography.Paragraph>
                    </div>
                    <Button type="primary" size="large" icon={<PlusOutlined />}>
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
                        <div className={styles.metricLabel}>
                            Đầu mối quản lý
                        </div>
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
                                organizations.filter(
                                    (item) => item.status === 'Hoạt động'
                                ).length
                            )}
                        </div>
                        <div className={styles.metricLabel}>
                            Đơn vị hoạt động
                        </div>
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
                                            organization.status === 'Hoạt động'
                                                ? 'success'
                                                : 'warning'
                                        }
                                        className={styles.statusTag}
                                    >
                                        {organization.status}
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
                                        <span>{organization.contact}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <EnvironmentOutlined
                                            className={styles.detailIcon}
                                        />
                                        <span>{organization.address}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <PhoneOutlined
                                            className={styles.detailIcon}
                                        />
                                        <span>{organization.phone}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <MailOutlined
                                            className={styles.detailIcon}
                                        />
                                        <span
                                            style={{ overflowWrap: 'anywhere' }}
                                        >
                                            {organization.email}
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

                                <Button
                                    block
                                    size="large"
                                    type="default"
                                    style={{ marginTop: 'auto' }}
                                >
                                    Quản lý đơn vị
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card variant="borderless" className={styles.sectionCard}>
                    <Empty description="Không có đơn vị phù hợp bộ lọc hiện tại" />
                </Card>
            )}
        </div>
    )
}

export default AdminManageOrganizationPage
