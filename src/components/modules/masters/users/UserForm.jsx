import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, Row, Col, message, Checkbox, Alert, Typography } from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import userService from '../../../../services/user'

const { Text } = Typography

const { Option } = Select

const UserForm = ({ open, mode, user, departments, onClose, onSuccess }) => {
  const [form] = Form.useForm()
  const { user: currentUser } = useSelector(state => state.auth)
  const [loading, setLoading] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState(null)
  const [createdUserEmail, setCreatedUserEmail] = useState(null)

  useEffect(() => {
    if (open && user && mode === 'edit') {
      form.setFieldsValue({
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        role: user.role,
        department_id: user.department?.id,
        employee_id: user.employeeId,
        is_active: user.isActive,
        is_vip: user.isVip || false
      })
    } else if (open && mode === 'create') {
      form.resetFields()
      form.setFieldsValue({
        is_active: true,
        is_vip: false
      })
    }
  }, [form, open, user, mode])

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      if (mode === 'create') {
        const response = await userService.createUser(values)
        const userData = response.data?.data || response.data

        // Check if password was auto-generated
        if (userData?.generatedPassword) {
          setGeneratedPassword(userData.generatedPassword)
          setCreatedUserEmail(userData.email)
          message.success('User created successfully with auto-generated password')
        } else {
          message.success('User created successfully')
          form.resetFields()
          onSuccess()
        }
      } else if (mode === 'edit') {
        await userService.updateUser(user.id, values)
        message.success('User updated successfully')
        form.resetFields()
        onSuccess()
      }
    } catch (error) {
      console.error('Failed to save user:', error)
      message.error(error.message || `Failed to ${mode} user`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setGeneratedPassword(null)
    setCreatedUserEmail(null)
    onClose()
  }

  const handlePasswordAcknowledge = () => {
    setGeneratedPassword(null)
    setCreatedUserEmail(null)
    form.resetFields()
    onSuccess()
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    message.success('Password copied to clipboard')
  }

  const getTitle = () => {
    return mode === 'create' ? 'Add New User' : 'Edit User'
  }

  const validateEmail = async (_, value) => {
    if (!value) {
      return Promise.resolve()
    }
    
    // Basic email validation is handled by the type: 'email' rule
    // Additional custom validation can be added here
    return Promise.resolve()
  }

  const availableRoles = userService.getAvailableRoles(currentUser?.role)

  // If password was generated, show the password display modal
  if (generatedPassword) {
    return (
      <Modal
        title="User Created Successfully"
        open={open}
        onOk={handlePasswordAcknowledge}
        onCancel={handlePasswordAcknowledge}
        width={500}
        okText="Done"
        cancelButtonProps={{ style: { display: 'none' } }}
        maskClosable={false}
      >
        <Alert
          type="success"
          message="User created with auto-generated password"
          description="Please copy and securely share the password below with the user. This password will not be shown again."
          showIcon
          style={{ marginBottom: 16 }}
        />
        <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <Text type="secondary">Email:</Text>
            <div><Text strong>{createdUserEmail}</Text></div>
          </div>
          <div>
            <Text type="secondary">Password:</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text strong copyable={{ text: generatedPassword }} style={{ fontSize: 16 }}>
                {generatedPassword}
              </Text>
              <CopyOutlined
                onClick={() => copyToClipboard(generatedPassword)}
                style={{ cursor: 'pointer', color: '#1890ff' }}
              />
            </div>
          </div>
        </div>
        <Alert
          type="warning"
          message="The user will be required to change this password on first login."
          showIcon
        />
      </Modal>
    )
  }

  return (
    <Modal
      title={getTitle()}
      open={open}
      onOk={form.submit}
      onCancel={handleCancel}
      width={700}
      okText={mode === 'create' ? 'Add User' : 'Update User'}
      cancelText="Cancel"
      maskClosable={false}
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="First Name"
              name="first_name"
              rules={[
                { required: true, message: 'First name is required' },
                { min: 2, message: 'First name must be at least 2 characters' },
                { max: 50, message: 'First name must not exceed 50 characters' }
              ]}
            >
              <Input placeholder="Enter first name" maxLength={50} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Last Name"
              name="last_name"
              rules={[
                { required: true, message: 'Last name is required' },
                { min: 2, message: 'Last name must be at least 2 characters' },
                { max: 50, message: 'Last name must not exceed 50 characters' }
              ]}
            >
              <Input placeholder="Enter last name" maxLength={50} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Please enter a valid email address' },
                { validator: validateEmail }
              ]}
            >
              <Input 
                placeholder="Enter email address" 
                maxLength={100}
                disabled={mode === 'edit'} // Email should not be editable
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Employee ID"
              name="employee_id"
              rules={[
                { max: 20, message: 'Employee ID must not exceed 20 characters' }
              ]}
            >
              <Input placeholder="Enter employee ID (optional)" maxLength={20} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Role"
              name="role"
              rules={[
                { required: true, message: 'Role is required' }
              ]}
            >
              <Select
                placeholder="Select user role"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {availableRoles.map(role => (
                  <Option key={role.value} value={role.value}>
                    {role.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <div style={{ height: '72px' }}></div>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Department"
              name="department_id"
              rules={[
                { required: true, message: 'Department is required' }
              ]}
            >
              <Select
                placeholder="Select department"
                allowClear
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {departments.map(dept => (
                  <Option key={dept.id} value={dept.id}>
                    {dept.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Status"
              name="is_active"
              rules={[
                { required: true, message: 'Status is required' }
              ]}
            >
              <Select placeholder="Select status">
                <Option value={true}>Active</Option>
                <Option value={false}>Inactive</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="is_vip"
              valuePropName="checked"
            >
              <Checkbox>
                VIP User
              </Checkbox>
            </Form.Item>
          </Col>
          <Col span={12}>
            <div style={{ height: '32px' }}></div>
          </Col>
        </Row>

        {mode === 'create' && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Password"
                name="password"
                extra="Leave empty to auto-generate a secure password"
                rules={[
                  { min: 8, message: 'Password must be at least 8 characters' },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
                  }
                ]}
              >
                <Input.Password
                  placeholder="Enter password (optional - auto-generated if empty)"
                  maxLength={50}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        {mode === 'create' && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Confirm Password"
                name="confirm_password"
                dependencies={['password']}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const password = getFieldValue('password')
                      // Only validate if password was provided
                      if (!password || !value || password === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('Passwords do not match'))
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder="Confirm password (optional)"
                  maxLength={50}
                />
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>
    </Modal>
  )
}

UserForm.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  user: PropTypes.object,
  departments: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
}

export default UserForm