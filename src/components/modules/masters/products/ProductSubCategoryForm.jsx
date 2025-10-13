import React, { useEffect } from 'react'
import { Modal, Form, Input, Select, Row, Col, message } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { createProductSubCategory, updateProductSubCategory, fetchProductCategories } from '../../../../store/slices/masterSlice'

const { TextArea } = Input
const { Option } = Select

const ProductSubCategoryForm = ({ open, mode, subCategory, onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const { productSubCategories, productCategories } = useSelector(state => state.master)
  const loading = productSubCategories?.loading || false
  const categories = Array.isArray(productCategories?.data) ? productCategories.data : []

  useEffect(() => {
    if (open) {
      dispatch(fetchProductCategories({ page: 1, limit: 1000 }))
    }
  }, [open, dispatch])

  useEffect(() => {
    if (open && subCategory && mode === 'edit') {
      form.setFieldsValue({
        name: subCategory.name || '',
        parent_category_id: subCategory.parent_category?.id || subCategory.parent_category_id,
        description: subCategory.description || ''
      })
    } else if (open && mode === 'create') {
      form.resetFields()
    }
  }, [form, open, subCategory, mode])

  const handleSubmit = async (values) => {
    try {
      if (mode === 'create') {
        await dispatch(createProductSubCategory(values)).unwrap()
        message.success('Sub-category created successfully')
      } else if (mode === 'edit') {
        await dispatch(updateProductSubCategory({ id: subCategory.id, data: values })).unwrap()
        message.success('Sub-category updated successfully')
      }
      
      form.resetFields()
      onSuccess()
    } catch (error) {
      message.error(error.message || `Failed to ${mode} sub-category`)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  const getTitle = () => {
    return mode === 'create' ? 'Add New Sub-Category' : 'Edit Sub-Category'
  }

  return (
    <Modal
      title={getTitle()}
      open={open}
      onOk={form.submit}
      onCancel={handleCancel}
      width={600}
      okText={mode === 'create' ? 'Add Sub-Category' : 'Update Sub-Category'}
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
              label="Sub-Category Name"
              name="name"
              rules={[
                { required: true, message: 'Sub-category name is required' },
                { min: 2, message: 'Sub-category name must be at least 2 characters' },
                { max: 100, message: 'Sub-category name must not exceed 100 characters' }
              ]}
            >
              <Input placeholder="Enter sub-category name (e.g., All - in - One (AIO))" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Parent Category"
              name="parent_category_id"
              rules={[
                { required: true, message: 'Parent category is required' }
              ]}
            >
              <Select 
                placeholder="Select parent category"
                allowClear
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { max: 500, message: 'Description must not exceed 500 characters' }
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Enter sub-category description (e.g., Space-Saving Computers Integrating the display and Processing unit into a Single Sleek Packing)"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

ProductSubCategoryForm.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  subCategory: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
}

export default ProductSubCategoryForm