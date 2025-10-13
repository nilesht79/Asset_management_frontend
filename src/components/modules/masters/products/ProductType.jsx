import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Button, Input, Space, Modal, message, Tag, Select, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, PoweroffOutlined } from '@ant-design/icons'
import ProductTypeForm from './ProductTypeForm'
import { fetchProductTypes, deleteProductType, updateProductType } from '../../../../store/slices/masterSlice'

const { Search } = Input
const { confirm } = Modal

const ProductType = () => {
  const dispatch = useDispatch()
  const { productTypes } = useSelector(state => state.master)
  const loading = productTypes?.loading || false
  const typeData = Array.isArray(productTypes?.data) ? productTypes.data : []
  const pagination = productTypes?.pagination || {}

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedType, setSelectedType] = useState(null)
  const [modalMode, setModalMode] = useState('create')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    dispatch(fetchProductTypes({ page: 1, limit: 10 }))
  }, [dispatch])

  const handleSearch = (value) => {
    const statusParam = statusFilter === 'all' ? {} : { status: statusFilter }
    dispatch(fetchProductTypes({ 
      page: 1, 
      limit: pagination?.limit || 10, 
      search: value,
      ...statusParam
    }))
  }

  const handleStatusChange = (value) => {
    setStatusFilter(value)
    const statusParam = value === 'all' ? {} : { status: value }
    dispatch(fetchProductTypes({ 
      page: 1, 
      limit: pagination?.limit || 10,
      ...statusParam
    }))
  }

  const handleCreate = () => {
    setSelectedType(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setSelectedType(record)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (record) => {
    confirm({
      title: 'Delete Product Type',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${record.name}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(deleteProductType(record.id)).unwrap()
          message.success('Product type deleted successfully')
          dispatch(fetchProductTypes({ page: pagination?.page || 1, limit: pagination?.limit || 10 }))
        } catch (error) {
          message.error(error.message || 'Failed to delete product type')
        }
      }
    })
  }

  const handleToggleStatus = (record) => {
    const newStatus = !record.is_active
    const actionText = newStatus ? 'activate' : 'deactivate'
    
    confirm({
      title: `${newStatus ? 'Activate' : 'Deactivate'} Product Type`,
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Are you sure you want to {actionText} <strong>"{record.name}"</strong>?</p>
          {!newStatus && (
            <p style={{ color: '#ff4d4f', fontSize: '14px' }}>
              ⚠️ Deactivating this product type will make it unavailable for new selections.
            </p>
          )}
        </div>
      ),
      okText: `Yes, ${newStatus ? 'Activate' : 'Deactivate'}`,
      okType: newStatus ? 'primary' : 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(updateProductType({ 
            id: record.id, 
            data: { is_active: newStatus } 
          })).unwrap()
          message.success(`Product type ${actionText}d successfully`)
          dispatch(fetchProductTypes({ 
            page: pagination?.page || 1, 
            limit: pagination?.limit || 10,
            ...(statusFilter !== 'all' ? { status: statusFilter } : {})
          }))
        } catch (error) {
          message.error(error.message || `Failed to ${actionText} product type`)
        }
      }
    })
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedType(null)
    setModalMode('create')
  }

  const handleFormSuccess = () => {
    handleModalClose()
    dispatch(fetchProductTypes({ page: pagination?.page || 1, limit: pagination?.limit || 10 }))
  }

  const handleTableChange = (paginationInfo) => {
    const statusParam = statusFilter === 'all' ? {} : { status: statusFilter }
    dispatch(fetchProductTypes({
      page: paginationInfo.current,
      limit: paginationInfo.pageSize,
      ...statusParam
    }))
  }

  const columns = [
    {
      title: 'Type ID',
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
      title: 'Type Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => text || '-'
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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

  const total = productTypes?.total || typeData.length

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
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Product Type Information</h3>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Total: {total} Product Types
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
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreate}
            style={{ backgroundColor: '#1890ff' }}
          >
            Add New
          </Button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <Search
          placeholder="Search sub categories..."
          allowClear
          style={{ width: 400 }}
          onSearch={handleSearch}
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={typeData}
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
      <ProductTypeForm
        open={isModalOpen}
        mode={modalMode}
        productType={selectedType}
        onClose={handleModalClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}

export default ProductType