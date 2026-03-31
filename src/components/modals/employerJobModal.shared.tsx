import { useEffect } from 'react'

import { DatePicker, Form, Input, InputNumber, Select } from 'antd'
import type { FormInstance } from 'antd'

import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

import type {
    DepartmentDto,
    JobPositionDto,
    RecruitmentRequestCreateDto,
    RecruitmentRequestDto,
    RecruitmentRequestUpdateDto,
} from '@/services/admin'
import { formatDisplayDate, formatDisplayDateTime } from '@/utils/admin'
import {
    formatRecruitmentStatus,
    formatSalaryRange,
    getEmploymentTypeLabel,
} from '@/utils/employer'

export type EmployerJobRecord = {
    id: string
    key: string
    requestCode: string
    title: string
    departmentId: string
    departmentName: string
    jobPositionId: string
    jobPositionName: string
    employmentType: string
    headcount: number
    applicants: number
    workLocation: string
    salaryMin?: number | null
    salaryMax?: number | null
    salaryText: string
    description: string
    requirement: string
    benefit: string
    applicationDeadline?: string | null
    creationTime?: string
    status: string | number
    statusLabel: string
    statusColor: string
}

export type EmployerJobFormValues = {
    requestCode: string
    title: string
    departmentId: string
    jobPositionId: string
    employmentType: string
    headcount: number
    workLocation: string
    salaryMin?: number | null
    salaryMax?: number | null
    description: string
    requirement: string
    benefit: string
    applicationDeadline: Dayjs | null
}

export type EmployerDepartmentOption = {
    label: string
    value: string
}

export type EmployerJobPositionOption = {
    label: string
    value: string
    departmentId: string
}

export const EMPLOYMENT_TYPE_OPTIONS = [
    { label: 'Toàn thời gian', value: 'FullTime' },
    { label: 'Bán thời gian', value: 'PartTime' },
    { label: 'Hợp đồng', value: 'Contract' },
]

export const mapDepartmentOptions = (
    departments: DepartmentDto[]
): EmployerDepartmentOption[] =>
    departments.map((department) => ({
        value: department.id,
        label: `${department.code} - ${department.name}`,
    }))

export const mapJobPositionOptions = (
    jobPositions: JobPositionDto[]
): EmployerJobPositionOption[] =>
    jobPositions.map((jobPosition) => ({
        value: jobPosition.id,
        label: `${jobPosition.code} - ${jobPosition.name}`,
        departmentId: jobPosition.departmentId,
    }))

export const mapRecruitmentRequestToEmployerJobRecord = (
    recruitmentRequest: RecruitmentRequestDto,
    departmentName: string,
    jobPositionName: string,
    applicants: number
): EmployerJobRecord => {
    const statusMeta = formatRecruitmentStatus(recruitmentRequest.status)

    return {
        id: recruitmentRequest.id,
        key: recruitmentRequest.id,
        requestCode: recruitmentRequest.requestCode,
        title: recruitmentRequest.title,
        departmentId: recruitmentRequest.departmentId,
        departmentName,
        jobPositionId: recruitmentRequest.jobPositionId,
        jobPositionName,
        employmentType: recruitmentRequest.employmentType || 'FullTime',
        headcount: recruitmentRequest.headcount || 0,
        applicants,
        workLocation: recruitmentRequest.workLocation?.trim() || '-',
        salaryMin: recruitmentRequest.salaryMin,
        salaryMax: recruitmentRequest.salaryMax,
        salaryText: formatSalaryRange(
            recruitmentRequest.salaryMin,
            recruitmentRequest.salaryMax
        ),
        description:
            recruitmentRequest.description?.trim() || 'Chưa cập nhật mô tả',
        requirement:
            recruitmentRequest.requirement?.trim() || 'Chưa cập nhật yêu cầu',
        benefit:
            recruitmentRequest.benefit?.trim() || 'Chưa cập nhật quyền lợi',
        applicationDeadline: recruitmentRequest.applicationDeadline || null,
        creationTime: recruitmentRequest.creationTime,
        status: recruitmentRequest.status,
        statusLabel: statusMeta.label,
        statusColor: statusMeta.color,
    }
}

export const getEmployerJobFormInitialValues = (
    job?: EmployerJobRecord | null,
    fallbackDepartmentId?: string
): EmployerJobFormValues => ({
    requestCode: job?.requestCode || '',
    title: job?.title || '',
    departmentId: job?.departmentId || fallbackDepartmentId || '',
    jobPositionId: job?.jobPositionId || '',
    employmentType: job?.employmentType || 'FullTime',
    headcount: job?.headcount || 1,
    workLocation: job?.workLocation === '-' ? '' : job?.workLocation || '',
    salaryMin: job?.salaryMin ?? undefined,
    salaryMax: job?.salaryMax ?? undefined,
    description:
        job?.description === 'Chưa cập nhật mô tả'
            ? ''
            : job?.description || '',
    requirement:
        job?.requirement === 'Chưa cập nhật yêu cầu'
            ? ''
            : job?.requirement || '',
    benefit:
        job?.benefit === 'Chưa cập nhật quyền lợi' ? '' : job?.benefit || '',
    applicationDeadline: job?.applicationDeadline
        ? dayjs(job.applicationDeadline)
        : null,
})

export const mapEmployerJobFormToCreateDto = (
    values: EmployerJobFormValues
): RecruitmentRequestCreateDto => ({
    requestCode: values.requestCode.trim(),
    title: values.title.trim(),
    departmentId: values.departmentId,
    positionId: values.jobPositionId,
    headcount: Number(values.headcount) || 0,
    employmentType: values.employmentType,
    workLocation: values.workLocation.trim() || undefined,
    salaryMin: values.salaryMin ?? null,
    salaryMax: values.salaryMax ?? null,
    description: values.description.trim() || undefined,
    requirement: values.requirement.trim() || undefined,
    benefit: values.benefit.trim() || undefined,
    applicationDeadline: values.applicationDeadline
        ? values.applicationDeadline.toISOString()
        : null,
})

export const mapEmployerJobFormToUpdateDto = (
    values: EmployerJobFormValues
): RecruitmentRequestUpdateDto => ({
    title: values.title.trim(),
    departmentId: values.departmentId,
    positionId: values.jobPositionId,
    headcount: Number(values.headcount) || 0,
    employmentType: values.employmentType,
    workLocation: values.workLocation.trim() || undefined,
    salaryMin: values.salaryMin ?? null,
    salaryMax: values.salaryMax ?? null,
    description: values.description.trim() || undefined,
    requirement: values.requirement.trim() || undefined,
    benefit: values.benefit.trim() || undefined,
    applicationDeadline: values.applicationDeadline
        ? values.applicationDeadline.toISOString()
        : null,
})

type EmployerJobFormFieldsProps = {
    form: FormInstance<EmployerJobFormValues>
    departmentOptions: EmployerDepartmentOption[]
    jobPositionOptions: EmployerJobPositionOption[]
    mode: 'create' | 'update'
}

export const EmployerJobFormFields = ({
    form,
    departmentOptions,
    jobPositionOptions,
    mode,
}: EmployerJobFormFieldsProps) => {
    const departmentId = Form.useWatch('departmentId', form)

    const filteredJobPositionOptions = jobPositionOptions.filter(
        (option) => !departmentId || option.departmentId === departmentId
    )

    useEffect(() => {
        const currentJobPositionId = form.getFieldValue('jobPositionId')

        if (
            currentJobPositionId &&
            !filteredJobPositionOptions.some(
                (option) => option.value === currentJobPositionId
            )
        ) {
            form.setFieldValue('jobPositionId', undefined)
        }
    }, [filteredJobPositionOptions, form])

    return (
        <>
            <Form.Item
                label="Mã phiếu tuyển dụng"
                name="requestCode"
                rules={[
                    {
                        required: true,
                        whitespace: true,
                        message: 'Vui lòng nhập mã phiếu tuyển dụng',
                    },
                    {
                        max: 50,
                        message: 'Mã phiếu tuyển dụng tối đa 50 ký tự',
                    },
                ]}
            >
                <Input
                    disabled={mode === 'update'}
                    placeholder="Nhập mã phiếu tuyển dụng"
                />
            </Form.Item>

            <Form.Item
                label="Tiêu đề tuyển dụng"
                name="title"
                rules={[
                    {
                        required: true,
                        whitespace: true,
                        message: 'Vui lòng nhập tiêu đề tuyển dụng',
                    },
                    {
                        max: 200,
                        message: 'Tiêu đề tuyển dụng tối đa 200 ký tự',
                    },
                ]}
            >
                <Input placeholder="Nhập tiêu đề tuyển dụng" />
            </Form.Item>

            <Form.Item
                label="Đơn vị tuyển dụng"
                name="departmentId"
                rules={[
                    {
                        required: true,
                        message: 'Vui lòng chọn đơn vị tuyển dụng',
                    },
                ]}
            >
                <Select
                    showSearch
                    optionFilterProp="label"
                    placeholder="Chọn đơn vị tuyển dụng"
                    options={departmentOptions}
                />
            </Form.Item>

            <Form.Item
                label="Vị trí tuyển dụng"
                name="jobPositionId"
                rules={[
                    {
                        required: true,
                        message: 'Vui lòng chọn vị trí tuyển dụng',
                    },
                ]}
            >
                <Select
                    showSearch
                    optionFilterProp="label"
                    placeholder="Chọn vị trí tuyển dụng"
                    options={filteredJobPositionOptions}
                />
            </Form.Item>

            <Form.Item
                label="Loại hình làm việc"
                name="employmentType"
                rules={[
                    {
                        required: true,
                        message: 'Vui lòng chọn loại hình làm việc',
                    },
                ]}
            >
                <Select
                    placeholder="Chọn loại hình làm việc"
                    options={EMPLOYMENT_TYPE_OPTIONS}
                />
            </Form.Item>

            <Form.Item
                label="Chỉ tiêu tuyển dụng"
                name="headcount"
                rules={[
                    {
                        required: true,
                        message: 'Vui lòng nhập chỉ tiêu tuyển dụng',
                    },
                ]}
            >
                <InputNumber
                    min={1}
                    precision={0}
                    style={{ width: '100%' }}
                    placeholder="Nhập số lượng cần tuyển"
                />
            </Form.Item>

            <Form.Item
                label="Địa điểm làm việc"
                name="workLocation"
                rules={[
                    {
                        max: 200,
                        message: 'Địa điểm làm việc tối đa 200 ký tự',
                    },
                ]}
            >
                <Input placeholder="Nhập địa điểm làm việc" />
            </Form.Item>

            <Form.Item label="Mức lương tối thiểu" name="salaryMin">
                <InputNumber
                    min={0}
                    precision={0}
                    style={{ width: '100%' }}
                    placeholder="Nhập lương tối thiểu"
                />
            </Form.Item>

            <Form.Item
                label="Mức lương tối đa"
                name="salaryMax"
                dependencies={['salaryMin']}
                rules={[
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            const salaryMin = getFieldValue('salaryMin')

                            if (
                                value === null ||
                                value === undefined ||
                                salaryMin === null ||
                                salaryMin === undefined ||
                                Number(value) >= Number(salaryMin)
                            ) {
                                return Promise.resolve()
                            }

                            return Promise.reject(
                                new Error(
                                    'Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu'
                                )
                            )
                        },
                    }),
                ]}
            >
                <InputNumber
                    min={0}
                    precision={0}
                    style={{ width: '100%' }}
                    placeholder="Nhập lương tối đa"
                />
            </Form.Item>

            <Form.Item label="Hạn nộp hồ sơ" name="applicationDeadline">
                <DatePicker
                    allowClear
                    format="DD/MM/YYYY"
                    style={{ width: '100%' }}
                    placeholder="Chọn hạn nộp hồ sơ"
                />
            </Form.Item>

            <Form.Item
                label="Mô tả công việc"
                name="description"
                rules={[
                    {
                        max: 4000,
                        message: 'Mô tả công việc tối đa 4000 ký tự',
                    },
                ]}
            >
                <Input.TextArea
                    rows={4}
                    showCount
                    maxLength={4000}
                    placeholder="Nhập mô tả công việc"
                />
            </Form.Item>

            <Form.Item
                label="Yêu cầu ứng viên"
                name="requirement"
                rules={[
                    {
                        max: 4000,
                        message: 'Yêu cầu ứng viên tối đa 4000 ký tự',
                    },
                ]}
            >
                <Input.TextArea
                    rows={4}
                    showCount
                    maxLength={4000}
                    placeholder="Nhập yêu cầu ứng viên"
                />
            </Form.Item>

            <Form.Item
                label="Quyền lợi"
                name="benefit"
                rules={[
                    {
                        max: 4000,
                        message: 'Quyền lợi tối đa 4000 ký tự',
                    },
                ]}
            >
                <Input.TextArea
                    rows={4}
                    showCount
                    maxLength={4000}
                    placeholder="Nhập quyền lợi"
                />
            </Form.Item>
        </>
    )
}

export const getEmployerJobSummaryItems = (job?: EmployerJobRecord | null) => [
    {
        key: 'requestCode',
        label: 'Mã phiếu tuyển dụng',
        value: job?.requestCode || '-',
    },
    {
        key: 'department',
        label: 'Đơn vị tuyển dụng',
        value: job?.departmentName || '-',
    },
    {
        key: 'jobPosition',
        label: 'Vị trí tuyển dụng',
        value: job?.jobPositionName || '-',
    },
    {
        key: 'employmentType',
        label: 'Loại hình làm việc',
        value: getEmploymentTypeLabel(job?.employmentType),
    },
    {
        key: 'headcount',
        label: 'Chỉ tiêu tuyển dụng',
        value: job?.headcount ?? 0,
    },
    {
        key: 'applicants',
        label: 'Số lượng ứng viên',
        value: job?.applicants ?? 0,
    },
    {
        key: 'workLocation',
        label: 'Địa điểm làm việc',
        value: job?.workLocation || '-',
    },
    {
        key: 'salary',
        label: 'Mức lương',
        value: job?.salaryText || '-',
    },
    {
        key: 'deadline',
        label: 'Hạn nộp hồ sơ',
        value: formatDisplayDate(job?.applicationDeadline),
    },
    {
        key: 'createdTime',
        label: 'Ngày tạo',
        value: formatDisplayDateTime(job?.creationTime),
    },
]
