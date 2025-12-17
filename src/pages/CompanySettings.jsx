import React, { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  message,
  Typography,
  Space,
  Divider,
  Spin,
  Avatar,
  Row,
  Col,
  Alert,
  Switch
} from 'antd'
import {
  UploadOutlined,
  SaveOutlined,
  DeleteOutlined,
  PictureOutlined,
  BankOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import companySettingsService from '../services/companySettings'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

const CompanySettings = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [logoUrl, setLogoUrl] = useState(null)
  const [logoFilename, setLogoFilename] = useState(null)
  const [showNameInPdf, setShowNameInPdf] = useState(true)

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await companySettingsService.getSettings()
      const data = response.data?.data || {}

      form.setFieldsValue({
        name: data.name || '',
        address: data.address || ''
      })

      setLogoFilename(data.logo)
      setShowNameInPdf(data.showNameInPdf !== false) // Default to true
      if (data.logoUrl) {
        // Construct full URL
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
        setLogoUrl(`${baseUrl}${data.logoUrl}`)
      } else {
        setLogoUrl(null)
      }
    } catch (error) {
      console.error('Failed to fetch company settings:', error)
      message.error('Failed to load company settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (values) => {
    setSaving(true)
    try {
      await companySettingsService.updateSettings({
        name: values.name,
        address: values.address,
        showNameInPdf
      })
      message.success('Company settings saved successfully')
    } catch (error) {
      console.error('Failed to save settings:', error)
      message.error('Failed to save company settings')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (file) => {
    // Validate file type
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('You can only upload image files!')
      return false
    }

    // Validate file size (2MB)
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('Logo must be smaller than 2MB!')
      return false
    }

    setUploading(true)
    try {
      const response = await companySettingsService.uploadLogo(file)
      const data = response.data?.data || {}

      setLogoFilename(data.logo)
      if (data.logoUrl) {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
        setLogoUrl(`${baseUrl}${data.logoUrl}`)
      }

      message.success('Logo uploaded successfully')
    } catch (error) {
      console.error('Failed to upload logo:', error)
      message.error('Failed to upload logo')
    } finally {
      setUploading(false)
    }

    return false // Prevent default upload behavior
  }

  const handleDeleteLogo = async () => {
    try {
      await companySettingsService.deleteLogo()
      setLogoUrl(null)
      setLogoFilename(null)
      message.success('Logo deleted successfully')
    } catch (error) {
      console.error('Failed to delete logo:', error)
      message.error('Failed to delete logo')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" tip="Loading settings..." />
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3}>
          <BankOutlined style={{ marginRight: 8 }} />
          Company Branding
        </Title>
        <Text type="secondary">
          Configure your company logo and details that appear on PDF reports
        </Text>
      </div>

      <Alert
        message="PDF Report Branding"
        description="The logo and company details configured here will be displayed on all generated PDF reports including Service Reports, Asset Reports, and other documents."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={24}>
        {/* Logo Section */}
        <Col xs={24} md={8}>
          <Card title="Company Logo" style={{ height: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              {logoUrl ? (
                <div>
                  <Avatar
                    src={logoUrl}
                    size={150}
                    shape="square"
                    style={{
                      marginBottom: 16,
                      border: '2px solid #f0f0f0',
                      borderRadius: 8
                    }}
                  />
                  <div>
                    <Space>
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={handleLogoUpload}
                      >
                        <Button
                          icon={<UploadOutlined />}
                          loading={uploading}
                          size="small"
                        >
                          Change
                        </Button>
                      </Upload>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleDeleteLogo}
                        size="small"
                      >
                        Remove
                      </Button>
                    </Space>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{
                    width: 150,
                    height: 150,
                    border: '2px dashed #d9d9d9',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    backgroundColor: '#fafafa'
                  }}>
                    <PictureOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />
                  </div>
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={handleLogoUpload}
                  >
                    <Button
                      type="primary"
                      icon={<UploadOutlined />}
                      loading={uploading}
                    >
                      Upload Logo
                    </Button>
                  </Upload>
                </div>
              )}

              <Paragraph type="secondary" style={{ marginTop: 16, fontSize: 12 }}>
                Recommended: 200x200px or larger<br />
                Max size: 2MB<br />
                Formats: JPG, PNG, SVG
              </Paragraph>

              {logoUrl && (
                <>
                  <Divider style={{ margin: '16px 0' }} />
                  <div style={{ textAlign: 'left' }}>
                    <Space>
                      <Switch
                        checked={showNameInPdf}
                        onChange={setShowNameInPdf}
                        size="small"
                      />
                      <Text style={{ fontSize: 12 }}>Show company name in PDFs</Text>
                    </Space>
                    <Paragraph type="secondary" style={{ fontSize: 11, marginTop: 4, marginBottom: 0 }}>
                      Disable if your logo already contains the company name
                    </Paragraph>
                  </div>
                </>
              )}
            </div>
          </Card>
        </Col>

        {/* Company Details Section */}
        <Col xs={24} md={16}>
          <Card title="Company Details">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
            >
              <Form.Item
                name="name"
                label="Company Name"
                rules={[{ required: true, message: 'Please enter company name' }]}
              >
                <Input
                  placeholder="Enter company name"
                  maxLength={100}
                />
              </Form.Item>

              <Form.Item
                name="address"
                label="Company Address"
                extra="This will appear below the company name on PDF reports"
              >
                <TextArea
                  placeholder="Enter company address (optional)"
                  rows={3}
                  maxLength={300}
                />
              </Form.Item>

              <Divider />

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={saving}
                  >
                    Save Settings
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchSettings}
                  >
                    Reset
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Preview Section */}
      <Card title="PDF Header Preview" style={{ marginTop: 24 }}>
        <div style={{
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          padding: 20,
          backgroundColor: '#fafafa'
        }}>
          <Row align="middle">
            <Col flex="auto">
              <Space align="start">
                {logoUrl ? (
                  <Avatar
                    src={logoUrl}
                    size={60}
                    shape="square"
                    style={{ borderRadius: 4 }}
                  />
                ) : (
                  <div style={{
                    width: 60,
                    height: 60,
                    backgroundColor: '#e8e8e8',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <PictureOutlined style={{ fontSize: 24, color: '#999' }} />
                  </div>
                )}
                {(showNameInPdf || !logoUrl) && (
                  <div>
                    <Title level={4} style={{ margin: 0, color: '#1a365d' }}>
                      {form.getFieldValue('name') || 'Company Name'}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {form.getFieldValue('address') || 'Company address will appear here'}
                    </Text>
                  </div>
                )}
              </Space>
            </Col>
            <Col>
              <div style={{ textAlign: 'right' }}>
                <Title level={4} style={{ margin: 0, color: '#1a365d' }}>
                  SERVICE REPORT
                </Title>
                <Text style={{ color: '#2b6cb0' }}>SR-2025-0001</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Generated: {new Date().toLocaleDateString()}
                </Text>
              </div>
            </Col>
          </Row>
          <Divider style={{ margin: '12px 0' }} />
          <Text type="secondary" style={{ fontSize: 11 }}>
            This is how your company branding will appear on PDF reports
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default CompanySettings
