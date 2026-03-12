import { useMemo, useState } from 'react'

import { Button, Card, Input, Select, Space, Table, Tag } from 'antd'

import {
    CheckCircleOutlined,
    EyeOutlined,
    FileDoneOutlined,
    FilterOutlined,
    SearchOutlined,
    StopOutlined,
} from '@ant-design/icons'

import AdminPageHeader from './AdminPageHeader'
import styles from './AdminUi.module.css'
import { recruitmentStats, recruitments } from './adminData'

const statColors = ['#2f54eb', '#d48806', '#389e0d', '#cf1322']

const AdminManageJobPage = () => {
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<string | undefined>()

    const filteredRecruitments = useMemo(() => {
        return recruitments.filter((recruitment) => {
            const keyword = search.trim().toLowerCase()
            const matchesKeyword =
                !keyword ||
                recruitment.title.toLowerCase().includes(keyword) ||
                recruitment.unit.toLowerCase().includes(keyword)

            return matchesKeyword && (!status || recruitment.status === status)
        })
    }, [search, status])

    return (
        <div className={styles.page}>
            <AdminPageHeader
                title="Quản lý tuyển dụng"
                subtitle="Theo dõi chiến dịch, phê duyệt tin tuyển dụng và giám sát lượng hồ sơ theo từng đơn vị."
            />

            <div className={styles.statsGrid}>
                {recruitmentStats.map((item, index) => (
                    <Card
                        key={item.key}
                        variant="borderless"
                        className={styles.statCard}
                        style={
                            {
                                '--accent-color': statColors[index],
                            } as React.CSSProperties
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
                            { value: 'Chờ duyệt', label: 'Chờ duyệt' },
                            { value: 'Đã duyệt', label: 'Đã duyệt' },
                            { value: 'Từ chối', label: 'Từ chối' },
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
                    dataSource={filteredRecruitments}
                    pagination={{ pageSize: 5 }}
                    columns={[
                        {
                            title: 'Tin tuyển dụng',
                            dataIndex: 'title',
                            key: 'title',
                            render: (
                                _: string,
                                record: (typeof recruitments)[0]
                            ) => (
                                <div className={styles.tableNameCell}>
                                    <span className={styles.tableMainText}>
                                        {record.title}
                                    </span>
                                    <span className={styles.tableSubText}>
                                        {record.position}
                                    </span>
                                </div>
                            ),
                        },
                        {
                            title: 'Đơn vị',
                            dataIndex: 'unit',
                            key: 'unit',
                        },
                        {
                            title: 'Số lượng',
                            dataIndex: 'quantity',
                            key: 'quantity',
                            render: (value: number) => `${value} người`,
                        },
                        {
                            title: 'Hồ sơ',
                            dataIndex: 'applications',
                            key: 'applications',
                            render: (value: number) => (
                                <span className={styles.tableMainText}>
                                    {value} hồ sơ
                                </span>
                            ),
                        },
                        {
                            title: 'Hạn nộp',
                            dataIndex: 'deadline',
                            key: 'deadline',
                        },
                        {
                            title: 'Trạng thái',
                            dataIndex: 'status',
                            key: 'status',
                            render: (value: string) => (
                                <Tag
                                    color={
                                        value === 'Đã duyệt'
                                            ? 'success'
                                            : value === 'Chờ duyệt'
                                              ? 'processing'
                                              : 'error'
                                    }
                                    className={styles.statusTag}
                                >
                                    {value}
                                </Tag>
                            ),
                        },
                        {
                            title: 'Thao tác',
                            key: 'actions',
                            render: (
                                _: unknown,
                                record: (typeof recruitments)[0]
                            ) => (
                                <Space size="small">
                                    <Button icon={<EyeOutlined />} />
                                    {record.status === 'Chờ duyệt' ? (
                                        <>
                                            <Button
                                                type="primary"
                                                icon={<CheckCircleOutlined />}
                                            />
                                            <Button
                                                danger
                                                icon={<StopOutlined />}
                                            />
                                        </>
                                    ) : null}
                                </Space>
                            ),
                        },
                    ]}
                />
            </Card>
        </div>
    )
}

export default AdminManageJobPage
