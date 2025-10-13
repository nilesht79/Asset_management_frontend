import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Button, Input, Select, Space, Modal, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import OEMForm from './OEMForm'
import { fetchOEMs, deleteOEM, exportOEMs } from '../../../../store/slices/masterSlice'

const { Search } = Input
const { Option } = Select
const { confirm } = Modal

const OEMList = () => {
  const dispatch = useDispatch()
  const { oems, pagination } = useSelector(state => state.master)
  const loading = oems?.loading || false
  const oemData = oems?.data || []
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOEM, setSelectedOEM] = useState(null)
  const [modalMode, setModalMode] = useState('create')
  const [statusFilter, setStatusFilter] = useState('All Status')

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
        search: '', // You can add current search filter here if needed
        status: statusFilter === 'All Status' ? '' : statusFilter.toLowerCase()
      }
      
      const response = await dispatch(exportOEMs(params)).unwrap()
      
      // Create download link
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
    </div>
  )
}

export default OEMList