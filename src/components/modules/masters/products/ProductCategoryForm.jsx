import React, { useEffect } from 'react'
import { Modal, Form, Input, message } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { createProductCategory, updateProductCategory } from '../../../../store/slices/masterSlice'

const { TextArea } = Input

const ProductCategoryForm = ({ open, mode, category, onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const { productCategories } = useSelector(state => state.master)
  const loading = productCategories?.loading || false

  useEffect(() => {
    if (open && category && mode === 'edit') {
      form.setFieldsValue({
        name: category.name || '',
        description: category.description || ''
      })
    } else if (open && mode === 'create') {
      form.resetFields()
    }
  }, [form, open, category, mode])

  const handleSubmit = async (values) => {
    try {
      if (mode === 'create') {
        await dispatch(createProductCategory(values)).unwrap()
        message.success('Category created successfully')
      } else if (mode === 'edit') {
        await dispatch(updateProductCategory({ id: category.id, data: values })).unwrap()
        message.success('Category updated successfully')
      }
      
      form.resetFields()
      onSuccess()
    } catch (error) {
      message.error(error.message || `Failed to ${mode} category`)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  const getTitle = () => {
    return mode === 'create' ? 'Add New Category' : 'Edit Category'
  }

  return (
    <Modal
      title={getTitle()}
      open={open}
      onOk={form.submit}
      onCancel={handleCancel}
      width={600}
      okText={mode === 'create' ? 'Add Category' : 'Update Category'}
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
          label="Category Name"
          name="name"
          rules={[
            { required: true, message: 'Category name is required' },
            { min: 2, message: 'Category name must be at least 2 characters' },
            { max: 100, message: 'Category name must not exceed 100 characters' }
          ]}
        >
          <Input placeholder="Enter category name (e.g., Hardware, Software)" />
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
            placeholder="Enter category description (optional)"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

ProductCategoryForm.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  category: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
}

export default ProductCategoryForm