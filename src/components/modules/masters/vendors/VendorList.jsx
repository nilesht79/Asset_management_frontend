import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Button, Input, Select, Space, Modal, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import VendorForm from './VendorForm'
import { fetchVendors, deleteVendor } from '../../../../store/slices/masterSlice'

const { Search } = Input
const { Option } = Select
const { confirm } = Modal

const VendorList = () => {
  const dispatch = useDispatch()
  const { vendors } = useSelector(state => state.master)
  const loading = vendors?.loading || false
  const vendorData = vendors?.data || []
  const pagination = vendors?.pagination || {}
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [modalMode, setModalMode] = useState('create')
  const [statusFilter, setStatusFilter] = useState('All Status')

  useEffect(() => {
    dispatch(fetchVendors({ page: 1, limit: 10 }))
  }, [dispatch])

  const handleSearch = (value) => {
    dispatch(fetchVendors({
      page: 1,
      limit: pagination?.limit || 10,
      search: value,
      status: statusFilter === 'All Status' ? '' : statusFilter.toLowerCase()
    }))
  }

  const handleStatusChange = (status) => {
    setStatusFilter(status)
    dispatch(fetchVendors({
      page: 1,
      limit: pagination?.limit || 10,
      status: status === 'All Status' ? '' : status.toLowerCase()
    }))
  }

  const handleCreate = () => {
    setSelectedVendor(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setSelectedVendor(record)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (record) => {
    confirm({
      title: 'Delete Vendor',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${record.name}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(deleteVendor(record.id)).unwrap()
          message.success('Vendor deleted successfully')
          dispatch(fetchVendors({ page: pagination?.page || 1, limit: pagination?.limit || 10 }))
        } catch (error) {
          message.error(error.message || 'Failed to delete vendor')
        }
      }
    })
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedVendor(null)
    setModalMode('create')
  }

  const handleFormSuccess = () => {
    handleModalClose()
    dispatch(fetchVendors({ page: pagination?.page || 1, limit: pagination?.limit || 10 }))
  }

  const handleTableChange = (paginationInfo) => {
    dispatch(fetchVendors({
      page: paginationInfo.current,
      limit: paginationInfo.pageSize
    }))
  }

  const columns = [
    {
      title: 'S.No',
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
      title: 'Vendor Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => text || '-'
    },
    {
      title: 'Vendor Code',
      dataIndex: 'code',
      key: 'code',
      render: (text) => text || '-'
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive) => (
        <span style={{
          color: isActive ? '#52c41a' : '#ff4d4f',
          fontWeight: 500
        }}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      )
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

  const total = vendors?.total || pagination?.total || vendorData.length

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
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Vendor Master</h2>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
            Dashboard {'>'} Master {'>'} Vendor Masters
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
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Vendors</span>
            <span style={{ fontSize: '14px', color: '#666', marginLeft: '16px' }}>
              Total: {total} Vendors
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Add Vendor
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
          placeholder="Search vendors by name or code..."
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
        dataSource={vendorData}
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
      <VendorForm
        open={isModalOpen}
        mode={modalMode}
        vendor={selectedVendor}
        onClose={handleModalClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}

export default VendorList
