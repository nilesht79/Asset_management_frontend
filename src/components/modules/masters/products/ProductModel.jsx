import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Button, Input, Space, Modal, message, Tag, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, PoweroffOutlined } from '@ant-design/icons'
import ProductModelForm from './ProductModelForm'
import { fetchProductModels, deleteProduct, updateProduct } from '../../../../store/slices/masterSlice'

const { Search } = Input
const { confirm } = Modal

const ProductModel = () => {
  const dispatch = useDispatch()
  const { productModels } = useSelector(state => state.master)
  const loading = productModels?.loading || false
  const productData = Array.isArray(productModels?.data) ? productModels.data : []
  const pagination = productModels?.pagination || {}

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalMode, setModalMode] = useState('create')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    dispatch(fetchProductModels({ page: 1, limit: 10 }))
  }, [dispatch])

  const handleSearch = (value) => {
    const statusParam = statusFilter === 'all' ? {} : { status: statusFilter }
    dispatch(fetchProductModels({
      page: 1,
      limit: pagination?.limit || 10,
      search: value,
      ...statusParam
    }))
  }

  const handleStatusChange = (value) => {
    setStatusFilter(value)
    const statusParam = value === 'all' ? {} : { status: value }
    dispatch(fetchProductModels({
      page: 1,
      limit: pagination?.limit || 10,
      ...statusParam
    }))
  }

  const handleCreate = () => {
    setSelectedProduct(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setSelectedProduct(record)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (record) => {
    confirm({
      title: 'Delete Product Model',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${record.name}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(deleteProduct(record.id)).unwrap()
          message.success('Product model deleted successfully')
          dispatch(fetchProductModels({ page: pagination?.page || 1, limit: pagination?.limit || 10 }))
        } catch (error) {
          message.error(error.message || 'Failed to delete product model')
        }
      }
    })
  }

  const handleToggleStatus = (record) => {
    const newStatus = !record.is_active
    const actionText = newStatus ? 'activate' : 'deactivate'

    confirm({
      title: `${newStatus ? 'Activate' : 'Deactivate'} Product Model`,
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Are you sure you want to {actionText} <strong>"{record.name}"</strong>?</p>
          {!newStatus && (
            <p style={{ color: '#ff4d4f', fontSize: '14px' }}>
              ⚠️ Deactivating this product model will make it unavailable for new selections.
            </p>
          )}
        </div>
      ),
      okText: `Yes, ${newStatus ? 'Activate' : 'Deactivate'}`,
      okType: newStatus ? 'primary' : 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(updateProduct({
            id: record.id,
            data: { is_active: newStatus }
          })).unwrap()
          message.success(`Product model ${actionText}d successfully`)
          dispatch(fetchProductModels({
            page: pagination?.page || 1,
            limit: pagination?.limit || 10,
            ...(statusFilter !== 'all' ? { status: statusFilter } : {})
          }))
        } catch (error) {
          message.error(error.message || `Failed to ${actionText} product model`)
        }
      }
    })
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
    setModalMode('create')
  }

  const handleFormSuccess = () => {
    handleModalClose()
    dispatch(fetchProductModels({ page: pagination?.page || 1, limit: pagination?.limit || 10 }))
  }

  const handleTableChange = (paginationInfo) => {
    const statusParam = statusFilter === 'all' ? {} : { status: statusFilter }
    dispatch(fetchProductModels({
      page: paginationInfo.current,
      limit: paginationInfo.pageSize,
      ...statusParam
    }))
  }

  const columns = [
    {
      title: 'No.',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      render: (_, __, index) => {
        const currentPage = pagination?.page || 1
        const pageSize = pagination?.limit || 10
        const serialNumber = (currentPage - 1) * pageSize + index + 1
        return String(serialNumber).padStart(2, '0')
      }
    },
    {
      title: 'Model Name',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text) => <span style={{ fontWeight: 500 }}>{text || '-'}</span>
    },
    {
      title: 'Model Number',
      dataIndex: 'model',
      key: 'model',
      width: 180,
      render: (text) => text || '-'
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
      width: 150,
      render: (text) => text || '-'
    },
    {
      title: 'Sub Category',
      dataIndex: 'subcategory_name',
      key: 'subcategory_name',
      width: 150,
      render: (text) => text || '-'
    },
    {
      title: 'Series',
      dataIndex: 'series_name',
      key: 'series_name',
      width: 150,
      render: (text) => text ? <Tag color="purple">{text}</Tag> : '-'
    },
    {
      title: 'OEM',
      dataIndex: 'oem_name',
      key: 'oem_name',
      width: 130,
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

  const total = productModels?.total || productData.length

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
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Product Model Information</h3>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Manage product models and their classifications
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
          placeholder="Search product models by name or model number..."
          allowClear
          style={{ width: 400 }}
          onSearch={handleSearch}
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={productData}
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
        scroll={{ x: 1200 }}
      />

      {/* Modal */}
      <ProductModelForm
        open={isModalOpen}
        mode={modalMode}
        product={selectedProduct}
        onClose={handleModalClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}

export default ProductModel
