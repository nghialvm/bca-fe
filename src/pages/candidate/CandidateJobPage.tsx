import { useMemo, useState } from 'react'

import {
    Button,
    Card,
    Col,
    DatePicker,
    Empty,
    Form,
    Input,
    InputNumber,
    Modal,
    Row,
    Select,
    Space,
    Tag,
    Typography,
    Upload,
    notification,
} from 'antd'

import {
    EnvironmentOutlined,
    FilterOutlined,
    SearchOutlined,
    TeamOutlined,
    UploadOutlined,
} from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import dayjs, { type Dayjs } from 'dayjs'

import { useCandidateWorkspace } from '@/hooks/useCandidateWorkspace'
import useDebounce from '@/hooks/useDebounce'
import type { CandidatePortalJobDto } from '@/services/candidate'
import { formatSalaryRange } from '@/utils/candidate'

const { Paragraph, Text, Title } = Typography
const SEARCH_DEBOUNCE_MS = 400

type ApplyFormValues = {
    fullName: string
    email: string
    phoneNumber: string
    address: string
    dateOfBirth?: Dayjs | null
    identityNumber: string
    currentCompany?: string
    currentPosition: string
    yearsOfExperience: number
    highestEducation: string
    universityName?: string
    major?: string
    note?: string
    gender?: number | null
}

const CandidateJobPage = () => {
    const [searchInput, setSearchInput] = useState('')
    const [department, setDepartment] = useState<string>('all')
    const [location, setLocation] = useState<string>('all')
    const [applyingJob, setApplyingJob] =
        useState<CandidatePortalJobDto | null>(null)
    const [cvFileList, setCvFileList] = useState<UploadFile[]>([])
    const [form] = Form.useForm<ApplyFormValues>()
    const { jobs, loading, profile, applyToJob, applyingJobId } =
        useCandidateWorkspace()
    const search = useDebounce(searchInput, SEARCH_DEBOUNCE_MS)

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

                const matchesSearch =
                    !normalized || haystack.includes(normalized)
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
        form.setFieldsValue({
            fullName: profile?.fullName || '',
            email: profile?.email || '',
            phoneNumber: profile?.phoneNumber || '',
            address: profile?.address || '',
            dateOfBirth: profile?.dateOfBirth
                ? dayjs(profile.dateOfBirth)
                : null,
            identityNumber: profile?.identityNumber || '',
            currentCompany: profile?.currentCompany || '',
            currentPosition: profile?.currentPosition || '',
            yearsOfExperience: profile?.yearsOfExperience ?? 0,
            highestEducation: profile?.highestEducation || '',
            universityName: profile?.universityName || '',
            major: profile?.major || '',
            note: '',
            gender: null,
        })
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
        const success = await applyToJob(
            applyingJob.id,
            cvFile,
            {
                fullName: values.fullName,
                email: values.email,
                phoneNumber: values.phoneNumber,
                address: values.address,
                dateOfBirth: values.dateOfBirth?.toISOString() ?? null,
                gender: values.gender,
                identityNumber: values.identityNumber,
                currentCompany: values.currentCompany,
                currentPosition: values.currentPosition,
                yearsOfExperience: values.yearsOfExperience,
                highestEducation: values.highestEducation,
                universityName: values.universityName,
                major: values.major,
            },
            values.note
        )

        if (success) {
            resetApplyModal()
        }
    }

    return (
        <div className="portal-page">
            <section className="portal-hero">
                <span className="portal-hero__eyebrow">Việc làm phù hợp</span>
                <Title level={2}>Danh sách vị trí đang mở cho ứng viên</Title>
                <Paragraph style={{ maxWidth: 720, color: '#fff' }}>
                    Trang việc làm đã được nối với candidate portal API, tự động
                    đồng bộ danh sách đợt tuyển dụng đang mở và trạng thái ứng
                    tuyển của bạn.
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
                            value={searchInput}
                            onChange={(event) =>
                                setSearchInput(event.target.value)
                            }
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
                            ? dayjs(job.applicationDeadline).diff(
                                  dayjs(),
                                  'day'
                              )
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
                                                    style={{
                                                        margin: '12px 0 8px',
                                                    }}
                                                >
                                                    {job.title}
                                                </Title>
                                                <Text className="portal-muted">
                                                    {job.departmentName}
                                                </Text>
                                            </div>
                                            <Tag
                                                color={
                                                    job.hasApplied
                                                        ? 'blue'
                                                        : 'green'
                                                }
                                            >
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
                                                {job.workLocation ||
                                                    'Chưa cập nhật'}
                                            </Text>
                                            <Text>
                                                <TeamOutlined /> Số lượng:{' '}
                                                {job.headcount} người
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
                                                type={
                                                    job.hasApplied
                                                        ? 'default'
                                                        : 'primary'
                                                }
                                                disabled={job.hasApplied}
                                                loading={
                                                    applyingJobId === job.id
                                                }
                                                onClick={() =>
                                                    handleOpenApplyModal(job)
                                                }
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
                <Card
                    className="portal-section-card portal-empty"
                    loading={loading}
                >
                    <Empty
                        description="Không tìm thấy vị trí phù hợp với bộ lọc hiện tại"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </Card>
            )}

            <Modal
                title="Nộp hồ sơ ứng tuyển"
                open={Boolean(applyingJob)}
                width="50%"
                onCancel={resetApplyModal}
                onOk={() => void handleSubmitApplication()}
                okText="Gửi hồ sơ"
                cancelText="Hủy"
                confirmLoading={Boolean(
                    applyingJob && applyingJobId === applyingJob.id
                )}
                destroyOnHidden
            >
                {applyingJob ? (
                    <Space
                        direction="vertical"
                        size={16}
                        style={{ width: '100%' }}
                    >
                        <div>
                            <Title level={4} style={{ marginBottom: 4 }}>
                                {applyingJob.title}
                            </Title>
                            <Text className="portal-muted">
                                {applyingJob.departmentName} -{' '}
                                {applyingJob.requestCode}
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
                                            file.name
                                                .toLowerCase()
                                                .endsWith('.pdf')
                                        if (!isPdf) {
                                            notification.error({
                                                message:
                                                    'Chỉ chấp nhận file PDF',
                                            })
                                            return Upload.LIST_IGNORE
                                        }
                                        if (file.size > 10 * 1024 * 1024) {
                                            notification.error({
                                                message:
                                                    'File CV vượt quá 10MB',
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

                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Họ và tên"
                                        name="fullName"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Vui lòng nhập họ và tên',
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Nguyễn Văn A" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Vui lòng nhập email',
                                            },
                                            {
                                                type: 'email',
                                                message: 'Email không hợp lệ',
                                            },
                                        ]}
                                    >
                                        <Input placeholder="candidate@example.com" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Ngày sinh"
                                        name="dateOfBirth"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Vui lòng chọn ngày sinh',
                                            },
                                        ]}
                                    >
                                        <DatePicker
                                            format="DD/MM/YYYY"
                                            placeholder="Chọn ngày sinh"
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="CCCD"
                                        name="identityNumber"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Vui lòng nhập số CCCD',
                                            },
                                        ]}
                                    >
                                        <Input placeholder="012345678901" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Số điện thoại"
                                        name="phoneNumber"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Vui lòng nhập số điện thoại',
                                            },
                                        ]}
                                    >
                                        <Input placeholder="0901234567" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Kinh nghiệm (năm)"
                                        name="yearsOfExperience"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Vui lòng nhập số năm kinh nghiệm',
                                            },
                                        ]}
                                    >
                                        <InputNumber
                                            min={0}
                                            max={50}
                                            precision={0}
                                            style={{ width: '100%' }}
                                            placeholder="Ví dụ: 2"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                label="Giới tính"
                                name="gender"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn giới tính',
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="Chọn giới tính"
                                    options={[
                                        { label: 'Nam', value: 1 },
                                        { label: 'Nữ', value: 2 },
                                        { label: 'Khác', value: 3 },
                                    ]}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Địa chỉ"
                                name="address"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập địa chỉ',
                                    },
                                ]}
                            >
                                <Input placeholder="Quận 1, TP.HCM" />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Công ty hiện tại"
                                        name="currentCompany"
                                    >
                                        <Input placeholder="Công ty hiện tại của bạn" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Vị trí hiện tại"
                                        name="currentPosition"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Vui lòng nhập vị trí hiện tại',
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Frontend Developer" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Trình độ học vấn"
                                        name="highestEducation"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Vui lòng chọn trình độ học vấn',
                                            },
                                        ]}
                                    >
                                        <Select
                                            placeholder="Chọn trình độ"
                                            options={[
                                                {
                                                    label: 'THPT',
                                                    value: 'THPT',
                                                },
                                                {
                                                    label: 'Trung cấp',
                                                    value: 'Trung cấp',
                                                },
                                                {
                                                    label: 'Cao đẳng',
                                                    value: 'Cao đẳng',
                                                },
                                                {
                                                    label: 'Đại học',
                                                    value: 'Đại học',
                                                },
                                                {
                                                    label: 'Thạc sĩ',
                                                    value: 'Thạc sĩ',
                                                },
                                                {
                                                    label: 'Tiến sĩ',
                                                    value: 'Tiến sĩ',
                                                },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Trường"
                                        name="universityName"
                                    >
                                        <Input placeholder="Tên trường / cơ sở đào tạo" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item label="Chuyên ngành" name="major">
                                <Input placeholder="Công nghệ thông tin" />
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
