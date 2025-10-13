import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Form, Input, Row, Col, message } from 'antd'
import PropTypes from 'prop-types'
import { createOEM, updateOEM } from '../../../../store/slices/masterSlice'

const { TextArea } = Input

const OEMForm = ({ open, mode, oem, onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const { loading } = useSelector(state => state.master)
  const [form] = Form.useForm()

  useEffect(() => {
    if (open && oem && mode === 'edit') {
      // Map backend fields to form fields
      form.setFieldsValue({
        name: oem.name || '',
        short_name: oem.contact_person || oem.code || '', // Use contact_person or code as short_name for design match
        address: oem.address || '',
        contact_number: oem.phone || '',
        email: oem.email || '',
        website: oem.website || '',
        description: oem.description || ''
      })
    } else if (open && mode === 'create') {
      form.resetFields()
    }
  }, [form, open, oem, mode])

  const handleSubmit = async (values) => {
    try {
      // Map form fields to backend expected fields
      const payload = {
        name: values.name,
        code: values.short_name || values.name.toUpperCase().replace(/\s+/g, '').substring(0, 10), // Use short_name as code
        contact_person: values.short_name, // Backend expects contact_person
        address: values.address,
        phone: values.contact_number, // Backend expects phone
        email: values.email,
        website: values.website || null,
        description: values.description || null,
        is_active: true // Default to active
      }

      if (mode === 'create') {
        await dispatch(createOEM(payload)).unwrap()
        message.success('OEM created successfully')
      } else if (mode === 'edit') {
        await dispatch(updateOEM({ id: oem.id, data: payload })).unwrap()
        message.success('OEM updated successfully')
      }
      
      form.resetFields()
      onSuccess()
    } catch (error) {
      message.error(error.message || `Failed to ${mode} OEM`)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  const getTitle = () => {
    return mode === 'create' ? 'Add New OEM' : 'Edit OEM'
  }

  return (
    <Modal
      title={getTitle()}
      open={open}
      onOk={form.submit}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={600}
      okText={mode === 'create' ? 'Add OEM' : 'Update OEM'}
      cancelText="Cancel"
      maskClosable={false}
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
              label="OEM Name"
              name="name"
              rules={[
                { required: true, message: 'OEM name is required' },
                { min: 2, message: 'OEM name must be at least 2 characters' },
                { max: 100, message: 'OEM name must not exceed 100 characters' }
              ]}
            >
              <Input placeholder="Enter OEM name (e.g., Cisco Systems)" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Short Name"
              name="short_name"
              rules={[
                { required: true, message: 'Short name is required' },
                { min: 2, message: 'Short name must be at least 2 characters' },
                { max: 50, message: 'Short name must not exceed 50 characters' }
              ]}
            >
              <Input 
                placeholder="Enter short name (e.g., CISCO)" 
                onChange={(e) => {
                  const value = e.target.value.toUpperCase()
                  form.setFieldValue('short_name', value)
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Address"
          name="address"
          rules={[
            { required: true, message: 'Address is required' },
            { max: 500, message: 'Address must not exceed 500 characters' }
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Enter complete address (e.g., Crescenzo Building, C-38, 39, G Block, Bandra Kurla Complex,Bandra (East),Mumbai,Maharashtra,India -400051)"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Contact Number"
              name="contact_number"
              rules={[
                { required: true, message: 'Contact number is required' },
                { pattern: /^[\+]?[\d\s\-\(\)]+$/, message: 'Please enter a valid phone number' },
                { max: 20, message: 'Contact number must not exceed 20 characters' }
              ]}
            >
              <Input placeholder="+1-408-526-4000" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Please enter a valid email address' },
                { max: 100, message: 'Email must not exceed 100 characters' }
              ]}
            >
              <Input placeholder="support@cisco.com" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Website"
          name="website"
          rules={[
            { type: 'url', message: 'Please enter a valid URL' },
            { max: 255, message: 'Website URL must not exceed 255 characters' }
          ]}
        >
          <Input placeholder="https://www.cisco.com" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { max: 500, message: 'Description must not exceed 500 characters' }
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Enter OEM description (optional)"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

OEMForm.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  oem: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
}

export default OEMForm