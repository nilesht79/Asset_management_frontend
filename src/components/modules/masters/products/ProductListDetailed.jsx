import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Button, Input, Space, Modal, message, Tag, Select, Card, Row, Col, Tooltip, Descriptions } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  PoweroffOutlined,
  UploadOutlined,
  EyeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import ProductModelForm from './ProductModelForm'
import ProductBulkUpload from './ProductBulkUpload'
import { fetchProducts, deleteProduct, updateProduct, fetchOEMs, fetchProductCategories } from '../../../../store/slices/masterSlice'
import dayjs from 'dayjs'

const { Search } = Input
const { confirm } = Modal

const ProductListDetailed = () => {
  const dispatch = useDispatch()
  const { products, oems, productCategories } = useSelector(state => state.master)
  const loading = products?.loading || false
  const productData = Array.isArray(products?.data) ? products.data : []
  const pagination = products?.pagination || {}

  const oemsList = Array.isArray(oems?.data) ? oems.data.filter(o => o.is_active) : []
  const categoriesList = Array.isArray(productCategories?.data) ? productCategories.data.filter(c => c.is_active) : []

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBulkUploadVisible, setIsBulkUploadVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalMode, setModalMode] = useState('create')
  const [statusFilter, setStatusFilter] = useState('all')
  const [oemFilter, setOemFilter] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [viewDetailsVisible, setViewDetailsVisible] = useState(false)
  const [viewingProduct, setViewingProduct] = useState(null)

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 10 }))
    dispatch(fetchOEMs({ page: 1, limit: 100, status: 'active' }))
    dispatch(fetchProductCategories({ page: 1, limit: 100, status: 'active' }))
  }, [dispatch])

  const buildFilterParams = (overrides = {}) => {
    const params = {
      page: 1,
      limit: pagination?.limit || 10,
      ...overrides
    }

    const currentStatus = overrides.status !== undefined ? overrides.status : statusFilter
    const currentOem = overrides.oem_id !== undefined ? overrides.oem_id : oemFilter
    const currentCategory = overrides.category_id !== undefined ? overrides.category_id : categoryFilter

    if (currentStatus && currentStatus !== 'all') {
      params.status = currentStatus
    }
    if (currentOem) {
      params.oem_id = currentOem
    }
    if (currentCategory) {
      params.category_id = currentCategory
    }

    return params
  }

  const handleSearch = (value) => {
    dispatch(fetchProducts(buildFilterParams({ search: value })))
  }

  const handleStatusChange = (value) => {
    setStatusFilter(value)
    dispatch(fetchProducts(buildFilterParams({ status: value })))
  }

  const handleOemChange = (value) => {
    setOemFilter(value)
    dispatch(fetchProducts(buildFilterParams({ oem_id: value })))
  }

  const handleCategoryChange = (value) => {
    setCategoryFilter(value)
    dispatch(fetchProducts(buildFilterParams({ category_id: value })))
  }

  const handleClearFilters = () => {
    setStatusFilter('all')
    setOemFilter(null)
    setCategoryFilter(null)
    dispatch(fetchProducts({ page: 1, limit: pagination?.limit || 10 }))
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

  const handleViewDetails = (record) => {
    setViewingProduct(record)
    setViewDetailsVisible(true)
  }

  const handleDelete = (record) => {
    confirm({
      title: 'Delete Product',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${record.name}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(deleteProduct(record.id)).unwrap()
          message.success('Product deleted successfully')
          dispatch(fetchProducts({ page: pagination?.page || 1, limit: pagination?.limit || 10 }))
        } catch (error) {
          message.error(error.message || 'Failed to delete product')
        }
      }
    })
  }

  const handleToggleStatus = (record) => {
    const newStatus = !record.is_active
    const actionText = newStatus ? 'activate' : 'deactivate'

    confirm({
      title: `${newStatus ? 'Activate' : 'Deactivate'} Product`,
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Are you sure you want to {actionText} <strong>"{record.name}"</strong>?</p>
          {!newStatus && (
            <p style={{ color: '#ff4d4f', fontSize: '14px' }}>
              ⚠️ Deactivating this product will make it unavailable for new selections.
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
          message.success(`Product ${actionText}d successfully`)
          dispatch(fetchProducts({
            page: pagination?.page || 1,
            limit: pagination?.limit || 10,
            ...(statusFilter !== 'all' ? { status: statusFilter } : {})
          }))
        } catch (error) {
          message.error(error.message || `Failed to ${actionText} product`)
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
    dispatch(fetchProducts({ page: pagination?.page || 1, limit: pagination?.limit || 10 }))
  }

  const handleTableChange = (paginationInfo) => {
    dispatch(fetchProducts(buildFilterParams({
      page: paginationInfo.current,
      limit: paginationInfo.pageSize
    })))
  }

  // Calculate statistics
  const activeProducts = productData.filter(p => p.is_active).length
  const totalAssets = productData.reduce((sum, p) => sum + (p.asset_count || 0), 0)

  const columns = [
    {
      title: 'No.',
      dataIndex: 'id',
      key: 'index',
      width: 60,
      render: (_, __, index) => {
        const currentPage = pagination?.page || 1
        const pageSize = pagination?.limit || 10
        const serialNumber = (currentPage - 1) * pageSize + index + 1
        return String(serialNumber).padStart(2, '0')
      }
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: { showTitle: false },
      render: (text, record) => (
        <Tooltip title={text}>
          <div>
            <div style={{ fontWeight: 500 }}>{text || '-'}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.model || '-'}</div>
          </div>
        </Tooltip>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 180,
      ellipsis: { showTitle: false },
      render: (text) => (
        <Tooltip title={text}>
          <span>{text || '-'}</span>
        </Tooltip>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type_name',
      key: 'type_name',
      width: 150,
      render: (text) => text ? <Tag color="blue">{text}</Tag> : '-'
    },
    {
      title: 'OEM',
      dataIndex: 'oem_name',
      key: 'oem_name',
      width: 120,
      render: (text) => text || '-'
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
      width: 130,
      render: (text) => text || '-'
    },
    {
      title: 'Sub Category',
      dataIndex: 'subcategory_name',
      key: 'subcategory_name',
      width: 130,
      render: (text) => text || '-'
    },
    {
      title: 'Series',
      dataIndex: 'series_name',
      key: 'series_name',
      width: 120,
      render: (text) => text ? <Tag color="purple">{text}</Tag> : '-'
    },
    {
      title: 'Warranty',
      dataIndex: 'warranty_period',
      key: 'warranty_period',
      width: 100,
      align: 'center',
      render: (value) => value ? `${value}M` : '-'
    },
    {
      title: 'Assets',
      dataIndex: 'asset_count',
      key: 'asset_count',
      width: 80,
      align: 'center',
      render: (count) => (
        <Tag color={count > 0 ? 'gold' : 'default'}>
          {count || 0}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 90,
      align: 'center',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 110,
      render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : '-'
    },
    {
      title: 'Action',
      key: 'action',
      width: 180,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              style={{ padding: 0, color: '#52c41a' }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ padding: 0, color: '#1890ff' }}
            />
          </Tooltip>
          <Tooltip title={record.is_active ? 'Deactivate' : 'Activate'}>
            <Button
              type="link"
              icon={<PoweroffOutlined />}
              onClick={() => handleToggleStatus(record)}
              style={{
                padding: 0,
                color: record.is_active ? '#ff4d4f' : '#52c41a'
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              style={{ padding: 0 }}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  const total = products?.total || productData.length

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff' }}>
                {productData.length}
              </div>
              <div style={{ color: '#666', marginTop: '8px' }}>Total Products</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#52c41a' }}>
                {activeProducts}
              </div>
              <div style={{ color: '#666', marginTop: '8px' }}>Active Products</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#faad14' }}>
                {totalAssets}
              </div>
              <div style={{ color: '#666', marginTop: '8px' }}>Total Assets</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#722ed1' }}>
                {productData.filter(p => !p.is_active).length}
              </div>
              <div style={{ color: '#666', marginTop: '8px' }}>Inactive Products</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Header with Add New button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
            <InfoCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Complete Product Details
          </h3>
          <span style={{ fontSize: '14px', color: '#666' }}>
            View all product information including descriptions, specifications, and more
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
              onClick={() => setIsBulkUploadVisible(true)}
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

      {/* Search and Filters */}
      <div style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Search
              placeholder="Search products by name, model, description..."
              allowClear
              onSearch={handleSearch}
            />
          </Col>
          <Col span={3}>
            <Select
              placeholder="Filter by OEM"
              allowClear
              style={{ width: '100%' }}
              value={oemFilter}
              onChange={handleOemChange}
              showSearch
              optionFilterProp="children"
            >
              {oemsList.map(oem => (
                <Select.Option key={oem.id} value={oem.id}>
                  {oem.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={3}>
            <Select
              placeholder="Filter by Category"
              allowClear
              style={{ width: '100%' }}
              value={categoryFilter}
              onChange={handleCategoryChange}
              showSearch
              optionFilterProp="children"
            >
              {categoriesList.map(category => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            {(oemFilter || categoryFilter || statusFilter !== 'all') && (
              <Button onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            )}
          </Col>
        </Row>
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
        bordered
        scroll={{ x: 1800 }}
      />

      {/* Product Form Modal */}
      <ProductModelForm
        open={isModalOpen}
        mode={modalMode}
        product={selectedProduct}
        onClose={handleModalClose}
        onSuccess={handleFormSuccess}
      />

      {/* Bulk Upload Modal */}
      <ProductBulkUpload
        isOpen={isBulkUploadVisible}
        onClose={() => setIsBulkUploadVisible(false)}
        onSuccess={() => {
          dispatch(fetchProducts({ page: 1, limit: 10 }))
          message.success('Products uploaded successfully')
        }}
      />

      {/* View Details Modal */}
      <Modal
        title={
          <div style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <InfoCircleOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
            Product Details
          </div>
        }
        open={viewDetailsVisible}
        onCancel={() => setViewDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewDetailsVisible(false)} size="large">
            Close
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            size="large"
            onClick={() => {
              setViewDetailsVisible(false)
              handleEdit(viewingProduct)
            }}
          >
            Edit Product
          </Button>
        ]}
        width={900}
        centered
        styles={{ body: { padding: '24px' } }}
      >
        {viewingProduct && (
          <Descriptions
            bordered
            column={2}
            size="middle"
            labelStyle={{
              fontWeight: 600,
              backgroundColor: '#fafafa',
              width: '180px'
            }}
            contentStyle={{
              backgroundColor: '#ffffff'
            }}
          >
            <Descriptions.Item label="Product Name" span={2}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937' }}>
                {viewingProduct.name}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Model Number">
              {viewingProduct.model || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={viewingProduct.is_active ? 'green' : 'red'} style={{ fontSize: '13px', padding: '2px 12px' }}>
                {viewingProduct.is_active ? 'Active' : 'Inactive'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              <div style={{ lineHeight: '1.6' }}>
                {viewingProduct.description || '-'}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="OEM">
              {viewingProduct.oem_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Category">
              {viewingProduct.category_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Sub Category">
              {viewingProduct.subcategory_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              {viewingProduct.type_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Series" span={2}>
              {viewingProduct.series_name ? (
                <Tag color="purple" style={{ fontSize: '13px', padding: '2px 12px' }}>
                  {viewingProduct.series_name}
                </Tag>
              ) : '-'}
            </Descriptions.Item>
            {/* Component Specifications */}
            {(viewingProduct.capacity_value || viewingProduct.speed_value || viewingProduct.interface_type || viewingProduct.form_factor) && (
              <>
                <Descriptions.Item label="Capacity">
                  {viewingProduct.capacity_value ? `${viewingProduct.capacity_value} ${viewingProduct.capacity_unit || ''}` : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Speed">
                  {viewingProduct.speed_value ? `${viewingProduct.speed_value} ${viewingProduct.speed_unit || ''}` : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Interface">
                  {viewingProduct.interface_type ? (
                    <Tag color="cyan" style={{ fontSize: '13px' }}>{viewingProduct.interface_type}</Tag>
                  ) : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Form Factor">
                  {viewingProduct.form_factor ? (
                    <Tag color="orange" style={{ fontSize: '13px' }}>{viewingProduct.form_factor}</Tag>
                  ) : '-'}
                </Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="Warranty Period">
              {viewingProduct.warranty_period ? `${viewingProduct.warranty_period} Months` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Asset Count">
              <Tag color={viewingProduct.asset_count > 0 ? 'gold' : 'default'} style={{ fontSize: '13px', padding: '2px 12px' }}>
                {viewingProduct.asset_count || 0} Assets
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Specifications" span={2}>
              {viewingProduct.specifications ? (
                <div style={{
                  background: '#f8f9fa',
                  padding: '14px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  fontSize: '13px',
                  maxHeight: '220px',
                  overflow: 'auto',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {viewingProduct.specifications}
                </div>
              ) : (
                <span style={{ color: '#9ca3af' }}>No specifications provided</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {viewingProduct.created_at ? dayjs(viewingProduct.created_at).format('MMM DD, YYYY [at] HH:mm') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {viewingProduct.updated_at ? dayjs(viewingProduct.updated_at).format('MMM DD, YYYY [at] HH:mm') : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default ProductListDetailed
