import { useEffect } from 'react'

import { Form, Input, Modal, Select, Switch } from 'antd'

import type {
    AdminOrganizationFormValues,
    AdminOrganizationRecord,
    OrganizationManagerOption,
} from './adminOrganizationModal.shared'
import { getAdminOrganizationFormInitialValues } from './adminOrganizationModal.shared'

type UpdateAdminOrganizationModalProps = {
    open: boolean
    organization: AdminOrganizationRecord | null
    managerOptions: OrganizationManagerOption[]
    submitting?: boolean
    onCancel: () => void
    onSubmit: (values: AdminOrganizationFormValues) => Promise<void> | void
}

const UpdateAdminOrganizationModal = ({
    open,
    organization,
    managerOptions,
    submitting,
    onCancel,
    onSubmit,
}: UpdateAdminOrganizationModalProps) => {
    const [form] = Form.useForm<AdminOrganizationFormValues>()

    useEffect(() => {
        if (open && organization) {
            form.setFieldsValue(
                getAdminOrganizationFormInitialValues(organization)
            )
            return
        }

        form.resetFields()
    }, [form, open, organization])

    const handleOk = async () => {
        const values = await form.validateFields()
        await onSubmit(values)
    }

    return (
        <Modal
            destroyOnClose
            title="Cập nhật đơn vị"
            open={open}
            okText="Lưu thay đổi"
            cancelText="Hủy"
            confirmLoading={submitting}
            onCancel={onCancel}
            onOk={() => void handleOk()}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={getAdminOrganizationFormInitialValues(
                    organization
                )}
            >
                <Form.Item
                    label="Mã đơn vị"
                    name="code"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message: 'Vui lòng nhập mã đơn vị',
                        },
                        {
                            max: 50,
                            message: 'Mã đơn vị tối đa 50 ký tự',
                        },
                    ]}
                >
                    <Input placeholder="Nhập mã đơn vị" />
                </Form.Item>

                <Form.Item
                    label="Tên đơn vị"
                    name="name"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message: 'Vui lòng nhập tên đơn vị',
                        },
                        {
                            max: 200,
                            message: 'Tên đơn vị tối đa 200 ký tự',
                        },
                    ]}
                >
                    <Input placeholder="Nhập tên đơn vị" />
                </Form.Item>

                <Form.Item label="Người quản lý" name="managerUserId">
                    <Select
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        placeholder="Chọn người quản lý"
                        options={managerOptions}
                    />
                </Form.Item>

                <Form.Item
                    label="Mô tả"
                    name="description"
                    rules={[
                        {
                            max: 1000,
                            message: 'Mô tả tối đa 1000 ký tự',
                        },
                    ]}
                >
                    <Input.TextArea
                        rows={4}
                        placeholder="Nhập mô tả đơn vị"
                        maxLength={1000}
                        showCount
                    />
                </Form.Item>

                <Form.Item
                    label="Trạng thái hoạt động"
                    name="isActive"
                    valuePropName="checked"
                >
                    <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default UpdateAdminOrganizationModal
