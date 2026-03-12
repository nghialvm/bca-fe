import { useMemo, useState } from 'react'

import { Button, Card, Input, Select, Tag } from 'antd'

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

import AdminPageHeader from './AdminPageHeader'
import styles from './AdminUi.module.css'
import { organizations } from './adminData'

const AdminManageOrganizationPage = () => {
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<string | undefined>()

    const filteredOrganizations = useMemo(() => {
        return organizations.filter((organization) => {
            const keyword = search.trim().toLowerCase()
            const matchesKeyword =
                !keyword ||
                organization.name.toLowerCase().includes(keyword) ||
                organization.code.toLowerCase().includes(keyword)

            return matchesKeyword && (!status || organization.status === status)
        })
    }, [search, status])

    const totalUsers = organizations.reduce((sum, item) => sum + item.users, 0)
    const totalRecruitments = organizations.reduce(
        (sum, item) => sum + item.activeRecruitments,
        0
    )

    return (
        <div className={styles.page}>
            <AdminPageHeader
                title="Quản lý đơn vị"
                subtitle="Quản trị danh mục đơn vị tham gia tuyển dụng và tài khoản đầu mối của từng đơn vị."
                extra={
                    <Button type="primary" size="large" icon={<PlusOutlined />}>
                        Thêm đơn vị
                    </Button>
                }
            />

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
                            {organizations.length}
                        </div>
                        <div className={styles.metricLabel}>Tổng đơn vị</div>
                    </div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <TeamOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>{totalUsers}</div>
                        <div className={styles.metricLabel}>
                            Tổng người dùng
                        </div>
                    </div>
                </div>
                <div className={styles.metricBox}>
                    <div className={styles.metricIcon}>
                        <ShopOutlined />
                    </div>
                    <div>
                        <div className={styles.metricValue}>
                            {totalRecruitments}
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
                            {
                                organizations.filter(
                                    (item) => item.status === 'Hoạt động'
                                ).length
                            }
                        </div>
                        <div className={styles.metricLabel}>
                            Đơn vị hoạt động
                        </div>
                    </div>
                </div>
            </div>

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
                                    <span style={{ overflowWrap: 'anywhere' }}>
                                        {organization.email}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.splitStats}>
                                <div>
                                    <div className={styles.splitValue}>
                                        {organization.users}
                                    </div>
                                    <div className={styles.splitLabel}>
                                        Người dùng
                                    </div>
                                </div>
                                <div>
                                    <div className={styles.splitValue}>
                                        {organization.activeRecruitments}
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
        </div>
    )
}

export default AdminManageOrganizationPage
