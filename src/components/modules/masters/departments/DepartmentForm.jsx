import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, Row, Col, message } from 'antd'
import PropTypes from 'prop-types'
import departmentService from '../../../../services/department'
import userService from '../../../../services/user'

const { TextArea } = Input
const { Option } = Select

const DepartmentForm = ({ open, mode, department, onClose, onSuccess }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Load users for contact person selection from USER_MASTER
  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      console.log('Loading users for department contact person...')
      const response = await userService.getDepartmentContactUsers({ limit: 100 })
      console.log('Users response:', response.data)
      if (response.data.success) {
        const users = response.data.data.users || []
        console.log('Users loaded:', users.length, users)
        setUsers(users)
      } else {
        console.warn('API response was not successful:', response.data)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadUsers()
    }
  }, [open])

  useEffect(() => {
    if (open && department && mode === 'edit') {
      // Validate that the contact person still exists in the current users list
      const contactPersonExists = department.contactPersonId && users.some(user => user.id === department.contactPersonId)
      
      form.setFieldsValue({
        name: department.name || '',
        description: department.description || '',
        contact_person_id: contactPersonExists ? department.contactPersonId : undefined,
      })
      
      // Log for debugging if contact person doesn't exist
      if (department.contactPersonId && !contactPersonExists) {
        console.warn('Department contact person ID not found in current users:', department.contactPersonId)
        console.log('Available users:', users.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}` })))
      }
    } else if (open && mode === 'create') {
      form.resetFields()
    }
  }, [form, open, department, mode, users])

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      let response
      
      if (mode === 'create') {
        response = await departmentService.createDepartment(values)
        if (response.data.success) {
          message.success('Department created successfully')
        }
      } else if (mode === 'edit') {
        response = await departmentService.updateDepartment(department.id, values)
        if (response.data.success) {
          message.success('Department updated successfully')
        }
      }
      
      if (response.data.success) {
        form.resetFields()
        onSuccess()
      } else {
        message.error(response.data.message || `Failed to ${mode} department`)
      }
    } catch (error) {
      console.error(`Failed to ${mode} department:`, error)
      
      if (error.response?.data?.message) {
        message.error(error.response.data.message)
      } else {
        message.error(`Failed to ${mode} department`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  const getTitle = () => {
    return mode === 'create' ? 'Add New Department' : 'Edit Department'
  }

  const validateDepartmentName = async (_, value) => {
    if (!value || !value.trim()) {
      return Promise.resolve()
    }
    
    // For edit mode, allow the current name
    if (mode === 'edit' && department?.name === value.trim()) {
      return Promise.resolve()
    }
    
    // Check if name already exists
    try {
      const response = await departmentService.getDepartments({ 
        search: value.trim(),
        limit: 1000 
      })
      
      if (response.data.success && response.data.data.departments) {
        const existingDept = response.data.data.departments.find(dept => 
          dept.name.toLowerCase() === value.trim().toLowerCase()
        )
        
        if (existingDept) {
          return Promise.reject(new Error('Department name already exists'))
        }
      }
    } catch (error) {
      // If validation fails, don't block the form
      console.warn('Name validation failed:', error)
    }
    
    return Promise.resolve()
  }

  return (
    <Modal
      title={getTitle()}
      open={open}
      onOk={form.submit}
      onCancel={handleCancel}
      width={600}
      okText={mode === 'create' ? 'Add Department' : 'Update Department'}
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
          <Col span={24}>
            <Form.Item
              label="Department Name"
              name="name"
              rules={[
                { required: true, message: 'Department name is required' },
                { min: 2, message: 'Department name must be at least 2 characters' },
                { max: 100, message: 'Department name must not exceed 100 characters' },
                { validator: validateDepartmentName }
              ]}
            >
              <Input 
                placeholder="Enter department name (e.g., Information Technology)" 
                maxLength={100}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Contact Person (Department Head)"
              name="contact_person_id"
              rules={[
                { required: false, message: 'Contact person is optional' }
              ]}
            >
              <Select 
                placeholder="Select contact person (optional)"
                allowClear
                showSearch
                loading={loadingUsers}
                optionFilterProp="children"
                optionLabelProp="label"
                filterOption={(input, option) => {
                  const user = users.find(u => u.id === option.value)
                  if (!user) return false
                  
                  const searchText = input.toLowerCase()
                  const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
                  const email = (user.email || '').toLowerCase()
                  
                  return fullName.includes(searchText) || email.includes(searchText)
                }}
              >
                {users.map(user => (
                  <Option 
                    key={user.id} 
                    value={user.id}
                    label={`${user.firstName} ${user.lastName}`}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {user.email} • {user.role}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Description"
              name="description"
              rules={[
                { max: 500, message: 'Description must not exceed 500 characters' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Enter department description (optional)"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

DepartmentForm.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  department: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
}

export default DepartmentForm