import { useEffect } from 'react'
import { Modal, Form, Input, Select, Row, Col, message } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { createProductSeries, updateProductSeries, fetchProductCategories, fetchProductSubCategories, fetchOEMs } from '../../../../store/slices/masterSlice'

const { TextArea } = Input
const { Option } = Select

const ProductSeriesForm = ({ open, mode, productSeries, onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const { productSeries: productSeriesState, productCategories, productSubCategories, oems } = useSelector(state => state.master)
  const loading = productSeriesState?.loading || false
  const categories = Array.isArray(productCategories?.data) ? productCategories.data : []
  const allCategories = Array.isArray(productSubCategories?.data) ? productSubCategories.data : []
  // Filter to get only subcategories (categories with parent_category_id)
  const subCategories = allCategories.filter(cat => cat.parent_category_id)
  const oemsList = Array.isArray(oems?.data) ? oems.data : []



  useEffect(() => {
    if (open) {
      dispatch(fetchOEMs({ page: 1, limit: 100 }))
      dispatch(fetchProductCategories({ page: 1, limit: 100 }))
      dispatch(fetchProductSubCategories({ page: 1, limit: 100 }))
    }
  }, [open, dispatch])

  useEffect(() => {
    if (open && productSeries && mode === 'edit') {
      form.setFieldsValue({
        name: productSeries.name || '',
        oem_id: productSeries.oem?.id || productSeries.oem_id,
        category_id: productSeries.category?.id || productSeries.category_id,
        sub_category_id: productSeries.subCategory?.id || productSeries.sub_category_id,
        description: productSeries.description || ''
      })
    } else if (open && mode === 'create') {
      form.resetFields()
    }
  }, [form, open, productSeries, mode])

  const handleSubmit = async (values) => {
    try {
      if (mode === 'create') {
        await dispatch(createProductSeries(values)).unwrap()
        message.success('Product series created successfully')
      } else if (mode === 'edit') {
        await dispatch(updateProductSeries({ id: productSeries.id, data: values })).unwrap()
        message.success('Product series updated successfully')
      }
      
      form.resetFields()
      onSuccess()
    } catch (error) {
      message.error(error.message || `Failed to ${mode} product series`)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  const getTitle = () => {
    return mode === 'create' ? 'Add New Product Series' : 'Edit Product Series'
  }

  const handleCategoryChange = () => {
    form.setFieldsValue({ sub_category_id: undefined })
  }

  // Get the currently selected category ID
  const selectedCategoryId = Form.useWatch('category_id', form)
  
  // Filter subcategories based on the selected category
  const filteredSubCategories = subCategories.filter(
    subCat => subCat.parent_category_id === selectedCategoryId
  )

  return (
    <Modal
      title={getTitle()}
      open={open}
      onOk={form.submit}
      onCancel={handleCancel}
      width={700}
      okText={mode === 'create' ? 'Add Product Series' : 'Update Product Series'}
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
              label="Product Series Name"
              name="name"
              rules={[
                { required: true, message: 'Product series name is required' },
                { min: 2, message: 'Product series name must be at least 2 characters' },
                { max: 100, message: 'Product series name must not exceed 100 characters' }
              ]}
            >
              <Input placeholder="Enter product series name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="OEM"
              name="oem_id"
              rules={[
                { required: true, message: 'OEM is required' }
              ]}
            >
              <Select 
                placeholder="Select OEM"
                allowClear
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {oemsList.map(oem => (
                  <Option key={oem.id} value={oem.id}>
                    {oem.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Product Category"
              name="category_id"
              rules={[
                { required: true, message: 'Product category is required' }
              ]}
            >
              <Select 
                placeholder="Select product category"
                allowClear
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                onChange={handleCategoryChange}
              >
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Product Sub Category"
              name="sub_category_id"
              rules={[
                { required: true, message: 'Product sub category is required' }
              ]}
            >
              <Select 
                placeholder="Select product sub category"
                allowClear
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                disabled={!selectedCategoryId}
              >
                {filteredSubCategories.map(subCategory => (
                  <Option key={subCategory.id} value={subCategory.id}>
                    {subCategory.name}
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
            placeholder="Enter product series description (optional)"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

ProductSeriesForm.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  productSeries: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
}

export default ProductSeriesForm