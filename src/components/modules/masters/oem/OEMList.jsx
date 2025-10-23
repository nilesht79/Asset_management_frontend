import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Button, Input, Select, Space, Modal, message, Upload, Progress, Alert } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, UploadOutlined, DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons'
import OEMForm from './OEMForm'
import { fetchOEMs, deleteOEM, exportOEMs } from '../../../../store/slices/masterSlice'
import api from '../../../../services/api'

const { Search } = Input
const { Option } = Select
const { confirm } = Modal
const { Dragger } = Upload

const OEMList = () => {
  const dispatch = useDispatch()
  const { oems, pagination } = useSelector(state => state.master)
  const loading = oems?.loading || false
  const oemData = oems?.data || []
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOEM, setSelectedOEM] = useState(null)
  const [modalMode, setModalMode] = useState('create')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [isBulkModalVisible, setIsBulkModalVisible] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState(null)
  const [file, setFile] = useState(null)

  useEffect(() => {
    dispatch(fetchOEMs({ page: 1, limit: 10 }))
  }, [dispatch])

  const handleSearch = (value) => {
    dispatch(fetchOEMs({
      page: 1,
      limit: pagination?.limit || 10,
      search: value,
      status: statusFilter === 'All Status' ? '' : statusFilter.toLowerCase()
    }))
  }

  const handleStatusChange = (status) => {
    setStatusFilter(status)
    dispatch(fetchOEMs({
      page: 1,
      limit: pagination?.limit || 10,
      status: status === 'All Status' ? '' : status.toLowerCase()
    }))
  }

  const handleCreate = () => {
    setSelectedOEM(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setSelectedOEM(record)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (record) => {
    confirm({
      title: 'Delete OEM',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${record.name}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(deleteOEM(record.id)).unwrap()
          message.success('OEM deleted successfully')
          dispatch(fetchOEMs({ page: pagination?.page || 1, limit: pagination?.limit || 10 }))
        } catch (error) {
          message.error(error.message || 'Failed to delete OEM')
        }
      }
    })
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedOEM(null)
    setModalMode('create')
  }

  const handleFormSuccess = () => {
    handleModalClose()
    dispatch(fetchOEMs({ page: pagination?.page || 1, limit: pagination?.limit || 10 }))
  }

  const handleTableChange = (paginationInfo) => {
    dispatch(fetchOEMs({
      page: paginationInfo.current,
      limit: paginationInfo.pageSize
    }))
  }

  const handleExport = async () => {
    try {
      const params = {
        format: 'xlsx',
        search: '',
        status: statusFilter === 'All Status' ? '' : statusFilter.toLowerCase()
      }

      const response = await dispatch(exportOEMs(params)).unwrap()

      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `oems_export_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      message.success('OEMs exported successfully')
    } catch (error) {
      message.error('Failed to export OEMs')
      console.error('Export error:', error)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/masters/oem/bulk-template', {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `oem_bulk_upload_template_${new Date().toISOString().split('T')[0]}.xlsx`)
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

  const handleBulkUpload = async () => {
    if (!file) {
      message.error('Please select a file to upload')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await api.post('/masters/oem/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      clearInterval(progressInterval)
      setUploadProgress(100)
      setUploadResult(response.data.data || response.data)

      if (response.data.data?.failed === 0 || response.data.failed === 0) {
        message.success('All OEMs uploaded successfully!')
        setTimeout(() => {
          handleCloseBulkModal()
          dispatch(fetchOEMs({ page: 1, limit: 10 }))
        }, 2000)
      } else {
        message.warning('Upload completed with some errors')
      }
    } catch (error) {
      console.error('Upload error:', error)
      message.error(error.response?.data?.message || 'Upload failed')
      setUploadResult({
        total: 0,
        success: 0,
        failed: 1,
        errors: [{
          row: 0,
          error: error.response?.data?.message || error.message || 'Upload failed'
        }]
      })
    } finally {
      setUploading(false)
    }
  }

  const handleCloseBulkModal = () => {
    setIsBulkModalVisible(false)
    setFile(null)
    setUploading(false)
    setUploadProgress(0)
    setUploadResult(null)
  }

  const uploadProps = {
    beforeUpload: (uploadFile) => {
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]

      if (!allowedTypes.includes(uploadFile.type)) {
        message.error('Invalid file type. Please upload CSV or Excel files only.')
        return false
      }

      if (uploadFile.size > 10 * 1024 * 1024) {
        message.error('File size exceeds 10MB limit.')
        return false
      }

      setFile(uploadFile)
      setUploadResult(null)
      return false
    },
    onRemove: () => {
      setFile(null)
    },
    fileList: file ? [file] : [],
    maxCount: 1,
  }

  const getAlertType = () => {
    if (!uploadResult) return 'info'
    if (uploadResult.failed === 0) return 'success'
    if (uploadResult.success === 0) return 'error'
    return 'warning'
  }

  const getAlertIcon = () => {
    if (!uploadResult) return null
    if (uploadResult.failed === 0) return <CheckCircleOutlined />
    if (uploadResult.success === 0) return <CloseCircleOutlined />
    return <WarningOutlined />
  }

  const errorColumns = [
    {
      title: 'Row',
      dataIndex: 'row',
      key: 'row',
      width: 80,
    },
    {
      title: 'OEM Name',
      dataIndex: 'oem_name',
      key: 'oem_name',
      width: 200,
    },
    {
      title: 'Error',
      dataIndex: 'error',
      key: 'error',
    },
  ]

  const columns = [
    {
      title: 'OEM ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (_, __, index) => {
        const currentPage = pagination?.page || 1
        const pageSize = pagination?.limit || 10
        const serialNumber = (currentPage - 1) * pageSize + index + 1
        return String(serialNumber).padStart(2, '0')
      }
    },
    {
      title: 'OEM Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => text || '-'
    },
    {
      title: 'Short name',
      dataIndex: 'contact_person',
      key: 'contact_person',
      render: (text) => text || '-'
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      render: (text) => text || '-'
    },
    {
      title: 'Contact Number',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => text || '-'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => text || '-'
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ padding: 0 }}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            style={{ padding: 0 }}
          />
        </Space>
      )
    }
  ]

  const currentData = oemData
  const total = oems?.total || pagination?.total || currentData.length

  return (
    <div style={{ padding: '24px', backgroundColor: '#fff' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>OEM Master</h2>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
            Dashboard {'>'} Master {'>'} OEM Masters
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>OEM Manufacturers</span>
            <span style={{ fontSize: '14px', color: '#666', marginLeft: '16px' }}>
              Total: {total} OEMs
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            style={{
              backgroundColor: '#f0f0f0',
              border: '1px solid #d9d9d9',
              color: '#000'
            }}
          >
            Export
          </Button>
          <Button
            icon={<UploadOutlined />}
            onClick={() => setIsBulkModalVisible(true)}
            style={{
              backgroundColor: '#f0f0f0',
              border: '1px solid #d9d9d9',
              color: '#000'
            }}
          >
            Bulk Upload
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Add OEM
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <Search
          placeholder="Search OEMs by name, contact person, or email..."
          allowClear
          style={{ width: 400 }}
          onSearch={handleSearch}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px' }}>Status:</span>
          <Select
            value={statusFilter}
            onChange={handleStatusChange}
            style={{ width: 120 }}
          >
            <Option value="All Status">All Status</Option>
            <Option value="Active">Active</Option>
            <Option value="Inactive">Inactive</Option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={currentData}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination?.page || 1,
          pageSize: pagination?.limit || 10,
          total: total,
          showSizeChanger: true,
          showQuickJumper: false,
          showTotal: (total, range) =>
            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
          pageSizeOptions: ['10', '25', '50', '100'],
          size: 'default'
        }}
        onChange={handleTableChange}
        size="middle"
        bordered={false}
      />

      {/* Modal */}
      <OEMForm
        open={isModalOpen}
        mode={modalMode}
        oem={selectedOEM}
        onClose={handleModalClose}
        onSuccess={handleFormSuccess}
      />

      {/* Bulk Upload Modal */}
      <Modal
        title="Bulk Upload OEMs"
        open={isBulkModalVisible}
        onCancel={handleCloseBulkModal}
        width={900}
        footer={[
          <Button key="close" onClick={handleCloseBulkModal}>
            {uploadResult ? 'Close' : 'Cancel'}
          </Button>,
          !uploadResult && (
            <Button
              key="upload"
              type="primary"
              onClick={handleBulkUpload}
              loading={uploading}
              disabled={!file || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload OEMs'}
            </Button>
          ),
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Download Template */}
          <Alert
            message="Need a template?"
            description={
              <Space>
                <span>Download our Excel template with sample data and required columns</span>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadTemplate}
                  size="small"
                >
                  Download Template
                </Button>
              </Space>
            }
            type="info"
            showIcon
          />

          {/* File Upload */}
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Supports CSV and Excel files (max 10MB)
            </p>
          </Dragger>

          {/* Upload Progress */}
          {uploading && (
            <div>
              <div style={{ marginBottom: 8 }}>
                <span>Uploading... {uploadProgress}%</span>
              </div>
              <Progress percent={uploadProgress} status="active" />
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Alert
                type={getAlertType()}
                icon={getAlertIcon()}
                message={
                  uploadResult.failed === 0
                    ? `Successfully uploaded ${uploadResult.success} OEMs`
                    : uploadResult.success === 0
                    ? 'Upload failed - no OEMs were created'
                    : `Partial upload: ${uploadResult.success} succeeded, ${uploadResult.failed} failed`
                }
                description={
                  <div>
                    <div>Total rows: {uploadResult.total}</div>
                    <div style={{ color: '#52c41a' }}>Success: {uploadResult.success}</div>
                    <div style={{ color: '#ff4d4f' }}>Failed: {uploadResult.failed}</div>
                  </div>
                }
                showIcon
              />

              {/* Error List */}
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div>
                  <div style={{
                    backgroundColor: '#fff2f0',
                    padding: '12px',
                    borderRadius: '4px 4px 0 0',
                    borderBottom: '1px solid #ffccc7'
                  }}>
                    <strong style={{ color: '#cf1322' }}>
                      Errors ({uploadResult.errors.length})
                    </strong>
                  </div>
                  <Table
                    columns={errorColumns}
                    dataSource={uploadResult.errors}
                    pagination={false}
                    scroll={{ y: 240 }}
                    size="small"
                    rowKey={(record, index) => index}
                  />
                </div>
              )}
            </Space>
          )}
        </Space>
      </Modal>
    </div>
  )
}

export default OEMList
