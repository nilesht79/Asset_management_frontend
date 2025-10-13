import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Modal, Form, Input, message } from 'antd'
import { BranchesOutlined } from '@ant-design/icons'
import { createLocationType, updateLocationType } from '../../../../store/slices/masterSlice'

const LocationTypeForm = ({ open, mode, locationType, onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && locationType) {
        form.setFieldsValue({
          location_type: locationType.location_type,
          description: locationType.description
        })
      } else {
        form.resetFields()
      }
    }
  }, [open, mode, locationType, form])

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      
      // Map form field name to API field name
      const payload = {
        location_type: values.location_type,
        description: values.description || ''
      }
      
      if (mode === 'edit') {
        await dispatch(updateLocationType({ 
          id: locationType.id, 
          data: payload 
        })).unwrap()
        message.success('Location type updated successfully')
      } else {
        await dispatch(createLocationType(payload)).unwrap()
        message.success('Location type created successfully')
      }
      
      onSuccess()
    } catch (error) {
      console.error('Form submission error:', error)
      message.error(error.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} location type`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <BranchesOutlined className="text-white text-sm" />
          </div>
          <span className="text-xl font-semibold">
            {mode === 'edit' ? 'Edit Location Type' : 'Create New Location Type'}
          </span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      width={500}
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
            label="Location Type"
            name="location_type"
            rules={[
              { required: true, message: 'Please enter location type' },
              { min: 2, message: 'Location type must be at least 2 characters' },
              { max: 100, message: 'Location type cannot exceed 100 characters' }
            ]}
          >
            <Input placeholder="Enter location type (e.g., Office, Warehouse, Factory)" />
          </Form.Item>
          
          <Form.Item
            label="Description"
            name="description"
            rules={[
              { max: 500, message: 'Description cannot exceed 500 characters' }
            ]}
          >
            <Input.TextArea 
              rows={3}
              placeholder="Enter description (optional)"
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}

export default LocationTypeForm