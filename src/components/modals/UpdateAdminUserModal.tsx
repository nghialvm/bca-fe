import { useEffect } from 'react'

import { Form, Input, Modal, Select, Switch } from 'antd'

import type { IdentityRoleDto } from '@/services/admin'

import {
    type AdminUserFormValues,
    type AdminUserRecord,
    getAdminUserFormInitialValues,
} from './adminUserModal.shared'

type UpdateAdminUserModalProps = {
    open: boolean
    user: AdminUserRecord | null
    roles: IdentityRoleDto[]
    submitting?: boolean
    onCancel: () => void
    onSubmit: (values: AdminUserFormValues) => Promise<void> | void
}

const UpdateAdminUserModal = ({
    open,
    user,
    roles,
    submitting,
    onCancel,
    onSubmit,
}: UpdateAdminUserModalProps) => {
    const [form] = Form.useForm<AdminUserFormValues>()

    useEffect(() => {
        if (open && user) {
            form.setFieldsValue(getAdminUserFormInitialValues(user))
            return
        }

        form.resetFields()
    }, [form, open, user])

    const handleOk = async () => {
        const values = await form.validateFields()
        await onSubmit(values)
    }

    return (
        <Modal
            destroyOnClose
            title="Cập nhật người dùng"
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
                initialValues={getAdminUserFormInitialValues(user || undefined)}
            >
                <Form.Item
                    label="Tên đăng nhập"
                    name="userName"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message: 'Vui lòng nhập tên đăng nhập',
                        },
                    ]}
                >
                    <Input placeholder="Nhập tên đăng nhập" />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            message: 'Vui lòng nhập email',
                        },
                        {
                            type: 'email',
                            message: 'Email không đúng định dạng',
                        },
                    ]}
                >
                    <Input placeholder="name@company.com" />
                </Form.Item>

                <Form.Item label="Tên" name="name">
                    <Input placeholder="Nhập tên" />
                </Form.Item>

                <Form.Item label="Họ" name="surname">
                    <Input placeholder="Nhập họ" />
                </Form.Item>

                <Form.Item label="Số điện thoại" name="phoneNumber">
                    <Input placeholder="Nhập số điện thoại" />
                </Form.Item>

                <Form.Item label="Vai trò" name="roleNames">
                    <Select
                        mode="multiple"
                        allowClear
                        maxTagCount="responsive"
                        placeholder="Chọn vai trò"
                        options={roles.map((role) => ({
                            value: role.name,
                            label: role.name,
                        }))}
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

export default UpdateAdminUserModal
