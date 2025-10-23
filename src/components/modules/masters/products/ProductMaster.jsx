import React, { useState } from 'react'
import { Tabs, Button, message, Space } from 'antd'
import {
  AppstoreOutlined,
  BranchesOutlined,
  TagsOutlined,
  OrderedListOutlined,
  UploadOutlined,
  DownloadOutlined,
  UnorderedListOutlined
} from '@ant-design/icons'
import ProductCategory from './ProductCategory'
import ProductSubCategory from './ProductSubCategory'
import ProductType from './ProductType'
import ProductSeries from './ProductSeries'
import ProductListDetailed from './ProductListDetailed'
import ProductBulkUpload from './ProductBulkUpload'
import { useDispatch } from 'react-redux'
import { fetchProducts } from '../../../../store/slices/masterSlice'
import api from '../../../../services/api'

const ProductMaster = () => {
  const [activeTab, setActiveTab] = useState('products')
  const [isBulkUploadVisible, setIsBulkUploadVisible] = useState(false)
  const [exporting, setExporting] = useState(false)
  const dispatch = useDispatch()

  // Handle export
  const handleExport = async () => {
    try {
      setExporting(true)
      const response = await api.get('/masters/products/export', {
        params: { format: 'xlsx' },
        responseType: 'blob'
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      message.success('Products exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      message.error(error.response?.data?.message || 'Failed to export products')
    } finally {
      setExporting(false)
    }
  }

  const tabItems = [
    {
      key: 'products',
      label: (
        <span>
          <UnorderedListOutlined />
          Products
        </span>
      ),
      children: <ProductListDetailed />
    },
    {
      key: 'category',
      label: (
        <span>
          <AppstoreOutlined />
          Category
        </span>
      ),
      children: <ProductCategory />
    },
    {
      key: 'subcategory',
      label: (
        <span>
          <BranchesOutlined />
          Sub-category
        </span>
      ),
      children: <ProductSubCategory />
    },
    {
      key: 'type',
      label: (
        <span>
          <TagsOutlined />
          Type
        </span>
      ),
      children: <ProductType />
    },
    {
      key: 'series',
      label: (
        <span>
          <OrderedListOutlined />
          Series
        </span>
      ),
      children: <ProductSeries />
    }
  ]

  return (
    <div style={{ padding: '24px', backgroundColor: '#fff' }}>
      {/* Header */}
      <div style={{
        marginBottom: '24px',
        borderBottom: '1px solid #f0f0f0',
        paddingBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Product Master</h2>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
            Dashboard {'>'} Master {'>'} Product Master
          </div>
        </div>
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            loading={exporting}
            size="large"
          >
            Export
          </Button>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => setIsBulkUploadVisible(true)}
            size="large"
          >
            Bulk Upload
          </Button>
        </Space>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        tabPosition="top"
        style={{
          '.ant-tabs-tab': {
            padding: '12px 24px'
          }
        }}
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
    </div>
  )
}

export default ProductMaster