import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Button, Input, Space, Modal, message, Select, Tag, Upload } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, PoweroffOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import LocationMainForm from './LocationMainForm'
import { fetchLocations, deleteLocation, updateLocation } from '../../../../store/slices/masterSlice'
import api from '../../../../utils/apiClient'

const { Search } = Input
const { confirm } = Modal

const LocationMain = () => {
  const dispatch = useDispatch()
  const { locations } = useSelector(state => state.master)
  const loading = locations?.loading || false
  const locationData = Array.isArray(locations?.data) ? locations.data : []
  const pagination = locations?.pagination || {}

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [modalMode, setModalMode] = useState('create')
  const [statusFilter, setStatusFilter] = useState('all')
  const [uploading, setUploading] = useState(false)
  const [isBulkModalVisible, setIsBulkModalVisible] = useState(false)

  useEffect(() => {
    dispatch(fetchLocations({ page: 1, limit: 10 }))
  }, [dispatch])

  const handleSearch = (value) => {
    const statusParam = statusFilter === 'all' ? {} : { status: statusFilter }
    dispatch(fetchLocations({ 
      page: 1, 
      limit: pagination?.limit || 10, 
      search: value,
      ...statusParam
    }))
  }

  const handleStatusChange = (value) => {
    setStatusFilter(value)
    const statusParam = value === 'all' ? {} : { status: value }
    dispatch(fetchLocations({ 
      page: 1, 
      limit: pagination?.limit || 10,
      ...statusParam
    }))
  }

  const handleCreate = () => {
    setSelectedLocation(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setSelectedLocation(record)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (record) => {
    confirm({
      title: 'Delete Location',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${record.name}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(deleteLocation(record.id)).unwrap()
          message.success('Location deleted successfully')
          dispatch(fetchLocations({ page: pagination?.page || 1, limit: pagination?.limit || 10 }))
        } catch (error) {
          message.error(error.message || 'Failed to delete location')
        }
      }
    })
  }

  const handleToggleStatus = (record) => {
    const newStatus = !record.is_active
    const actionText = newStatus ? 'activate' : 'deactivate'
    
    confirm({
      title: `${newStatus ? 'Activate' : 'Deactivate'} Location`,
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Are you sure you want to {actionText} <strong>"{record.name}"</strong>?</p>
          {!newStatus && (
            <p style={{ color: '#ff4d4f', fontSize: '14px' }}>
              ⚠️ Deactivating this location will make it unavailable for new selections.
            </p>
          )}
        </div>
      ),
      okText: `Yes, ${newStatus ? 'Activate' : 'Deactivate'}`,
      okType: newStatus ? 'primary' : 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(updateLocation({ 
            id: record.id, 
            data: { is_active: newStatus } 
          })).unwrap()
          message.success(`Location ${actionText}d successfully`)
          dispatch(fetchLocations({ 
            page: pagination?.page || 1, 
            limit: pagination?.limit || 10,
            ...(statusFilter !== 'all' ? { status: statusFilter } : {})
          }))
        } catch (error) {
          message.error(error.message || `Failed to ${actionText} location`)
        }
      }
    })
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedLocation(null)
    setModalMode('create')
  }

  const handleFormSuccess = () => {
    handleModalClose()
    dispatch(fetchLocations({ page: pagination?.page || 1, limit: pagination?.limit || 10 }))
  }

  const handleTableChange = (paginationInfo) => {
    const statusParam = statusFilter === 'all' ? {} : { status: statusFilter }
    dispatch(fetchLocations({
      page: paginationInfo.current,
      limit: paginationInfo.pageSize,
      ...statusParam
    }))
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/masters/locations/bulk-template', {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'location_bulk_upload_template.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      message.success('Template downloaded successfully')
    } catch (error) {
      message.error('Failed to download template')
    }
  }

  const handleBulkUpload = async (file) => {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post('/masters/locations/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.success) {
        const result = response.data.data
        message.success(`Upload completed: ${result.successful} successful, ${result.failed} failed`)
        if (result.errors && result.errors.length > 0) {
          Modal.info({
            title: 'Upload Errors',
            width: 600,
            content: (
              <div style={{ maxHeight: 400, overflow: 'auto' }}>
                {result.errors.map((err, idx) => (
                  <div key={idx} style={{ marginBottom: 8 }}>
                    <strong>Row {err.row}:</strong> {err.error}
                  </div>
                ))}
              </div>
            )
          })
        }
        setIsBulkModalVisible(false)
        dispatch(fetchLocations({ page: 1, limit: pagination?.limit || 10 }))
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }

    return false // Prevent auto upload
  }

  const columns = [
    {
      title: 'Location ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (_, __, index) => {
        const currentPage = pagination?.page || 1
        const pageSize = pagination?.limit || 10
        const serialNumber = (currentPage - 1) * pageSize + index + 1
        return String(serialNumber).padStart(2, '0')
      }
    },
    {
      title: 'Location Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <div className="font-medium text-gray-900">{text || '-'}</div>
      )
    },
    {
      title: 'Client',
      dataIndex: 'client_name',
      key: 'client_name',
      render: (text) => text || '-'
    },
    {
      title: 'Location Type',
      dataIndex: 'location_type',
      key: 'location_type',
      render: (text) => text || '-'
    },
    {
      title: 'Contact Person',
      dataIndex: 'contact_person',
      key: 'contact_person',
      render: (text) => text || '-'
    },
    {
      title: 'City, State',
      key: 'location_info',
      render: (_, record) => (
        <div>
          <div>{record.city_name || '-'}</div>
          <div className="text-sm text-gray-500">{record.state_name || '-'}</div>
        </div>
      )
    },
    {
      title: 'Pincode',
      dataIndex: 'pincode',
      key: 'pincode',
      width: 100,
      render: (text) => text || '-'
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      align: 'center',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ padding: 0, color: '#1890ff' }}
            title="Edit"
          />
          <Button
            type="link"
            icon={<PoweroffOutlined />}
            onClick={() => handleToggleStatus(record)}
            style={{ 
              padding: 0, 
              color: record.is_active ? '#ff4d4f' : '#52c41a'
            }}
            title={record.is_active ? 'Deactivate' : 'Activate'}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            style={{ padding: 0 }}
            title="Delete"
          />
        </Space>
      )
    }
  ]

  const total = locations?.total || locationData.length

  return (
    <div>
      {/* Header with Add New button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Location Information</h3>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Total: {total} Locations
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>Status:</span>
            <Select
              value={statusFilter}
              onChange={handleStatusChange}
              style={{ width: 120 }}
              size="small"
            >
              <Select.Option value="all">All Status</Select.Option>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </div>
          <Space>
            <Button
              icon={<UploadOutlined />}
              onClick={() => setIsBulkModalVisible(true)}
            >
              Bulk Upload
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              style={{ backgroundColor: '#1890ff' }}
            >
              Add New
            </Button>
          </Space>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <Search
          placeholder="Search locations..."
          allowClear
          style={{ width: 400 }}
          onSearch={handleSearch}
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={locationData}
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
      <LocationMainForm
        open={isModalOpen}
        mode={modalMode}
        location={selectedLocation}
        onClose={handleModalClose}
        onSuccess={handleFormSuccess}
      />

      {/* Bulk Upload Modal */}
      <Modal
        title="Bulk Upload Locations"
        open={isBulkModalVisible}
        onCancel={() => setIsBulkModalVisible(false)}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: 24 }}>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
            block
            size="large"
          >
            Download Template
          </Button>
        </div>

        <Upload.Dragger
          name="file"
          accept=".xlsx,.xls"
          beforeUpload={handleBulkUpload}
          showUploadList={false}
          disabled={uploading}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text">Click or drag Excel file to upload</p>
          <p className="ant-upload-hint">
            Supports .xlsx and .xls formats. Download the template above first.
          </p>
        </Upload.Dragger>

        {uploading && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <p>Uploading and processing locations...</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default LocationMain