import { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, Row, Col, message, Divider, Typography, Space, InputNumber, Tooltip } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { InfoCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import PropTypes from 'prop-types'
import { createProduct, updateProduct, fetchOEMs, fetchProductCategories, fetchProductSubCategories, fetchProductSeries, fetchProductTypes, fetchProducts } from '../../../../store/slices/masterSlice'
import { fetchFieldTemplatesByProductType, clearCurrentTemplates } from '../../../../store/slices/componentFieldTemplatesSlice'

const { TextArea } = Input
const { Option } = Select
const { Text } = Typography

const ProductModelForm = ({ open, mode, product, onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const [selectedTypeId, setSelectedTypeId] = useState(null)
  const {
    products,
    oems,
    productCategories,
    productSubCategories,
    productSeries,
    productTypes
  } = useSelector(state => state.master)
  const { currentProductTypeTemplates } = useSelector(state => state.componentFieldTemplates)

  const loading = products?.loading || false
  const oemsList = Array.isArray(oems?.data) ? oems.data.filter(o => o.is_active) : []
  const categories = Array.isArray(productCategories?.data) ? productCategories.data.filter(c => c.is_active) : []
  const subCategories = Array.isArray(productSubCategories?.data) ? productSubCategories.data.filter(sc => sc.is_active) : []
  const series = Array.isArray(productSeries?.data) ? productSeries.data.filter(s => s.is_active) : []
  const types = Array.isArray(productTypes?.data) ? productTypes.data.filter(t => t.is_active) : []

  useEffect(() => {
    if (open) {
      dispatch(fetchOEMs({ page: 1, limit: 100, status: 'active' }))
      dispatch(fetchProductCategories({ page: 1, limit: 100, status: 'active' }))
      dispatch(fetchProductSubCategories({ page: 1, limit: 100, status: 'active' }))
      dispatch(fetchProductSeries({ page: 1, limit: 100, status: 'active' }))
      dispatch(fetchProductTypes({ page: 1, limit: 100, status: 'active' }))
    }
  }, [open, dispatch])

  useEffect(() => {
    if (open && product && mode === 'edit') {
      form.setFieldsValue({
        name: product.name || '',
        model: product.model || '',
        description: product.description || '',
        type_id: product.type?.id || product.type_id,
        oem_id: product.oem?.id || product.oem_id,
        category_id: product.category?.id || product.category_id,
        subcategory_id: product.subcategory?.id || product.subcategory_id,
        series_id: product.series?.id || product.series_id,
        specifications: product.specifications || '',
        warranty_period: product.warranty_period || 12,
        capacity_value: product.capacity_value || null,
        capacity_unit: product.capacity_unit || null,
        speed_value: product.speed_value || null,
        speed_unit: product.speed_unit || null,
        interface_type: product.interface_type || null,
        form_factor: product.form_factor || null,
        is_active: product.is_active !== undefined ? product.is_active : true
      })
    } else if (open && mode === 'create') {
      form.resetFields()
      form.setFieldsValue({
        is_active: true,
        warranty_period: 12
      })
    }
  }, [form, open, product, mode])

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        specifications: values.specifications?.trim() || null
      }

      if (mode === 'create') {
        await dispatch(createProduct(formattedValues)).unwrap()
        message.success('Product model created successfully')
      } else if (mode === 'edit') {
        await dispatch(updateProduct({ id: product.id, data: formattedValues })).unwrap()
        message.success('Product model updated successfully')
      }

      form.resetFields()
      // Refresh products list
      dispatch(fetchProducts({ page: 1, limit: 10 }))
      onSuccess()
    } catch (error) {
      message.error(error.message || `Failed to ${mode} product model`)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  const getTitle = () => {
    return mode === 'create' ? (
      <Space>
        <CheckCircleOutlined style={{ color: '#52c41a' }} />
        Add New Product 
      </Space>
    ) : (
      <Space>
        <InfoCircleOutlined style={{ color: '#1890ff' }} />
        Edit Product Model
      </Space>
    )
  }

  const handleCategoryChange = () => {
    form.setFieldsValue({
      subcategory_id: undefined,
      series_id: undefined
    })
  }

  const handleSubCategoryChange = () => {
    form.setFieldsValue({ series_id: undefined })
  }

  const handleProductTypeChange = (typeId) => {
    setSelectedTypeId(typeId)
    if (typeId) {
      dispatch(fetchFieldTemplatesByProductType(typeId))
    } else {
      dispatch(clearCurrentTemplates())
    }
  }

  // Fetch templates when editing product with type
  useEffect(() => {
    if (open && product && mode === 'edit' && product.type_id) {
      setSelectedTypeId(product.type_id)
      dispatch(fetchFieldTemplatesByProductType(product.type_id))
    }
  }, [open, product, mode, dispatch])

  const selectedCategoryId = Form.useWatch('category_id', form)
  const selectedSubCategoryId = Form.useWatch('subcategory_id', form)

  const filteredSubCategories = subCategories.filter(
    subCat => subCat.parent_category_id === selectedCategoryId
  )

  const filteredSeries = series.filter(s => {
    return s.category?.id === selectedCategoryId &&
           (!selectedSubCategoryId || s.subCategory?.id === selectedSubCategoryId)
  })

  // Render dynamic form fields based on templates
  const renderDynamicFields = () => {
    if (!currentProductTypeTemplates || currentProductTypeTemplates.length === 0) {
      return null
    }

    // Group fields into rows of 3
    const fieldRows = []
    for (let i = 0; i < currentProductTypeTemplates.length; i += 3) {
      fieldRows.push(currentProductTypeTemplates.slice(i, i + 3))
    }

    return fieldRows.map((row, rowIndex) => (
      <Row gutter={16} key={rowIndex}>
        {row.map(template => renderDynamicField(template))}
      </Row>
    ))
  }

  // Render individual dynamic field
  const renderDynamicField = (template) => {
    const { id, field_name, display_label, field_type, is_required, placeholder_text, help_text, options, min_value, max_value } = template

    const rules = []
    if (is_required) {
      rules.push({ required: true, message: `${display_label} is required` })
    }
    if (min_value !== null || max_value !== null) {
      rules.push({
        type: 'number',
        min: min_value,
        max: max_value,
        message: `Value must be between ${min_value || 0} and ${max_value || 'unlimited'}`
      })
    }

    switch (field_type) {
      case 'text':
        return (
          <Col span={8} key={id}>
            <Form.Item
              label={display_label}
              name={field_name}
              rules={rules}
              tooltip={help_text}
            >
              <Input placeholder={placeholder_text} />
            </Form.Item>
          </Col>
        )

      case 'number_with_unit':
        // This field type needs two inputs: value + unit
        const unitOptions = options || []
        return (
          <>
            <Col span={5} key={`${id}-value`}>
              <Form.Item
                label={display_label}
                name={`${field_name}_value`}
                rules={rules}
                tooltip={help_text}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={placeholder_text}
                  min={min_value || 0}
                  max={max_value}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={3} key={`${id}-unit`}>
              <Form.Item
                label="Unit"
                name={`${field_name}_unit`}
                rules={is_required ? [{ required: true, message: 'Required' }] : []}
              >
                <Select placeholder="Unit">
                  {unitOptions.map(opt => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.value}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </>
        )

      case 'select':
        const selectOptions = options || []
        return (
          <Col span={8} key={id}>
            <Form.Item
              label={display_label}
              name={field_name}
              rules={rules}
              tooltip={help_text}
            >
              <Select placeholder={placeholder_text} allowClear>
                {selectOptions.map(opt => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        )

      case 'multiselect':
        const multiOptions = options || []
        return (
          <Col span={8} key={id}>
            <Form.Item
              label={display_label}
              name={field_name}
              rules={rules}
              tooltip={help_text}
            >
              <Select mode="multiple" placeholder={placeholder_text} allowClear>
                {multiOptions.map(opt => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        )

      default:
        return null
    }
  }

  return (
    <Modal
      title={getTitle()}
      open={open}
      onOk={form.submit}
      onCancel={handleCancel}
      width={900}
      okText={mode === 'create' ? 'Create Product Model' : 'Update Product Model'}
      cancelText="Cancel"
      maskClosable={false}
      confirmLoading={loading}
      style={{ top: 20 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: '24px' }}
      >
        {/* SECTION 1: Basic Information */}
        <div style={{
          background: '#f0f5ff',
          padding: '12px 16px',
          borderRadius: '4px',
          marginBottom: '16px',
          border: '1px solid #d6e4ff'
        }}>
          <Text strong style={{ color: '#1890ff' }}>
            📝 Basic Information
          </Text>
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={
                <Space>
                  <span>Product Name</span>
                  <Tooltip title="Enter the complete product model name">
                    <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                  </Tooltip>
                </Space>
              }
              name="name"
              rules={[
                { required: true, message: 'Product model name is required' },
                { min: 2, message: 'Must be at least 2 characters' },
                { max: 200, message: 'Must not exceed 200 characters' }
              ]}
            >
              <Input
                placeholder="e.g., Dell Latitude 5520"
                showCount
                maxLength={200}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={
                <Space>
                  <span>Model Number</span>
                  <Tooltip title="Enter the manufacturer's model number">
                    <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                  </Tooltip>
                </Space>
              }
              name="model"
              rules={[
                { required: true, message: 'Model number is required' },
                { min: 2, message: 'Must be at least 2 characters' },
                { max: 100, message: 'Must not exceed 100 characters' }
              ]}
            >
              <Input
                placeholder="e.g., LAT-5520-I7"
                showCount
                maxLength={100}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={
            <Space>
              <span>Description</span>
              <Text type="secondary" style={{ fontSize: '12px' }}>(Optional)</Text>
            </Space>
          }
          name="description"
          rules={[
            { max: 1000, message: 'Description must not exceed 1000 characters' }
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Enter a brief description of the product model..."
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Divider style={{ margin: '24px 0' }} />

        {/* SECTION 2: Classification */}
        <div style={{
          background: '#f6ffed',
          padding: '12px 16px',
          borderRadius: '4px',
          marginBottom: '16px',
          border: '1px solid #b7eb8f'
        }}>
          <Text strong style={{ color: '#52c41a' }}>
            🏷️ Classification
          </Text>
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Product Type"
              name="type_id"
              tooltip="Select the type of component (e.g., RAM, CPU, Storage)"
            >
              <Select
                placeholder="Select product type"
                allowClear
                showSearch
                optionFilterProp="children"
                onChange={handleProductTypeChange}
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {types.map(type => (
                  <Option key={type.id} value={type.id}>
                    {type.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="OEM Manufacturer"
              name="oem_id"
              rules={[
                { required: true, message: 'OEM is required' }
              ]}
            >
              <Select
                placeholder="Select OEM manufacturer"
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
                { required: true, message: 'Category is required' }
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
              name="subcategory_id"
              rules={[
                { required: true, message: 'Sub category is required' }
              ]}
              help={!selectedCategoryId && <Text type="secondary">Select a category first</Text>}
            >
              <Select
                placeholder="Select product sub category"
                allowClear
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                onChange={handleSubCategoryChange}
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
          <Col span={12}>
            <Form.Item
              label="Product Series"
              name="series_id"
              help={!selectedSubCategoryId && <Text type="secondary">Select a sub category first</Text>}
            >
              <Select
                placeholder="Select product series"
                allowClear
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                disabled={!selectedSubCategoryId}
              >
                {filteredSeries.map(seriesItem => (
                  <Option key={seriesItem.id} value={seriesItem.id}>
                    {seriesItem.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ margin: '24px 0' }} />

        {/* SECTION 3: Technical Details */}
        <div style={{
          background: '#fff7e6',
          padding: '12px 16px',
          borderRadius: '4px',
          marginBottom: '16px',
          border: '1px solid #ffd591'
        }}>
          <Text strong style={{ color: '#fa8c16' }}>
            🔧 Technical Details
          </Text>
        </div>

        {/* Dynamic Component Specifications - Rendered based on Product Type */}
        {selectedTypeId && currentProductTypeTemplates && currentProductTypeTemplates.length > 0 ? (
          <>
            {renderDynamicFields()}
          </>
        ) : selectedTypeId ? (
          <div style={{ padding: '20px', textAlign: 'center', background: '#f5f5f5', borderRadius: '4px', marginBottom: '16px' }}>
            <Text type="secondary">No custom fields configured for this product type</Text>
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', background: '#e6f7ff', borderRadius: '4px', marginBottom: '16px', border: '1px dashed #91d5ff' }}>
            <Text type="secondary">Select a Product Type to see specific component fields</Text>
          </div>
        )}

        <Form.Item
          label={
            <Space>
              <span>Technical Specifications</span>
              <Text type="secondary" style={{ fontSize: '12px' }}>(Optional)</Text>
            </Space>
          }
          name="specifications"
          rules={[
            { max: 2000, message: 'Specifications must not exceed 2000 characters' }
          ]}
          tooltip="Enter additional detailed specifications or features"
        >
          <TextArea
            rows={3}
            placeholder="Example: ECC Support, RGB Lighting, Heatsink included, etc."
            maxLength={2000}
            showCount
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={
                <Space>
                  <span>Warranty Period</span>
                  <Tooltip title="Warranty period in months">
                    <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                  </Tooltip>
                </Space>
              }
              name="warranty_period"
              rules={[
                { required: true, message: 'Warranty period is required' },
                { type: 'number', min: 0, max: 120, message: 'Must be between 0 and 120 months' }
              ]}
            >
              <InputNumber
                placeholder="12"
                min={0}
                max={120}
                style={{ width: '100%' }}
                addonAfter="months"
              />
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
                <Option value={true}>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    Active
                  </Space>
                </Option>
                <Option value={false}>
                  <Space>
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    Inactive
                  </Space>
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

ProductModelForm.propTypes = {
  open: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  product: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
}

export default ProductModelForm
