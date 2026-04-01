import {
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
} from 'antd'
import dayjs, { type Dayjs } from 'dayjs'

import type { InterviewScheduleCreateDto } from '@/services/admin'

export type InterviewFormValues = {
    applicationId?: string
    roundNumber: number
    interviewType: number
    scheduledTime: Dayjs
    durationMinutes: number
    location?: string
    meetingLink?: string
    contactPerson?: string
    note?: string
    status: number
}

type ApplicationOption = {
    label: string
    value: string
}

type InterviewScheduleFormFieldsProps = {
    applicationOptions?: ApplicationOption[]
    includeApplication?: boolean
    mode?: 'create' | 'edit'
}

export const interviewTypeOptions = [
    { label: 'Trực tiếp', value: 1 },
    { label: 'Trực tuyến', value: 2 },
    { label: 'Điện thoại', value: 3 },
]

export const interviewStatusOptions = [
    { label: 'Chờ xác nhận', value: 1 },
    { label: 'Đã xác nhận', value: 2 },
    { label: 'Đổi lịch', value: 3 },
    { label: 'Đã hủy', value: 4 },
    { label: 'Hoàn thành', value: 5 },
]

export const createInterviewInitialValues = (
    overrides: Partial<InterviewFormValues> = {}
): Partial<InterviewFormValues> => ({
    roundNumber: 1,
    interviewType: 1,
    scheduledTime: dayjs()
        .add(1, 'day')
        .hour(9)
        .minute(0)
        .second(0)
        .millisecond(0),
    durationMinutes: 60,
    status: 1,
    contactPerson: '',
    location: '',
    meetingLink: '',
    note: '',
    ...overrides,
})

const normalizeTextValue = (value?: string) => value?.trim() || null

export const buildInterviewSchedulePayload = (
    values: InterviewFormValues & { applicationId: string },
    createdByUserId: string
): InterviewScheduleCreateDto => ({
    applicationId: values.applicationId,
    roundNumber: values.roundNumber,
    interviewType: values.interviewType,
    scheduledTime: values.scheduledTime.toISOString(),
    durationMinutes: values.durationMinutes,
    location: normalizeTextValue(values.location),
    meetingLink: normalizeTextValue(values.meetingLink),
    contactPerson: normalizeTextValue(values.contactPerson),
    note: normalizeTextValue(values.note),
    status: values.status,
    createdByUserId,
})

export const InterviewScheduleFormFields = ({
    applicationOptions = [],
    includeApplication = false,
    mode: _mode = 'create',
}: InterviewScheduleFormFieldsProps) => (
    <>
        {includeApplication ? (
            <Form.Item
                label="Hồ sơ ứng tuyển"
                name="applicationId"
                rules={[
                    {
                        required: true,
                        message:
                            'Chọn hồ sơ ứng tuyển cần lên lịch phỏng vấn.',
                    },
                ]}
            >
                <Select
                    showSearch
                    options={applicationOptions}
                    optionFilterProp="label"
                    placeholder="Chọn hồ sơ ứng tuyển"
                />
            </Form.Item>
        ) : null}

        <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
                <Form.Item
                    label="Vòng phỏng vấn"
                    name="roundNumber"
                    rules={[
                        {
                            required: true,
                            message: 'Nhập số vòng phỏng vấn.',
                        },
                    ]}
                >
                    <InputNumber
                        min={1}
                        precision={0}
                        style={{ width: '100%' }}
                    />
                </Form.Item>
            </Col>
            <Col xs={24} md={12}>
                <Form.Item
                    label="Hình thức"
                    name="interviewType"
                    rules={[
                        {
                            required: true,
                            message: 'Chọn hình thức phỏng vấn.',
                        },
                    ]}
                >
                    <Select options={interviewTypeOptions} />
                </Form.Item>
            </Col>
        </Row>

        <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
                <Form.Item
                    label="Thời gian phỏng vấn"
                    name="scheduledTime"
                    rules={[
                        {
                            required: true,
                            message: 'Chọn thời gian phỏng vấn.',
                        },
                    ]}
                >
                    <DatePicker
                        showTime={{ format: 'HH:mm' }}
                        format="DD/MM/YYYY HH:mm"
                        style={{ width: '100%' }}
                        placeholder="Chọn thời gian phỏng vấn"
                    />
                </Form.Item>
            </Col>
            <Col xs={24} md={12}>
                <Form.Item
                    label="Thời lượng (phút)"
                    name="durationMinutes"
                    rules={[
                        {
                            required: true,
                            message: 'Nhập thời lượng phỏng vấn.',
                        },
                    ]}
                >
                    <InputNumber
                        min={1}
                        max={1440}
                        precision={0}
                        style={{ width: '100%' }}
                    />
                </Form.Item>
            </Col>
        </Row>

        <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
                <Form.Item label="Người phụ trách" name="contactPerson">
                    <Input placeholder="Nhập tên người phụ trách" />
                </Form.Item>
            </Col>
            <Col xs={24} md={12}>
                <Form.Item
                    label="Trạng thái lịch phỏng vấn"
                    name="status"
                    rules={[
                        {
                            required: true,
                            message: 'Chọn trạng thái lịch phỏng vấn.',
                        },
                    ]}
                >
                    <Select options={interviewStatusOptions} />
                </Form.Item>
            </Col>
        </Row>

        <Form.Item label="Địa điểm" name="location">
            <Input placeholder="Nhập địa điểm phỏng vấn" />
        </Form.Item>

        <Form.Item label="Link họp" name="meetingLink">
            <Input placeholder="Nhập link họp nếu phỏng vấn online" />
        </Form.Item>

        <Form.Item label="Ghi chú" name="note">
            <Input.TextArea
                rows={4}
                placeholder="Nhập ghi chú cho buổi phỏng vấn"
            />
        </Form.Item>
    </>
)
