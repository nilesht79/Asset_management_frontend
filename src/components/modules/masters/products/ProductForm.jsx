import React, { useEffect } from 'react'
import { Modal, Form, Input, Select, Row, Col, InputNumber, Divider } from 'antd'
import { ShoppingOutlined } from '@ant-design/icons'

const { TextArea } = Input
const { Option } = Select

const ProductForm = ({ visible, onCancel, onSubmit, editData, oems = [], categories = [] }) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (visible) {
      if (editData) {
        form.setFieldsValue({
          ...editData,
          oemId: editData.oem?.id,
          categoryId: editData.category?.id,
          processor: editData.specifications?.processor,
          memory: editData.specifications?.memory,
          storage: editData.specifications?.storage,
          display: editData.specifications?.display,
          graphics: editData.specifications?.graphics,
          os: editData.specifications?.os
        })
      } else {
        form.resetFields()
      }
    }
  }, [visible, editData, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      // Transform form values to match expected structure
      const formattedValues = {
        name: values.name,
        code: values.code,
        model: values.model,
        description: values.description,
        oem: oems.find(o => o.id === values.oemId),
        category: categories.find(c => c.id === values.categoryId),
        specifications: {
          processor: values.processor,
          memory: values.memory,
          storage: values.storage,
          display: values.display,
          graphics: values.graphics,
          os: values.os
        },
        unitPrice: values.unitPrice,
        warrantyMonths: values.warrantyMonths,
        status: values.status
      }
      
      await onSubmit(formattedValues)
    } catch (error) {
      console.error('Form validation failed:', error)
    }
  }

  const generateProductCode = () => {
    const oem = oems.find(o => o.id === form.getFieldValue('oemId'))
    const category = categories.find(c => c.id === form.getFieldValue('categoryId'))
    const model = form.getFieldValue('model')
    
    if (oem && category && model) {
      // Generate code like DELL-LAT-5520
      const modelCode = model.replace(/\s+/g, '-').toUpperCase().substring(0, 10)
      return `${oem.code}-${modelCode}`
    }
    return ''
  }

  const handleOEMOrModelChange = () => {
    setTimeout(() => {
      const generatedCode = generateProductCode()
      if (generatedCode && !form.getFieldValue('code')) {
        form.setFieldsValue({ code: generatedCode })
      }
    }, 100)
  }

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
            <ShoppingOutlined className="text-white text-sm" />
          </div>
          <span className="text-xl font-semibold">
            {editData ? 'Edit Product' : 'Create New Product'}
          </span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={900}
      okText={editData ? 'Update Product' : 'Create Product'}
      cancelText="Cancel"
      destroyOnClose
      okButtonProps={{
        className: 'bg-gradient-to-r from-red-600 to-red-700 border-0 hover:from-red-700 hover:to-red-800'
      }}
    >
      <div className="py-4 max-h-96 overflow-y-auto">
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          {/* Basic Information */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="OEM"
                  name="oemId"
                  rules={[{ required: true, message: 'Please select an OEM' }]}
                >
                  <Select 
                    placeholder="Select OEM"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={handleOEMOrModelChange}
                  >
                    {oems.map(oem => (
                      <Option key={oem.id} value={oem.id}>
                        <div className="flex items-center justify-between">
                          <span>{oem.name}</span>
                          <span className="text-xs text-gray-500">({oem.code})</span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Category"
                  name="categoryId"
                  rules={[{ required: true, message: 'Please select a category' }]}
                >
                  <Select 
                    placeholder="Select Category"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {categories.map(category => (
                      <Option key={category.id} value={category.id}>
                        <div className="flex items-center justify-between">
                          <span>{category.name}</span>
                          <span className="text-xs text-gray-500">({category.code})</span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Product Name"
              name="name"
              rules={[
                { required: true, message: 'Please enter product name' },
                { min: 3, message: 'Name must be at least 3 characters' },
                { max: 200, message: 'Name must be less than 200 characters' }
              ]}
            >
              <Input placeholder="e.g., Dell Latitude 5520" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Model"
                  name="model"
                  rules={[
                    { required: true, message: 'Please enter model' },
                    { min: 2, message: 'Model must be at least 2 characters' }
                  ]}
                >
                  <Input 
                    placeholder="e.g., Latitude 5520" 
                    onChange={handleOEMOrModelChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Product Code"
                  name="code"
                  rules={[
                    { required: true, message: 'Please enter product code' },
                    { pattern: /^[A-Z0-9\-_]+$/, message: 'Code must contain only uppercase letters, numbers, hyphens, and underscores' }
                  ]}
                  extra="Auto-generated based on OEM and model, but can be customized"
                >
                  <Input 
                    placeholder="e.g., DELL-LAT-5520" 
                    style={{ textTransform: 'uppercase' }}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase()
                      form.setFieldsValue({ code: value })
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Description"
              name="description"
              rules={[
                { required: true, message: 'Please enter product description' },
                { min: 10, message: 'Description must be at least 10 characters' },
                { max: 500, message: 'Description must be less than 500 characters' }
              ]}
            >
              <TextArea 
                rows={3} 
                placeholder="Detailed product description..."
                showCount
                maxLength={500}
              />
            </Form.Item>
          </div>

          <Divider />

          {/* Technical Specifications */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h4>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Processor"
                  name="processor"
                  rules={[{ required: true, message: 'Please enter processor details' }]}
                >
                  <Input placeholder="e.g., Intel Core i7-1165G7" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Memory (RAM)"
                  name="memory"
                  rules={[{ required: true, message: 'Please enter memory specifications' }]}
                >
                  <Input placeholder="e.g., 16GB DDR4" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Storage"
                  name="storage"
                  rules={[{ required: true, message: 'Please enter storage details' }]}
                >
                  <Input placeholder="e.g., 512GB SSD" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Display"
                  name="display"
                >
                  <Input placeholder="e.g., 15.6 inch FHD" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Graphics"
                  name="graphics"
                >
                  <Input placeholder="e.g., Intel UHD Graphics" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Operating System"
                  name="os"
                >
                  <Input placeholder="e.g., Windows 11 Pro" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider />

          {/* Pricing and Status */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Status</h4>
            
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Unit Price ($)"
                  name="unitPrice"
                  rules={[
                    { required: true, message: 'Please enter unit price' },
                    { type: 'number', min: 0.01, message: 'Price must be greater than 0' }
                  ]}
                >
                  <InputNumber 
                    style={{ width: '100%' }}
                    placeholder="0.00"
                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    precision={2}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Warranty (Months)"
                  name="warrantyMonths"
                  rules={[
                    { required: true, message: 'Please enter warranty period' },
                    { type: 'number', min: 1, max: 120, message: 'Warranty must be between 1-120 months' }
                  ]}
                  initialValue={12}
                >
                  <InputNumber 
                    style={{ width: '100%' }}
                    placeholder="12"
                    min={1}
                    max={120}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Status"
                  name="status"
                  rules={[{ required: true, message: 'Please select status' }]}
                  initialValue="active"
                >
                  <Select placeholder="Select status">
                    <Option value="active">
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Active
                      </span>
                    </Option>
                    <Option value="inactive">
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        Inactive
                      </span>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Guidelines */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
            <div className="text-sm font-medium text-gray-800 mb-2">Product Guidelines:</div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Ensure all technical specifications are accurate and complete</li>
              <li>• Product codes should be unique and follow naming conventions</li>
              <li>• Include warranty period as specified by the manufacturer</li>
              <li>• Pricing should reflect the most recent market rates</li>
            </ul>
          </div>
        </Form>
      </div>
    </Modal>
  )
}

export default ProductForm