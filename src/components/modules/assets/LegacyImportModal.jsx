import { useState } from 'react'
import { Modal, Steps, Button, Upload, Table, message, Progress, Alert, Space, Tag, Typography } from 'antd'
import { UploadOutlined, DownloadOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined, FileExcelOutlined } from '@ant-design/icons'
import api from '../../../services/api'

const { Step } = Steps
const { Text, Title } = Typography
const { Dragger } = Upload

const LegacyImportModal = ({ visible, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [validationResult, setValidationResult] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState(null)

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/assets/legacy-template', {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'legacy_asset_upload_template.xlsx')
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
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/assets/legacy-validate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.success) {
        setValidationResult(response.data.data)
        setCurrentStep(1)
        message.success(`Validation complete: ${response.data.data.summary.total} rows processed`)
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to validate file')
      console.error(error)
    } finally {
      setUploading(false)
    }
    return false
  }

  const handleImport = async () => {
    if (!validationResult) return

    // Combine valid and warning rows for import
    const assetsToImport = [...validationResult.valid, ...validationResult.warnings]

    if (assetsToImport.length === 0) {
      message.error('No valid assets to import')
      return
    }

    setImporting(true)
    setImportProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 500)

      const response = await api.post('/assets/legacy-import', {
        assets: assetsToImport
      })

      clearInterval(progressInterval)
      setImportProgress(100)

      if (response.data.success) {
        setImportResult(response.data.data)
        setCurrentStep(2)
        message.success(`Import completed: ${response.data.data.successful} assets created`)
        onSuccess()
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to import assets')
      console.error(error)
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setCurrentStep(0)
    setValidationResult(null)
    setImportResult(null)
    setImportProgress(0)
    onClose()
  }

  const downloadErrorReport = () => {
    if (!validationResult || validationResult.errors.length === 0) return

    // Create CSV content
    const headers = ['Row', 'Serial Number', 'Product', 'Errors']
    const rows = validationResult.errors.map(row => [
      row.row_number,
      row.serial_number,
      row.product_input,
      row.errors.join('; ')
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'import_errors.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    message.success('Error report downloaded')
  }

  const validationColumns = [
    {
      title: 'Row',
      dataIndex: 'row_number',
      key: 'row',
      width: 60,
      fixed: 'left'
    },
    {
      title: 'Status',
      key: 'status',
      width: 90,
      render: (_, record) => {
        if (record.errors && record.errors.length > 0) {
          return <Tag color="error" icon={<CloseCircleOutlined />}>Error</Tag>
        } else if (record.warnings && record.warnings.length > 0) {
          return <Tag color="warning" icon={<ExclamationCircleOutlined />}>Warning</Tag>
        } else {
          return <Tag color="success" icon={<CheckCircleOutlined />}>Valid</Tag>
        }
      }
    },
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial',
      width: 150
    },
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product',
      width: 200
    },
    {
      title: 'Assigned To',
      dataIndex: 'assigned_user_name',
      key: 'assigned_to',
      width: 200,
      render: (text) => text || <Text type="secondary">Unassigned</Text>
    },
    {
      title: 'Issues',
      key: 'issues',
      render: (_, record) => {
        const issues = [...(record.errors || []), ...(record.warnings || [])]
        if (issues.length === 0) return <Text type="success">No issues</Text>
        return (
          <div>
            {issues.map((issue, idx) => (
              <div key={idx}>
                <Text type={record.errors && record.errors.includes(issue) ? 'danger' : 'warning'}>
                  • {issue}
                </Text>
              </div>
            ))}
          </div>
        )
      }
    }
  ]

  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <div style={{ marginBottom: 24 }}>
              <Title level={5}>Step 1: Download Template</Title>
              <Text type="secondary">
                Download the Excel template with sample data and reference sheets for products and users.
              </Text>
              <div style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadTemplate}
                  size="large"
                >
                  Download Template
                </Button>
              </div>
            </div>

            <div style={{ marginTop: 32 }}>
              <Title level={5}>Step 2: Upload Completed File</Title>
              <Text type="secondary">
                Fill in the template with your legacy asset data and upload it here for validation.
              </Text>
              <Dragger
                accept=".xlsx,.xls"
                beforeUpload={handleFileUpload}
                showUploadList={false}
                disabled={uploading}
                style={{ marginTop: 16 }}
              >
                <p className="ant-upload-drag-icon">
                  <FileExcelOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                </p>
                <p className="ant-upload-text">Click or drag Excel file to this area</p>
                <p className="ant-upload-hint">
                  Supports .xlsx and .xls formats. Maximum 10,000 rows.
                </p>
              </Dragger>
              {uploading && (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Progress percent={50} status="active" />
                  <Text>Validating file...</Text>
                </div>
              )}
            </div>
          </div>
        )

      case 1:
        return (
          <div>
            <div style={{ marginBottom: 24 }}>
              <Alert
                message="Validation Results"
                description={
                  <div>
                    <div>Total rows: <strong>{validationResult?.summary.total || 0}</strong></div>
                    <div style={{ color: '#52c41a' }}>✓ Valid rows: <strong>{validationResult?.summary.valid || 0}</strong></div>
                    <div style={{ color: '#faad14' }}>⚠ Warning rows: <strong>{validationResult?.summary.warnings || 0}</strong></div>
                    <div style={{ color: '#ff4d4f' }}>✕ Error rows: <strong>{validationResult?.summary.errors || 0}</strong></div>
                  </div>
                }
                type={validationResult?.summary.errors > 0 ? 'warning' : 'success'}
                showIcon
              />
            </div>

            {validationResult?.errors?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={downloadErrorReport}
                >
                  Download Error Report
                </Button>
              </div>
            )}

            <Table
              columns={validationColumns}
              dataSource={[
                ...(validationResult?.valid || []),
                ...(validationResult?.warnings || []),
                ...(validationResult?.errors || [])
              ]}
              rowKey="row_number"
              scroll={{ x: 1200, y: 400 }}
              pagination={{ pageSize: 50 }}
              size="small"
              rowClassName={(record) => {
                if (record.errors && record.errors.length > 0) return 'error-row'
                if (record.warnings && record.warnings.length > 0) return 'warning-row'
                return 'valid-row'
              }}
            />

            {importing && (
              <div style={{ marginTop: 24 }}>
                <Progress percent={importProgress} status="active" />
                <Text style={{ marginTop: 8, display: 'block', textAlign: 'center' }}>
                  Importing assets... {importProgress}%
                </Text>
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div>
            <Alert
              message="Import Completed Successfully"
              description={
                <div>
                  <div>Total processed: <strong>{importResult?.total || 0}</strong></div>
                  <div style={{ color: '#52c41a' }}>✓ Successfully created: <strong>{importResult?.successful || 0}</strong></div>
                  <div style={{ color: '#ff4d4f' }}>✕ Failed: <strong>{importResult?.failed || 0}</strong></div>
                </div>
              }
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
            />

            {importResult?.details?.failed?.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Title level={5}>Failed Imports</Title>
                <Table
                  columns={[
                    { title: 'Row', dataIndex: 'row', key: 'row', width: 80 },
                    { title: 'Serial Number', dataIndex: 'serial_number', key: 'serial', width: 150 },
                    { title: 'Error', dataIndex: 'error', key: 'error' }
                  ]}
                  dataSource={importResult.details.failed}
                  rowKey="row"
                  pagination={false}
                  size="small"
                />
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Modal
      title="Import Legacy Assets"
      open={visible}
      onCancel={handleClose}
      width={1200}
      footer={
        <Space>
          {currentStep === 1 && (
            <Button onClick={() => setCurrentStep(0)}>
              Back
            </Button>
          )}
          <Button onClick={handleClose}>
            {currentStep === 2 ? 'Close' : 'Cancel'}
          </Button>
          {currentStep === 1 && (
            <Button
              type="primary"
              onClick={handleImport}
              disabled={importing || (validationResult?.valid?.length === 0 && validationResult?.warnings?.length === 0)}
              loading={importing}
            >
              Import {(validationResult?.valid?.length || 0) + (validationResult?.warnings?.length || 0)} Assets
            </Button>
          )}
        </Space>
      }
    >
      <Steps current={currentStep} style={{ marginBottom: 32 }}>
        <Step title="Upload" description="Download & upload file" />
        <Step title="Validate" description="Review validation results" />
        <Step title="Complete" description="Import summary" />
      </Steps>

      {getStepContent()}

      <style jsx>{`
        .error-row {
          background-color: #fff1f0 !important;
        }
        .warning-row {
          background-color: #fffbe6 !important;
        }
        .valid-row {
          background-color: #f6ffed !important;
        }
      `}</style>
    </Modal>
  )
}

export default LegacyImportModal
