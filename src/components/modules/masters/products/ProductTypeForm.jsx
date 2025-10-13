import { useEffect } from 'react'
import { Modal, Form, Input, Select, message } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { createProductType, updateProductType } from '../../../../store/slices/masterSlice'

const { TextArea } = Input
const { Option } = Select

const ProductTypeForm = ({ open, mode, productType, onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const { productTypes } = useSelector(state => state.master)
  const loading = productTypes?.loading || false

  useEffect(() => {
    if (open && productType && mode === 'edit') {
      form.setFieldsValue({
        name: productType.name || '',
        description: productType.description || '',
        is_active: productType.is_active !== undefined ? productType.is_active : true
      })
    } else if (open && mode === 'create') {
      form.resetFields()
      form.setFieldsValue({
        is_active: true
      })
    }
  }, [form, open, productType, mode])

  const handleSubmit = async (values) => {
    try {
      if (mode === 'create') {
        await dispatch(createProductType(values)).unwrap()
        message.success('Product type created successfully')
      } else if (mode === 'edit') {
        await dispatch(updateProductType({ id: productType.id, data: values })).unwrap()
        message.success('Product type updated successfully')
      }
      
      form.resetFields()
      onSuccess()
    } catch (error) {
      message.error(error.message || `Failed to ${mode} product type`)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  const getTitle = () => {
    return mode === 'create' ? 'Add New Product Type' : 'Edit Product Type'
  }

  return (
    <Modal
      title={getTitle()}
      open={open}
      onOk={form.submit}
      onCancel={handleCancel}
      width={600}
      okText={mode === 'create' ? 'Add Product Type' : 'Update Product Type'}
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
        <Form.Item
          label="Type Name"
          name="name"
          rules={[
            { required: true, message: 'Type name is required' },
            { min: 2, message: 'Type name must be at least 2 characters' },
            { max: 100, message: 'Type name must not exceed 100 characters' }
          ]}
        >
          <Input placeholder="Enter type name (e.g., Asset, License, Service)" />
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
            placeholder="Enter type description (e.g., Physical and digital assets for organization use)"
            maxLength={500}
            showCount
          />
        </Form.Item>

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
      </Form>
    </Modal>
  )
}

ProductTypeForm.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  productType: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
}

export default ProductTypeForm