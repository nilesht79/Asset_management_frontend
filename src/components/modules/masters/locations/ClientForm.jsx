import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Modal, Form, Input, message } from 'antd'
import { BankOutlined } from '@ant-design/icons'
import { createClient, updateClient } from '../../../../store/slices/masterSlice'

const { TextArea } = Input

const ClientForm = ({ open, mode, client, onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && client) {
        form.setFieldsValue({
          client_name: client.client_name,
          contact_person: client.contact_person,
          contact_email: client.contact_email,
          contact_phone: client.contact_phone,
          address: client.address
        })
      } else {
        form.resetFields()
      }
    }
  }, [open, mode, client, form])

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      
      const payload = {
        client_name: values.client_name,
        contact_person: values.contact_person || '',
        contact_email: values.contact_email || '',
        contact_phone: values.contact_phone || '',
        address: values.address || ''
      }
      
      if (mode === 'edit') {
        await dispatch(updateClient({ 
          id: client.id, 
          data: payload 
        })).unwrap()
        message.success('Client updated successfully')
      } else {
        await dispatch(createClient(payload)).unwrap()
        message.success('Client created successfully')
      }
      
      onSuccess()
    } catch (error) {
      console.error('Form submission error:', error)
      message.error(error.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} client`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <BankOutlined className="text-white text-sm" />
          </div>
          <span className="text-xl font-semibold">
            {mode === 'edit' ? 'Edit Client' : 'Create New Client'}
          </span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      width={700}
      okText={mode === 'edit' ? 'Update' : 'Create'}
      cancelText="Cancel"
      confirmLoading={loading}
    >
      <div className="py-4">
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            label="Client Name"
            name="client_name"
            rules={[
              { required: true, message: 'Please enter client name' },
              { min: 2, max: 255, message: 'Client name must be between 2-255 characters' }
            ]}
          >
            <Input placeholder="Enter client name" />
          </Form.Item>

          <Form.Item
            label="Contact Person"
            name="contact_person"
            rules={[
              { min: 2, max: 100, message: 'Contact person name must be between 2-100 characters' }
            ]}
          >
            <Input placeholder="Enter contact person name (optional)" />
          </Form.Item>

          <Form.Item
            label="Contact Email"
            name="contact_email"
            rules={[
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Enter contact email (optional)" />
          </Form.Item>

          <Form.Item
            label="Contact Phone"
            name="contact_phone"
            rules={[
              {
                pattern: /^[+]?[1-9][\d]{0,15}$/,
                message: 'Please enter a valid phone number'
              }
            ]}
          >
            <Input placeholder="Enter contact phone (optional)" />
          </Form.Item>

          <Form.Item
            label="Address"
            name="address"
            rules={[
              { max: 500, message: 'Address cannot exceed 500 characters' }
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Enter client address (optional)"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}

export default ClientForm