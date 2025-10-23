import React, { useState, useEffect } from 'react'
import { Table, Button, Input, Space, Modal, message, Upload, Progress, Alert } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, TeamOutlined, UploadOutlined, DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons'
import DepartmentForm from './DepartmentForm'
import departmentService from '../../../../services/department'
import api from '../../../../services/api'

const { Search } = Input
const { confirm } = Modal
const { Dragger } = Upload

const DepartmentMaster = () => {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [modalMode, setModalMode] = useState('create')
  const [searchText, setSearchText] = useState('')
  const [isBulkModalVisible, setIsBulkModalVisible] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState(null)
  const [file, setFile] = useState(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} departments`
  })

  useEffect(() => {
    loadDepartments()
  }, [pagination.current, pagination.pageSize, searchText])

  const loadDepartments = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText || undefined
      }

      const response = await departmentService.getDepartments(params)

      if (response.data.success) {
        setDepartments(response.data.data.departments)
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination.total
        }))
      } else {
        message.error('Failed to load departments')
      }
    } catch (error) {
      console.error('Error loading departments:', error)
      message.error('Failed to load departments')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value) => {
    setSearchText(value)
    setPagination(prev => ({
      ...prev,
      current: 1
    }))
  }

  const handleCreate = () => {
    setSelectedDepartment(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setSelectedDepartment(record)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (record) => {
    confirm({
      title: 'Delete Department',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${record.name}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await departmentService.deleteDepartment(record.id)
          message.success('Department deleted successfully')
          loadDepartments()
        } catch (error) {
          message.error(error.message || 'Failed to delete department')
        }
      }
    })
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedDepartment(null)
    setModalMode('create')
  }

  const handleFormSuccess = () => {
    handleModalClose()
    loadDepartments()
  }

  const handleTableChange = (paginationInfo) => {
    setPagination({
      ...pagination,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize
    })
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/departments/bulk-template', {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `department_bulk_upload_template_${new Date().toISOString().split('T')[0]}.xlsx`)
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

  const handleExport = async () => {
    try {
      const response = await api.get('/departments/export', {
        params: { format: 'xlsx', search: searchText },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `departments_export_${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      message.success('Departments exported successfully')
    } catch (error) {
      console.error('Error exporting departments:', error)
      message.error('Failed to export departments')
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

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await api.post('/departments/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      clearInterval(progressInterval)
      setUploadProgress(100)
      setUploadResult(response.data.data || response.data)

      if (response.data.data?.failed === 0 || response.data.failed === 0) {
        message.success('All departments uploaded successfully!')
        setTimeout(() => {
          handleCloseBulkModal()
          loadDepartments()
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
      return false // Prevent auto upload
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
      title: 'Department Name',
      dataIndex: 'department_name',
      key: 'department_name',
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
      title: 'Department ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (_, __, index) => {
        const serialNumber = (pagination.current - 1) * pagination.pageSize + index + 1
        return String(serialNumber).padStart(2, '0')
      }
    },
    {
      title: 'Department Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text) => (
        <div style={{ fontWeight: 500 }}>
          {text}
        </div>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || <span style={{ color: '#999', fontStyle: 'italic' }}>No description</span>
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      render: (contactPerson) => {
        if (contactPerson) {
          return (
            <div>
              <div style={{ fontWeight: 500 }}>
                {contactPerson.firstName} {contactPerson.lastName}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {contactPerson.email}
              </div>
            </div>
          )
        }
        return <span style={{ color: '#999', fontStyle: 'italic' }}>Not assigned</span>
      }
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date) => new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ padding: '4px' }}
            title="Edit Department"
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            style={{ padding: '4px' }}
            title="Delete Department"
          />
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px', backgroundColor: '#fff' }}>
      {/* Header */}
      <div style={{
        marginBottom: '24px',
        borderBottom: '1px solid #f0f0f0',
        paddingBottom: '16px'
      }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
          <TeamOutlined style={{ marginRight: '8px' }} />
          Department Master
        </h2>
        <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
          Dashboard {'>'} Master {'>'} User Management {'>'} Department Master
        </div>
      </div>

      {/* Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        gap: '16px'
      }}>
        <div style={{ flex: 1, maxWidth: '300px' }}>
          <Search
            placeholder="Search departments..."
            allowClear
            enterButton
            size="middle"
            onSearch={handleSearch}
            onChange={(e) => !e.target.value && handleSearch('')}
          />
        </div>

        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            size="middle"
          >
            Export
          </Button>
          <Button
            icon={<UploadOutlined />}
            onClick={() => setIsBulkModalVisible(true)}
            size="middle"
          >
            Bulk Upload
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="middle"
          >
            Add Department
          </Button>
        </Space>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={departments}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: pagination.showSizeChanger,
          showQuickJumper: pagination.showQuickJumper,
          showTotal: pagination.showTotal,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
        scroll={{ x: 800 }}
        size="middle"
      />

      {/* Form Modal */}
      <DepartmentForm
        open={isModalOpen}
        mode={modalMode}
        department={selectedDepartment}
        onClose={handleModalClose}
        onSuccess={handleFormSuccess}
      />

      {/* Bulk Upload Modal */}
      <Modal
        title="Bulk Upload Departments"
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
              {uploading ? 'Uploading...' : 'Upload Departments'}
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
                    ? `Successfully uploaded ${uploadResult.success} departments`
                    : uploadResult.success === 0
                    ? 'Upload failed - no departments were created'
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

export default DepartmentMaster
