import { useMemo, useState } from 'react'

import {
    Button,
    Card,
    Col,
    Empty,
    Form,
    Input,
    Modal,
    notification,
    Row,
    Select,
    Space,
    Tag,
    Typography,
    Upload,
} from 'antd'
import type { UploadFile } from 'antd/es/upload/interface'

import {
    EnvironmentOutlined,
    FilterOutlined,
    SearchOutlined,
    TeamOutlined,
    UploadOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import { useCandidateWorkspace } from '@/hooks/useCandidateWorkspace'
import type { CandidatePortalJobDto } from '@/services/candidate'
import { formatSalaryRange } from '@/utils/candidate'

const { Paragraph, Text, Title } = Typography

type ApplyFormValues = {
    note?: string
}

const CandidateJobPage = () => {
    const [search, setSearch] = useState('')
    const [department, setDepartment] = useState<string>('all')
    const [location, setLocation] = useState<string>('all')
    const [applyingJob, setApplyingJob] = useState<CandidatePortalJobDto | null>(null)
    const [cvFileList, setCvFileList] = useState<UploadFile[]>([])
    const [form] = Form.useForm<ApplyFormValues>()
    const { jobs, loading, applyToJob, applyingJobId } = useCandidateWorkspace()

    const departments = useMemo(
        () => [
            { label: 'Tất cả đơn vị', value: 'all' },
            ...Array.from(new Set(jobs.map((job) => job.departmentName)))
                .filter(Boolean)
                .map((item) => ({
                    label: item,
                    value: item,
                })),
        ],
        [jobs]
    )

    const locations = useMemo(
        () => [
            { label: 'Tất cả địa điểm', value: 'all' },
            ...Array.from(
                new Set(jobs.map((job) => job.workLocation || 'Chưa cập nhật'))
            ).map((item) => ({
                label: item,
                value: item,
            })),
        ],
        [jobs]
    )

    const filteredJobs = useMemo(
        () =>
            jobs.filter((job) => {
                const normalized = search.trim().toLowerCase()
                const haystack = [
                    job.title,
                    job.departmentName,
                    job.jobPositionName,
                    job.description,
                    job.requirement,
                    job.workLocation,
                    job.requestCode,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase()

                const matchesSearch = !normalized || haystack.includes(normalized)
                const matchesDepartment =
                    department === 'all' || job.departmentName === department
                const jobLocation = job.workLocation || 'Chưa cập nhật'
                const matchesLocation =
                    location === 'all' || jobLocation === location

                return matchesSearch && matchesDepartment && matchesLocation
            }),
        [department, jobs, location, search]
    )

    const resetApplyModal = () => {
        setApplyingJob(null)
        setCvFileList([])
        form.resetFields()
    }

    const handleOpenApplyModal = (job: CandidatePortalJobDto) => {
        setApplyingJob(job)
    }

    const handleSubmitApplication = async () => {
        if (!applyingJob) return

        const cvFile = cvFileList[0]?.originFileObj

        if (!cvFile) {
            notification.warning({
                message: 'Vui lòng chọn file CV PDF',
            })
            return
        }

        const values = await form.validateFields()
        const success = await applyToJob(applyingJob.id, cvFile, values.note)

        if (success) {
            resetApplyModal()
        }
    }

    return (
        <div className="portal-page">
            <section className="portal-hero">
                <span className="portal-hero__eyebrow">Việc làm phù hợp</span>
                <Title level={2}>Danh sách vị trí đang mở cho ứng viên</Title>
                <Paragraph style={{ maxWidth: 720 }}>
                    Trang việc làm đã được nối với candidate portal API, tự động
                    đồng bộ danh sách đợt tuyển dụng đang mở và trạng thái ứng tuyển
                    của bạn.
                </Paragraph>
            </section>

            <Card className="portal-section-card">
                <Row gutter={[16, 16]} align="bottom">
                    <Col xs={24} md={12}>
                        <Text strong>Tìm kiếm</Text>
                        <Input
                            allowClear
                            size="large"
                            prefix={<SearchOutlined />}
                            placeholder="Nhập từ khóa, đơn vị, mã phiếu..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </Col>
                    <Col xs={24} md={6}>
                        <Text strong>Đơn vị</Text>
                        <Select
                            size="large"
                            options={departments}
                            value={department}
                            onChange={setDepartment}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={24} md={6}>
                        <Text strong>Địa điểm</Text>
                        <Select
                            size="large"
                            options={locations}
                            value={location}
                            onChange={setLocation}
                            style={{ width: '100%' }}
                        />
                    </Col>
                </Row>
                <Space
                    style={{
                        width: '100%',
                        justifyContent: 'space-between',
                        marginTop: 18,
                    }}
                >
                    <Text className="portal-muted">
                        Tìm thấy {filteredJobs.length} vị trí tuyển dụng đang mở
                    </Text>
                    <Button icon={<FilterOutlined />}>Bộ lọc nhanh</Button>
                </Space>
            </Card>

            {filteredJobs.length ? (
                <Row gutter={[24, 24]}>
                    {filteredJobs.map((job) => {
                        const daysRemaining = job.applicationDeadline
                            ? dayjs(job.applicationDeadline).diff(dayjs(), 'day')
                            : null

                        return (
                            <Col xs={24} md={12} xl={8} key={job.id}>
                                <Card
                                    hoverable
                                    loading={loading}
                                    className="portal-section-card"
                                    style={{ height: '100%' }}
                                >
                                    <Space
                                        direction="vertical"
                                        size={16}
                                        style={{ width: '100%' }}
                                    >
                                        <Space
                                            style={{
                                                width: '100%',
                                                justifyContent: 'space-between',
                                            }}
                                            align="start"
                                        >
                                            <div>
                                                <Tag className="portal-tag-soft">
                                                    {job.requestCode}
                                                </Tag>
                                                <Title
                                                    level={4}
                                                    style={{ margin: '12px 0 8px' }}
                                                >
                                                    {job.title}
                                                </Title>
                                                <Text className="portal-muted">
                                                    {job.departmentName}
                                                </Text>
                                            </div>
                                            <Tag color={job.hasApplied ? 'blue' : 'green'}>
                                                {job.hasApplied
                                                    ? 'Đã ứng tuyển'
                                                    : job.employmentType}
                                            </Tag>
                                        </Space>

                                        <Paragraph className="portal-muted">
                                            {job.description ||
                                                job.requirement ||
                                                'Chưa có mô tả chi tiết cho vị trí này.'}
                                        </Paragraph>

                                        <Space wrap>
                                            <Tag className="portal-tag-soft">
                                                {job.jobPositionName}
                                            </Tag>
                                            <Tag className="portal-tag-soft">
                                                {job.employmentType}
                                            </Tag>
                                            <Tag className="portal-tag-soft">
                                                {job.headcount} chỉ tiêu
                                            </Tag>
                                        </Space>

                                        <Space
                                            direction="vertical"
                                            size={10}
                                            style={{ width: '100%' }}
                                        >
                                            <Text>
                                                <EnvironmentOutlined />{' '}
                                                {job.workLocation || 'Chưa cập nhật'}
                                            </Text>
                                            <Text>
                                                <TeamOutlined /> Số lượng: {job.headcount}{' '}
                                                người
                                            </Text>
                                            <Text strong>
                                                {formatSalaryRange(
                                                    job.salaryMin,
                                                    job.salaryMax
                                                )}
                                            </Text>
                                        </Space>

                                        <Space
                                            style={{
                                                width: '100%',
                                                justifyContent: 'space-between',
                                                paddingTop: 12,
                                                borderTop:
                                                    '1px solid rgba(11, 61, 46, 0.08)',
                                            }}
                                        >
                                            <Text
                                                strong={
                                                    daysRemaining !== null &&
                                                    daysRemaining <= 7
                                                }
                                                type={
                                                    daysRemaining !== null &&
                                                    daysRemaining <= 7
                                                        ? 'danger'
                                                        : undefined
                                                }
                                            >
                                                {daysRemaining === null
                                                    ? 'Không giới hạn hạn nộp'
                                                    : daysRemaining >= 0
                                                      ? `Còn ${daysRemaining} ngày`
                                                      : 'Đã hết hạn'}
                                            </Text>
                                            <Button
                                                type={job.hasApplied ? 'default' : 'primary'}
                                                disabled={job.hasApplied}
                                                loading={applyingJobId === job.id}
                                                onClick={() => handleOpenApplyModal(job)}
                                            >
                                                {job.hasApplied
                                                    ? 'Đã ứng tuyển'
                                                    : 'Ứng tuyển ngay'}
                                            </Button>
                                        </Space>
                                    </Space>
                                </Card>
                            </Col>
                        )
                    })}
                </Row>
            ) : (
                <Card className="portal-section-card portal-empty" loading={loading}>
                    <Empty
                        description="Không tìm thấy vị trí phù hợp với bộ lọc hiện tại"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </Card>
            )}

            <Modal
                title="Nộp hồ sơ ứng tuyển"
                open={Boolean(applyingJob)}
                onCancel={resetApplyModal}
                onOk={() => void handleSubmitApplication()}
                okText="Gửi hồ sơ"
                cancelText="Hủy"
                confirmLoading={Boolean(applyingJob && applyingJobId === applyingJob.id)}
                destroyOnClose
            >
                {applyingJob ? (
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                        <div>
                            <Title level={4} style={{ marginBottom: 4 }}>
                                {applyingJob.title}
                            </Title>
                            <Text className="portal-muted">
                                {applyingJob.departmentName} - {applyingJob.requestCode}
                            </Text>
                        </div>

                        <Form form={form} layout="vertical">
                            <Form.Item
                                label="CV (PDF)"
                                required
                                extra="Chỉ chấp nhận file PDF, dung lượng tối đa 10MB."
                            >
                                <Upload
                                    accept=".pdf,application/pdf"
                                    maxCount={1}
                                    fileList={cvFileList}
                                    beforeUpload={(file) => {
                                        const isPdf =
                                            file.type === 'application/pdf' ||
                                            file.name.toLowerCase().endsWith('.pdf')
                                        if (!isPdf) {
                                            notification.error({
                                                message: 'Chỉ chấp nhận file PDF',
                                            })
                                            return Upload.LIST_IGNORE
                                        }
                                        if (file.size > 10 * 1024 * 1024) {
                                            notification.error({
                                                message: 'File CV vượt quá 10MB',
                                            })
                                            return Upload.LIST_IGNORE
                                        }
                                        setCvFileList([
                                            {
                                                uid: file.uid,
                                                name: file.name,
                                                status: 'done',
                                                originFileObj: file,
                                            },
                                        ])
                                        return false
                                    }}
                                    onRemove={() => {
                                        setCvFileList([])
                                        return true
                                    }}
                                >
                                    <Button icon={<UploadOutlined />}>
                                        Chọn file CV PDF
                                    </Button>
                                </Upload>
                            </Form.Item>

                            <Form.Item label="Ghi chú" name="note">
                                <Input.TextArea
                                    rows={4}
                                    placeholder="Giới thiệu ngắn hoặc ghi chú thêm cho nhà tuyển dụng"
                                />
                            </Form.Item>
                        </Form>
                    </Space>
                ) : null}
            </Modal>
        </div>
    )
}

export default CandidateJobPage
