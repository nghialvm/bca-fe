import { useEffect } from 'react'

import { Form, Modal } from 'antd'

import type {
    EmployerDepartmentOption,
    EmployerJobFormValues,
    EmployerJobPositionOption,
    EmployerJobRecord,
} from './employerJobModal.shared'
import {
    EmployerJobFormFields,
    getEmployerJobFormInitialValues,
} from './employerJobModal.shared'

type UpdateEmployerJobModalProps = {
    open: boolean
    job: EmployerJobRecord | null
    departmentOptions: EmployerDepartmentOption[]
    jobPositionOptions: EmployerJobPositionOption[]
    submitting?: boolean
    onCancel: () => void
    onSubmit: (values: EmployerJobFormValues) => Promise<void> | void
}

const UpdateEmployerJobModal = ({
    open,
    job,
    departmentOptions,
    jobPositionOptions,
    submitting,
    onCancel,
    onSubmit,
}: UpdateEmployerJobModalProps) => {
    const [form] = Form.useForm<EmployerJobFormValues>()

    useEffect(() => {
        if (open && job) {
            form.setFieldsValue(getEmployerJobFormInitialValues(job))
            return
        }

        form.resetFields()
    }, [form, job, open])

    const handleOk = async () => {
        const values = await form.validateFields()
        await onSubmit(values)
    }

    return (
        <Modal
            destroyOnClose
            title="Cập nhật tin tuyển dụng"
            open={open}
            width={720}
            okText="Lưu thay đổi"
            cancelText="Hủy"
            confirmLoading={submitting}
            onCancel={onCancel}
            onOk={() => void handleOk()}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={getEmployerJobFormInitialValues(job)}
            >
                <EmployerJobFormFields
                    form={form}
                    mode="update"
                    departmentOptions={departmentOptions}
                    jobPositionOptions={jobPositionOptions}
                />
            </Form>
        </Modal>
    )
}

export default UpdateEmployerJobModal
