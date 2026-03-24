import { useEffect } from 'react'

import { Form, Modal } from 'antd'

import type {
    EmployerDepartmentOption,
    EmployerJobFormValues,
    EmployerJobPositionOption,
} from './employerJobModal.shared'
import {
    EmployerJobFormFields,
    getEmployerJobFormInitialValues,
} from './employerJobModal.shared'

type CreateEmployerJobModalProps = {
    open: boolean
    defaultDepartmentId?: string
    departmentOptions: EmployerDepartmentOption[]
    jobPositionOptions: EmployerJobPositionOption[]
    submitting?: boolean
    onCancel: () => void
    onSubmit: (values: EmployerJobFormValues) => Promise<void> | void
}

const CreateEmployerJobModal = ({
    open,
    defaultDepartmentId,
    departmentOptions,
    jobPositionOptions,
    submitting,
    onCancel,
    onSubmit,
}: CreateEmployerJobModalProps) => {
    const [form] = Form.useForm<EmployerJobFormValues>()

    useEffect(() => {
        if (open) {
            form.setFieldsValue(
                getEmployerJobFormInitialValues(null, defaultDepartmentId)
            )
            return
        }

        form.resetFields()
    }, [defaultDepartmentId, form, open])

    const handleOk = async () => {
        const values = await form.validateFields()
        await onSubmit(values)
    }

    return (
        <Modal
            destroyOnClose
            title="Tạo tin tuyển dụng"
            open={open}
            width={720}
            okText="Tạo mới"
            cancelText="Hủy"
            confirmLoading={submitting}
            onCancel={onCancel}
            onOk={() => void handleOk()}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={getEmployerJobFormInitialValues(
                    null,
                    defaultDepartmentId
                )}
            >
                <EmployerJobFormFields
                    form={form}
                    mode="create"
                    departmentOptions={departmentOptions}
                    jobPositionOptions={jobPositionOptions}
                />
            </Form>
        </Modal>
    )
}

export default CreateEmployerJobModal
