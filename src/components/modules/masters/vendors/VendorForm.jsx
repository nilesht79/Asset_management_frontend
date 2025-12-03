import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Form, Input, Row, Col, message } from 'antd'
import PropTypes from 'prop-types'
import { createVendor, updateVendor } from '../../../../store/slices/masterSlice'

const VendorForm = ({ open, mode, vendor, onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const { vendors } = useSelector(state => state.master)
  const loading = vendors?.loading || false
  const [form] = Form.useForm()

  useEffect(() => {
    if (open && vendor && mode === 'edit') {
      form.setFieldsValue({
        name: vendor.name || '',
        code: vendor.code || ''
      })
    } else if (open && mode === 'create') {
      form.resetFields()
    }
  }, [form, open, vendor, mode])

  const handleSubmit = async (values) => {
    try {
      const payload = {
        name: values.name,
        code: values.code || values.name.toUpperCase().replace(/\s+/g, '').substring(0, 20),
        is_active: true
      }

      if (mode === 'create') {
        await dispatch(createVendor(payload)).unwrap()
        message.success('Vendor created successfully')
      } else if (mode === 'edit') {
        await dispatch(updateVendor({ id: vendor.id, data: payload })).unwrap()
        message.success('Vendor updated successfully')
      }

      form.resetFields()
      onSuccess()
    } catch (error) {
      message.error(error.message || `Failed to ${mode} vendor`)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  const getTitle = () => {
    return mode === 'create' ? 'Add New Vendor' : 'Edit Vendor'
  }

  return (
    <Modal
      title={getTitle()}
      open={open}
      onOk={form.submit}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={500}
      okText={mode === 'create' ? 'Add Vendor' : 'Update Vendor'}
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
          <Col span={24}>
            <Form.Item
              label="Vendor Name"
              name="name"
              rules={[
                { required: true, message: 'Vendor name is required' },
                { min: 2, message: 'Vendor name must be at least 2 characters' },
                { max: 255, message: 'Vendor name must not exceed 255 characters' }
              ]}
            >
              <Input placeholder="Enter vendor name (e.g., PoleStar)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Vendor Code"
              name="code"
              rules={[
                { max: 50, message: 'Vendor code must not exceed 50 characters' }
              ]}
            >
              <Input
                placeholder="Enter vendor code (e.g., POLESTAR)"
                onChange={(e) => {
                  const value = e.target.value.toUpperCase()
                  form.setFieldValue('code', value)
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

VendorForm.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  vendor: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
}

export default VendorForm
