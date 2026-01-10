import { useState } from 'react'
import { Modal, Steps, Form, Input, Select, Button, Upload, Table, message, Space, InputNumber } from 'antd'
import { UploadOutlined, DownloadOutlined, CheckCircleOutlined } from '@ant-design/icons'
import api from '../../../services/api'

const { Step } = Steps

const BulkAddAssetsModal = ({ visible, onClose, onSuccess, products, locations, oems, categories }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [form] = Form.useForm()
  const [assetData, setAssetData] = useState(null)
  const [uploadedData, setUploadedData] = useState([])
  const [loading, setLoading] = useState(false)

  const handleNext = () => {
    form.validateFields().then(values => {
      setAssetData(values)
      setCurrentStep(currentStep + 1)
    })
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleDownloadTemplate = async () => {
    try {
      const quantity = form.getFieldValue('quantity')
      const product_id = form.getFieldValue('product_id')
      const response = await api.get('/assets/bulk-template', {
        params: { quantity, product_id },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `bulk_assets_template_${quantity}_items.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      message.success('Template downloaded successfully')
    } catch (error) {
      console.error('Error downloading template:', error)
      message.error('Failed to download template')
    }
  }

  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('product_id', assetData.product_id)

      const response = await api.post('/assets/parse-bulk-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.success) {
        setUploadedData(response.data.data)
        message.success(`${response.data.data.length} assets parsed successfully`)
        setCurrentStep(2) // Move to preview step
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to parse Excel file')
      console.error(error)
    }
    return false // Prevent auto upload
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await api.post('/assets/bulk', { assets: uploadedData })

      if (response.data.success) {
        message.success(`${response.data.data.created} assets created successfully!`)
        if (response.data.data.errors && response.data.data.errors.length > 0) {
          message.warning(`${response.data.data.errors.length} asset(s) failed to create`)
        }
        onSuccess()
        handleClose()
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create assets')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setCurrentStep(0)
    form.resetFields()
    setAssetData(null)
    setUploadedData([])
    onClose()
  }

  const previewColumns = [
    { title: 'Row', dataIndex: 'row_number', key: 'row', width: 60 },
    { title: 'Serial Number', dataIndex: 'serial_number', key: 'serial', width: 150 },
    { title: 'Asset Type', dataIndex: 'asset_type', key: 'asset_type', width: 100 },
    { title: 'Parent Asset', dataIndex: 'parent_asset_tag', key: 'parent_tag', width: 120 },
    {
      title: 'Standby',
      dataIndex: 'is_standby_asset',
      key: 'is_standby',
      width: 80,
      render: (val) => val ? 'Yes' : 'No'
    },
    {
      title: 'Available',
      dataIndex: 'standby_available',
      key: 'standby_available',
      width: 80,
      render: (val) => val ? 'Yes' : 'No'
    },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 100 },
    { title: 'Condition', dataIndex: 'condition_status', key: 'condition', width: 100 },
    { title: 'Purchase Date', dataIndex: 'purchase_date', key: 'purchase_date', width: 120 },
    { title: 'Purchase Cost', dataIndex: 'purchase_cost', key: 'cost', width: 120 },
    { title: 'Warranty Start', dataIndex: 'warranty_start_date', key: 'warranty_start', width: 120 },
    { title: 'Warranty End', dataIndex: 'warranty_end_date', key: 'warranty_end', width: 120 },
    { title: 'EOL Date', dataIndex: 'eol_date', key: 'eol_date', width: 120 },
    { title: 'EOS Date', dataIndex: 'eos_date', key: 'eos_date', width: 120 },
    {
      title: 'Software',
      dataIndex: 'additional_software',
      key: 'additional_software',
      width: 150,
      render: (software) => software && software.length > 0 ? `${software.length} software(s)` : 'None'
    },
    { title: 'Notes', dataIndex: 'notes', key: 'notes', ellipsis: true }
  ]

  return (
    <Modal
      title={<span className="text-sm sm:text-base">Bulk Add Assets</span>}
      open={visible}
      onCancel={handleClose}
      width={typeof window !== 'undefined' && window.innerWidth < 768 ? '95vw' : typeof window !== 'undefined' && window.innerWidth < 1024 ? '90vw' : 900}
      footer={null}
      className="responsive-modal"
    >
      <Steps current={currentStep} className="mb-4 sm:mb-6" size={typeof window !== 'undefined' && window.innerWidth < 640 ? 'small' : 'default'}>
        <Step
          title={<span className="text-xs sm:text-sm">Product Details</span>}
          description={<span className="hidden sm:inline text-xs">Select product & quantity</span>}
        />
        <Step
          title={<span className="text-xs sm:text-sm">Download & Fill</span>}
          description={<span className="hidden sm:inline text-xs">Add serial numbers</span>}
        />
        <Step
          title={<span className="text-xs sm:text-sm">Preview</span>}
          description={<span className="hidden sm:inline text-xs">Review before saving</span>}
        />
      </Steps>

      {currentStep === 0 && (
        <Form form={form} layout="vertical">
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber min={1} max={1000} style={{ width: '100%' }} placeholder="How many assets?" />
          </Form.Item>

          <Form.Item
            name="product_id"
            label="Product"
            rules={[{ required: true, message: 'Please select a product' }]}
          >
            <Select
              showSearch
              placeholder="Select product"
              optionFilterProp="children"
              filterOption={(input, option) => {
                const searchText = `${option.label || ''}`.toLowerCase()
                return searchText.includes(input.toLowerCase())
              }}
              options={products?.map(p => ({ value: p.id, label: `${p.name} - ${p.model || 'N/A'}` }))}
            />
          </Form.Item>

          <div className="flex justify-end">
            <Button onClick={handleClose} className="mr-2">Cancel</Button>
            <Button type="primary" onClick={handleNext}>Next</Button>
          </div>
        </Form>
      )}

      {currentStep === 1 && (
        <div>
          <div className="mb-4 p-4 bg-blue-50 rounded">
            <h4 className="font-semibold mb-2">Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "Download Template" to get the Excel file (2 sheets: Assets + Additional Software)</li>
              <li><strong>Sheet 1 (Assets):</strong> Fill in Serial Number, Warranty dates, EOL/EOS dates, OS & Office software with license keys</li>
              <li><strong>Sheet 2 (Additional Software):</strong> Add unlimited software installations by matching Serial Number</li>
              <li>Optionally, set "Asset Type" to "component" and specify "Parent Asset Tag" to create components</li>
              <li>You can also update Purchase Date, Cost, Installation Notes, and other fields</li>
              <li>Upload the completed file below</li>
            </ol>
          </div>

          <div className="flex justify-between items-center mb-4">
            <Button icon={<DownloadOutlined />} type="primary" onClick={handleDownloadTemplate}>
              Download Template ({assetData?.quantity} rows)
            </Button>
          </div>

          <Upload
            beforeUpload={handleFileUpload}
            maxCount={1}
            accept=".xlsx,.xls"
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />} block size="large">
              Upload Completed File
            </Button>
          </Upload>

          <div className="flex justify-between mt-6">
            <Button onClick={handlePrevious}>Previous</Button>
            <Button onClick={handleClose}>Cancel</Button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div>
          <div className="mb-4 flex items-center text-green-600">
            <CheckCircleOutlined className="text-2xl mr-2" />
            <span className="font-semibold">{uploadedData.length} assets ready to be created</span>
          </div>

          <Table
            columns={previewColumns}
            dataSource={uploadedData}
            pagination={{ pageSize: 10, simple: typeof window !== 'undefined' && window.innerWidth < 576 }}
            scroll={{ x: 600, y: typeof window !== 'undefined' && window.innerWidth < 640 ? 300 : 400 }}
            size="small"
            rowKey="Row"
          />

          <div className="flex justify-between mt-6">
            <Button onClick={() => setCurrentStep(1)}>Back to Upload</Button>
            <Space>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="primary" onClick={handleSave} loading={loading}>
                Create {uploadedData.length} Assets
              </Button>
            </Space>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default BulkAddAssetsModal
