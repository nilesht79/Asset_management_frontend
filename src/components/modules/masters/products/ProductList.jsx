import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, message, Input, Tag, Select, Card, Row, Col } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ShoppingOutlined, FilterOutlined, UploadOutlined } from '@ant-design/icons'
import ProductForm from './ProductForm'
import ProductBulkUpload from './ProductBulkUpload'

const { Search } = Input
const { Option } = Select

const ProductList = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [isBulkUploadVisible, setIsBulkUploadVisible] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [selectedOEM, setSelectedOEM] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)

  // Mock data for demonstration
  const mockOEMs = [
    { id: 1, name: 'Dell Technologies', code: 'DELL' },
    { id: 2, name: 'HP Inc.', code: 'HP' },
    { id: 3, name: 'Lenovo Group', code: 'LENOVO' },
    { id: 4, name: 'Apple Inc.', code: 'APPLE' }
  ]

  const mockCategories = [
    { id: 1, name: 'Laptops & Notebooks', code: 'LAPTOP' },
    { id: 2, name: 'Desktop Computers', code: 'DESKTOP' },
    { id: 3, name: 'Mobile Devices', code: 'MOBILE' },
    { id: 4, name: 'Network Equipment', code: 'NETWORK' }
  ]

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    // Mock API call - replace with actual API
    setTimeout(() => {
      setProducts([
        {
          id: 1,
          name: 'Dell Latitude 5520',
          code: 'DELL-LAT-5520',
          model: 'Latitude 5520',
          description: '15.6" Business Laptop with Intel i7 processor',
          oem: { id: 1, name: 'Dell Technologies', code: 'DELL' },
          category: { id: 1, name: 'Laptops & Notebooks', code: 'LAPTOP' },
          specifications: {
            processor: 'Intel Core i7-1165G7',
            memory: '16GB DDR4',
            storage: '512GB SSD',
            display: '15.6" FHD',
            os: 'Windows 11 Pro'
          },
          unitPrice: 1299.99,
          status: 'active',
          assetsCount: 25,
          warrantyMonths: 36,
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20'
        },
        {
          id: 2,
          name: 'HP EliteBook 840 G8',
          code: 'HP-EB-840G8',
          model: 'EliteBook 840 G8',
          description: '14" Premium Business Laptop',
          oem: { id: 2, name: 'HP Inc.', code: 'HP' },
          category: { id: 1, name: 'Laptops & Notebooks', code: 'LAPTOP' },
          specifications: {
            processor: 'Intel Core i5-1135G7',
            memory: '16GB DDR4',
            storage: '256GB SSD',
            display: '14" FHD',
            os: 'Windows 11 Pro'
          },
          unitPrice: 1199.99,
          status: 'active',
          assetsCount: 18,
          warrantyMonths: 36,
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18'
        },
        {
          id: 3,
          name: 'Lenovo ThinkPad X1 Carbon',
          code: 'LEN-X1C-GEN9',
          model: 'X1 Carbon Gen 9',
          description: '14" Ultra-lightweight business laptop',
          oem: { id: 3, name: 'Lenovo Group', code: 'LENOVO' },
          category: { id: 1, name: 'Laptops & Notebooks', code: 'LAPTOP' },
          specifications: {
            processor: 'Intel Core i7-1185G7',
            memory: '16GB LPDDR4X',
            storage: '512GB SSD',
            display: '14" WQUXGA',
            os: 'Windows 11 Pro'
          },
          unitPrice: 1899.99,
          status: 'active',
          assetsCount: 12,
          warrantyMonths: 36,
          createdAt: '2024-01-08',
          updatedAt: '2024-01-25'
        },
        {
          id: 4,
          name: 'Dell OptiPlex 7090',
          code: 'DELL-OPT-7090',
          model: 'OptiPlex 7090 MT',
          description: 'Mid-tower desktop computer for business',
          oem: { id: 1, name: 'Dell Technologies', code: 'DELL' },
          category: { id: 2, name: 'Desktop Computers', code: 'DESKTOP' },
          specifications: {
            processor: 'Intel Core i7-11700',
            memory: '16GB DDR4',
            storage: '512GB SSD + 1TB HDD',
            graphics: 'Intel UHD Graphics 750',
            os: 'Windows 11 Pro'
          },
          unitPrice: 999.99,
          status: 'active',
          assetsCount: 8,
          warrantyMonths: 36,
          createdAt: '2024-01-12',
          updatedAt: '2024-01-22'
        },
        {
          id: 5,
          name: 'Apple MacBook Pro 16"',
          code: 'APPLE-MBP-16',
          model: 'MacBook Pro 16-inch',
          description: '16" MacBook Pro with M2 Pro chip',
          oem: { id: 4, name: 'Apple Inc.', code: 'APPLE' },
          category: { id: 1, name: 'Laptops & Notebooks', code: 'LAPTOP' },
          specifications: {
            processor: 'Apple M2 Pro',
            memory: '16GB Unified Memory',
            storage: '512GB SSD',
            display: '16" Liquid Retina XDR',
            os: 'macOS Ventura'
          },
          unitPrice: 2499.99,
          status: 'inactive',
          assetsCount: 3,
          warrantyMonths: 12,
          createdAt: '2024-01-05',
          updatedAt: '2024-01-15'
        }
      ])
      setLoading(false)
    }, 1000)
  }

  const handleCreate = () => {
    setEditingProduct(null)
    setIsFormVisible(true)
  }

  const handleEdit = (record) => {
    setEditingProduct(record)
    setIsFormVisible(true)
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Product',
      content: (
        <div>
          <p>Are you sure you want to delete "{record.name}"?</p>
          {record.assetsCount > 0 && (
            <p className="text-red-600">
              ⚠️ This product has {record.assetsCount} assets in inventory that will be affected.
            </p>
          )}
          <p className="font-medium">This action cannot be undone.</p>
        </div>
      ),
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Mock API call
          setProducts(prev => prev.filter(item => item.id !== record.id))
          message.success('Product deleted successfully')
        } catch (error) {
          message.error('Failed to delete product')
        }
      }
    })
  }

  const handleFormSubmit = async (values) => {
    try {
      if (editingProduct) {
        // Update existing product
        setProducts(prev => prev.map(item => 
          item.id === editingProduct.id 
            ? { ...item, ...values, updatedAt: new Date().toISOString().split('T')[0] }
            : item
        ))
        message.success('Product updated successfully')
      } else {
        // Create new product
        const newProduct = {
          id: Date.now(),
          ...values,
          assetsCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        }
        setProducts(prev => [newProduct, ...prev])
        message.success('Product created successfully')
      }
      setIsFormVisible(false)
      setEditingProduct(null)
    } catch (error) {
      message.error('Failed to save product')
    }
  }

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchText || 
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.code.toLowerCase().includes(searchText.toLowerCase()) ||
      product.model.toLowerCase().includes(searchText.toLowerCase()) ||
      product.oem.name.toLowerCase().includes(searchText.toLowerCase())

    const matchesOEM = !selectedOEM || product.oem.id === selectedOEM
    const matchesCategory = !selectedCategory || product.category.id === selectedCategory
    const matchesStatus = !selectedStatus || product.status === selectedStatus

    return matchesSearch && matchesOEM && matchesCategory && matchesStatus
  })

  // Calculate statistics
  const totalAssets = filteredProducts.reduce((sum, product) => sum + product.assetsCount, 0)
  const activeProducts = filteredProducts.filter(p => p.status === 'active').length
  const averagePrice = filteredProducts.length > 0 
    ? filteredProducts.reduce((sum, p) => sum + p.unitPrice, 0) / filteredProducts.length 
    : 0

  const clearFilters = () => {
    setSelectedOEM(null)
    setSelectedCategory(null)
    setSelectedStatus(null)
    setSearchText('')
  }

  const columns = [
    {
      title: 'Product Code',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (text) => <Tag color="blue" className="font-mono">{text}</Tag>
    },
    {
      title: 'Product Details',
      key: 'details',
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900">{record.name}</div>
          <div className="text-sm text-gray-500">{record.model}</div>
          <div className="flex space-x-2 mt-1">
            <Tag size="small" color="green">{record.oem.code}</Tag>
            <Tag size="small" color="purple">{record.category.code}</Tag>
          </div>
        </div>
      )
    },
    {
      title: 'Specifications',
      key: 'specifications',
      width: 200,
      render: (_, record) => (
        <div className="text-xs space-y-1">
          <div><strong>CPU:</strong> {record.specifications.processor}</div>
          <div><strong>RAM:</strong> {record.specifications.memory}</div>
          <div><strong>Storage:</strong> {record.specifications.storage}</div>
        </div>
      )
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.unitPrice - b.unitPrice,
      render: (price) => (
        <span className="font-medium text-green-600">
          ${price.toLocaleString()}
        </span>
      )
    },
    {
      title: 'Assets',
      dataIndex: 'assetsCount',
      key: 'assetsCount',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.assetsCount - b.assetsCount,
      render: (count) => (
        <Tag color={count > 0 ? 'gold' : 'default'}>
          {count}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
            title="Edit"
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDelete(record)}
            title="Delete"
          />
        </Space>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600">Manage product catalog with specifications and pricing</p>
        </div>
        <Space>
          <Button
            type="default"
            icon={<UploadOutlined />}
            onClick={() => setIsBulkUploadVisible(true)}
            size="large"
          >
            Bulk Upload
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="large"
            className="bg-gradient-to-r from-red-600 to-red-700 border-0 hover:from-red-700 hover:to-red-800 shadow-lg"
          >
            Add Product
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16}>
        <Col span={6}>
          <Card className="text-center border-l-4 border-l-blue-500">
            <div className="text-2xl font-bold text-blue-600">{filteredProducts.length}</div>
            <div className="text-gray-600">Total Products</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="text-center border-l-4 border-l-green-500">
            <div className="text-2xl font-bold text-green-600">{activeProducts}</div>
            <div className="text-gray-600">Active Products</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="text-center border-l-4 border-l-orange-500">
            <div className="text-2xl font-bold text-orange-600">{totalAssets}</div>
            <div className="text-gray-600">Total Assets</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="text-center border-l-4 border-l-purple-500">
            <div className="text-2xl font-bold text-purple-600">${averagePrice.toLocaleString()}</div>
            <div className="text-gray-600">Avg. Unit Price</div>
          </Card>
        </Col>
      </Row>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="flex justify-between items-center">
            <Search
              placeholder="Search products..."
              allowClear
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined className="text-gray-400" />}
            />
            <div className="text-sm text-gray-500">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </div>
          
          <div className="flex space-x-4 items-center">
            <Select
              placeholder="Filter by OEM"
              allowClear
              style={{ width: 200 }}
              value={selectedOEM}
              onChange={setSelectedOEM}
            >
              {mockOEMs.map(oem => (
                <Option key={oem.id} value={oem.id}>{oem.name}</Option>
              ))}
            </Select>
            
            <Select
              placeholder="Filter by Category"
              allowClear
              style={{ width: 200 }}
              value={selectedCategory}
              onChange={setSelectedCategory}
            >
              {mockCategories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
            
            <Select
              placeholder="Filter by Status"
              allowClear
              style={{ width: 150 }}
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
            
            {(selectedOEM || selectedCategory || selectedStatus) && (
              <Button onClick={clearFilters} icon={<FilterOutlined />}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} items`
          }}
          className="border-0"
          scroll={{ x: 1200 }}
        />
      </div>

      <ProductForm
        visible={isFormVisible}
        onCancel={() => {
          setIsFormVisible(false)
          setEditingProduct(null)
        }}
        onSubmit={handleFormSubmit}
        editData={editingProduct}
        oems={mockOEMs}
        categories={mockCategories}
      />

      <ProductBulkUpload
        isOpen={isBulkUploadVisible}
        onClose={() => setIsBulkUploadVisible(false)}
        onSuccess={() => {
          loadProducts()
          message.success('Products uploaded successfully')
        }}
      />
    </div>
  )
}

export default ProductList