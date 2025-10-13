import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Button, Input, Space, Modal, message, Select, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, PoweroffOutlined } from '@ant-design/icons'
import ProductSeriesForm from './ProductSeriesForm'
import { fetchProductSeries, deleteProductSeries, updateProductSeries } from '../../../../store/slices/masterSlice'

const { Search } = Input
const { confirm } = Modal

const ProductSeries = () => {
  const dispatch = useDispatch()
  const { productSeries } = useSelector(state => state.master)
  const loading = productSeries?.loading || false
  const seriesData = Array.isArray(productSeries?.data) ? productSeries.data : []
  const pagination = productSeries?.pagination || {}

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSeries, setSelectedSeries] = useState(null)
  const [modalMode, setModalMode] = useState('create')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    dispatch(fetchProductSeries({ page: 1, limit: 10 }))
  }, [dispatch])

  const handleSearch = (value) => {
    const statusParam = statusFilter === 'all' ? {} : { status: statusFilter }
    dispatch(fetchProductSeries({ 
      page: 1, 
      limit: pagination?.limit || 10, 
      search: value,
      ...statusParam
    }))
  }

  const handleStatusChange = (value) => {
    setStatusFilter(value)
    const statusParam = value === 'all' ? {} : { status: value }
    dispatch(fetchProductSeries({ 
      page: 1, 
      limit: pagination?.limit || 10,
      ...statusParam
    }))
  }

  const handleCreate = () => {
    setSelectedSeries(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setSelectedSeries(record)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (record) => {
    confirm({
      title: 'Delete Product Series',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${record.name}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(deleteProductSeries(record.id)).unwrap()
          message.success('Product series deleted successfully')
          dispatch(fetchProductSeries({ page: pagination?.page || 1, limit: pagination?.limit || 10 }))
        } catch (error) {
          message.error(error.message || 'Failed to delete product series')
        }
      }
    })
  }

  const handleToggleStatus = (record) => {
    const newStatus = !record.is_active
    const actionText = newStatus ? 'activate' : 'deactivate'
    
    confirm({
      title: `${newStatus ? 'Activate' : 'Deactivate'} Product Series`,
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Are you sure you want to {actionText} <strong>"{record.name}"</strong>?</p>
          {!newStatus && (
            <p style={{ color: '#ff4d4f', fontSize: '14px' }}>
              ⚠️ Deactivating this product series will make it unavailable for new selections.
            </p>
          )}
        </div>
      ),
      okText: `Yes, ${newStatus ? 'Activate' : 'Deactivate'}`,
      okType: newStatus ? 'primary' : 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(updateProductSeries({ 
            id: record.id, 
            data: { is_active: newStatus } 
          })).unwrap()
          message.success(`Product series ${actionText}d successfully`)
          dispatch(fetchProductSeries({ 
            page: pagination?.page || 1, 
            limit: pagination?.limit || 10,
            ...(statusFilter !== 'all' ? { status: statusFilter } : {})
          }))
        } catch (error) {
          message.error(error.message || `Failed to ${actionText} product series`)
        }
      }
    })
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedSeries(null)
    setModalMode('create')
  }

  const handleFormSuccess = () => {
    handleModalClose()
    dispatch(fetchProductSeries({ page: pagination?.page || 1, limit: pagination?.limit || 10 }))
  }

  const handleTableChange = (paginationInfo) => {
    const statusParam = statusFilter === 'all' ? {} : { status: statusFilter }
    dispatch(fetchProductSeries({
      page: paginationInfo.current,
      limit: paginationInfo.pageSize,
      ...statusParam
    }))
  }

  const columns = [
    {
      title: 'Product Series',
      dataIndex: 'name',
      key: 'name',
      render: (text) => text || '-'
    },
    {
      title: 'OEM',
      dataIndex: ['oem', 'name'],
      key: 'oem',
      render: (text, record) => record.oem?.name || '-'
    },
    {
      title: 'Product Category',
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (text, record) => record.category?.name || '-'
    },
    {
      title: 'Product Sub Category',
      dataIndex: ['subCategory', 'name'],
      key: 'subCategory',
      render: (text, record) => record.subCategory?.name || '-'
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

  const total = productSeries?.total || seriesData.length

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
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Product Series Information</h3>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Total: {total} Product Series
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
          placeholder="Search product series..."
          allowClear
          style={{ width: 400 }}
          onSearch={handleSearch}
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={seriesData}
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
      <ProductSeriesForm
        open={isModalOpen}
        mode={modalMode}
        productSeries={selectedSeries}
        onClose={handleModalClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}

export default ProductSeries